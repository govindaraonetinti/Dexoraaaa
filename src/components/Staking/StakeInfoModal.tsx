
import { ChevronDown } from "lucide-react";
import Modal from "../../lib/Modal";
import { useEffect, useRef, useState } from "react";
import { currencies, type Currencies } from "../../lib/Currencies";

export default function StakeInfoModal({ stake, setStake }: { stake: string; setStake: (stake: string) => void }) {
    const [openCurrency, setOpenCurrency] = useState(false);
    const [selected, setSelected] = useState<Currencies | null>(null);
    const [amount, setAmount] = useState<string | null>(null);
    useEffect(() => {
        if (stake != '') {
            setSelected(currencies.filter((coin) => coin.vendors_vendorshortcode.toLowerCase() == stake.toLowerCase())[0])
        } else {
            setSelected(currencies[0])
        }
    }, [stake])
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicked outside
    useEffect(() => {
        function handleClick(e: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenCurrency(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);


    return (
        <Modal open={stake != ''} onClose={() => setStake('')} width="max-w-3xl" className="bg-[#24242B]">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-6 py-6">

                {/* LEFT SIDE */}
                <div>

                    <h4 className="h4-tag mb-4">Staking</h4>

                    {/* Currency Selector */}
                    <div
                        ref={dropdownRef}
                        className="mb-6 relative"
                    >
                        <p className="text-xs text-gray-400 mb-2">Currency</p>

                        {/* Dropdown Button */}
                        <button
                            onClick={() => { setOpenCurrency(!openCurrency) }}
                            className="w-full bg-[#FFFFFF]/20 rounded-lg px-4 py-3 flex items-center justify-between "
                        >
                            <div className="flex items-center gap-2">
                                <img src={selected?.vendors_logopath} className="w-6 h-6" />
                                <span>{selected?.vendors_vendorname}</span>
                            </div>
                            <ChevronDown
                                size={18}
                                className={`text-gray-400 transition-transform ${openCurrency ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Dropdown List */}
                        {openCurrency && (
                            <div className="absolute left-0 right-0 mt-2 bg-neutral-900 border h-60 overflow-y-auto border-white/10 rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                                {currencies.map((item) => (
                                    <button
                                        key={item.vendors_id}
                                        onClick={() => {
                                            setSelected(item);
                                            setOpenCurrency(false);
                                        }}
                                        className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white/5"
                                    >
                                        <img src={item?.vendors_logopath} className="w-5 h-5" />
                                        <span className="text-sm">{item?.vendors_vendorname}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* Amount Input */}
                    <div className="mb-6">
                        <p className="text-xs text-gray-400 mb-2">Amount</p>

                        {selected &&
                            <div className="flex items-center bg-[#FFFFFF]/20 rounded-lg  px-4 py-3">
                                <input value={amount ?? ''}
                                    className="bg-transparent outline-none flex-1 pr-4 text-sm" onChange={(e) => { setAmount(e.target.value) }}
                                    placeholder={`Min amount ${10 / selected?.vendors_usdrate} ${selected?.vendors_vendorshortcode}`}
                                />
                                <span className="text-gray-400 mr-3">{selected?.vendors_vendorshortcode}</span>
                                <button className="text-gray-300 text-sm" onClick={() => setAmount(String(selected?.vendors_usdrate))}>Max</button>
                            </div>}
                    </div>

                    {/* Stats Section */}
                    <div className="text-sm text-gray-300 space-y-2 mt-4">
                        <p>Reference APR <span className="float-right">3%</span></p>
                        <p>Term <span className="float-right">Flexible</span></p>
                        <p>Funding account <span className="float-right">0 BTC</span></p>
                        <p>Max amount <span className="float-right">1,00,000 BTC</span></p>
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div>

                    {/* Preview Section */}
                    <h3 className="text-base font-medium mb-3 border-b pb-2 border-[#424242]">Preview</h3>

                    <div className="text-sm text-gray-300 space-y-2 mb-6">
                        <p>Subscription date <span className="float-right">4/22/2025, 15:37</span></p>
                        <p>Accrual date <span className="float-right">4/22/2025, 21:30</span></p>
                        <p>Profit distribution date <span className="float-right">4/24/2025, 17:30</span></p>
                        <p>Redemption period <span className="float-right">14 days</span></p>
                        <p>Profit received <span className="float-right">Daily</span></p>
                    </div>

                    {/* Estimated Returns */}
                    <h3 className="text-base font-medium mb-3 border-b pb-2 border-[#424242]">Estimated returns</h3>

                    <p className="text-sm text-gray-300 mb-6">
                        BTC earnings <span className="float-right">: 0.000</span>
                    </p>

                    {/* Agreement */}
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-6">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>
                            I have read and agree to
                            <a className="text-blue-400 ml-1 underline cursor-pointer">Staking User Agreement</a>
                        </span>
                    </label>

                    {/* Stake Button */}
                    <button className="w-full bg-white text-black py-3 rounded-full text-center font-medium hover:bg-gray-200 transition">
                        Stake
                    </button>

                </div>
            </div>
        </Modal>
    );
}
