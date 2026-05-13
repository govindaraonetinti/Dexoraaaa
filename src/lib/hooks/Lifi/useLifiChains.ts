import { useState, useEffect } from "react";
import { CHAIN_ID_TO_NETWORK } from "./useLifiTokens";


export interface ChainsData {
    chainId: number,
    logoURI: string;
    metamask: any;
    name: string;
    nativeToken: any;
    key: string;
}

export const useLifiChains = () => {
    const [chains, setChains] = useState<ChainsData[]>([]);

    const getChains = async () => {
        try {
            const response = await fetch("https://li.quest/v1/chains");
            const data = await response.json();
           console.log(data.chains.length)
            const filteredChains = data.chains
                .filter((chain: any) => Object.keys(CHAIN_ID_TO_NETWORK).includes(String(chain.nativeToken.chainId)))
                .map((chain: any) => ({
                    chainId: chain.nativeToken.chainId,
                    key: chain.key,
                    name: chain.name,
                    logoURI: chain.logoURI,
                    metamask: chain.metamask,
                    nativeToken: chain.nativeToken,
                }));

            setChains(filteredChains);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getChains();
    }, []);

    return chains;
};
