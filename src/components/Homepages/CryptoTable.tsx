import { BsArrowRight } from "react-icons/bs";
import { currencies } from "../../lib/Currencies";
import { GradientSparkline } from "./GradientLine";
import { Link } from "react-router-dom";
import { useCryprtoSocket } from "../../lib/hooks/useCryptoSocket";

import { useEffect, useState } from "react";
import { getAllPerpMetas } from "../Dexpages/Methods/FetchAvailPairs";
import { getNumberFixedDecimal } from "../../utils";


export default function CryptoTable() {
    const [perpInfo, setPerpInfo] = useState<any[]>([]);
    useEffect(() => {
        getAllPerpMetas(currencies, setPerpInfo);
    }, []);
    return (
        <div className="w-full py-20 flex flex-col items-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold text-center">
                Buy and sell with the lowest fees <br /> in the industry
            </h1>

            <p className="text-gray-400 max-w-xl text-center mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>

            <button className="mt-6 text-purple-400 hover:text-purple-300">
                Learn More →
            </button>

            <div className="w-full max-w-5xl bg-[#12121a] rounded-2xl mt-14 p-6">
                {currencies.map((item) => (
                    <Row key={item.vendors_vendorshortcode} item={item} decimal={perpInfo.find((c: any) => c.name === item.vendors_vendorshortcode)?.decimal || 2} />
                ))}
            </div>
        </div>
    );
}


function Row({ item, decimal }: { item: any, decimal: number }) {
    const { marketData } = useCryprtoSocket(item.vendors_vendorshortcode);
    const positive = Number(marketData?.change24h) >= 0;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-[170px_120px_130px_160px_200px_120px] items-center py-5 border-b border-gray-800 gap-4 text-sm">
            {/* Name */}
            <div className="flex items-center gap-3">
                <div><img src={`/images/coins/${item.vendors_vendorshortcode.toLowerCase()}.png`} alt="" className="w-7 h-7" /></div>
                <span className="text-white ">{item.vendors_vendorname}</span>
                <span className="text-purple-400 font-semibold sm:hidden">
                    ({item.vendors_vendorshortcode})
                </span>
            </div>

            {/* Symbol */}
            <div className="hidden sm:flex text-purple-400 font-semibold">
                {item.vendors_vendorshortcode}
            </div>

            {/* Price */}
            <div className="text-white font-medium">
                ${marketData.price}
            </div>

            {/* Change */}
            <div className={positive ? "text-green-400" : "text-[#F74B60]"}>
                <span>{(getNumberFixedDecimal(marketData.change24hRate, decimal))} <br /></span> {Number(marketData?.change24h) >= 0 ? "+" : ""}
                {Number(marketData?.change24h).toFixed(2)}%
            </div>

            {/* Sparkline */}
            <div className="w-full sm:w-24 md:w-32">
                <GradientSparkline data={marketData.candles} positive={positive} />
            </div>

            {/* Trade */}
            <Link to={`/trade/${item.vendors_vendorshortcode}`} className="text-white hover:text-purple-400 flex gap-2 items-center justify-start sm:justify-end">
                Trade Now <BsArrowRight />
            </Link>
        </div>
    );
}


export type Candle = {
    t: number;   // open time (ms)
    o: string;
    h: string;
    l: string;
    c: string;   // CLOSE
    v: string;
};
