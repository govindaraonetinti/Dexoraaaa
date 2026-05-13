
import React, { useEffect, useState } from "react";
import Modal from "../../lib/Modal";
import { getNumberTransformed } from "../../utils";
import toast from 'react-hot-toast';

interface withdrawPopupFormProps {
    withdrawPopup: boolean;
    setWithdrawPopup: (withdrawPopup: boolean) => void;
    withdraw: (withdrawAmount: string | number, address: string, currency: any) => void;
    perpsEquity: number;
    currency: string
}


export type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] | undefined }) => Promise<unknown>;
    on?: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
};


export default function WithdrawPopupForm_spot({ withdrawPopup, setWithdrawPopup, withdraw, perpsEquity, currency }: withdrawPopupFormProps) {
    // UI / form state
    const [selectedCurrency, setSelectedCurrency] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [avlBalace, setAvlBalance] = useState<string>("0");
    // touched + errors for simple validation
    const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    useEffect(() => {
        setAvlBalance(String(perpsEquity));
    }, [perpsEquity]);

    useEffect(() => {
        if (!withdrawPopup) {
            setSelectedCurrency("");
            setAmount("");
        }
    }, [withdrawPopup])

    useEffect(() => {
        // reset touched/errors for network/amount when currency changes
        setTouched(prev => ({ ...prev, network: false, amount: false }));
        setErrors(prev => {
            const copy = { ...prev };
            delete copy.network;
            delete copy.amount;
            return copy;
        });
    }, [selectedCurrency]);

    /* -------------------------
       Validation (simple real-time)
       - errors are set when fields change
       - shown only if corresponding touched[field] === true
       ------------------------- */
    const validate = () => {
        const newErrors: { [k: string]: string } = {};

        // Amount must be a positive number
        if (!address) newErrors.address = "Enter address";
        else if (address.length <= 21) newErrors.address = "Invalid address";
        else if (!amount) newErrors.amount = "Enter amount";
        else if (isNaN(Number(amount))) newErrors.amount = "Invalid number";
        else if (Number(amount) <= 0) newErrors.amount = "Amount must be > 0";
        // else if (Number(amount) < 2) newErrors.amount = `Minimum withdraw is 2 ${currency}`;

        setErrors(newErrors);
        return newErrors;
    };

    // Run validation whenever relevant fields change (real-time)
    useEffect(() => {
        validate();
    }, [amount, address]);


    // Handle form submit (we keep this simple)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // mark touched so errors will show
        setTouched({ currency: true, network: true, amount: true });
        const errs = validate();
        if (Object.keys(errs).length > 0) return;

        try {
            let res = await withdraw(amount, address, currency)
            console.log(res);
            toast.success("Withdrawal successful");
        } catch (e: any) {
            console.log(e);
            console.log("error", e.messages);
            toast.error(e.message);
        }
    };
    return (
        <>
            {withdrawPopup && (
                <Modal open={withdrawPopup} onClose={() => setWithdrawPopup(false)} >
                    <h3 className="text-xl font-semibold mb-4">Withdraw</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ul className="flex items-center justify-between gap-3">
                            <li>Available:</li>
                            <li>{getNumberTransformed(avlBalace)} {currency}</li>
                        </ul>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Address</label>
                            <div className="relative">
                                <input
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value);
                                        setTouched((t) => ({ ...t, amount: true }));
                                    }}
                                    onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                                    placeholder="Enter address"
                                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ring-0"
                                    inputMode="text"
                                />
                            </div>
                            {touched.address && errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Amount</label>
                            <div className="relative">
                                <input
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setTouched((t) => ({ ...t, amount: true }));
                                    }}
                                    onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                                    placeholder="Enter amount (e.g. 10)"
                                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ring-0"
                                    inputMode="decimal"
                                />
                                <button className="text-white absolute right-4 -translate-y-1/2  top-1/2" onClick={() => setAmount(getNumberTransformed(avlBalace))}>MAX: {getNumberTransformed(avlBalace)}</button>
                            </div>
                            {touched.amount && errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <button
                                type="submit"
                                className={`w-full py-2 rounded bg-linear-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-60`}
                            >
                                Submit
                            </button>
                        </div>
                    </form>

                    <div className="text-xs text-gray-400 mt-3">
                        {/* <p className="m-0">Minimum Withdraw: 2 {currency}</p> */}
                        <p className="m-0 mt-1">Note: Spot withdraw may take ~2 minute to reflect.</p>
                    </div>
                </Modal>
            )}
        </>
    );
}