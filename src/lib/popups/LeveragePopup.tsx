import { useEffect, useState } from "react";
import Modal from "../Modal";

interface LeverageProps {
    perpinfo: any[];
    changeLeverage?: (payload: any) => void;
    tradeType: string | null;
    setTradeType: (tradeType: string | null) => void;
    setLeverage: (leverage: string) => void;
    leverage: string;
    marketCoin: string;
    AcccountProps: any;
}

const LeveragePopup = ({
    perpinfo,
    tradeType,
    setTradeType,
    setLeverage,
    leverage,
    changeLeverage,
    marketCoin,
    AcccountProps
}: LeverageProps) => {

    const [localLeverage, setLocalLeverage] = useState(leverage);
    const leverageCoin = perpinfo?.find(coin => coin?.name == marketCoin);
    // Load the leverage when popup opens
    useEffect(() => {
        if (tradeType === "leverage") {
            setLocalLeverage(leverage);
        }
    }, [tradeType, leverage]);

    const handleChange = (value: number) => {
        setLocalLeverage(String(value)); // update local ONLY
    };

    const handleConfirm = () => {
        changeLeverage?.({ marketCoin, localLeverage }); // apply the change to parent
        setLeverage(localLeverage);      // update parent UI state
        setTradeType(null);              // close popup
    };

    return (
        <Modal
            open={tradeType === "leverage"}
            onClose={() => setTradeType(null)}
            title=""
            width="max-w-[500px]"
        >
            <p className="text-2xl mb-4 mt-3 text-center">Adjust Leverage</p>
            <p>
                Control the leverage used for {leverageCoin?.name} positions. The maximum leverage is {leverageCoin?.maxLeverage}X.
                Max position size decreases the higher your leverage.
            </p>

            <div className="grid grid-cols-[1fr_60px] items-center gap-4 mt-4">
                <CustomRange
                    value={Number(localLeverage)}
                    min={0}
                    max={leverageCoin?.maxLeverage}
                    onChange={handleChange}
                />
                <div className="border border-[#37373c] py-1.5 rounded text-center">
                    {localLeverage}x
                </div>
            </div>
            {AcccountProps.perpsEquity < 0.01 ? (
                <div className="border text-[12px] border-[#F74B60] text-[#F74B60] px-4 py-2 rounded mt-5 text-center">
                    Need to deposit to use leverage
                </div>) : (
                <button
                    className="mt-5 w-full bg-white py-3 rounded-lg text-black cursor-pointer font-semibold"
                    onClick={handleConfirm}
                >
                    Confirm
                </button>
            )}

            <div className="border text-[12px] border-[#F74B60] text-[#F74B60] px-4 py-2 rounded mt-5 text-center">
                Note that setting a higher leverage increases the risk of liquidation.
            </div>
        </Modal>
    );
};


export default LeveragePopup;

interface CustomRangeProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}

const CustomRange: React.FC<CustomRangeProps> = ({
    value,
    min = 0,
    max = 40,
    step = 1,
    onChange,
}) => {
    // Percentage for the filled track
    const percentage =
        max === min ? 0 : ((value - min) / (max - min)) * 100;

    return (
        <div className="relative w-full h-6">
            {/* Track background */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-[#2d2d32] rounded-full" />

            {/* Filled progress */}
            <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-white rounded-full"
                style={{ width: `${percentage}%` }}
            />

            {/* Invisible range input */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-6 opacity-0 absolute inset-0 cursor-pointer"
            />

            {/* Thumb */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none transition-all duration-150"
                style={{ left: `calc(${percentage}% - 8px)` }}
            />
        </div>
    );
};

