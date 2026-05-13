import { ethers } from "ethers";
import { CHAIN_ID_TO_NETWORK } from "./useLifiTokens";

const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function getTokenBalance(chainId: number, setAvlbalance: (avlBalance: number) => void, tokenAddress?: string, address?: string) {
    const walletAddress = address ?? '';
    // const walletAddress = "0x405F34617e9867F5FA3C5467B0E07D9ee85F1678";
    try {
        const provider = new ethers.JsonRpcProvider(
            CHAIN_ID_TO_NETWORK[chainId].rpc
        );

        // ✅ Native token balance (ETH / BNB / MATIC)
        if (
            !tokenAddress ||
            tokenAddress === NATIVE_TOKEN_ADDRESS
        ) {
            const balance = await provider.getBalance(walletAddress);
            const formattedBalance = ethers.formatEther(balance);

            // console.log(`Native Balance: ${formattedBalance}`);
            setAvlbalance(Number(formattedBalance));
            return {
                type: "native",
                raw: balance.toString(),
                formatted: formattedBalance,
                decimals: 18,
            };
        }

        // ✅ ERC-20 token balance
        const erc20Abi = [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
        ];

        const tokenContract = new ethers.Contract(
            tokenAddress,
            erc20Abi,
            provider
        );

        const balance = await tokenContract.balanceOf(walletAddress);
        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();

        const formattedBalance = ethers.formatUnits(balance, decimals);

        // console.log(`Token Balance: ${formattedBalance} ${symbol}`);
        setAvlbalance(Number(formattedBalance));
        return {
            type: "erc20",
            raw: balance.toString(),
            formatted: formattedBalance,
            decimals,
            symbol,
        };
    } catch (error) {
        console.error("Error fetching balance:", error);
        return null;
    }
}

export async function getBalanceFromAPI(address: string) {
    try {
        const response = await fetch(`https://li.quest/v1/wallets/${address}/balances?extended=true`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching balance from API:", error);
        return null;
    }
}
// Single token balance
export interface TokenBalance {
    address: string;
    symbol: string;
    decimals: number;
    amount: string;
    name: string;
    chainId: number;
    priceUSD?: string;
    marketCapUSD?: number;
    volumeUSD24H?: number;
    fdvUSD?: number;
    logoURI?: string;
}

// Balances grouped by chainId
export interface ChainBalances {
    [chainId: string]: TokenBalance[];
}

// Root API response
export interface WalletBalancesResponse {
    walletAddress: string;
    balances: ChainBalances;
    limit: number;
}
