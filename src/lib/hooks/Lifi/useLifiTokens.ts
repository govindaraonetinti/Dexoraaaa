import { useState, useEffect } from "react";

export const ALLOWED_TOKENS = ["ETH", "BNB", "POL", "USDT", "USDC", "WBTC", "WETH", "ARB"];

export const CHAIN_ID_TO_NETWORK: Record<number, any> = {
    1: { chainId: 1, name: "Ethereum", rpc: "https://ethereum-rpc.publicnode.com" },
    56: { chainId: 56, name: "BNB Smart Chain", rpc: "https://bsc-dataseed3.defibit.io" },
    137: { chainId: 137, name: "Polygon", rpc: "https://polygon-bor-rpc.publicnode.com" },
    42161: { chainId: 42161, name: "Arbitrum One", rpc: 'https://arbitrum-one-rpc.publicnode.com' },
    // 143: { chainId: 143, name: "Monad", rpc: 'https://monad-mainnet-rpc.spidernode.net' }
};


export const useLifiTokens = () => {
    const [tokens, setTokens] = useState<TokenData[]>([]);

    const getTokens = async () => {
        try {
            const response = await fetch("https://li.quest/v1/tokens");
            const data = await response.json();

            let allTokens: TokenData[] = [];

            Object.keys(CHAIN_ID_TO_NETWORK).forEach((chainId) => {
                const tokensByChain = data.tokens[chainId] || [];

                const enriched = tokensByChain.map((token: TokenData) => ({
                    ...token,
                    chainId,
                    network: CHAIN_ID_TO_NETWORK[Number(chainId)].name,
                    logoURI: token.logoURI ? token.logoURI : `/images/coins/${token.symbol.toLowerCase()}.png`
                }));

                allTokens.push(...enriched);
            });

            const filtered = allTokens.filter((token) =>
                ALLOWED_TOKENS.includes(token.symbol)
            );

            setTokens(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getTokens();
    }, []);

    return tokens;
};


export interface TokenData {
    network: string,
    address: string
    chainId: string
    coinKey: string
    decimals: string
    logoURI: string
    name: string
    priceUSD: string
    symbol: string
}