import { useEffect, useRef, useState } from "react";
import { formatPrice } from "./dexUtils";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { FaTimes } from "react-icons/fa";

type DexHeaderProps = {
    spotMode: string;
    selectedCoin: string;
    setSelectedCoin: (coin: string) => void;
    selectedToCoin: string;
    setSelectedToCoin: (coin: string) => void;
    perpinfo: any[];
    spotinfo: any[];
    marketData: { price: number; type: string; change24h: any, change24hRate?: string };
    priceChange: number;
};

export const DexHeader = ({
    spotMode,
    selectedCoin,
    setSelectedCoin,
    selectedToCoin,
    setSelectedToCoin,
    perpinfo,
    spotinfo,
    marketData,
    priceChange,
}: DexHeaderProps) => {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<string>(spotMode);
    useEffect(() => {
        if (!open) setSearch("");
    }, [open]);
    const sanitizedSearch = search
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "");

    const filteredPerpInfo = perpinfo.filter((c) =>
        c.name.toLowerCase().includes(sanitizedSearch)
    );


    const filteredSpotInfo = spotinfo.filter((c) => {
        const vendor = c.vendor.toLowerCase();
        const market = c.market.toLowerCase();
        const combined = `${vendor}.${market}`; // normalize with dot

        return (
            vendor.includes(sanitizedSearch) ||
            market.includes(sanitizedSearch) ||
            combined.includes(sanitizedSearch)
        );
    });



    useEffect(() => {
        setTab(spotMode);
    }, [spotMode]);

    const selectedPerpCurrency = perpinfo.find(c => c.name === selectedCoin);
    const selectedSpotCurrency = spotinfo.find(c => c.vendor === selectedCoin);

    const handlePerpSelect = (coin: string) => {
        setSelectedCoin(coin);
        setOpen(false);
        navigate(`/trade/${coin}`);
    };

    const handleSpotSelect = (vendor: string, market: string) => {
        setSelectedCoin(vendor);
        setSelectedToCoin(market);
        setOpen(false);
        navigate(`/trade/${vendor}/${market}`);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);
    const changeColor = priceChange >= 0 ? "text-[#2BC287]" : "text-[#F74B60]"

    return (
        <header className="px-4 py-3 flex items-center justify-between border-b border-[#232323]">
            <div className="flex items-center gap-5 flex-wrap">
                {/* Market Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(p => !p)}
                        className="flex items-center gap-2 min-w-30 whitespace-nowrap"
                    >
                        <div className="w-8">
                            {spotMode === "perp" && selectedPerpCurrency?.logo && (
                                <img src={selectedPerpCurrency.logo} className="w-8 rounded-full" alt={selectedPerpCurrency.name} />
                            )}
                            {spotMode === "spot" && selectedSpotCurrency?.logo && (
                                <img src={selectedSpotCurrency.logo} className="w-8 rounded-full" alt={selectedSpotCurrency.vendor} />
                            )}
                        </div>

                        <span className="text-[18px] font-semibold">
                            {selectedCoin}-{selectedToCoin || "USDC"}
                        </span>

                        <ChevronDown
                            size={18}
                            className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />

                        {spotMode === "perp" && selectedPerpCurrency?.maxLeverage ? (
                            <span className="bg-[#27272A] text-xs px-1 rounded flex items-center">
                                {selectedPerpCurrency.maxLeverage}
                                <FaTimes className="ml-0.5" />
                            </span>
                        ) : (
                            <span className="bg-emerald-500/20 text-[#2BC287] px-2 py-0.5 rounded-md text-xs">
                                Spot
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {open && (
                        <div className="
                                absolute z-50 mt-3 w-85
                                rounded-2xl overflow-hidden
                                bg-[#0B0B0F]
                                border border-[#2A2A32]
                                shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                                animate-in fade-in slide-in-from-top-2 duration-150
                            ">

                            {/* ───────── Tabs */}
                            <div className="flex  px-1 py-1">
                                {["perp", "spot"].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t as any)}
                                        className={`
                        flex-1 py-2 rounded-lg text-sm font-semibold transition
                        ${tab === t
                                                ? "bg-white/4 text-white"
                                                : "hover:text-white"
                                            }
                    `}
                                    >
                                        {t === "perp" ? "Perpetuals" : "Spot"}
                                    </button>
                                ))}
                            </div>

                            {/* ───────── Search */}
                            <div className="px-3 py-2 border-b border-[#1E1E26]">
                                <div className="relative">
                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value.replace(/[^a-zA-Z0-9.]/g, ""))
                                        }
                                        placeholder={`Search ${tab === "perp" ? "Perpetuals" : "Spot"} markets`}
                                        className="
                                            w-full bg-white/4
                                            px-3 py-2 rounded-lg
                                            text-sm text-white
                                            placeholder:text-white/40
                                            outline-none
                                            focus:ring-1 focus:ring-[#2BC287]"/>
                                    {search && <button onClick={() => setSearch('')}><FaTimes className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/2" /></button>}
                                </div>

                            </div>

                            {/* ───────── Market List */}
                            <div className="max-h-75 overflow-y-auto">

                                {/* ───── PERP LIST */}
                                {tab === "perp" && (
                                    <>
                                        {filteredPerpInfo.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <div className="text-sm text-white/50">
                                                    No perpetual markets found
                                                </div>
                                                <div className="text-xs text-white/30 mt-1">
                                                    Try searching another symbol
                                                </div>
                                            </div>
                                        ) : (
                                            filteredPerpInfo.map((c, id) => {
                                                const active = c.name === selectedCoin;

                                                return (
                                                    <div
                                                        key={id}
                                                        onClick={() => handlePerpSelect(c.name)}
                                                        className={`
                                group flex items-center gap-3
                                px-4 py-3 cursor-pointer transition
                                ${active
                                                                ? "bg-white/4"
                                                                : "hover:bg-white/4"
                                                            }
                            `}
                                                    >
                                                        <img
                                                            src={c.logo}
                                                            className="w-8 h-8 rounded-full overflow-hidden"
                                                        />

                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-white truncate">
                                                                {c.name} / USDC
                                                            </div>
                                                            <div className="text-xs text-white/40">
                                                                Perpetual
                                                            </div>
                                                        </div>

                                                        {c.maxLeverage && (
                                                            <span className="
                                    flex items-center gap-0
                                    text-xs font-semibold
                                    bg-[#1E1E26]
                                    px-2 py-1 rounded-md
                                    text-white/80
                                ">
                                                                {c.maxLeverage}
                                                                <FaTimes />
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </>
                                )}

                                {/* ───── SPOT LIST */}
                                {tab === "spot" && (
                                    <>
                                        {filteredSpotInfo.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <div className="text-sm text-white/50">
                                                    No spot markets found
                                                </div>
                                                <div className="text-xs text-white/30 mt-1">
                                                    Try searching another pair
                                                </div>
                                            </div>
                                        ) : (
                                            filteredSpotInfo.map((c, id) => {
                                                const active =
                                                    c.vendor === selectedCoin &&
                                                    c.market === selectedToCoin;

                                                return (
                                                    <div
                                                        key={id}
                                                        onClick={() =>
                                                            handleSpotSelect(c.vendor, c.market)
                                                        }
                                                        className={`
                                group flex items-center gap-3
                                px-4 py-3 cursor-pointer transition
                                ${active
                                                                ? "bg-white/4"
                                                                : "hover:bg-white/4"
                                                            }
                            `}
                                                    >
                                                        <img
                                                            src={c.logo}
                                                            className="w-8 h-8 rounded-full overflow-hidden"
                                                        />

                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-white truncate">
                                                                {c.vendor}
                                                                <span className=" ml-1">
                                                                    / {c.market}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-white/40">
                                                                Spot market
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </>
                                )}
                            </div>

                        </div>
                    )}


                </div>

                {/* Price */}
                <div className="flex items-center md:gap-8 gap-3">
                    <span
                        className={`text-lg font-bold w-full font-inter ${marketData.type === "Buy"
                            ? "text-[#2BC287]"
                            : "text-[#F74B60]"
                            }`}
                    >
                        ${formatPrice(marketData.price)}
                    </span>

                    {/* 24h Change */}
                    <div className="text-xs flex gap-1 flex-col whitespace-nowrap">
                        <div className="text-white/75">24H Change</div>
                        <div className={`text-xs flex items-center gap-1 ${changeColor}`}>
                            <span>
                                {marketData.change24hRate || 0}
                            </span>/
                            <span>
                                {priceChange >= 0 && "+"}
                                {priceChange}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
