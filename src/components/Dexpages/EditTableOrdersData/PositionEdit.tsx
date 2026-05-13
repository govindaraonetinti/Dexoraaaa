import useNumberOnly from "../../../lib/hooks/useNUmberOnly";
import Modal from "../../../lib/Modal"
import { useEffect, useState } from "react";
import { getNumberTransformed } from "../../../utils";
import { TradeCurrencies } from "../FromInputs/TradeCurrencies";
import { Slider } from "../FromInputs/Slider";

export const PositionEdit = ({ editObj, setEditObj, cancelPositionOrder, isLoading, selectedCoin, perpsEquity, leverage,options }:
    {
        editObj: any | null;
        setEditObj: (editObj: any | null) => void;
        cancelPositionOrder: (payload: any) => void;
        isLoading: boolean;
        selectedCoin: string;
        perpsEquity: any;
        leverage: any;
        options:any
    }) => {
    const [isManual, setIsManual] = useState<boolean>(true);
    const [inputCurrency, setInputCurrency] = useState<string>(selectedCoin);
    const numberOnly = useNumberOnly({ decimals: true });
    const [size, setSize] = useState<number | string>('');
    const [price, setPrice] = useState<number | string>('');
    const [val, setVal] = useState<number | null>(null);
    useEffect(() => {
        if (editObj?.type) {
            setPrice(editObj?.marketPrice || 0);
        }
    }, [editObj]);
    useEffect(() => {
        if (editObj) {
            setInputCurrency(editObj?.position?.coin);
            setVal(100)
        }
    }, [editObj])
    useEffect(() => {
        setSize(inputCurrency == "USDC" ? Math.abs(editObj?.position?.szi) * editObj?.marketPrice : Math.abs(editObj?.position?.szi))
    }, [inputCurrency])

    useEffect(() => {
        if (!perpsEquity) return;

        const accountValue = Number(Math.abs(editObj?.position?.szi) * editObj?.marketPrice);

        if (!accountValue) return;

        // -------- Slider → Size --------
        if (!isManual) {
            if (val == null) return;

            let newSize: number;

            if (inputCurrency === "USDC") {
                newSize = getNumberTransformed(Math.abs(accountValue) * (val / 100));
            } else {
                newSize = getNumberTransformed((Math.abs(accountValue) * (val / 100)) / editObj?.marketPrice);
            }

            if (!Number.isNaN(newSize)) {
                setSize(newSize.toString());
            }
            return;
        }

        // -------- Size → Slider --------
        const parsedSize = Number(size);

        // 👇 THIS FIXES "0."
        if (Number.isNaN(parsedSize)) return;

        let newPercentage: number;

        if (inputCurrency === "USDC") {
            newPercentage = (parsedSize / (Math.abs(accountValue))) * 100;
        } else {
            newPercentage = (parsedSize * editObj?.marketPrice) / (Math.abs(accountValue)) * 100;
        }

        if (!Number.isNaN(newPercentage)) {
            setVal(Math.round(newPercentage));
        }

    }, [val, size, isManual, inputCurrency, leverage, perpsEquity]);

    return (
        <Modal
            open={(!!editObj && (editObj?.type.toLowerCase() == 'market') || (editObj?.type.toLowerCase() == 'limit'))}
            onClose={() => setEditObj(null)}
        >
            <div className="">

                {/* Title */}
                <h2 className="text-center text-xl font-semibold mb-1">{editObj?.type} Close</h2>
                <p className="text-center text-gray-400 text-sm mb-6">
                    This will send an order to close your position at the {editObj?.type} price.
                </p>

                {/* Price Row */}
                {editObj?.type.toLowerCase() !== 'market' ?
                    <div className="mb-4">
                        <div className="">
                            <input {...numberOnly} type="number"
                                className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ring-0"
                                placeholder="Enter Price (USDC)" value={price ? price : ''} onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div> :
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between"><span>Price :</span> <span>{editObj?.marketPrice}</span></div>
                        <div className="flex items-center justify-between"><span>Size :</span> <span>{editObj?.position?.szi}</span></div>
                    </div>
                }

                {/* Size Row */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="number" {...numberOnly}
                            value={size} placeholder="Enter Size"
                            onChange={(e) => {
                                setSize(e.target.value);
                                setIsManual(true)
                            }}
                            className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ring-0 pr-0"
                        />
                        {/* <span className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2">{editObj?.position?.coin}</span> */}
                        <div className="absolute -right-9 top-1/2 -translate-x-1/2 -translate-y-1/2 z-1">
                            <TradeCurrencies inputCurrency={inputCurrency} options={options} setInputCurrency={setInputCurrency} />
                        </div>
                    </div>
                </div>
                <Slider
                    value={val ?? 0}
                    onChange={(v) => {
                        setIsManual(false);
                        setVal(v);
                        editObj?.marketPrice
                    }}
                />
                {/* Confirm Button */}
                <button onClick={() => cancelPositionOrder({ ...editObj, editedSize: inputCurrency == "USDC" ? (Number(size) / editObj?.marketPrice) : size, editedMarketprice: price })} disabled={isLoading}
                    className={`w-full bg-white transition text-black font-semibold py-3 rounded-lg mt-4`}
                >
                    {isLoading ? 'Loading...' : 'Confirm'}
                </button>
            </div>
        </Modal>
    );
};
