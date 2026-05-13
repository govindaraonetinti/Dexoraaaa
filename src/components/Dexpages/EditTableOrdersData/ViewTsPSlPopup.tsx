import Modal from "../../../lib/Modal";

export const ViewTsPSlPopup = ({ order, setSelectedOrder }: { order: any, setSelectedOrder: (order: any) => void }) => {
    const sl = order.children.find((c: any) => c.orderType.includes("Stop"));
    const tp = order.children.find((c: any) => c.orderType.includes("Take Profit"));
    const getPriceLabel = (o: any) => o.orderType.includes("Market") ? "Market" : `$${o.limitPx}`;

    return (
        <Modal open={order} onClose={() => setSelectedOrder(null)} width="max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-2">
                Take Profit / Stop Loss
            </h2>
            <p className="text-center text-gray-400 mb-6">
                If Order A is filled, Orders B & C will be placed
            </p>

            {/* ORDER A */}
            <div className="text-center mb-4 text-sm text-gray-400">Order A (Entry)</div>
            <div className="border-2 border-[#4a4a4d] rounded-xl p-4 mb-6 max-w-md mx-auto space-y-2 bg-[#27272A]">
                <div className="flex justify-between"><span>Order Type:</span> <span>{order.orderType}</span></div>
                <div className="flex justify-between"><span>Side:</span> <span className={order.side === "A" ? "text-[#F74B60]" : "text-[#2BC287]"}>{order.side === "B" ? "Long" : "Short"}</span></div>
                <div className="flex justify-between"><span>Amount:</span> <span>{order.sz} {order.coin}</span></div>
                <div className="flex justify-between"><span>Trigger:</span> <span>{order.triggerCondition}</span></div>
                <div className="flex justify-between"><span>Price:</span> <span>${order.limitPx}</span></div>
            </div>

            {/* Vertical line connecting Order A to B & C */}
            <div className="h-6 w-0.5 bg-[#4a4a4d] mx-auto"></div>

            {/* ORDER B & C */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Stop Loss */}
                {sl && (
                    <div className="max-w-md w-full mx-auto">
                        <div className="text-center text-sm text-gray-400 mb-1">If Order B filled, cancel Order C</div>
                        <div className="text-center text-sm text-gray-400 mb-2">Order B</div>
                        <div className="border-2 border-[#4a4a4d] rounded-xl p-4 bg-[#27272A] space-y-2">
                            <div className="flex justify-between"><span>Order Type:</span> {sl.orderType}</div>
                            <div className="flex justify-between"><span>Side:</span> <span className={sl.side === "A" ? "text-[#F74B60]" : "text-[#2BC287]"}>{sl.side === "B" ? "Long" : "Short"}</span></div>
                            <div className="flex justify-between"><span>Amount:</span> {sl.sz} {sl.coin}</div>
                            <div className="flex justify-between"><span>Trigger:</span> {sl.triggerCondition}</div>
                            <div className="flex justify-between"><span>Price:</span> {getPriceLabel(sl)}</div>
                        </div>
                    </div>
                )}

                {/* Take Profit */}
                {tp && (
                    <div className="max-w-md w-full mx-auto">
                        <div className="text-center text-sm text-gray-400 mb-1">If Order C filled, cancel Order B</div>
                        <div className="text-center text-sm text-gray-400 mb-2">Order C</div>
                        <div className="border-2 border-[#4a4a4d] rounded-xl p-4 bg-[#27272A] space-y-2">
                            <div className="flex justify-between"><span>Order Type:</span> {tp.orderType}</div>
                            <div className="flex justify-between"><span>Side:</span> <span className={tp.side === "A" ? "text-[#F74B60]" : "text-[#2BC287]"}>{tp.side === "B" ? "Long" : "Short"}</span></div>
                            <div className="flex justify-between"><span>Amount:</span> {tp.sz} {tp.coin}</div>
                            <div className="flex justify-between"><span>Trigger:</span> {tp.triggerCondition}</div>
                            <div className="flex justify-between"><span>Price:</span> {getPriceLabel(tp)}</div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
