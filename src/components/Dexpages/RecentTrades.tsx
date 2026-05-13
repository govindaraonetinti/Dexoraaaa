import { formatPrice, formatSize } from "./dexUtils";


type Trade = {
    price: number | string;
    size: number | string;
    side: string;
    time: number | string;
};

export const RecentTrades = ({ trades, market }: { trades: Trade[] ,market:string }) => {
    return (
        <div className=" flex flex-col">
            <div className="flex-1 overflow-hidden text-xs ">
                {/* HEADER */}
                <div className="grid grid-cols-3 text-white/75 px-3 py-1.5 sticky top-0 border-b border-[#2A2A32]">
                    <span>Price(USD)</span>
                    <span className="text-right">Size({market})</span>
                    <span className="text-right">Time</span>
                </div>
                {/* TRADE LIST */}
                <div className="h-145 overflow-hidden">
                    {trades?.map((t, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-3 px-3 py-0.5 hover:bg-[#161616] h-6.75 leading-6.75"
                        >
                            <span
                                className={
                                    t.side === "B"
                                        ? "text-[#2BC287]"
                                        : "text-[#F74B60]"
                                }
                            >
                                {formatPrice(t.price)}
                            </span>
                            <span className="text-right">
                                {formatSize(t.size)}
                            </span>
                            <span className="text-right ">
                                {new Date(t.time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}