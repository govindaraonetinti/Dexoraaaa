import { useEffect } from "react";
import CustomCheckbox from "../CustomCheckBox";
import Modal from "../Modal";

interface CrossTradingProps {
    marketCoin: string; vendorCoin: string;
    tradeType: string | null;
    setTradeType: (tradeType: string | null) => void;
    setTradeMode?: (tradeMode: string) => void;
    tradeMode: string,
    updateTradeMode?: (payload: any) => void;
    AcccountProps: any;
}

const CrossTrading = ({ marketCoin, vendorCoin, tradeType, setTradeType, setTradeMode, tradeMode, updateTradeMode, AcccountProps }: CrossTradingProps) => {

    useEffect(() => {
        if (setTradeMode)
            if (tradeType) setTradeMode(tradeMode);
    }, [tradeType]);

    const handleChange = (mode: string) => {
        if (setTradeMode)
            setTradeMode(mode);
    };

    return (
        <Modal
            open={tradeType == 'cross-isolated'}
            onClose={() => setTradeType(null)}
            title=""
            width="max-w-[500px]"
        >
            <p className="text-2xl mb-4 mt-3 text-center">{marketCoin}-{vendorCoin ? vendorCoin : 'USDC'} Margin Mode</p>
            {/* sharath */}

            <div className="flex flex-col gap-4">


                <label className="w-full border border-[#4a4a4d] rounded-lg px-4 py-2 cursor-pointer" htmlFor="cross">
                    <div className="flex items-center gap-2 mt-2">

                        <CustomCheckbox id="cross"
                            checked={tradeMode == "cross"}
                            onChange={() => handleChange("cross")}
                        />
                        <span>Cross</span>
                    </div>
                    <p className="text-[12px] font-light mt-2">
                        Manage your risk on individual positions by restricting the amount
                        of margin allocated to each. If the margin ratio of an isolated
                        position reaches 100%, the position will be liquidated. Margin can be added
                        or removed to individual positions in this mode.
                    </p>
                </label>
                <label className="w-full border border-[#4a4a4d] rounded-lg px-4 py-2 cursor-pointer" htmlFor="isolated">
                    <div className="flex items-center gap-2 mt-2">

                        <CustomCheckbox id="isolated"
                            checked={tradeMode === "isolated"}
                            onChange={() => handleChange("isolated")}
                        />
                        <span>Isolated</span>
                    </div>
                    <p className="text-[12px] font-light mt-2">
                        All cross positions share the same cross margin as collateral.
                        In the event of liquidation, your cross margin balance and any
                        remaining open positions under assets in this mode may be forfeited.
                    </p>
                </label>
            </div>
            {AcccountProps.perpsEquity < 0.01 ? (

                <div className="border text-[12px] border-[#F74B60] text-[#F74B60] px-4 py-2 rounded mt-5 text-center">
                    Need to deposit
                </div>) : (
                <button className="mt-5 w-full bg-white py-3 rounded-lg text-black cursor-pointer  font-semibold" onClick={() => { updateTradeMode?.(tradeMode); setTradeType(null) }}>Select</button>
            )}
        </Modal>
    );
};

export default CrossTrading;
