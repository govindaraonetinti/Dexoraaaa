import { useState } from "react";
import { TableWrapper, TradeNoData } from "../AccountsTabTables";
import { ViewTsPSlPopup } from "../EditTableOrdersData/ViewTsPSlPopup";
import { getFormattedDateTime, getNumberTransformed } from "../../../utils";
import { usePagination } from "../../../lib/hooks/usepagination";
import { PaginateSelect } from "./NumberSelect";

export const OpenOrdersTable = ({ orders, cancelOrder, cancelAllOrders, symbolmapping }: {
    orders: any[],
    cancelOrder: (payload: any) => void
    cancelAllOrders: (payload: any) => void
    symbolmapping: any
}) => {

    const [selectedOrder, setSelectedOrder] = useState(null);
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(orders);
    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Time</th>
                        <th className="px-4 py-3 bg-black">Type</th>
                        <th className="px-4 py-3 bg-black">Coin</th>
                        <th className="px-4 py-3 bg-black">Direction</th>
                        <th className="px-4 py-3 bg-black">Size</th>
                        <th className="px-4 py-3 bg-black">Original Size</th>
                        <th className="px-4 py-3 bg-black">Order Value</th>
                        <th className="px-4 py-3 bg-black">Price</th>
                        <th className="px-4 py-3 bg-black">Reduce Only</th>
                        <th className="px-4 py-3 bg-black">Trigger Conditions</th>
                        <th className="px-4 py-3 bg-black">TP/SL</th>
                        <th className="px-4 py-3 bg-black"><button onClick={() => cancelAllOrders('payload')} className={`${orders.length == 0 ? 'text-[#6D6D6F]' : 'text-[#2BC287]'}`} disabled={orders.length == 0}>Cancel All</button></th>
                    </tr>
                </thead>

                {paginatedTrades.length !== 0 ? (
                    <tbody>
                        {paginatedTrades.map((o: any, i) => {
                            const px = o.limitPx ? Number(o.limitPx) : null;
                            const orderValue = px ? px * Number(o.sz) : "--";
                            const ordertype = (o.coin.includes("@") ? (o.side === "B" ? "Buy" : "Sell") : (((o.orderType == 'Stop Market') || (o.orderType == 'Stop Limit')) && (o.triggerPrice != '')) ? (o.side === "A" ? "Close Long" : "Close Short") :
                                ((((o.orderType == 'Take Profit Market') || (o.orderType == 'Take Profit Limit')) && (o.triggerPrice != '')) ? (o.side === "A" ? "Close Long" : "Close Short") : (o.side === "B" ? "Long" : "Short")));
                            return (
                                <tr key={i}>
                                    {/* TIME */}
                                    <td className="px-4 py-3">
                                        <div>{getFormattedDateTime(o.timestamp).date}</div>
                                        <div className="text-[12px]">{getFormattedDateTime(o.timestamp).timeAMPM}</div>
                                    </td>

                                    {/* TYPE */}
                                    <td className="px-4 py-3">
                                        {o.orderType}
                                    </td>

                                    {/* COIN */}
                                    <td className="px-4 py-3">{symbolmapping[o.coin.replace('@', '')] || o.coin}</td>

                                    {/* DIRECTION */}
                                    <td className={`px-4 py-3 ${o.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                        {ordertype}
                                    </td>

                                    {/* SIZE */}
                                    <td className="px-4 py-3">{o.sz}</td>

                                    {/* ORIGINAL SIZE */}
                                    <td className="px-4 py-3">{o.origSz}</td>
                                    {/* ORDER VALUE */}
                                    <td className="px-4 py-3">{orderValue !== "--" ? getNumberTransformed(orderValue) : "--"}</td>

                                    {/* PRICE */}
                                    <td className="px-4 py-3">
                                        {(o?.orderType?.toLowerCase().indexOf('market') >= 0) ? "Market" : getNumberTransformed(px)}
                                    </td>
                                    {/* REDUCE ONLY */}
                                    <td className="px-4 py-3">{o.coin.includes("@") ? "--" : o.reduceOnly ? "Yes" : "No"}</td>

                                    {/* TRIGGER CONDITIONS */}
                                    <td className="px-4 py-3">
                                        {o.triggerPx
                                            ? `${o.triggerCondition}`
                                            : "--"}
                                    </td>

                                    {/* TP/SL */}
                                    {/* TP / SL */}
                                    <td className="px-4 py-3">
                                        {o.children?.length ? (
                                            <button
                                                onClick={() => setSelectedOrder(o)}
                                                className="text-white font-bold"
                                            >
                                                View
                                            </button>
                                        ) : "--"}
                                    </td>



                                    {/* ACTION */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => cancelOrder({ coinName: o.coin, orderId: o.oid })}
                                            className="text-[#F74B60] hover:text-red-300"
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                ) : (
                    <TradeNoData data={orders} />
                )}
            </TableWrapper>
            {selectedOrder && <ViewTsPSlPopup order={selectedOrder} setSelectedOrder={setSelectedOrder} />}
            <PaginateSelect setPage={setPage} pageCount={pageCount} number={number} setNumber={setNumber} data={orders} page={page} />

        </>
    )
};
