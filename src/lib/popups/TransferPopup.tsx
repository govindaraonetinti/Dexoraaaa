
import { useEffect, useState } from "react";
import Modal from "../Modal";
import { CgSwap } from "react-icons/cg";
import useNumberOnly from "../hooks/useNUmberOnly";
import { getNumberTransformed } from "../../utils";

interface TransferPopupFormProps {
    transferPopup: boolean;
    setTransferPopup: (transferPopup: boolean) => void;
    transferFunds: (payload: any) => void;
    perpsEquity: number;
    spotEquity: number;
    spotMode: string;
}
export default function TransferModal({ transferPopup, setTransferPopup, transferFunds, perpsEquity, spotEquity, spotMode }: TransferPopupFormProps) {
    const [from, setFrom] = useState<string>("perp");
    const [to, setTo] = useState<string>("spot");
    const [amount, setAmount] = useState<string>("");
    const [avlBalance, setAvlBalance] = useState<number>(getNumberTransformed(perpsEquity));
    const [isSwap, setIsSwap] = useState<boolean>(false);
    const numberOnly = useNumberOnly({ decimals: true });
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);


    useEffect(() => {
        if (spotMode === "spot") {
            setFrom("spot");
            setTo("perp");
        } else {
            setFrom("perp");
            setTo("spot");
        }
    }, [spotMode])
    useEffect(() => {
        setAvlBalance(from === "perp" ? getNumberTransformed(perpsEquity) : getNumberTransformed(spotEquity));
        setAmount("");
        setError('');
        setSubmitted(false);
    }, [from, perpsEquity, spotEquity, transferPopup]);
    // Swap direction
    const swapDirection = () => {
        const prevFrom = from;
        setFrom(to);
        setTo(prevFrom);
        setIsSwap(!isSwap)
    };

    // Submit Transfer
    const validateAmount = (value: string): string => {
        if (value == '') return "Amount is required";

        const num = Number(value);
        if (isNaN(num)) return "Invalid amount";
        if (num <= 0) return "Amount must be greater than 0";
        if (num < 5) return "Amount must be at least 5 USDC";
        if (num > avlBalance)
            return `Not enough balance. You currently have ${getNumberTransformed(avlBalance)} USDC`;

        return '';
    };


    useEffect(() => {
        if (!submitted && amount === "") return;
        setError(validateAmount(amount));
    }, [amount, avlBalance, submitted]);



    const handleSubmit = () => {
        setSubmitted(true);

        const validationError = validateAmount(amount);
        setError(validationError);

        if (validationError) return;

        transferFunds({
            amount,
            toPerp: to === "perp",
        });
    };


    return (
        <Modal
            open={transferPopup}
            onClose={() => setTransferPopup(false)}
            title=""
            width="max-w-[500px]"
        >
            {/* Subtitle */}
            <p className="text-2xl mb-4 mt-3 text-center">
                Transfer USDC
            </p>
            {/* Subtitle */}
            <p className="text-white/75 text-sm text-center mb-5">
                Transfer USDC between your <b className="capitalize text-emerald-400">{from}</b> and <b className="capitalize text-emerald-400">{to}</b> balances.
            </p>
            {/* From → To toggle */}
            <div className="flex items-center justify-center mb-6">
                <button className="px-4 py-1.5 rounded-md text-[#1e2a32] bg-white font-semibold text-sm capitalize">
                    {from}
                </button>
                <button onClick={swapDirection}>
                    <CgSwap
                        size={18}
                        className={`mx-3 text-white w-8 h-8 cursor-pointer ${isSwap ? 'rotate-180' : 'rotate-0'} transition transform-all duration-250`}
                    />
                </button>
                <button className="px-4 py-1.5 rounded-md text-[#1e2a32] bg-white font-semibold text-sm capitalize">
                    {to}
                </button>
            </div>
            <div className="relative mb-6">
                <button className="text-white absolute right-4 -translate-y-1/2  top-1/2" onClick={() => setAmount(getNumberTransformed(avlBalance))}>MAX: {getNumberTransformed(avlBalance)}</button>
                <input {...numberOnly}
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-md bg-[#27272A]
                            text-white outline-none border border-[#1e2a32]
                            placeholder-gray-500  transition
                        "
                />

            </div>
            {error && <p className="text-red-500 text-sm relative -top-5.5">{error}</p>}
            {/* Confirm */}
            <button
                onClick={handleSubmit}
                className="w-full py-2 rounded-md bg-white text-black text-sm font-medium">
                Confirm
            </button>
        </Modal>
    );
}
