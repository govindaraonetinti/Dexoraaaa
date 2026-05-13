import { BsEyeSlash, BsEye } from "react-icons/bs";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAuthAddress } from "../../lib/hooks/useAuthAddress";
import { getNumberTransformed, toastinfo } from "../../utils";
import { useSearchParams } from 'react-router-dom';
import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";

export type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] | undefined }) => Promise<unknown>;
    on?: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
};
export default function StakeStats() {
    const STAKING_BRIDGE_ADDRESS = "0xf290f2fc64461448088e534d31d50bb72a073b83";
    const [searchParams] = useSearchParams();
    const { address } = useAuthAddress();
    const referrer = searchParams.get("ref") || address;
    const [hidden, setHidden] = useState(false);
    const [userinfo, setUserInfo] = useState<any>(null);
    const [userinvestments, setuserinvestments] = useState<any>(null);
    const [getlevelreferralcounts, setLevelReferralCounts] = useState<any>(null);
    const [getLevelEarnings, setLevelEarning] = useState<any>(null);
    const [getDirectCSV, setDirectCSV] = useState<any>(null); 
    const [stats, setStats] = useState<any>([]);

    const [amount, setAmount] = useState("");
    const [avlBalace, setAvlBalance] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);
    // useEffect(() => {
    //     // Function to call every minute
    //     const myFunction = () => {
    //         console.log('Called every minute');
    //         calculatebalance("TTT", "Bsc-testnet mainnet");
    //         getUserInfo();
    //         getInvestments();
    //         getLevelReferralCounts();
    //     };
    //     // Call immediately on mount
    //     myFunction();
    //     // Set up interval
    //     const intervalId = setInterval(myFunction, 60000); // 60000ms = 1 minute
    //     // Cleanup on unmount
    //     return () => clearInterval(intervalId);
    // }, []);
    useEffect(() => {
        // Function to call every minute
        if (address) {
            calculatebalance("TTT", "Bsc-testnet mainnet");
            getUserInfo();
            getInvestments();
            getLevelReferralCounts();
        }
    }, [address]); // Empty dependency array = runs once on mount

    const CURRENCIES_DATA: any[] = [
        { name: "TTT", shortcode: "TTT", network: "Bsc-testnet mainnet", contractAddress: "0xd04a56cdc466087a9afa0f27585a1eef51696234", decimals: 9, chainid: 97, rpc: 'https://data-seed-prebsc-2-s2.bnbchain.org:8545', mode: "onchain", mindeposit: "5", time: "1" },
    ];
    const ERC20_ABI = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function balanceOf(address account) public view returns (uint256)",
        "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
        "function nonces(address owner) external view returns (uint256)",
        "function transfer(address owner,  uint256 amount) public returns (bool)"
    ];
    const STAKING_ABI = [{"inputs":[{"internalType":"address","name":"_usdt","type":"address"},{"internalType":"address","name":"_abcd","type":"address"},{"internalType":"address","name":"_duo","type":"address"},{"internalType":"address","name":"_treasury","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"depositIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdtPaid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"abcdMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"principal","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isTopUp","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"DepositMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"address","name":"referee","type":"address"},{"indexed":false,"internalType":"uint256","name":"abcdAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"GapCommission","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"depositIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"IDDeactivated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"address","name":"origin","type":"address"},{"indexed":false,"internalType":"uint8","name":"level","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"credited","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"flushed","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"LevelBonus","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"prev","type":"address"},{"indexed":true,"internalType":"address","name":"next","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint8","name":"rankId","type":"uint8"},{"indexed":false,"internalType":"string","name":"rankName","type":"string"},{"indexed":false,"internalType":"uint256","name":"duoAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"RankAchieved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"rankId","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"newAmount","type":"uint256"}],"name":"RankAirdropUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"address","name":"referee","type":"address"},{"indexed":false,"internalType":"uint256","name":"abcdAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"ReferralBonus","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"usdtPaid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"abcdMinted","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Registered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"abcdAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"SecondaryWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"duoAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"SmartSpeedAirdrop","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"duoAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"WelcomeAirdrop","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"abcdAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"ABCD","outputs":[{"internalType":"contract IMintable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DUO","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EXTENDED_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"GRACE_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_LEVELS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_RETURN_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MDV_CAP_PER_ID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MDV_REQUIREMENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MDV_WINDOW","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"RANK_AIRDROP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_BASE","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"RANK_DAILY_ROI","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_ELITE","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_GRAND","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_INFINITE","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_PRIME","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_SMART","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RANK_SUPREME","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"RANK_VALIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REFERRAL_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"REQUIRED_LEGS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDARY_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SMART_DIR_COUNT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SMART_DIR_CSV_MIN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SMART_DROP_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SMART_SELF_CSV_MIN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SMART_SPEED_WIN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TIME_STEP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDT","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WELCOME_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"abcdDecimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"abcdReserve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"usdtRaw","type":"uint256"}],"name":"addStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimalInfo","outputs":[{"internalType":"uint8","name":"usdtDec","type":"uint8"},{"internalType":"uint8","name":"abcdDec","type":"uint8"},{"internalType":"uint256","name":"multiplyBy","type":"uint256"},{"internalType":"uint256","name":"divideBy","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"duoReserve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fundDuoPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getAllDeposits","outputs":[{"components":[{"internalType":"uint8","name":"dtype","type":"uint8"},{"internalType":"uint256","name":"principal","type":"uint256"},{"internalType":"uint256","name":"rate","type":"uint256"},{"internalType":"uint256","name":"cap","type":"uint256"},{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"usdtPaid","type":"uint256"},{"internalType":"uint256","name":"abcdMinted","type":"uint256"},{"internalType":"bool","name":"isTopUp","type":"bool"},{"internalType":"uint256","name":"capFinish","type":"uint256"},{"internalType":"uint256","name":"yieldPerSec","type":"uint256"},{"internalType":"uint256","name":"claimable","type":"uint256"}],"internalType":"struct DuoYield.DepositInfo[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getDepositCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getDepositInfo","outputs":[{"components":[{"internalType":"uint8","name":"dtype","type":"uint8"},{"internalType":"uint256","name":"principal","type":"uint256"},{"internalType":"uint256","name":"rate","type":"uint256"},{"internalType":"uint256","name":"cap","type":"uint256"},{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"usdtPaid","type":"uint256"},{"internalType":"uint256","name":"abcdMinted","type":"uint256"},{"internalType":"bool","name":"isTopUp","type":"bool"},{"internalType":"uint256","name":"capFinish","type":"uint256"},{"internalType":"uint256","name":"yieldPerSec","type":"uint256"},{"internalType":"uint256","name":"claimable","type":"uint256"}],"internalType":"struct DuoYield.DepositInfo","name":"info","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"direct","type":"address"}],"name":"getDirectCSV","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getDirects","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getDirectsInfo","outputs":[{"components":[{"internalType":"address","name":"wallet","type":"address"},{"internalType":"uint256","name":"totalCSV","type":"uint256"},{"internalType":"uint256","name":"directCSVForMe","type":"uint256"},{"internalType":"uint8","name":"rankId","type":"uint8"},{"internalType":"string","name":"rankName","type":"string"},{"internalType":"bool","name":"hasActiveStake","type":"bool"},{"internalType":"uint256","name":"registeredAt","type":"uint256"}],"internalType":"struct DuoYield.DirectInfo[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getLevelCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getLevelCounts","outputs":[{"internalType":"uint256[20]","name":"","type":"uint256[20]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getLevelEarning","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getLevelEarnings","outputs":[{"internalType":"uint256[20]","name":"","type":"uint256[20]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getSecondaryDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSiteInfo","outputs":[{"internalType":"uint256","name":"_totalInvested","type":"uint256"},{"internalType":"uint256","name":"_totalAbcdMinted","type":"uint256"},{"internalType":"uint256","name":"_totalAbcdPaid","type":"uint256"},{"internalType":"uint256","name":"_totalDuoPaid","type":"uint256"},{"internalType":"uint256","name":"_totalReferralPaid","type":"uint256"},{"internalType":"uint256","name":"_totalLevelPaid","type":"uint256"},{"internalType":"uint256","name":"_totalTVL","type":"uint256"},{"internalType":"uint256","name":"_totalUsers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserAvailable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserDividends","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserRankInfo","outputs":[{"components":[{"internalType":"uint8","name":"rankId","type":"uint8"},{"internalType":"string","name":"rankName","type":"string"},{"internalType":"uint256","name":"rankExpiry","type":"uint256"},{"internalType":"bool","name":"rankExpired","type":"bool"},{"internalType":"uint256","name":"effectiveRoiBps","type":"uint256"},{"internalType":"uint256","name":"directCount","type":"uint256"},{"internalType":"uint256","name":"smartLegs","type":"uint256"},{"internalType":"uint256","name":"primeLegs","type":"uint256"},{"internalType":"uint256","name":"eliteLegs","type":"uint256"},{"internalType":"uint256","name":"grandLegs","type":"uint256"},{"internalType":"uint256","name":"supremeLegs","type":"uint256"},{"internalType":"bool","name":"mdvEligible","type":"bool"},{"internalType":"uint256","name":"mdvBankExpiry","type":"uint256"}],"internalType":"struct DuoYield.RankInfo","name":"info","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserStakeInfo","outputs":[{"components":[{"internalType":"bool","name":"registered","type":"bool"},{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"registeredAt","type":"uint256"},{"internalType":"uint256","name":"checkpoint","type":"uint256"},{"internalType":"uint256","name":"totalCSV","type":"uint256"},{"internalType":"uint256","name":"lastDepositRaw","type":"uint256"},{"internalType":"uint256","name":"depositCount","type":"uint256"},{"internalType":"uint256","name":"totalPrimaryWithdrawn","type":"uint256"},{"internalType":"uint256","name":"totalSecondaryWithdrawn","type":"uint256"}],"internalType":"struct DuoYield.StakeInfo","name":"info","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserTotalPrincipal","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserTotalUsdtDeposited","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserTotalWithdrawn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getUserYieldInfo","outputs":[{"components":[{"internalType":"uint256","name":"primaryClaimable","type":"uint256"},{"internalType":"uint256","name":"secondaryBalance","type":"uint256"},{"internalType":"uint256","name":"secondaryClaimable","type":"uint256"},{"internalType":"uint256","name":"totalClaimable","type":"uint256"}],"internalType":"struct DuoYield.YieldInfo","name":"info","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"usdtRaw","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"}],"name":"initialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"legUniqueCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"minimumNextDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"rankProgress","outputs":[{"internalType":"uint8","name":"nextRank","type":"uint8"},{"internalType":"uint256","name":"legsHave","type":"uint256"},{"internalType":"uint256","name":"legsNeed","type":"uint256"},{"internalType":"bool","name":"canUpgrade","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"refreshRank","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueAbcd","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueDuo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"rankId","type":"uint8"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"setRankAirdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newTreasury","type":"address"}],"name":"setTreasury","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"toAbcdDivisor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"toAbcdMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalAbcdMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalAbcdPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDuoPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalInvested","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalLevelPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalReferralPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTVL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"usdtDecimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"userLeg","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawSecondary","outputs":[],"stateMutability":"nonpayable","type":"function"}];

    const calculatebalance = async (selectedCurrencyArg?: string, selectedNetworkArg?: string) => {
        const sCurrency = selectedCurrencyArg;
        const sNetwork = selectedNetworkArg;
        if (!sCurrency || !sNetwork) {
            setAvlBalance('0');
        } else if (!address) {
            setAvlBalance('0');
        } else {
            const currencyinfo = CURRENCIES_DATA.find(c => c.shortcode === sCurrency && c.network === sNetwork);
            if (!currencyinfo) {
                setAvlBalance('0');
            } else {
                try {
                    const provider = new ethers.JsonRpcProvider(currencyinfo.rpc);
                    const contract = new ethers.Contract(currencyinfo.contractAddress, ERC20_ABI, provider);
                    const balance = await contract.balanceOf(address);
                    console.log("balance", ethers.formatUnits(balance.toString(), currencyinfo.decimals).toString(), address, balance);
                    setAvlBalance(ethers.formatUnits(balance.toString(), currencyinfo.decimals).toString());
                    return balance;
                } catch (err) {
                    console.error("balance fetch failed:", err, address);
                    // ... error handling
                }
            }
        }
    };
    const getUserInfo = async () => {
        try {
            if (!address) {
                setAvlBalance('0');
            } else {
                const currencyinfo = CURRENCIES_DATA[0];
                const provider = new ethers.JsonRpcProvider(currencyinfo.rpc);
                const contract = new ethers.Contract(STAKING_BRIDGE_ADDRESS, STAKING_ABI, provider);
                const userinfo = await contract.getUserStakeInfo(address);
                const YieldInfo = await contract.getUserYieldInfo(address);
                console.log("userinfo", userinfo);
                setStats([
                    { label: "Total Buy", value: getNumberTransformed(ethers.formatUnits(userinfo[4], 18).toString()) },
                    { label: "Last Deposit", value: getNumberTransformed(ethers.formatUnits(userinfo[5], 9).toString()) },
                    { label: "Withdrawable", value: getNumberTransformed(ethers.formatUnits(YieldInfo[3], 18).toString()) },
                ]);
                setUserInfo(userinfo);
            }
        } catch (err) {
            console.error("getUserInfo fetch failed:", err);
        }
    };
    const getInvestments = async () => {
        try {
            if (!address) {
                setAvlBalance('0');
            } else {
                const currencyinfo = CURRENCIES_DATA[0];
                const provider = new ethers.JsonRpcProvider(currencyinfo.rpc);
                const contract = new ethers.Contract(STAKING_BRIDGE_ADDRESS, STAKING_ABI, provider);
                const userinvestments = await contract.getAllDeposits(address);
                console.log("userinvestments", userinvestments);
                setuserinvestments(userinvestments);
            }
        } catch (err) {
            console.error("balance fetch failed:", err);
        }
    };

    const getLevelReferralCounts = async () => {
        try {
            if (!address) {
                setAvlBalance('0');
            } else {
                const currencyinfo = CURRENCIES_DATA[0];
                const provider = new ethers.JsonRpcProvider(currencyinfo.rpc);
                const contract = new ethers.Contract(STAKING_BRIDGE_ADDRESS, STAKING_ABI, provider);
                const getlevelreferralcounts = await contract.getLevelCounts(address);
                console.log("getlevelreferralcounts", getlevelreferralcounts);
                setLevelReferralCounts(getlevelreferralcounts);
                const getLevelEarning = await contract.getLevelEarnings(address);
                console.log("getLevelEarning", getLevelEarning);
                setLevelEarning(getLevelEarning);
                const getdirectreferral = await contract.getDirectsInfo(address);
                console.log("getdirectreferral", getdirectreferral);
                setDirectCSV(getdirectreferral);
            }
        } catch (err) {
            console.error("balance fetch failed:", err);
        }
    };

    const stakenow = async () => {
        const amt = amount;
        if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
            toastinfo("Please enter a valid amount.");
            return;
        }
        if (Number(amt) < 5) {
            toastinfo("Minimum deposit is 5 USDC. Amounts less than 5 USDC will be lost.");
            return;
        }
        if (!window.ethereum) {
            toastinfo('Please install MetaMask!');
            return;
        }
        // Find currency metadata
        const currencyinfo = CURRENCIES_DATA[0];
        if (!currencyinfo) {
            toastinfo("Selected currency/network combination is not supported.");
            return;
        }
        // If no contract address (e.g. Bitcoin) — not supported in this on-chain flow
        if (!currencyinfo.contractAddress || currencyinfo.contractAddress === ethers.ZeroAddress) {
            toastinfo(`${currencyinfo.name} on ${currencyinfo.network} is not supported for direct ERC20 deposit via this bridge.`);
            return;
        }
        // setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
            const network = await provider.getNetwork();
            const currentChainId = Number(network.chainId);
            // If wrong chain, attempt to switch
            if (Number(currentChainId) != Number(currencyinfo.chainid)) {
                try {
                    await (window.ethereum as MetaMaskProvider).request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + Number(currencyinfo.chainid).toString(16) }],
                    });
                    // After switching, re-init provider to ensure correct network
                    // Note: provider may not auto-refresh; rebuilding browser provider is safe
                } catch (switchError) {
                    console.error("Failed to switch network", switchError);
                    toastinfo("Please switch your wallet to the required network and try again.");
                    setLoading(false);
                    return;
                }
            }
            const signer = await provider.getSigner();
            // Minimum deposit is 5 USDC
            if (parseFloat(amt) < 5) {
                toastinfo('Minimum deposit is 5 USDC. Amounts less than 5 USDC will be lost forever!');
                return;
            }
            // Convert amount to proper format (USDC has 6 decimals)
            const amount = ethers.parseUnits(amt.toString(), currencyinfo.decimals);
            const usdcContract = new ethers.Contract(currencyinfo.contractAddress, ERC20_ABI, signer);
            const tokencontract = new ethers.Contract(STAKING_BRIDGE_ADDRESS, STAKING_ABI, signer);
            const balance = await usdcContract.balanceOf(address);
            if (balance < amount) {
                toast.error(`Insufficient ${currencyinfo.shortcode} balance. You have ${ethers.formatUnits(balance, currencyinfo.decimals)} ${currencyinfo.shortcode}`);
                return;
            }
            if (Number(amount) < Number(userinfo[5])) {
                toast.error(`Deposit amount should be greater than previous deposit amount.  you can deposit ${ethers.formatUnits(userinfo[5], currencyinfo.decimals)} ${currencyinfo.shortcode} or more.`);
                return;
            }
            // console.log(`Depositing ${amt} ${currencyinfo.shortcode} to ABC Dex...`);
            // Check current allowance
            const currentAllowance = await usdcContract.allowance(address, STAKING_BRIDGE_ADDRESS);
            // Step 1: Approve bridge if needed
            if (currentAllowance < amount) {
                // console.log('Approving USDC spend...');
                toastinfo('Approving allowance for bridge...');
                const approveTx = await usdcContract.approve(STAKING_BRIDGE_ADDRESS, amount);
                await approveTx.wait();
                
                // console.log('Approval confirmed');
            }
            const amount64 = amount.toString();
            console.log('Depositing to bridge...', amount64, address, referrer);
            let depositTx;
            if (userinfo[0] == false)
                depositTx = await tokencontract.initialStake(amount64, referrer);
            else
                depositTx = await tokencontract.addStake(amount64);

            toast.success('Deposit transaction sent! Your staking rewards will start shortly.');
            const receipt = await depositTx.wait();
            // console.log('Deposit confirmed:', receipt);
            calculatebalance("TTT", "Bsc-testnet mainnet");
            getUserInfo();
            getInvestments();
            setLoading(false);
            return receipt;
        } catch (error: any) {
            console.error('Deposit failed:', error);
            // More specific error handling
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                toastinfo('Transaction was rejected by user');
            } else if (error.message.includes('INVALID_SIGNATURE')) {
                toastinfo('Invalid signature. Please try again.');
            } else if (error.message.includes('EXPIRED')) {
                toastinfo('Permit expired. Please try again.');
            } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
                toastinfo('Insufficient funds for gas fees');
            } else if (error.message.includes('insufficient funds')) {
                toastinfo('Insufficient ETH for gas fees');
            } else if (error.message.includes('execution reverted')) {
                toastinfo('Transaction failed. Please check your inputs and try again.');
            } else {
                toast.error(`${error.message}`);
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const Withdraw = async () => {
        const currencyinfo = CURRENCIES_DATA[0];
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
            const network = await provider.getNetwork();
            const currentChainId = Number(network.chainId);
            // If wrong chain, attempt to switch
            if (currentChainId !== Number(currencyinfo.chainid)) {
                try {
                    await (window.ethereum as MetaMaskProvider).request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + Number(currencyinfo.chainid).toString(16) }],
                    });
                    // After switching, re-init provider to ensure correct network
                    // Note: provider may not auto-refresh; rebuilding browser provider is safe
                } catch (switchError) {
                    console.error("Failed to switch network", switchError);
                    toastinfo("Please switch your wallet to the required network and try again.");
                    setLoading(false);
                    return;
                }
            }
            const signer = await provider.getSigner();
            const tokencontract = new ethers.Contract(STAKING_BRIDGE_ADDRESS, STAKING_ABI, signer);
            const depositTx = await tokencontract.withdraw();

            toast.success('Withdraw processed! Your funds will be sent to your wallet.');
            const receipt = await depositTx.wait();
            // console.log('Deposit confirmed:', receipt);
            calculatebalance("TTT", "Bsc-testnet mainnet");
            getUserInfo();
            getInvestments();
            setLoading(false);
            return receipt;
        } catch (error: any) {
            console.error('Deposit failed:', error);
            // More specific error handling
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                toastinfo('Transaction was rejected by user');
            } else if (error.message.includes('INVALID_SIGNATURE')) {
                toastinfo('Invalid signature. Please try again.');
            } else if (error.message.includes('EXPIRED')) {
                toastinfo('Permit expired. Please try again.');
            } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
                toastinfo('Insufficient funds for gas fees');
            } else if (error.message.includes('insufficient funds')) {
                toastinfo('Insufficient ETH for gas fees');
            } else if (error.message.includes('execution reverted')) {
                toastinfo('Transaction failed. Please check your inputs and try again.');
            } else {
                toast.error(`${error.message}`);
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full">
            <div className="flex md:flex-row flex-col gap-6 justify-between items-center mt-18 border-2 border-[#2A2A32] p-6">

                {/* Left Section */}
                <div className="flex items-center gap-5">
                    <div className="text-[24px] font-bold text-white">Start staking</div>
                </div>
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                        <input type="text" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent outline-none text-sm border-2 border-gray-400 p-2" />
                        <span className="text-sm text-gray-400 mt-1 cursor-pointer" onClick={() => { setAmount(avlBalace) }}>
                            Max: {avlBalace}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {loading ? <button className="border-2 border-[#2A2A32] px-5 py-2"> Processing... </button> : <button className="border-2 border-[#2A2A32] px-5 py-2" onClick={() => stakenow()}> Stake Now </button>}
                    {loading ? <button className="border-2 border-[#2A2A32] px-5 py-2"> Processing... </button> : <button className="border-2 border-[#2A2A32] px-5 py-2" onClick={() => Withdraw()}> Withdraw Now </button>}
                </div>
            </div>
            <div className="flex md:flex-row flex-col gap-6 justify-between items-center mt-18 border-2 border-[#2A2A32] p-6" style={{ "display": "none" }}>
                {/* Left Section */}
                <div className=" items-center gap-5">
                    <div className="text-[24px] font-bold text-white"> registered {userinfo && userinfo[0]}</div>
                    <div className="text-[24px] font-bold text-white"> referrer {userinfo && userinfo[1]}</div>
                    <div className="text-[24px] font-bold text-white"> registeredAt {userinfo && userinfo[2]}</div>
                    <div className="text-[24px] font-bold text-white"> checkpoint {userinfo && userinfo[3]}</div>
                    <div className="text-[24px] font-bold text-white"> totalCSV {userinfo && userinfo[4]}</div>
                    <div className="text-[24px] font-bold text-white"> lastDepositRaw {userinfo && userinfo[5]}</div>
                    <div className="text-[24px] font-bold text-white"> depositCount {userinfo && userinfo[6]}</div>
                    <div className="text-[24px] font-bold text-white"> totalPrimaryWithdrawn {userinfo && userinfo[7]}</div>
                    <div className="text-[24px] font-bold text-white"> totalSecondaryWithdrawn {userinfo && userinfo[8]}</div>
                </div>
            </div>
            <div className="md:flex-row flex-col gap-6 justify-between items-center mt-18 border-2 border-[#2A2A32] p-6">
                <div className="flex md:flex-row flex-col justify-between items-center p-6">
                    {/* Left Section */}
                    <div className="flex items-center gap-5">
                        <div className="text-[24px] font-bold text-white">Profile Overview</div>
                        <button
                            onClick={() => setHidden(!hidden)}
                            className="border border-[#454667] p-3 rounded-full"
                        >
                            {hidden ? <BsEye /> : <BsEyeSlash />}
                        </button>
                    </div>
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {stats.map((s: any, i: any) => (
                            <div key={s.label + i}  className="border-2 border-[#2A2A32] px-5 py-2" >
                                <div className="text-[15px] text-[#D7E2F4]/50">{s.label}</div>
                                <div className="text-[24px] font-bold text-white mt-1">
                                    {hidden ? "***" : s.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex md:flex-row flex-col justify-between items-center pl-6 pr-6">
                    {/* Left Section */}
                    <div className="flex items-center gap-5">
                        <div className="text-[24px] font-bold text-white">Referral Id</div> :
                        <CopyToClipboard
                            text={address ? `${window.location.origin}/staking?ref=${address}` : `${window.location.origin}/staking`}
                            onCopy={() => {
                                toast.success("Referral link Copied");
                            }}
                        >
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="text-[18px] font-bold text-white">
                                    {address && `${address}`}
                                </div>
                                <span className="text-[24px] font-bold text-[#C2954E]">Copy</span>
                            </div>
                        </CopyToClipboard>
                    </div>
                </div>
            </div>
            <div className="flex md:flex-row flex-col gap-6 justify-between items-center mt-18 border-2 border-[#2A2A32] p-6">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Sl No</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Deposit Type</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Principal</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Rate</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Cap</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Start</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>usdtPaid</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>abcdMinted</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>isTopUp</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>capFinish</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>yieldPerSec</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Claimable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userinvestments && [...userinvestments].reverse().map((item: any, index: any) => (
                            <tr key={index}>
                                <td style={{ padding: '8px' }}>{index + 1}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{item[0] == 1 ? "Direct" : "Referral"}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{getNumberTransformed(ethers.formatUnits(item[1], 18).toString())}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{Number(item[2]) / 100} </td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{getNumberTransformed(ethers.formatUnits(item[3], 18).toString())}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{new Date(Number(item[4]) * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{getNumberTransformed(ethers.formatUnits(item[5], 9).toString())}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{getNumberTransformed(ethers.formatUnits(item[6], 18).toString())}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{item[7] == true ? "Yes" : "No"}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{new Date(Number(item[8]) * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{getNumberTransformed(ethers.formatUnits(item[9], 18).toString())}</td>
                                <td style={{ textAlign: 'left', padding: '8px' }}>{getNumberTransformed(ethers.formatUnits(item[10], 18).toString())}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex md:flex-row flex-col gap-6 justify-between items-center mt-18 border-2 border-[#2A2A32] p-6">

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Level</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Wallet Address</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Amount Paid</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>My Direct Payment</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>User Rank</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Rank Name</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Has Active Stake</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Registered On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getDirectCSV && [...getDirectCSV].map((item: any, index: any) => (
                            <tr key={index}>
                                <td style={{ padding: '8px' }}>Level {index + 1}</td>
                                <td style={{ padding: '8px' }}>{item[0]}</td>
                                <td style={{ padding: '8px' }}>{ ethers.formatUnits(item[1], 18).toString() }</td>
                                <td style={{ padding: '8px' }}>{ ethers.formatUnits(item[2], 18).toString() }</td>
                                <td style={{ padding: '8px' }}>{item[3] }</td>
                                <td style={{ padding: '8px' }}>{item[4]}</td>
                                <td style={{ padding: '8px' }}>{item[5] == true ? "Yes" : "No"}</td>
                                <td style={{ padding: '8px' }}>{new Date(Number(item[6]) * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex md:flex-row flex-col gap-6 justify-between items-center mt-18 border-2 border-[#2A2A32] p-6">

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Level</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Referral Count</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Referral Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getlevelreferralcounts && [...getlevelreferralcounts].map((item: any, index: any) => (
                            <tr key={index}>
                                <td style={{ padding: '8px' }}>Level {index + 1}</td>
                                <td style={{ padding: '8px' }}>{Number(item)}</td>
                                <td style={{ padding: '8px' }}>{getLevelEarnings ? ethers.formatUnits(getLevelEarnings[index], 18).toString() : 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
