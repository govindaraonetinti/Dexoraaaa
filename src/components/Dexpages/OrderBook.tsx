
import { useState } from "react";
import { getNumberTransformed } from "../../utils";

type OrderRow = {
    price: number | string;
    size: number | string;
};
type OrderBookData = {
    bids: OrderRow[];
    asks: OrderRow[];
};

type OrderBookProps = {
    orderbook: OrderBookData;
    marketData: { price: number; type: string; change24h: string };
    market: string;
    inputCurrency: string;
};

const ROW_HEIGHT = 27;

export const OrderBook = ({
    orderbook, marketData, market, inputCurrency
}: OrderBookProps) => {
    const toNumber = (v: number | string) => Number(v) || 0;
    // ✅ LOADING LOGIC (key part)
    const isLoading = !orderbook?.bids?.length && !orderbook?.asks?.length;


    const isEmpty =
        !isLoading &&
        orderbook.bids.length === 0 &&
        orderbook.asks.length === 0;

    // ✅ SAFE slicing (only after loading)
    const asks = isLoading ? [] : orderbook.asks.slice(0, 10);
    const bids = isLoading ? [] : orderbook.bids.slice(0, 10);
    const maxAskDepth = asks.reduce(
        (sum, a) => sum + toNumber(a.size),
        0
    );
    const maxBidDepth = bids.reduce(
        (sum, b) => sum + toNumber(b.size),
        0
    );
    const [activeTab] = useState<"both" | "buy" | "sell">("both");
    const [hover, setHover] = useState<{
        side: "ask" | "bid";
        index: number;
    } | null>(null);
    /* ---------------- Aggregation ---------------- */
    const aggregate = (rows: OrderRow[], index: number) => {
        let totalSize = 0;
        let totalValue = 0;

        for (let i = 0; i <= index; i++) {
            const size = rows.length > i ? toNumber(rows[i].size || 0) : 0;
            const price = rows.length > i ? toNumber(rows[i].price || 0) : 0;

            totalSize += size;
            totalValue += size * price;
        }

        return {
            totalSize,      // number
            totalValue,     // number
            vwap: totalValue / (totalSize || 1)
        };
    };
    /* ---------------- Asks ---------------- */
    const renderAsks = () => {
        let cumulative = 0;
        let cumulativeTotal = 0;
        return (

            <>
                {asks.length != 0 &&
                    <div className="overflow-hidden flex flex-col-reverse h-68">
                        {asks.map((a, i) => {
                            const sizeNum = toNumber(a.size);
                            cumulativeTotal += sizeNum; // add current row size
                            cumulative += toNumber(a.size);
                            const pct = (cumulative / maxAskDepth) * 100;

                            return (
                                <div
                                    key={`ask-${i}`}
                                    onMouseEnter={() => setHover({ side: "ask", index: i })}
                                    onMouseLeave={() => setHover(null)}
                                    className={`grid grid-cols-[80px_110px_115px] px-3 py-1 relative justify-between text-[13px] space-y-0.5 
                                ${hover?.index == i && hover?.side == 'ask' ? 'border-dashed border-t border-red-500/50' : ''}
                                 ${hover && hover?.index >= i && hover?.side == 'ask' ? 'bg-red-500/10' : ''}`}
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    <div
                                        className="absolute right-0 top-0 bottom-0 bg-red-500/15 transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                    <span className="text-[#F74B60] relative z-10">
                                        {a.price}
                                    </span>
                                    <span className="text-right relative z-10">
                                        {inputCurrency === market
                                            ? getNumberTransformed(a.size)
                                            : getNumberTransformed(Number(a.size) * Number(a.price))}
                                    </span>

                                    <span className="text-right relative z-10">
                                        {inputCurrency === market
                                            ? getNumberTransformed(cumulativeTotal)
                                            : getNumberTransformed(cumulativeTotal * Number(a.price))}
                                    </span>
                                </div>
                            );
                        })}
                    </div>}
                {isLoading && <div className="overflow-hidden flex flex-col-reverse h-67.5 items-center justify-center"><AbcDexLoader /></div>}
                {isEmpty && <div className="overflow-hidden flex flex-col-reverse h-67.5 items-center justify-center">No Data</div>}
            </>
        );
    };
    /* ---------------- Bids ---------------- */
    const renderBids = () => {
        let cumulative = 0;
        let cumulativeTotal = 0;
        return (
            <>
                {bids.length != 0 &&
                    <div className="overflow-hidden h-68">
                        {[...bids].reverse().map((b, i) => {
                            const sizeNum = toNumber(b.size);
                            cumulativeTotal += sizeNum; // add current row size
                            cumulative += toNumber(b.size);
                            const pct = (cumulative / maxBidDepth) * 100;



                            return (
                                <div
                                    key={`bid-${i}`}
                                    onMouseEnter={() => setHover({ side: "bid", index: i })}
                                    onMouseLeave={() => setHover(null)}
                                    className={`grid grid-cols-[80px_110px_115px] px-3 py-1 relative justify-between text-[13px] space-y-0.5 
                                ${hover?.index == i && hover?.side == 'bid' ? 'border-dashed border-b border-emerald-500/50' : ''}
                                ${hover && hover?.index >= i && hover?.side === 'bid' ? 'bg-emerald-500/10' : ''}
                                `}
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    <div
                                        className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                    <span className="text-[#2BC287] relative z-10">
                                        {b.price}
                                    </span>
                                    <span className="text-right relative z-10">
                                        {inputCurrency === market
                                            ? getNumberTransformed(b.size)
                                            : getNumberTransformed(Number(b.size) * Number(b.price))}
                                    </span>
                                    <span className="text-right relative z-10">
                                        {inputCurrency === market
                                            ? getNumberTransformed(cumulativeTotal)
                                            : getNumberTransformed(cumulativeTotal * Number(b.price))}
                                    </span>
                                </div>
                            );
                        })}
                    </div>}

                {isLoading && <div className="overflow-hidden flex flex-col-reverse h-67.5 items-center justify-center"><AbcDexLoader /></div>}
                {isEmpty && <div className="overflow-hidden flex flex-col-reverse h-67.5 items-center justify-center">No Data</div>}
            </>
        );
    };
    /* ---------------- Popup Position ---------------- */
    const popupStyle = () => {
        if (!hover) return {};

        if (hover.side === "ask") {
            return {
                top: (asks.length - hover.index - 1) * ROW_HEIGHT,
                left: -5,
                transform: "translateX(-100%)"
            };
        }

        return {
            top:
                asks.length * ROW_HEIGHT +
                ROW_HEIGHT +
                ROW_HEIGHT +
                hover.index * ROW_HEIGHT,
            left: 0,
            transform: "translateX(-100%)"
        };
    };
    const rows = hover?.side === "ask" ? asks : bids;

    const agg = hover && rows ? aggregate(rows, hover.index) : null;

    /* ---------------- Render ---------------- */
    return (
        <div className="relative flex flex-col">

            {/* Header */}
            <div className="grid grid-cols-[80px_110px_115px] px-3 py-1.5 border-b border-[#2A2A32] text-xs text-white/75 justify-between">
                <span>Price</span>
                <span className="text-right flex items-center justify-end">Size({inputCurrency})</span>
                <span className="text-right flex items-center justify-end">Total({inputCurrency})</span>
            </div>

            {/* Asks */}
            {(activeTab === "sell" || activeTab === "both") && renderAsks()}

            {/* Mid Price */}
            {activeTab === "both" && (
                <div className="py-1 px-3 text-center border-y border-[#2A2A32] space-x-4">
                    <span
                        className={`text-lg font-bold ${marketData.type === "Buy"
                            ? "text-[#2BC287]"
                            : "text-[#F74B60]"
                            }`}
                    >
                        ${marketData.price}
                    </span>
                    <span
                        className={
                            Number(marketData.change24h) > 0
                                ? "text-[#2BC287]"
                                : "text-[#F74B60]"
                        }
                    >
                        {marketData.change24h}%
                    </span>
                </div>
            )}

            {/* Bids */}
            {(activeTab === "buy" || activeTab === "both") && renderBids()}

            {/* Hover Popup (outside overflow) */}
            {hover && agg && (
                <div
                    className="absolute z-50 bg-[#1E1E1E] border border-[#232323] rounded-md px-3 py-2 text-[12px] space-y-1 shadow-lg"
                    style={popupStyle()}
                >
                    {/* Arrow */}
                    <div
                        className="absolute w-0 h-0 border-t-[6px] border-[#232323] border-b-[6px] border-l-8 border-t-transparent border-b-transparent border-r-[#1E1E1E] -right-2 top-1/2 -translate-y-1/2"
                    />

                    {/* Content */}
                    <div className="flex flex-col space-y-1">
                        <div className="flex justify-between gap-3">
                            <span className="text-white/75">VWAP:</span>
                            <b>${agg.vwap.toFixed(2)}</b>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-white/75">Total Size:</span>
                            <b>
                                {inputCurrency === market
                                    ? getNumberTransformed(agg.totalSize)
                                    : getNumberTransformed(Number(agg.totalSize) * Number(agg.vwap))}
                            </b>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-white/75">Total USDC:</span>
                            <b>$
                                {inputCurrency === market
                                    ? getNumberTransformed(agg.totalValue)
                                    : getNumberTransformed(Number(agg.totalValue) * Number(agg.vwap))}
                            </b>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export const AbcDexLoader = () => {
    const brand = "A B C";
    const status = "SYNCING....";

    return (
        <div className="h-67.5 flex flex-col items-center justify-center gap-4">

            {/* BRAND — wave + glow */}
            <div className="relative flex gap-0 text-3xl font-bold tracking-0 text-[#2BC287]">
                {brand.split("").map((char, i) => (
                    <span
                        key={i}
                        className="inline-block animate-[wave_1.6s_ease-in-out_infinite]"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}

                {/* glow layer */}
                <span className="absolute inset-0 blur-lg opacity-40 text-[#2BC287] pointer-events-none">
                    ABC DEX
                </span>
            </div>

            {/* STATUS TEXT — terminal flicker */}
            <div className="flex gap-0.5 text-xs tracking-[0.35em] text-white/60">
                {status.split("").map((char, i) => (
                    <span
                        key={i}
                        className="inline-block animate-[flicker_2.4s_linear_infinite]"
                        style={{ animationDelay: `${i * 0.06}s` }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </div>

            {/* MULTI SCAN BARS */}
            <div className="flex flex-col gap-1 w-40">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="relative h-0.5 bg-[#2BC287]/10 overflow-hidden rounded-full"
                    >
                        <div
                            className="absolute h-full w-1/3 bg-[#2BC287]"
                            style={{
                                animation: `scan ${1.2 + i * 0.4}s linear infinite`,
                                animationDelay: `${i * 0.2}s`
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* FAKE ORDERBOOK FEED */}
            {/* <div className="flex gap-2 text-[10px] text-white/40 font-mono">
                <span className="animate-[ticker_1.8s_linear_infinite]">
                    BID 4321.5 ▲
                </span>
                <span className="animate-[ticker_2.2s_linear_infinite]">
                    ASK 4322.0 ▼
                </span>
                <span className="animate-[ticker_2.6s_linear_infinite]">
                    VOL 182.4
                </span>
            </div> */}

        </div>
    );
};
