import { useEffect, useState } from "react";
import type { OrderPayload } from "../../components/Dexpages/TradeForms";
import Modal from "../Modal";

type Props = {
    spotMode: string;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    details?: any;
    payload: OrderPayload | null;
    marketData: any;
};

const ConfirmationTxnPopup = ({ spotMode, isOpen, onConfirm, onCancel, payload, marketData }: Props) => {
    useEffect(() => {
        if (payload && marketData) {
            payload.marketData = marketData;
        }
    }, [marketData, payload])
    const [isLoading, setIsLoading] = useState(false);

    const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

    const handleConfirm = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            await delay(0); // test loading UI
            await onConfirm();
        } catch (err) {
            console.error("Error during confirmation:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onClose={() => onCancel()}
            title=""
            width="max-w-[400px]"
            zIndex="z-999"
        >
            {payload &&
                <div className="space-y-4">
                    <h2 className="text-center text-xl font-semibold mb-1">Confirm Order</h2>
                    {/* Details */}
                    <div className="rounded-lg  space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Side</span>
                            <span
                                className={`font-medium ${payload.side.toLowerCase() === "buy" ? "text-[#2BC287]" : "text-[#F74B60]"}`}
                            >
                                {payload.side}
                            </span>
                        </div>

                        {(payload.size || payload.size != 0) &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Size</span>
                                <span className="font-medium">{payload.size}</span>
                            </div>
                        }

                        {payload?.marketData &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Market Price</span>
                                <span className="font-medium">{payload?.marketData?.price}</span>
                            </div>
                        }
                        {payload?.startUSD &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">start USDC</span>
                                <span className="font-medium">{payload?.startUSD}</span>
                            </div>}
                        {payload?.startUSD &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">End USDC</span>
                                <span className="font-medium">{payload?.startUSD}</span>
                            </div>}
                        {payload?.sizeSkew &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Size Skew</span>
                                <span className="font-medium">{payload?.sizeSkew}</span>
                            </div>}
                        {payload?.totalOrders &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Orders</span>
                                <span className="font-medium">{payload?.totalOrders}</span>
                            </div>}
                        {payload?.runtimeMinutes &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Runtime Minutes</span>
                                <span className="font-medium">{payload?.runtimeMinutes}</span>
                            </div>
                        }
                        {payload?.triggerPrice &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Trigger Price</span>
                                <span className="font-medium">{payload?.triggerPrice}</span>
                            </div>
                        }
                        {payload?.tpsl &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Entry Price</span>
                                <span className="font-medium">{payload?.price}</span>
                            </div>
                        }
                        {payload?.tp &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">TP Price(PNL)</span>
                                <span className="font-medium">{payload?.tp?.price}({payload?.tp?.pnlPercent})</span>
                            </div>
                        }
                        {payload?.sl &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">SL Price(PNL)</span>
                                <span className="font-medium">{payload?.sl?.price}({payload?.sl?.pnlPercent})</span>
                            </div>
                        }
                        {payload?.reduceOnly &&
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Reduce Only</span>
                                <span className={`${payload?.reduceOnly ? "text-[#2BC287]" : "text-[#F74B60]"} font-medium`}>{payload?.reduceOnly ? 'True' : 'False'}</span>
                            </div>
                        }
                        <p className="text-gray-400 mt-5">You pay no gas. The order will be confirmed within a few seconds.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleConfirm} disabled={isLoading}
                            className={`flex-1 rounded-lg py-2 text-sm font-medium ${payload.side.toLowerCase() === "buy"
                                ? "bg-[#2BC287]"
                                : "bg-[#F74B60]"
                                }`}
                        >
                            {isLoading ? 'Loading...' : `${payload.side.toLowerCase() === "buy" ? `${spotMode != 'spot' ? 'Buy/Long' : 'Buy'}` : `${spotMode != 'spot' ? 'Sell/Short' : 'Sell'}`}`}
                        </button>
                    </div>
                </div>}
        </Modal>
    );
};

export default ConfirmationTxnPopup