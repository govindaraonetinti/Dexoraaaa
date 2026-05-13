import { usePagination } from "../../../lib/hooks/usepagination";
import { getFormattedDateTime, getNumberTransformed } from "../../../utils";
import { TableWrapper, TradeNoData } from "../AccountsTabTables";
import { PaginateSelect } from "./NumberSelect";

export const FundingHistoryTable = ({ fundings }: { fundings: any[] }) => {
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(fundings);
    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Time</th>
                        <th className="px-4 py-3 bg-black">Coin</th>
                        <th className="px-4 py-3 bg-black">Size</th>
                        <th className="px-4 py-3 bg-black">Position Side</th>
                        <th className="px-4 py-3 bg-black">Payment (USDC)</th>
                        <th className="px-4 py-3 bg-black">Rate</th>
                    </tr>
                </thead>

                {paginatedTrades.length !== 0 ? (
                    <tbody>
                        {paginatedTrades.map((f, i) => {
                            const { date, timeAMPM } = getFormattedDateTime(f.time);

                            return (
                                <tr key={i}>
                                    {/* Time */}
                                    <td className="px-4 py-3">
                                        <div>{date}</div>
                                        <div className="text-[12px]">{timeAMPM}</div>
                                    </td>

                                    {/* Coin */}
                                    <td className={`px-4 py-3 ${Number(f.szi) >= 0
                                            ? "text-[#2BC287]"
                                            : "text-[#F74B60]"
                                            }`}>{f.coin}</td>

                                    {/* Size */}
                                    <td
                                        className={`px-4 py-3 `}
                                    >
                                        {Math.abs(f.szi)} {f.coin}
                                    </td>

                                    {/* Position Side */}
                                    <td
                                        className={`px-4 py-3 ${Number(f.szi) > 0
                                            ? "text-[#2BC287]"
                                            : Number(f.szi) < 0
                                                ? "text-[#F74B60]"
                                                : ""
                                            }`}
                                    >
                                        {Number(f.szi) > 0
                                            ? "Long"
                                            : Number(f.szi) < 0
                                                ? "Short"
                                                : "--"}
                                    </td>

                                    {/* Payment (USDC) */}
                                    <td
                                        className={`px-4 py-3 ${Number(f.usdc) >= 0
                                            ? "text-[#2BC287]"
                                            : "text-[#F74B60]"
                                            }`}
                                    >
                                        {f.usdc}
                                    </td>

                                    {/* Rate */}
                                    <td
                                        className={`px-4 py-3`}
                                    >
                                        {getNumberTransformed(f.fundingRate*100)}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                ) : (
                    <TradeNoData data={fundings} />
                )}
            </TableWrapper>
            <PaginateSelect setPage={setPage} pageCount={pageCount} number={number} setNumber={setNumber} data={fundings} page={page} />
        </>
    )
};
