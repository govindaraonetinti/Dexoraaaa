// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================
 *  DuoToken  (_abcd)  |  DuoVault Ecosystem
 * ============================================================
 *
 *  Standard ERC-20 with:
 *
 *  Whitelist-controlled minting
 *    - Only addresses on the MINT WHITELIST can call mint()
 *    - Owner can add or remove whitelist addresses at any time
 *    - Multiple contracts (e.g. DuoYield v1, v2, migration)
 *      can be whitelisted simultaneously
 *    - Full enumeration: owner can query the entire whitelist
 *
 *  Hard cap
 *    - MAX_SUPPLY set at deployment; can never be exceeded
 *
 *  Burnable
 *    - Any holder can burn their own tokens
 *    - burnFrom() available with allowance
 *
 * ============================================================
 *  Deployment checklist
 * ============================================================
 *  1. Deploy DuoToken(name, symbol, maxSupply, initSupply)
 *  2. Deploy DuoYield(usdt, abcd, duo, treasury)
 *  3. Call addToWhitelist(DuoYield_address)  on DuoToken
 *     -> DuoYield can now mint on every user stake
 *  4. Optionally call removeFromWhitelist(deployer_address)
 *     -> Deployer can no longer mint; only DuoYield can
 * ============================================================
 */

// ------------------------------------------------------------
//  Ownable
// ------------------------------------------------------------
abstract contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed prev, address indexed next);

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Zero address");
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }

    function owner() public view returns (address) { return _owner; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }
}

// ------------------------------------------------------------
//  DuoToken
// ------------------------------------------------------------
contract DuoToken is Ownable {

    // -- ERC-20 metadata --------------------------------------
    string  public name;
    string  public symbol;
    uint8   public constant decimals = 18;

    // -- Supply -----------------------------------------------
    uint256 public totalSupply;
    uint256 public immutable MAX_SUPPLY;

    // -- ERC-20 core state ------------------------------------
    mapping(address => uint256)                     private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // -- Mint Whitelist ---------------------------------------
    // isWhitelisted[addr]  : O(1) lookup
    // _whitelist[]         : ordered array for enumeration
    // _whitelistIndex[addr]: position + 1 in _whitelist (0 = not listed)
    mapping(address => bool)    public  isWhitelisted;
    address[]                   private _whitelist;
    mapping(address => uint256) private _whitelistIndex;

    // -- Events -----------------------------------------------
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    event Mint(address indexed minter, address indexed to, uint256 amount, uint256 newTotalSupply);
    event Burn(address indexed from, uint256 amount, uint256 newTotalSupply);

    // -- Constructor ------------------------------------------
    /**
     * @param _name        Token name   (e.g. "DuoYield Token")
     * @param _symbol      Token symbol (e.g. "ABCD")
     * @param _maxSupply   Hard cap in wei (e.g. 1_000_000_000e18 for 1 billion tokens)
     * @param _initSupply  Initial mint to deployer. 0 = no pre-mint. Must be <= _maxSupply.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _initSupply
    ) Ownable(msg.sender) {
        require(_maxSupply > 0, "Max supply must be > 0");
        require(_initSupply <= _maxSupply, "Init supply exceeds max supply");

        name       = _name;
        symbol     = _symbol;
        MAX_SUPPLY = _maxSupply;

        // Deployer is whitelisted by default so they can mint during setup
        _addToWhitelist(msg.sender);

        if (_initSupply > 0) {
            _mint(msg.sender, _initSupply);
        }
    }

    // ============================================================
    //  ERC-20 STANDARD
    // ============================================================

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address _owner, address spender) external view returns (uint256) {
        return _allowances[_owner][spender];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 current = _allowances[from][msg.sender];
        require(current >= amount, "ERC20: insufficient allowance");
        unchecked { _allowances[from][msg.sender] = current - amount; }
        _transfer(from, to, amount);
        return true;
    }

    /// @notice Safely increase allowance (avoids the ERC-20 approve race condition).
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }

    /// @notice Safely decrease allowance.
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        uint256 current = _allowances[msg.sender][spender];
        require(current >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked { _approve(msg.sender, spender, current - subtractedValue); }
        return true;
    }

    // ============================================================
    //  MINT  (whitelist-gated)
    // ============================================================

    /**
     * @notice Mint `amount` tokens to `to`.
     *
     *         Caller MUST be on the mint whitelist.
     *         Total supply after mint must not exceed MAX_SUPPLY.
     *
     * @param to     Recipient address
     * @param amount Amount in wei (18 decimals)
     */
    function mint(address to, uint256 amount) external {
        require(isWhitelisted[msg.sender], "Caller is not whitelisted");
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Amount must be > 0");
        require(totalSupply + amount <= MAX_SUPPLY, "Exceeds max supply");

        _mint(to, amount);
        emit Mint(msg.sender, to, amount, totalSupply);
    }

    // ============================================================
    //  BURN
    // ============================================================

    /// @notice Burn tokens from caller's own balance.
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Burn `amount` from `from` using caller's allowance.
    function burnFrom(address from, uint256 amount) external {
        uint256 current = _allowances[from][msg.sender];
        require(current >= amount, "ERC20: insufficient allowance");
        unchecked { _allowances[from][msg.sender] = current - amount; }
        _burn(from, amount);
    }

    // ============================================================
    //  WHITELIST MANAGEMENT  (owner only)
    // ============================================================

    /**
     * @notice Add `account` to the mint whitelist.
     *         After calling this, `account` can call mint().
     *
     *         Typical usage:
     *           addToWhitelist(DuoYield_contract_address)
     *
     * @param account Address to whitelist
     */
    function addToWhitelist(address account) external onlyOwner {
        require(account != address(0), "Zero address");
        require(!isWhitelisted[account], "Already whitelisted");
        _addToWhitelist(account);
    }

    /**
     * @notice Remove `account` from the mint whitelist.
     *         After calling this, `account` can no longer mint.
     *
     *         Use this to revoke access from old contract versions
     *         when upgrading to a new DuoYield deployment.
     *
     * @param account Address to remove
     */
    function removeFromWhitelist(address account) external onlyOwner {
        require(isWhitelisted[account], "Not whitelisted");
        _removeFromWhitelist(account);
    }

    /**
     * @notice Add multiple addresses to the whitelist in a single transaction.
     * @param accounts Array of addresses to whitelist
     */
    function addToWhitelistBatch(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(accounts[i] != address(0), "Zero address in batch");
            if (!isWhitelisted[accounts[i]]) {
                _addToWhitelist(accounts[i]);
            }
        }
    }

    /**
     * @notice Remove multiple addresses from the whitelist in a single transaction.
     * @param accounts Array of addresses to remove
     */
    function removeFromWhitelistBatch(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (isWhitelisted[accounts[i]]) {
                _removeFromWhitelist(accounts[i]);
            }
        }
    }

    // ============================================================
    //  WHITELIST VIEW FUNCTIONS
    // ============================================================

    /// @notice Returns the full list of currently whitelisted addresses.
    function getWhitelist() external view returns (address[] memory) {
        return _whitelist;
    }

    /// @notice Returns the number of whitelisted addresses.
    function whitelistCount() external view returns (uint256) {
        return _whitelist.length;
    }

    /// @notice Returns the whitelisted address at a specific index.
    function whitelistAt(uint256 index) external view returns (address) {
        require(index < _whitelist.length, "Index out of bounds");
        return _whitelist[index];
    }

    // ============================================================
    //  INTERNAL: WHITELIST
    // ============================================================

    function _addToWhitelist(address account) internal {
        isWhitelisted[account]     = true;
        _whitelistIndex[account]   = _whitelist.length + 1;  // 1-based
        _whitelist.push(account);
        emit AddedToWhitelist(account);
    }

    /**
     * @dev Swap-and-pop removal to keep the array compact without gaps.
     *      O(1) removal using the stored index.
     */
    function _removeFromWhitelist(address account) internal {
        uint256 index      = _whitelistIndex[account] - 1;   // convert to 0-based
        uint256 lastIndex  = _whitelist.length - 1;
        address lastAddr   = _whitelist[lastIndex];

        // Move last element into the removed slot
        _whitelist[index]         = lastAddr;
        _whitelistIndex[lastAddr] = index + 1;               // update moved address index

        // Remove last slot
        _whitelist.pop();
        delete _whitelistIndex[account];
        isWhitelisted[account] = false;

        emit RemovedFromWhitelist(account);
    }

    // ============================================================
    //  INTERNAL: ERC-20
    // ============================================================

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "ERC20: insufficient balance");

        unchecked {
            _balances[from] -= amount;
            _balances[to]   += amount;
        }
        emit Transfer(from, to, amount);
    }

    function _approve(address _owner, address spender, uint256 amount) internal {
        require(_owner  != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");
        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }

    function _mint(address to, uint256 amount) internal {
        unchecked {
            totalSupply   += amount;
            _balances[to] += amount;
        }
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        require(_balances[from] >= amount, "ERC20: insufficient balance");
        unchecked {
            _balances[from] -= amount;
            totalSupply     -= amount;
        }
        emit Transfer(from, address(0), amount);
        emit Burn(from, amount, totalSupply);
    }

    // ============================================================
    //  VIEW HELPERS
    // ============================================================

    /// @notice Remaining tokens that can still be minted before hitting MAX_SUPPLY.
    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply;
    }
}
