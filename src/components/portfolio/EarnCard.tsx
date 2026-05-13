import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { CardRow } from "./CardRow";
import { FiArrowUpRight } from "react-icons/fi";

export const EarnCard = ({balance}:{balance:string}) => {
    return (
        <div className="border-2 border-[#2a2a32] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#2A2A32] px-6 py-5">
                <div className="font-medium text-[20px]">Earn</div>

                <button className="text-[16px] text-white border px-4 py-2 rounded-xl border-[#37373C] flex items-center gap-1">
                    Mint now <FiArrowUpRight className="text-xl" />
                </button>
            </div>

            {/* Balance section */}
            <div className="border-b-2 border-[#2A2A32] px-3 py-3 max-w-[95%] mx-auto">
                <div className="flex flex-col gap-2 justify-between text-white/70 text-[16px] py-1">
                    <span>Balace</span>
                    <span>{balance}</span>
                </div>
            </div>

            {/* Principal + PNL */}
            <div className="border-b-2 border-[#2A2A32] px-3 py-3 max-w-[95%] mx-auto">
                <CardRow label="Principal" value="--" />
                <CardRow label="Holding PNL" value="--" />
            </div>

            {/* Footer */}
            <button className="w-full px-6 py-3 flex justify-between items-center text-[20px]">
                Earn history <MdOutlineKeyboardArrowRight />
            </button>
        </div>
    );
};
