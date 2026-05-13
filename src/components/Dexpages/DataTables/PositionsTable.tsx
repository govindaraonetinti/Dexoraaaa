import { Edit2Icon } from "lucide-react";
import { TableWrapper, TradeNoData } from "../AccountsTabTables";
import { usePagination } from "../../../lib/hooks/usepagination";
import { PaginateSelect } from "./NumberSelect";
import { getNumberTransformed } from "../../../utils";
import { PositionEdit } from "../EditTableOrdersData/PositionEdit";
import EditTpSlPopup from "../EditTableOrdersData/EditTpSlPopup";

export const PositionsTable = ({
    options,
    type,
    setType,
    orders,
    perpsEquity,
    mids,
    positions,
    setEditObj, closeAllPositions, cancelPositionOrder, UpdatePosition, cancelOrder, editObj, isLoading, selectedCoin, leverage
}: PositionProps) => {
    const isShort = (szi: string) => szi?.toString().startsWith("-");
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(positions);
    function combinePositionWithTpSl(position: any) {
        if (!position || orders.length == 0) return;
        const entryPx = Number(position.entryPx);
        const isLong = Number(position.szi) > 0;

        const relatedOrders = orders.filter((o: any) =>
            o.coin === position.coin &&
            o.reduceOnly &&
            o.isTrigger &&
            o.isPositionTpsl
        );

        let tp = { triggerPx: "--" }
        let sl = { triggerPx: "--" };

        for (const order of relatedOrders) {
            const triggerPx = Number(order.triggerPx);

            if (isLong) {
                if (triggerPx > entryPx) tp = order;
                if (triggerPx < entryPx) sl = order;
            } else {
                if (triggerPx < entryPx) tp = order;
                if (triggerPx > entryPx) sl = order;
            }
        }

        return {
            tp,
            sl,
        };
    }

    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Coin</th>
                        <th className="px-4 py-3 bg-black">Size</th>
                        <th className="px-4 py-3 bg-black">Position value</th>
                        <th className="px-4 py-3 bg-black">Entry Price</th>
                        <th className="px-4 py-3 bg-black">Mark Price</th>
                        <th className="px-4 py-3 bg-black">PNL(ROE %)</th>
                        <th className="px-4 py-3 bg-black">Liq Price</th>
                        <th className="px-4 py-3 bg-black">Margin</th>
                        <th className="px-4 py-3 bg-black">Funding</th>
                        <th className="px-4 py-3 bg-black" >
                            <button onClick={() => closeAllPositions('payload')} className={`${positions.length == 0 ? 'text-[#6D6D6F]' : 'text-[#2BC287]'}`} disabled={positions.length == 0}>Cancel All</button>
                        </th>
                        <th className="px-4 py-3 bg-black">TP/SL</th>
                    </tr>
                </thead>

                {paginatedTrades.length !== 0 ? (
                    <tbody>
                        {paginatedTrades.map((p, i) => {
                            const pos = p.position;
                            const short = isShort(pos.szi);
                            const color = short ? "text-[#F74B60]" : "text-[#2BC287]";

                            const colorfunding = pos.cumFunding?.allTime < 0 ? "text-[#F74B60]" : "text-[#2BC287]";
                            const markPrice = mids[pos.coin];
                            const entryPrice = Number(pos.entryPx);
                            const size = Math.abs(Number(pos.szi));
                            const isLong = Number(pos.szi) > 0;

                            const unrealizedPnl =
                                markPrice
                                    ? (isLong
                                        ? (markPrice - entryPrice)
                                        : (entryPrice - markPrice)
                                    ) * size
                                    : 0;
                            const roe =
                                pos.marginUsed && Number(pos.marginUsed) !== 0
                                    ? ((unrealizedPnl / Number(pos.marginUsed)) * 100).toFixed(2)
                                    : "--";
                            const colorpnl = unrealizedPnl < 0 ? "text-[#F74B60]" : "text-[#2BC287]";
                            return (
                                <tr key={i}>
                                    {/* COIN */}
                                    <td className="px-4 py-3">
                                        <span className={color}>
                                            {pos.coin} {pos.leverage?.value}x
                                        </span>
                                    </td>

                                    {/* SIZE */}
                                    <td className="px-4 py-3">
                                        <span className={color}>{Math.abs(Number(pos.szi))}</span>
                                    </td>

                                    {/* POSITION VALUE */}
                                    <td className="px-4 py-3">
                                        {Number(pos.positionValue)} USDC
                                    </td>

                                    {/* ENTRY PRICE */}
                                    <td className="px-4 py-3">
                                        {Number(pos.entryPx)}
                                    </td>

                                    {/* MARK PRICE */}
                                    <td className="px-4 py-3">
                                        {mids[pos.coin] ? mids[pos.coin] : "--"}
                                    </td>

                                    {/* UNREALIZED PNL */}
                                    <td className="px-4 py-3">
                                        <span className={colorpnl}>
                                            {unrealizedPnl.toFixed(4)} ({`${roe}%`})
                                        </span>
                                    </td>

                                    {/* LIQ PRICE */}
                                    <td className="px-4 py-3">
                                        {pos.liquidationPx
                                            ? getNumberTransformed(pos.liquidationPx)
                                            : "--"}
                                    </td>

                                    {/* MARGIN USED */}
                                    <td className="px-4 py-3">
                                        {Number(pos.marginUsed)}
                                    </td>

                                    {/* FUNDING */}
                                    <td className="px-4 py-3">
                                        <span className={colorfunding}>{getNumberTransformed(pos.cumFunding?.allTime) ?? "--"}</span>
                                    </td>

                                    {/* CLOSE ALL */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <button className="text-[#2BC287]"
                                                onClick={() => {
                                                    setEditObj({ ...p, type: "Limit", marketPrice: mids[pos.coin] });
                                                    setType('marketlimit')
                                                }}
                                            >
                                                Limit
                                            </button>
                                            <button className="text-[#2BC287]"
                                                onClick={() => {
                                                    setEditObj({
                                                        ...p,
                                                        type: "Market",
                                                        marketPrice: mids[pos.coin],
                                                    });
                                                    setType('marketlimit')
                                                }}
                                            >
                                                Market
                                            </button>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            {/* Extract position data */}

                                            <>
                                                <button className="px-1 py-0.5 bg-gray-700 rounded text-white text-xs">
                                                    {combinePositionWithTpSl(pos)?.tp.triggerPx}
                                                </button>/
                                                <button className="px-1 py-0.5 bg-gray-700 rounded text-white text-xs">
                                                    {combinePositionWithTpSl(pos)?.sl.triggerPx}
                                                </button>
                                            </>


                                            {/* Edit button */}
                                            <button
                                                onClick={() => {
                                                    setEditObj({
                                                        ...p,
                                                        type: "tpsl",
                                                        marketData: mids[p.position.coin],
                                                        color: color,
                                                        tpsl: combinePositionWithTpSl(pos)
                                                    });
                                                    setType('tpsl')
                                                }}
                                                className="ml-1"
                                            >
                                                <Edit2Icon className="w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                ) : (
                    <TradeNoData data={positions} />
                )}
            </TableWrapper>
            <PaginateSelect setPage={setPage} pageCount={pageCount} number={number} setNumber={setNumber} data={positions} page={page} />
            {type == 'marketlimit' && <PositionEdit options={options} leverage={leverage} selectedCoin={selectedCoin} editObj={editObj} setEditObj={setEditObj} cancelPositionOrder={cancelPositionOrder} isLoading={isLoading} perpsEquity={perpsEquity} />}
            {type == 'tpsl' && <EditTpSlPopup editObj={editObj} setEditObj={setEditObj} UpdatePosition={UpdatePosition} cancelOrder={cancelOrder} isLoading={isLoading} />}
        </>
    );
};
interface PositionProps {
    type: string | null;
    setType: (type: string | null) => void;
    mids: any, positions: any[], cancelOrder: (payload: any) => void; editObj: any | null;
    UpdatePosition: (payload: any) => void;
    cancelPositionOrder: (payload: any) => void;
    setEditObj: (editObj: any | null) => void; marketData?: { price?: number } | null,
    closeAllPositions: (payload: any | null) => void;
    orders: any[];
    perpsEquity: any;
    isLoading: boolean;
    selectedCoin: string;
    leverage: any;
    options:any
}