import { useState, useEffect } from "react";
import type { Transfer } from "../../../components/Swap/TransferCard";


export const useLifiTransfers = (address: { address: string }) => {
    if (!address && address != '') return
    const [transfers, setTransfers] = useState<Transfer[]>([]);

    useEffect(() => {
        if (!address?.address) return;

        const getTransfers = async () => {
            try {
                const response = await fetch(
                    `https://li.quest/v1/analytics/transfers?integrator=${'li.fi-playground'}&wallet=${address.address}`
                );
                const data = await response.json();
                setTransfers(data?.transfers || []);
            } catch (err) {
                console.error(err);
            }
        };

        getTransfers();
    }, [address?.address]); // only runs when the string changes



    return transfers;
};

