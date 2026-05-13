// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
 * ============================================================
 *  DuoYield  |  DuoVault Ecosystem
 * ============================================================
 *
 *  Deployed Addresses
 *  ------------------
 *  USDT (payment):  0xd04a56cdc466087a9afa0f27585a1eef51696234
 *  ABCD (staking):  0xC4747Ff6107015EAF51DB6a419d4204646f2ea68
 *  DUO  (airdrop):  0xb07675af7fbe2f7d7b3d77e1c2a654be17bbb072
 *  Treasury:        0x405F34617e9867F5FA3C5467B0E07D9ee85F1678
 *
 *  Token Flow
 *  ----------
 *  USDT  → paid by user, forwarded to treasury instantly.
 *  ABCD  → minted 2× by contract on every stake (1× principal + 1× reserved for yield).
 *           All yield, referral, and level bonuses paid in ABCD.
 *  DUO   → airdrop-only, funded manually by owner via fundDuoPool().
 *
 *  Decimal Handling
 *  ----------------
 *  USDT and ABCD decimals are read from token contracts at deploy time.
 *  _toAbcd(usdtRaw) converts any raw USDT amount to ABCD-native units.
 *  All internal accounting (principal, cap, earned, bonuses) is in ABCD-native units.
 *  lastDepositRaw is stored in raw USDT units (for min-deposit comparison only).
 *
 *  Yield Accrual (per-second, reference-contract style)
 *  -----------------------------------------------------
 *  Each Deposit struct stores:
 *    principal   – ABCD-native units staked
 *    rate        – daily ROI in BPS (e.g. 30 = 0.30%)
 *    start       – timestamp when this deposit began accruing
 *    cap         – 200% of principal (max total yield for this deposit)
 *
 *  getUserDividends() loops all deposits and computes:
 *    share = principal * rate / BPS / TIME_STEP      (per-second rate)
 *    elapsed from max(deposit.start, checkpoint) to min(now, capFinish)
 *    totalYield += share * elapsed
 *
 *  withdraw() checkpoints: user.checkpoint = block.timestamp
 *  This is the same proven pattern as the reference SMARTHarvest contract.
 *
 *  Rank System
 *  -----------
 *  0 Duo-Base    0.30%/day   no requirements
 *  1 Duo-Smart   0.40%/day   self CSV $500 + 3 directs @ $500 each
 *  2 Duo-Prime   0.50%/day   4 Smart legs   validity 1yr   DUO airdrop $2,000
 *  3 Duo-Elite   0.60%/day   4 Prime legs   validity 2yr   DUO airdrop $8,000
 *  4 Duo-Grand   0.70%/day   5 Elite legs   validity 3yr   DUO airdrop $15,000
 *  5 Duo-Supreme 0.80%/day   5 Grand legs   validity 4yr   DUO airdrop $25,000
 *  6 Duo-Infinite 1.00%/day  6 Supreme legs validity 5yr   DUO airdrop $50,000
 *
 *  Rank expiry: ROI falls back to Smart (0.40%) until refreshRank() re-qualifies.
 *  Smart Speed Airdrop: 10% of qualifying 3 directs' combined CSV if Smart
 *  is achieved within 30 days of first stake.
 * ============================================================
 */

// ── Interfaces ───────────────────────────────────────────────

interface IERC20 {
    function decimals()                                        external view returns (uint8);
    function balanceOf(address account)                        external view returns (uint256);
    function allowance(address owner, address spender)         external view returns (uint256);
    function transfer(address to, uint256 amount)              external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IMintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

// ── Ownable ──────────────────────────────────────────────────

abstract contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed prev, address indexed next);
    constructor() { _owner = msg.sender; }
    modifier onlyOwner() { require(msg.sender == _owner, "Not owner"); _; }
    function owner() public view returns (address) { return _owner; }
    function transferOwnership(address to) external onlyOwner {
        require(to != address(0), "Zero address");
        emit OwnershipTransferred(_owner, to);
        _owner = to;
    }
}

// ── ReentrancyGuard ──────────────────────────────────────────

abstract contract ReentrancyGuard {
    uint256 private constant _NOT = 1;
    uint256 private constant _IN  = 2;
    uint256 private _status = _NOT;
    modifier nonReentrant() {
        require(_status != _IN, "Reentrant");
        _status = _IN;
        _;
        _status = _NOT;
    }
}

// ── DuoYield ─────────────────────────────────────────────────

contract DuoYield is Ownable, ReentrancyGuard {

    // ── Rank IDs ─────────────────────────────────────────────

    uint8 public constant RANK_BASE     = 0;
    uint8 public constant RANK_SMART    = 1;
    uint8 public constant RANK_PRIME    = 2;
    uint8 public constant RANK_ELITE    = 3;
    uint8 public constant RANK_GRAND    = 4;
    uint8 public constant RANK_SUPREME  = 5;
    uint8 public constant RANK_INFINITE = 6;

    // ── Constants ─────────────────────────────────────────────

    uint256 public constant BPS            = 10000;   // basis-point divisor
    uint256 public constant MAX_RETURN_BPS = 20000;   // 200% cap
    uint256 public constant REFERRAL_BPS   = 1000;    // 10% referral bonus
    uint256 public constant WELCOME_BPS    = 1000;    // 10% welcome DUO airdrop
    uint256 public constant SMART_DROP_BPS = 1000;    // 10% Smart-speed DUO airdrop
    uint256 public constant SECONDARY_BPS  = 30;      // 0.30%/day secondary yield

    // TIME_STEP: seconds in one day.
    // Mainnet: 86400  |  Testnet: 60  (change only this line before deploy)
    uint256 public constant TIME_STEP      = 60;

    uint256 public constant GRACE_PERIOD   = 90 days;
    uint256 public constant EXTENDED_PERIOD = 180 days;
    uint256 public constant SMART_SPEED_WIN = 30 days;
    uint256 public constant MDV_WINDOW     = 30 days;
    uint256 public constant MAX_LEVELS     = 20;
    uint256 public constant SMART_DIR_COUNT = 3;

    // ── Rank tables ───────────────────────────────────────────

    // Daily ROI in BPS per rank (divisor = BPS = 10000)
    uint256[7] public RANK_DAILY_ROI = [30, 40, 50, 60, 70, 80, 100];

    // Minimum qualifying legs required to reach each rank
    uint256[7] public REQUIRED_LEGS  = [0, 0, 4, 4, 5, 5, 6];

    // Rank validity periods
    uint256[7] public RANK_VALIDITY  = [0, 0, 365 days, 730 days, 1095 days, 1460 days, 1825 days];

    // DUO airdrop amounts (scaled to ABCD-native units in constructor)
    uint256[7] public RANK_AIRDROP   = [0, 0, 2_000, 8_000, 15_000, 25_000, 50_000];

    // Level bonus BPS: L1=10%, L2=50%, L3=40%, L4=30%, L5=20%, L6-L20=5%
    uint256[20] private LEVEL_BPS = [
        1000, 5000, 4000, 3000, 2000,
        500,  500,  500,  500,  500,
        500,  500,  500,  500,  500,
        500,  500,  500,  500,  500
    ];

    // ── Decimal bridge ────────────────────────────────────────

    uint8   public immutable usdtDecimals;
    uint8   public immutable abcdDecimals;
    uint256 public immutable toAbcdMultiplier; // multiply USDT raw by this (ud <= ad case)
    uint256 public immutable toAbcdDivisor;    // divide   USDT raw by this (ud >  ad case), else 1

    // Scaled dollar thresholds (set in constructor once abcdDecimals is known)
    uint256 public immutable SMART_SELF_CSV_MIN;  // $500 in ABCD units
    uint256 public immutable SMART_DIR_CSV_MIN;   // $500 in ABCD units
    uint256 public immutable MDV_REQUIREMENT;     // $500 in ABCD units
    uint256 public immutable MDV_CAP_PER_ID;      // $500 in ABCD units

    // ── Structs ───────────────────────────────────────────────

    // One entry per deposit (initial stake, top-up, or re-stake).
    // Pattern identical to the reference SMARTHarvest.Deposit struct.
    struct Deposit {
        uint8   dtype;      // 1 = user stake, 0 = internal (referral / level)
        uint256 principal;  // ABCD-native units
        uint256 rate;       // daily ROI in BPS (e.g. 30 = 0.30%)
        uint256 cap;        // 200% of principal — yield stops here (ABCD-native)
        uint256 start;      // block.timestamp when this deposit started accruing
        uint256 usdtPaid;   // raw USDT units paid for this deposit (0 for internal)
        uint256 abcdMinted; // ABCD minted for this deposit (2× converted usdtPaid)
        bool    isTopUp;    // true = top-up on active stake
    }

    struct RankState {
        uint8   id;
        uint256 achievedAt;
        uint256 expiry;
        bool    smartAirdropClaimed;
        uint256 highestRankPaid;
    }

    // Secondary (level-bonus) pool — earns 0.30%/day, depletes to zero
    struct SecondaryPool {
        uint256 balance;       // ABCD-native units in the pool
        uint256 checkpoint;    // timestamp of last secondary claim
    }

    struct User {
        // Registration
        bool    registered;
        address referrer;
        uint256 registeredAt;

        // Deposit log (reference-contract style: array, looped in view)
        Deposit[] deposits;

        // Primary yield checkpoint (same as SMARTHarvest.checkpoint)
        uint256 checkpoint;           // timestamp: yield before this is already claimed

        // Track the raw-USDT amount of the most recent user deposit (for min top-up check)
        uint256 lastDepositRaw;       // raw USDT-native units

        // Cumulative staked value (ABCD-native units) — for rank qualification
        uint256 totalCSV;

        // Referral tree
        address[] directs;
        mapping(address => uint256) directCSV; // ABCD-native

        // Rank
        RankState rank;

        // Level-bonus pool (secondary yield)
        SecondaryPool secondary;

        // MDV expiry
        uint256 mdvBankExpiry;

        // Airdrop flags
        bool welcomeAirdropClaimed;

        // Withdrawal totals
        uint256 totalPrimaryWithdrawn;
        uint256 totalSecondaryWithdrawn;

        // Per-level referral counts (index 0 = Level 1 directs)
        uint256[20] levelCount;
        uint256[20] levelEarned;
    }
    struct DirectInfo {
        address wallet;
        uint256 totalCSV;        // ABCD-native units staked by this direct
        uint256 directCSVForMe;  // ABCD-native units this direct contributed to MY CSV tracking
        uint8   rankId;
        string  rankName;
        bool    hasActiveStake;
        uint256 registeredAt;
    }
    // ── Tokens & treasury ────────────────────────────────────

    IERC20    public immutable USDT;
    IMintable public immutable ABCD;
    IERC20    public immutable DUO;
    address   public treasury;

    // ── Global stats ──────────────────────────────────────────

    uint256 public totalInvested;    // ABCD-native units, cumulative stakes
    uint256 public totalAbcdMinted;
    uint256 public totalAbcdPaid;
    uint256 public totalDuoPaid;
    uint256 public totalReferralPaid;
    uint256 public totalLevelPaid;
    uint256 public totalTVL;         // ABCD-native units, active only

    // ── User storage ──────────────────────────────────────────

    mapping(address => User) internal users;
    address[] public allUsers;

    // ── Leg tracking ─────────────────────────────────────────

    mapping(address => mapping(address => address))                   public userLeg;
    mapping(address => mapping(address => mapping(uint8 => uint256))) private legRankCount;
    mapping(address => mapping(uint8 => uint256))                     public legUniqueCount;

    // ── Events ────────────────────────────────────────────────

    event Registered       (address indexed user, address indexed referrer, uint256 usdtPaid, uint256 abcdMinted, uint256 time);
    event DepositMade      (address indexed user, uint256 indexed depositIndex, uint256 usdtPaid, uint256 abcdMinted, uint256 principal, bool isTopUp, uint256 time);
    event Withdrawn        (address indexed user, uint256 abcdAmount, uint256 time);
    event SecondaryWithdrawn(address indexed user, uint256 abcdAmount, uint256 time);
    event ReferralBonus    (address indexed referrer, address indexed referee, uint256 abcdAmount, uint256 time);
    event GapCommission    (address indexed referrer, address indexed referee, uint256 abcdAmount, uint256 time);
    event LevelBonus       (address indexed recipient, address indexed origin, uint8 level, uint256 credited, uint256 flushed, uint256 time);
    event WelcomeAirdrop   (address indexed user, uint256 duoAmount, uint256 time);
    event SmartSpeedAirdrop(address indexed user, uint256 duoAmount, uint256 time);
    event RankAchieved     (address indexed user, uint8 rankId, string rankName, uint256 duoAmount, uint256 time);
    event IDDeactivated    (address indexed user, uint256 depositIndex, uint256 time);
    event RankAirdropUpdated(uint8 indexed rankId, uint256 newAmount);

    // ── Constructor ───────────────────────────────────────────


    // ─────────────────────────────────────────────────────────
    //  RETURN STRUCTS  (avoids "stack too deep" on view functions)
    // ─────────────────────────────────────────────────────────

    /// @dev Returned by getUserStakeInfo()
    struct StakeInfo {
        bool    registered;
        address referrer;
        uint256 registeredAt;
        uint256 checkpoint;
        uint256 totalCSV;
        uint256 lastDepositRaw;
        uint256 depositCount;
        uint256 totalPrimaryWithdrawn;
        uint256 totalSecondaryWithdrawn;
    }

    /// @dev Returned by getUserYieldInfo()
    struct YieldInfo {
        uint256 primaryClaimable;
        uint256 secondaryBalance;
        uint256 secondaryClaimable;
        uint256 totalClaimable;
    }

    /// @dev Returned by getUserRankInfo()
    struct RankInfo {
        uint8   rankId;
        string  rankName;
        uint256 rankExpiry;
        bool    rankExpired;
        uint256 effectiveRoiBps;
        uint256 directCount;
        uint256 smartLegs;
        uint256 primeLegs;
        uint256 eliteLegs;
        uint256 grandLegs;
        uint256 supremeLegs;
        bool    mdvEligible;
        uint256 mdvBankExpiry;
    }

    /// @dev Returned by getDepositInfo() and getAllDeposits()
    struct DepositInfo {
        uint8   dtype;
        uint256 principal;
        uint256 rate;
        uint256 cap;
        uint256 start;
        uint256 usdtPaid;
        uint256 abcdMinted;
        bool    isTopUp;
        uint256 capFinish;
        uint256 yieldPerSec;
        uint256 claimable;
    }

    constructor(
        address _usdt,
        address _abcd,
        address _duo,
        address _treasury
    ) {
        require(_usdt != address(0) && _abcd != address(0) && _duo != address(0) && _treasury != address(0), "Zero address");

        USDT     = IERC20(_usdt);
        ABCD     = IMintable(_abcd);
        DUO      = IERC20(_duo);
        treasury = _treasury;

        // Read decimals from token contracts
        uint8 ud = IERC20(_usdt).decimals();
        uint8 ad = IMintable(_abcd).decimals();
        usdtDecimals = ud;
        abcdDecimals = ad;

        // Build scalar for USDT → ABCD conversion (handles any decimal pair)
        if (ad >= ud) {
            toAbcdMultiplier = 10 ** uint256(ad - ud); // e.g. 9-dec USDT + 18-dec ABCD → 1e9
            toAbcdDivisor    = 1;
        } else {
            toAbcdMultiplier = 1;
            toAbcdDivisor    = 10 ** uint256(ud - ad);
        }

        // Scale dollar thresholds to ABCD-native units
        uint256 unit          = 10 ** uint256(ad);
        SMART_SELF_CSV_MIN    = 500  * unit;
        SMART_DIR_CSV_MIN     = 500  * unit;
        MDV_REQUIREMENT       = 500  * unit;
        MDV_CAP_PER_ID        = 500  * unit;

        // Scale rank airdrop amounts
        RANK_AIRDROP[2] = 2_000  * unit;
        RANK_AIRDROP[3] = 8_000  * unit;
        RANK_AIRDROP[4] = 15_000 * unit;
        RANK_AIRDROP[5] = 25_000 * unit;
        RANK_AIRDROP[6] = 50_000 * unit;
    }

    // ─────────────────────────────────────────────────────────
    //  EXTERNAL: STAKING
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Register and place first stake.
     * @param usdtRaw  Raw USDT amount in token-native units
     *                 (e.g. 100 USDT with 9-dec token = 100_000_000_000)
     * @param referrer Sponsor address (address(0) for none)
     */
    function initialStake(uint256 usdtRaw, address referrer) external nonReentrant {
        require(usdtRaw > 0, "Amount must be > 0");
        User storage u = users[msg.sender];
        require(!u.registered, "Already registered use addStake()");

        // ── Referral setup
        if (referrer != address(0) && referrer != msg.sender && users[referrer].registered) {
            u.referrer = referrer;
            users[referrer].directs.push(msg.sender);
            _registerLegAncestry(msg.sender, referrer);
            _propagateLevelCount(msg.sender, referrer);
        }

        // ── Pull USDT → treasury
        require(USDT.allowance(msg.sender, address(this)) >= usdtRaw, "USDT: insufficient allowance");
        USDT.transferFrom(msg.sender, treasury, usdtRaw);

        // ── Mint 2× ABCD to contract
        uint256 abcdNative = _toAbcd(usdtRaw);           // 1× in ABCD units
        uint256 mintAmount = abcdNative * 2;              // 2× minted
        ABCD.mint(address(this), mintAmount);
        totalAbcdMinted += mintAmount;

        // ── Register user
        u.registered    = true;
        u.registeredAt  = block.timestamp;
        u.checkpoint    = block.timestamp;
        u.rank.id       = RANK_BASE;
        u.mdvBankExpiry = block.timestamp + GRACE_PERIOD;
        allUsers.push(msg.sender);

        // ── Create deposit record
        uint256 rate  = _effectiveRoiBps(msg.sender);
        uint256 cap   = (abcdNative * MAX_RETURN_BPS) / BPS;  // 200% of principal
        u.deposits.push(Deposit({
            dtype:      1,
            principal:  abcdNative,
            rate:       rate,
            cap:        cap,
            start:      block.timestamp,
            usdtPaid:   usdtRaw,
            abcdMinted: mintAmount,
            isTopUp:    false
        }));
        u.lastDepositRaw = usdtRaw;
        u.totalCSV      += abcdNative;
        totalInvested   += abcdNative;
        totalTVL        += abcdNative;

        emit Registered(msg.sender, u.referrer, usdtRaw, mintAmount, block.timestamp);
        emit DepositMade(msg.sender, u.deposits.length - 1, usdtRaw, mintAmount, abcdNative, false, block.timestamp);

        // ── Welcome DUO airdrop (10% of stake, outside cap)
        if (!u.welcomeAirdropClaimed) {
            u.welcomeAirdropClaimed = true;
            uint256 drop = (abcdNative * WELCOME_BPS) / BPS;
            _safeDuoTransfer(msg.sender, drop);
            emit WelcomeAirdrop(msg.sender, drop, block.timestamp);
        }

        // ── Referral bonus + level bonuses
        if (u.referrer != address(0)) {
            _handleReferralBonus(u.referrer, msg.sender, abcdNative, false);
        }
        _propagateLevelBonus(msg.sender, abcdNative);

        // ── Rank check
        _trySmartRank(msg.sender);
    }
    // ── Add these two view functions in the VIEW: CONVENIENCE HELPERS section ──

    /// @notice ABCD earned at each level (index 0 = Level 1, … index 19 = Level 20).
    function getLevelEarnings(address account) external view returns (uint256[20] memory)
    {
        return users[account].levelEarned;
    }

    /// @notice Earning at a single level (1-indexed).
    function getLevelEarning(address account, uint8 level) external view returns (uint256)
    {
        require(level >= 1 && level <= 20, "Level out of range");
        return users[account].levelEarned[level - 1];
    }

    /// @notice Full details for every direct referral of `account`.
    function getDirectsInfo(address account) external view returns (DirectInfo[] memory result)
    {
        address[] storage directs = users[account].directs;
        result = new DirectInfo[](directs.length);
        for (uint256 i = 0; i < directs.length; i++) {
            address d = directs[i];
            User storage du = users[d];
            result[i] = DirectInfo({
                wallet:         d,
                totalCSV:       du.totalCSV,
                directCSVForMe: users[account].directCSV[d],
                rankId:         du.rank.id,
                rankName:       _rankName(du.rank.id),
                hasActiveStake: _hasActiveDeposit(d),
                registeredAt:   du.registeredAt
            });
        }
    }
    /**
     * @notice Top-up an active stake or re-stake after 200% cap.
     *         Amount must be >= the raw USDT of the previous deposit.
     * @param usdtRaw  Raw USDT amount in token-native units
     */
    function addStake(uint256 usdtRaw) external nonReentrant {
        User storage u = users[msg.sender];
        require(u.registered, "Not registered");
        require(usdtRaw > 0, "Amount must be > 0");
        require(usdtRaw >= u.lastDepositRaw, "Amount < last deposit");

        require(USDT.allowance(msg.sender, address(this)) >= usdtRaw, "USDT: insufficient allowance");
        USDT.transferFrom(msg.sender, treasury, usdtRaw);

        uint256 abcdNative = _toAbcd(usdtRaw);
        uint256 mintAmount = abcdNative * 2;
        ABCD.mint(address(this), mintAmount);
        totalAbcdMinted += mintAmount;

        bool hasActiveStake = _hasActiveDeposit(msg.sender);
        uint256 rate        = _effectiveRoiBps(msg.sender);
        uint256 cap         = (abcdNative * MAX_RETURN_BPS) / BPS;

        // Each addStake always creates a new Deposit entry — clean, auditable, simple.
        // Top-up: isTopUp=true, fresh deposit on an active stake.
        // Re-stake: isTopUp=false, after 200% cap has been reached.
        u.deposits.push(Deposit({
            dtype:      1,
            principal:  abcdNative,
            rate:       rate,
            cap:        cap,
            start:      block.timestamp,
            usdtPaid:   usdtRaw,
            abcdMinted: mintAmount,
            isTopUp:    hasActiveStake
        }));
        u.lastDepositRaw = usdtRaw;
        u.totalCSV      += abcdNative;
        totalInvested   += abcdNative;
        totalTVL        += abcdNative;

        emit DepositMade(msg.sender, u.deposits.length - 1, usdtRaw, mintAmount, abcdNative, hasActiveStake, block.timestamp);

        if (u.referrer != address(0)) {
            _handleReferralBonus(u.referrer, msg.sender, abcdNative, hasActiveStake);
        }
        _propagateLevelBonus(msg.sender, abcdNative);
        _trySmartRank(msg.sender);
        _tryLeaderRank(msg.sender);
    }

    // ─────────────────────────────────────────────────────────
    //  EXTERNAL: WITHDRAW YIELD
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Claim all accrued primary yield.
     *         Loops deposits, computes per-second yield since checkpoint.
     *         Identical logic to SMARTHarvest.withdraw().
     */
    function withdraw() external nonReentrant {
        User storage u = users[msg.sender];
        uint256 totalAmount = getUserDividends(msg.sender);
        require(totalAmount > 0, "Nothing to claim");

        // Advance checkpoint — next claim starts from now
        u.checkpoint = block.timestamp;
        u.totalPrimaryWithdrawn += totalAmount;

        // Mark deposits that have hit their cap as done
        _checkAndDeactivateDeposits(msg.sender);

        _safeAbcdTransfer(msg.sender, totalAmount);
        emit Withdrawn(msg.sender, totalAmount, block.timestamp);
    }

    /**
     * @notice Claim secondary (level-bonus pool) yield.
     *         Pool earns 0.30%/day and depletes to zero.
     */
    function withdrawSecondary() external nonReentrant {
        User storage u = users[msg.sender];
        SecondaryPool storage sp = u.secondary;
        require(sp.balance > 0 && sp.checkpoint > 0, "No secondary yield");

        uint256 elapsed = block.timestamp - sp.checkpoint;
        require(elapsed > 0, "Too soon");

        uint256 accrued = (sp.balance * SECONDARY_BPS * elapsed) / BPS / TIME_STEP;
        if (accrued > sp.balance) accrued = sp.balance;
        require(accrued > 0, "No yield yet");

        sp.balance      -= accrued;
        sp.checkpoint    = block.timestamp;
        u.totalSecondaryWithdrawn += accrued;

        _safeAbcdTransfer(msg.sender, accrued);
        emit SecondaryWithdrawn(msg.sender, accrued, block.timestamp);
    }

    /// @notice Re-check rank qualification (after expiry or building legs).
    function refreshRank() external nonReentrant {
        _trySmartRank(msg.sender);
        _tryLeaderRank(msg.sender);
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: DECIMAL CONVERSION
    // ─────────────────────────────────────────────────────────

    function _toAbcd(uint256 usdtRaw) internal view returns (uint256) {
        if (toAbcdDivisor == 1) return usdtRaw * toAbcdMultiplier;
        return usdtRaw / toAbcdDivisor;
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: YIELD HELPERS
    // ─────────────────────────────────────────────────────────

    function _effectiveRoiBps(address account) internal view returns (uint256) {
        RankState storage r = users[account].rank;
        if (r.id >= RANK_PRIME && r.expiry > 0 && block.timestamp > r.expiry) {
            return RANK_DAILY_ROI[RANK_SMART];
        }
        return RANK_DAILY_ROI[r.id];
    }

    /// @dev Returns true if the user has at least one deposit that hasn't hit its cap yet.
    function _hasActiveDeposit(address account) internal view returns (bool) {
        User storage u = users[account];
        for (uint256 i = 0; i < u.deposits.length; i++) {
            Deposit storage d = u.deposits[i];
            if (d.dtype != 1) continue;
            // Deposit is active if its cap-finish time hasn't passed
            uint256 daysToFull  = (d.cap * BPS * TIME_STEP) / (d.principal * d.rate);
            uint256 capFinish   = d.start + daysToFull;
            if (block.timestamp < capFinish) return true;
        }
        return false;
    }

    /// @dev After withdraw(), mark any deposits that have fully matured so TVL is updated.
    function _checkAndDeactivateDeposits(address account) internal {
        User storage u = users[account];
        for (uint256 i = 0; i < u.deposits.length; i++) {
            Deposit storage d = u.deposits[i];
            if (d.dtype != 1 || d.principal == 0) continue;
            uint256 daysToFull = (d.cap * BPS * TIME_STEP) / (d.principal * d.rate);
            uint256 capFinish  = d.start + daysToFull;
            if (block.timestamp >= capFinish && d.cap > 0) {
                // Deposit fully matured — remove principal from TVL (once)
                if (totalTVL >= d.principal) totalTVL -= d.principal;
                // Zero-out cap so this can't deactivate again
                d.cap = 0;
                emit IDDeactivated(account, i, block.timestamp);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: REFERRAL & LEVEL BONUSES
    // ─────────────────────────────────────────────────────────

    function _handleReferralBonus(
        address referrer,
        address referee,
        uint256 abcdNative,
        bool isTopUp
    ) internal {
        // Referrer must have at least one active deposit
        if (!_hasActiveDeposit(referrer)) return;

        uint256 bonus;
        if (!isTopUp) {
            // Initial stake or re-stake: 10% of full stake
            bonus = (abcdNative * REFERRAL_BPS) / BPS;
        } else {
            // Top-up: 10% of incremental amount (gap commission)
            bonus = (abcdNative * REFERRAL_BPS) / BPS;
        }

        if (bonus > 0) {
            // Credit as internal deposit to referrer (earns yield up to its own cap)
            _creditInternalDeposit(referrer, bonus);
            totalReferralPaid += bonus;
            if (!isTopUp) {
                emit ReferralBonus(referrer, referee, bonus, block.timestamp);
            } else {
                emit GapCommission(referrer, referee, bonus, block.timestamp);
            }
        }

        users[referrer].directCSV[referee] += abcdNative;
        _updateMDV(referrer, referee, abcdNative);
    }

    function _propagateLevelBonus(address origin, uint256 abcdNative) internal {
        address current = users[origin].referrer;
        for (uint8 lvl = 0; lvl < MAX_LEVELS && current != address(0); lvl++) {
            User storage up = users[current];
            if (_hasActiveDeposit(current) && _isLevelEligible(current)) {
                uint256 gross  = (abcdNative * LEVEL_BPS[lvl]) / BPS;
                if (gross > 0) {
                    // Credit to secondary pool (earns 0.30%/day, depletes)
                    if (up.secondary.checkpoint == 0) {
                        up.secondary.checkpoint = block.timestamp;
                    }
                    up.secondary.balance += gross;
                    totalLevelPaid += gross;
                    // Mint the gross amount so it's backed by real tokens
                    ABCD.mint(address(this), gross);
                    totalAbcdMinted += gross;
                    up.levelEarned[lvl] += gross;
                    emit LevelBonus(current, origin, lvl + 1, gross, 0, block.timestamp);
                }
            }
            current = up.referrer;
        }
    }

    /**
     * @dev Credit an internal (referral/gap) bonus as a new Deposit entry.
     *      dtype=0 so it's distinguishable from user deposits.
     *      Earns yield from its own start time, up to its own 200% cap.
     */
    function _creditInternalDeposit(address account, uint256 abcdBonus) internal {
        // Mint the ABCD to back this bonus deposit
        ABCD.mint(address(this), abcdBonus * 2);
        totalAbcdMinted += abcdBonus * 2;

        uint256 rate = _effectiveRoiBps(account);
        uint256 cap  = (abcdBonus * MAX_RETURN_BPS) / BPS;
        users[account].deposits.push(Deposit({
            dtype:      0,
            principal:  abcdBonus,
            rate:       rate,
            cap:        cap,
            start:      block.timestamp,
            usdtPaid:   0,
            abcdMinted: abcdBonus * 2,
            isTopUp:    false
        }));
        totalTVL += abcdBonus;
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: LEVEL ELIGIBILITY & MDV
    // ─────────────────────────────────────────────────────────

    function _isLevelEligible(address account) internal view returns (bool) {
        User storage u = users[account];
        uint256 age = block.timestamp - u.registeredAt;
        if (age <= GRACE_PERIOD)                                          return true;
        if (u.rank.id >= RANK_SMART && age <= EXTENDED_PERIOD)            return true;
        if (age > EXTENDED_PERIOD)                                        return _passesMDV(account);
        return false;
    }

    function _passesMDV(address account) internal view returns (bool) {
        return block.timestamp <= users[account].mdvBankExpiry;
    }

    function _updateMDV(address account, address direct, uint256 newAbcd) internal {
        User storage u = users[account];
        if (u.rank.id < RANK_SMART) return;

        uint256 prevTracked = u.directCSV[direct] > MDV_CAP_PER_ID
            ? MDV_CAP_PER_ID : u.directCSV[direct];
        uint256 rawNew      = u.directCSV[direct] + newAbcd;
        uint256 newTracked  = rawNew > MDV_CAP_PER_ID ? MDV_CAP_PER_ID : rawNew;
        uint256 increment   = newTracked > prevTracked ? newTracked - prevTracked : 0;
        if (increment == 0) return;

        uint256 months = increment / MDV_REQUIREMENT;
        if (months == 0) return;

        uint256 base    = block.timestamp > u.mdvBankExpiry ? block.timestamp : u.mdvBankExpiry;
        u.mdvBankExpiry = base + (months * MDV_WINDOW);
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: LEG ANCESTRY
    // ─────────────────────────────────────────────────────────

    function _registerLegAncestry(address newUser, address referrer) internal {
        userLeg[referrer][newUser] = newUser;
        address child    = referrer;
        address ancestor = users[referrer].referrer;
        for (uint8 i = 0; i < MAX_LEVELS - 1 && ancestor != address(0); i++) {
            userLeg[ancestor][newUser] = userLeg[ancestor][child];
            child    = ancestor;
            ancestor = users[ancestor].referrer;
        }
    }

    function _propagateLevelCount(address newUser, address referrer) internal {
        address current = referrer;
        for (uint8 lvl = 0; lvl < MAX_LEVELS && current != address(0); lvl++) {
            users[current].levelCount[lvl]++;
            current = users[current].referrer;
        }
    }

    function _propagateRankAchievement(address user, uint8 rankId) internal {
        address current = users[user].referrer;
        for (uint8 i = 0; i < MAX_LEVELS && current != address(0); i++) {
            address leg = userLeg[current][user];
            if (leg != address(0)) {
                if (legRankCount[current][leg][rankId] == 0) legUniqueCount[current][rankId]++;
                legRankCount[current][leg][rankId]++;
            }
            current = users[current].referrer;
        }
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: RANK UPGRADES
    // ─────────────────────────────────────────────────────────

    function _trySmartRank(address account) internal {
        User storage u = users[account];
        if (u.rank.id >= RANK_SMART) return;
        if (u.totalCSV < SMART_SELF_CSV_MIN) return;

        uint256 qualCount = 0;
        uint256 qualCSV   = 0;
        for (uint256 i = 0; i < u.directs.length; i++) {
            uint256 csv = users[u.directs[i]].totalCSV;
            if (csv >= SMART_DIR_CSV_MIN) {
                qualCount++;
                qualCSV += csv;
                if (qualCount == SMART_DIR_COUNT) break;
            }
        }
        if (qualCount < SMART_DIR_COUNT) return;

        u.rank.id         = RANK_SMART;
        u.rank.achievedAt = block.timestamp;
        u.rank.expiry     = 0;
        if (u.mdvBankExpiry < u.registeredAt + EXTENDED_PERIOD) {
            u.mdvBankExpiry = u.registeredAt + EXTENDED_PERIOD;
        }
        _propagateRankAchievement(account, RANK_SMART);

        if ((block.timestamp - u.registeredAt) <= SMART_SPEED_WIN && !u.rank.smartAirdropClaimed) {
            u.rank.smartAirdropClaimed = true;
            uint256 drop = (qualCSV * SMART_DROP_BPS) / BPS;
            totalDuoPaid += drop;
            _safeDuoTransfer(account, drop);
            emit SmartSpeedAirdrop(account, drop, block.timestamp);
        }
        emit RankAchieved(account, RANK_SMART, "Duo-Smart", 0, block.timestamp);
    }

    function _tryLeaderRank(address account) internal {
        User storage u = users[account];
        if (u.rank.id < RANK_SMART) return;

        uint8 startRank = u.rank.id;

        for (uint8 rid = RANK_PRIME; rid <= RANK_INFINITE; rid++) {
            if (startRank >= rid) {
                // Already at this rank — refresh expiry if expired
                if (startRank == rid && u.rank.expiry > 0 && block.timestamp > u.rank.expiry) {
                    if (legUniqueCount[account][rid - 1] >= REQUIRED_LEGS[rid]) {
                        u.rank.expiry = block.timestamp + RANK_VALIDITY[rid];
                    }
                }
                continue;
            }
            if (legUniqueCount[account][rid - 1] < REQUIRED_LEGS[rid]) break;

            u.rank.id         = rid;
            u.rank.achievedAt = block.timestamp;
            u.rank.expiry     = block.timestamp + RANK_VALIDITY[rid];
            _propagateRankAchievement(account, rid);

            if (rid > u.rank.highestRankPaid) {
                u.rank.highestRankPaid = rid;
                uint256 drop = RANK_AIRDROP[rid];
                if (drop > 0) {
                    totalDuoPaid += drop;
                    _safeDuoTransfer(account, drop);
                }
                emit RankAchieved(account, rid, _rankName(rid), drop, block.timestamp);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL: TRANSFER HELPERS
    // ─────────────────────────────────────────────────────────

    function _safeAbcdTransfer(address to, uint256 amount) internal {
        if (amount == 0) return;
        require(ABCD.balanceOf(address(this)) >= amount, "ABCD: insufficient reserve");
        require(ABCD.transfer(to, amount), "ABCD: transfer failed");
        totalAbcdPaid += amount;
    }

    function _safeDuoTransfer(address to, uint256 amount) internal {
        if (amount == 0) return;
        if (DUO.balanceOf(address(this)) >= amount) {
            DUO.transfer(to, amount);
            totalDuoPaid += amount;
        }
    }

    function _rankName(uint8 rid) internal pure returns (string memory) {
        if (rid == RANK_BASE)     return "Duo-Base";
        if (rid == RANK_SMART)    return "Duo-Smart";
        if (rid == RANK_PRIME)    return "Duo-Prime";
        if (rid == RANK_ELITE)    return "Duo-Elite";
        if (rid == RANK_GRAND)    return "Duo-Grand";
        if (rid == RANK_SUPREME)  return "Duo-Supreme";
        if (rid == RANK_INFINITE) return "Duo-Infinite";
        return "Unknown";
    }

    // ─────────────────────────────────────────────────────────
    //  ADMIN
    // ─────────────────────────────────────────────────────────

    function fundDuoPool(uint256 amount) external onlyOwner {
        require(DUO.allowance(msg.sender, address(this)) >= amount, "DUO: allowance");
        DUO.transferFrom(msg.sender, address(this), amount);
    }

    function setRankAirdrop(uint8 rankId, uint256 amount) external onlyOwner {
        require(rankId >= RANK_PRIME && rankId <= RANK_INFINITE, "Invalid rank");
        RANK_AIRDROP[rankId] = amount;
        emit RankAirdropUpdated(rankId, amount);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Zero address");
        treasury = newTreasury;
    }

    function rescueDuo(uint256 amount)  external onlyOwner { DUO.transfer(owner(), amount); }
    function rescueAbcd(uint256 amount) external onlyOwner { ABCD.transfer(owner(), amount); }

    // ─────────────────────────────────────────────────────────
    //  VIEW: YIELD CALCULATION  (reference-contract style)
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Total yield claimable right now for `account`.
     *
     *   For each deposit d:
     *     capFinish = d.start + (200% / rate) days   — when the deposit reaches 200%
     *     share     = d.principal * d.rate / BPS / TIME_STEP   — yield per second
     *     from      = max(d.start, user.checkpoint)
     *     to        = min(block.timestamp, capFinish)
     *     yield    += share * (to - from)   if from < to
     *
     *   Grows every second. Resets to zero after withdraw().
     */
    function getUserDividends(address account) public view returns (uint256 total) {
        User storage u = users[account];
        for (uint256 i = 0; i < u.deposits.length; i++) {
            Deposit storage d = u.deposits[i];
            if (d.principal == 0 || d.rate == 0) continue;

            // When does this deposit reach its 200% cap?
            // capFinish = start + (cap / (principal * rate / BPS)) * TIME_STEP
            uint256 capFinish = d.start + ((d.cap * BPS * TIME_STEP) / (d.principal * d.rate));

            if (u.checkpoint >= capFinish) continue; // fully matured and already claimed

            uint256 share = (d.principal * d.rate) / BPS / TIME_STEP; // wei per second
            uint256 from  = d.start > u.checkpoint ? d.start : u.checkpoint;
            uint256 to    = block.timestamp < capFinish ? block.timestamp : capFinish;

            if (from < to) {
                total += share * (to - from);
            }
        }
    }

    /**
     * @notice Pending secondary (level-bonus) yield right now.
     */
    function getSecondaryDividends(address account) public view returns (uint256) {
        SecondaryPool storage sp = users[account].secondary;
        if (sp.balance == 0 || sp.checkpoint == 0) return 0;
        uint256 elapsed = block.timestamp - sp.checkpoint;
        if (elapsed == 0) return 0;
        uint256 accrued = (sp.balance * SECONDARY_BPS * elapsed) / BPS / TIME_STEP;
        return accrued > sp.balance ? sp.balance : accrued;
    }

    // ─────────────────────────────────────────────────────────
    //  VIEW: DEPOSIT INFO
    // ─────────────────────────────────────────────────────────

    /// @notice Total number of deposits (all types) for `account`.
    function getDepositCount(address account) external view returns (uint256) {
        return users[account].deposits.length;
    }

    /**
     * @notice Full info for a single deposit by index. Returns a DepositInfo struct.
     */
    function getDepositInfo(address account, uint256 index) external view returns (DepositInfo memory info) {
        User storage u = users[account];
        require(index < u.deposits.length, "Index out of range");
        Deposit storage d = u.deposits[index];

        info.dtype      = d.dtype;
        info.principal  = d.principal;
        info.rate       = d.rate;
        info.cap        = d.cap;
        info.start      = d.start;
        info.usdtPaid   = d.usdtPaid;
        info.abcdMinted = d.abcdMinted;
        info.isTopUp    = d.isTopUp;

        if (d.principal > 0 && d.rate > 0) {
            info.capFinish   = d.start + ((d.cap * BPS * TIME_STEP) / (d.principal * d.rate));
            info.yieldPerSec = (d.principal * d.rate) / BPS / TIME_STEP;
            uint256 from = d.start > u.checkpoint ? d.start : u.checkpoint;
            uint256 to   = block.timestamp < info.capFinish ? block.timestamp : info.capFinish;
            info.claimable = from < to ? info.yieldPerSec * (to - from) : 0;
        }
    }

    /**
     * @notice All deposits as an array of DepositInfo structs.
     *         Each entry includes capFinish, yieldPerSec, and current claimable.
     */
    function getAllDeposits(address account) external view returns (DepositInfo[] memory result) {
        User storage u = users[account];
        uint256 len = u.deposits.length;
        result = new DepositInfo[](len);
        for (uint256 i = 0; i < len; i++) {
            Deposit storage d = u.deposits[i];
            result[i].dtype      = d.dtype;
            result[i].principal  = d.principal;
            result[i].rate       = d.rate;
            result[i].cap        = d.cap;
            result[i].start      = d.start;
            result[i].usdtPaid   = d.usdtPaid;
            result[i].abcdMinted = d.abcdMinted;
            result[i].isTopUp    = d.isTopUp;
            if (d.principal > 0 && d.rate > 0) {
                uint256 cf = d.start + ((d.cap * BPS * TIME_STEP) / (d.principal * d.rate));
                uint256 ps = (d.principal * d.rate) / BPS / TIME_STEP;
                uint256 fr = d.start > u.checkpoint ? d.start : u.checkpoint;
                uint256 to = block.timestamp < cf ? block.timestamp : cf;
                result[i].capFinish   = cf;
                result[i].yieldPerSec = ps;
                result[i].claimable   = fr < to ? ps * (to - fr) : 0;
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    //  VIEW: USER SUMMARY
    // ─────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────
    //  VIEW: USER DASHBOARD  (split into 3 structs — avoids stack too deep)
    // ─────────────────────────────────────────────────────────

    /// @notice Registration, deposit counts, and withdrawal totals.
    function getUserStakeInfo(address account) external view returns (StakeInfo memory info) {
        User storage u = users[account];
        info.registered              = u.registered;
        info.referrer                = u.referrer;
        info.registeredAt            = u.registeredAt;
        info.checkpoint              = u.checkpoint;
        info.totalCSV                = u.totalCSV;
        info.lastDepositRaw          = u.lastDepositRaw;
        info.depositCount            = u.deposits.length;
        info.totalPrimaryWithdrawn   = u.totalPrimaryWithdrawn;
        info.totalSecondaryWithdrawn = u.totalSecondaryWithdrawn;
    }

    /// @notice Live yield claimable right now (grows every second). Use this for UI refresh.
    function getUserYieldInfo(address account) external view returns (YieldInfo memory info) {
        info.primaryClaimable   = getUserDividends(account);
        info.secondaryBalance   = users[account].secondary.balance;
        info.secondaryClaimable = getSecondaryDividends(account);
        info.totalClaimable     = info.primaryClaimable + info.secondaryClaimable;
    }

    /// @notice Rank, ROI rate, leg counts, and MDV status.
    function getUserRankInfo(address account) external view returns (RankInfo memory info) {
        User storage u = users[account];
        info.rankId          = u.rank.id;
        info.rankName        = _rankName(u.rank.id);
        info.rankExpiry      = u.rank.expiry;
        info.rankExpired     = u.rank.expiry > 0 && block.timestamp > u.rank.expiry;
        info.effectiveRoiBps = _effectiveRoiBps(account);
        info.directCount     = u.directs.length;
        info.smartLegs       = legUniqueCount[account][RANK_SMART];
        info.primeLegs       = legUniqueCount[account][RANK_PRIME];
        info.eliteLegs       = legUniqueCount[account][RANK_ELITE];
        info.grandLegs       = legUniqueCount[account][RANK_GRAND];
        info.supremeLegs     = legUniqueCount[account][RANK_SUPREME];
        info.mdvEligible     = _passesMDV(account);
        info.mdvBankExpiry   = u.mdvBankExpiry;
    }

    // ─────────────────────────────────────────────────────────
    //  VIEW: CONVENIENCE HELPERS
    // ─────────────────────────────────────────────────────────

    /// @notice Available ABCD to claim right now (primary + secondary).
    function getUserAvailable(address account) external view returns (uint256) {
        return getUserDividends(account) + getSecondaryDividends(account);
    }

    /// @notice Total USDT deposited across all user deposits.
    function getUserTotalUsdtDeposited(address account) external view returns (uint256 total) {
        User storage u = users[account];
        for (uint256 i = 0; i < u.deposits.length; i++) {
            total += u.deposits[i].usdtPaid;
        }
    }

    /// @notice Total ABCD principal across all deposits.
    function getUserTotalPrincipal(address account) external view returns (uint256 total) {
        User storage u = users[account];
        for (uint256 i = 0; i < u.deposits.length; i++) {
            total += u.deposits[i].principal;
        }
    }

    /// @notice Total ABCD withdrawn (primary + secondary).
    function getUserTotalWithdrawn(address account) external view returns (uint256) {
        return users[account].totalPrimaryWithdrawn + users[account].totalSecondaryWithdrawn;
    }

    /// @notice Minimum raw USDT for the next addStake() call.
    function minimumNextDeposit(address account) external view returns (uint256) {
        return users[account].lastDepositRaw;
    }

    /// @notice Per-level referral counts (index 0 = Level 1 directs).
    function getLevelCounts(address account) external view returns (uint256[20] memory) {
        return users[account].levelCount;
    }

    /// @notice Referral count at a specific level (1-indexed).
    function getLevelCount(address account, uint8 level) external view returns (uint256) {
        require(level >= 1 && level <= 20, "Level out of range");
        return users[account].levelCount[level - 1];
    }

    /// @notice Direct referral addresses.
    function getDirects(address account) external view returns (address[] memory) {
        return users[account].directs;
    }

    /// @notice ABCD staked by a direct referral.
    function getDirectCSV(address account, address direct) external view returns (uint256) {
        return users[account].directCSV[direct];
    }

    /// @notice Rank upgrade progress toward next rank.
    function rankProgress(address account) external view returns (
        uint8   nextRank,
        uint256 legsHave,
        uint256 legsNeed,
        bool    canUpgrade
    ) {
        User storage u = users[account];
        nextRank = u.rank.id + 1;
        if (nextRank > RANK_INFINITE) return (RANK_INFINITE, 0, 0, false);
        uint8 prevRank = nextRank - 1;
        legsHave   = legUniqueCount[account][prevRank];
        legsNeed   = REQUIRED_LEGS[nextRank];
        canUpgrade = legsHave >= legsNeed;
    }

    /// @notice Decimal configuration used for USDT→ABCD conversion.
    function decimalInfo() external view returns (
        uint8   usdtDec,
        uint8   abcdDec,
        uint256 multiplyBy,
        uint256 divideBy
    ) {
        return (usdtDecimals, abcdDecimals, toAbcdMultiplier, toAbcdDivisor);
    }

    /// @notice Contract ABCD reserve.
    function abcdReserve() external view returns (uint256) { return ABCD.balanceOf(address(this)); }

    /// @notice Contract DUO reserve.
    function duoReserve()  external view returns (uint256) { return DUO.balanceOf(address(this)); }

    /// @notice Total number of registered users.
    function totalUsers()  external view returns (uint256) { return allUsers.length; }

    /// @notice Global site stats.
    function getSiteInfo() external view returns (
        uint256 _totalInvested,
        uint256 _totalAbcdMinted,
        uint256 _totalAbcdPaid,
        uint256 _totalDuoPaid,
        uint256 _totalReferralPaid,
        uint256 _totalLevelPaid,
        uint256 _totalTVL,
        uint256 _totalUsers
    ) {
        return (
            totalInvested, totalAbcdMinted, totalAbcdPaid,
            totalDuoPaid,  totalReferralPaid, totalLevelPaid,
            totalTVL,      allUsers.length
        );
    }
}
