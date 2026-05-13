import { FiArrowUpRight } from "react-icons/fi";
import { CardRow } from "./CardRow";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";

export const PerpCard = ({balance}:{balance:any}) => {
    return (
        <div className="border-2 border-[#2a2a32] overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-[#2A2A32] px-6 py-5">
                <div className="font-medium text-[20px]">Perp</div>
                <Link to={'/trade/BTC'} className="text-[16px] text-white border px-4 py-2 rounded-xl border-[#37373C] flex items-center gap-1">
                    Trade now <FiArrowUpRight className="text-xl" />
                </Link>
            </div>

            {/* Balance */}
            <div className="border-b-2 border-[#2A2A32] px-3 py-3 max-w-[95%] mx-auto">
                <div className="flex flex-col gap-2 justify-between text-white/70 text-[16px] py-1">
                    <span>Balace</span>
                    <span>{balance}</span>
                </div>
            </div>

            {/* Margin + PNL */}
            <div className="border-b-2 border-[#2A2A32] px-3 py-3 max-w-[95%] mx-auto">
                <CardRow label="Margin used" value="--" />
                <CardRow label="Unrealized PNL" value="--" />
            </div>

            {/* Footer button */}
            <button className="w-full px-6 py-3 flex justify-between items-center text-[20px]">
                Trade history <MdOutlineKeyboardArrowRight />
            </button>
        </div>
    );
};
