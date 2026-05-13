import { useEffect, useState } from "react";
import { getFormattedDateTime, getNumberTransformed, toTitleCase } from "../../../utils";
import { TableWrapper, TradeNoData } from "../AccountsTabTables";
import { usePagination } from "../../../lib/hooks/usepagination";
import { PaginateSelect } from "./NumberSelect";

export const TWAPTable = ({ mids, twapStates, userTwapSliceFills, userTwapHistory, cancelTwapOrder, symbolmapping }: { mids: any, twapStates: any[], userTwapSliceFills: any[], userTwapHistory: any[], cancelTwapOrder: (payload: any) => void, symbolmapping: any }) => {

    const tabs = [
        { id: 1, tab: "", name: "Active", count: twapStates.length },
        { id: 2, tab: "history", name: "History", count: 0 },
        { id: 3, tab: "fillhistory", name: "Fill History", count: 0 },
    ];

    const [active, setActive] = useState(tabs[0]);
    return (
        <>
            <nav className="flex gap-6 overflow-x-auto custom-scroll">
                {tabs.map((t) => {
                    const isActive = active.id === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActive(t)}
                            className={`flex items-center cursor-pointer py-2 whitespace-nowrap text-sm font-medium transition relative ${isActive ? "text-[#2BC287]" : "opacity-50"}`}
                        >
                            <div className="relative pb-2">
                                {t.name}

                                {/* underline */}
                                <div
                                    className={`h-0.5 w-6 absolute bottom-0 left-1/2 -translate-x-1/2 origin-center transition-all duration-300
                ${isActive ? "bg-[#2BC287] scale-x-100" : "bg-white/0 scale-x-0"}
            `}
                                ></div>
                            </div>

                            {t.count > 0 && (
                                <span
                                    className={`ml-2 rounded-full relative -top-1 px-2 py-0.5 text-[11px] font-semibold
                ${isActive ? "bg-[#2BC287] text-black" : "bg-white/80 text-black"}
            `}
                                >
                                    {t.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>



            {active.tab === "fillhistory" && (
                <FillHistoryTable userTwapSliceFills={userTwapSliceFills} symbolmapping={symbolmapping} />
            )}

            {active.tab === "history" && (
                <HistoryTable userTwapHistory={userTwapHistory} symbolmapping={symbolmapping} />
            )}
            {active.tab === "" && (
                <ActiveTable twapStates={twapStates} cancelTwapOrder={cancelTwapOrder} mids={mids} symbolmapping={symbolmapping} />
            )}
        </>
    );
};

const ActiveTable = ({ twapStates, cancelTwapOrder, mids, symbolmapping }: { twapStates: any[], cancelTwapOrder: (payload: any) => void, mids: any, symbolmapping: any }) => {
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(twapStates);

    function formatDuration(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Add leading zeros with String.prototype.padStart
        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");

        return `${hh}:${mm}:${ss}`;
    }

    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Created Time</th>
                        <th className="px-4 py-3 bg-black">Coin</th>
                        <th className="px-4 py-3 bg-black">Size</th>
                        <th className="px-4 py-3 bg-black">Executed Size</th>
                        <th className="px-4 py-3 bg-black">Avg Price</th>
                        <th className="px-4 py-3 bg-black">Runtime / Total</th>
                        <th className="px-4 py-3 bg-black">Reduce Only</th>
                        <th className="px-4 py-3 bg-black">Randomize</th>
                        <th className="px-4 py-3 bg-black">Terminate</th>
                    </tr>
                </thead>

                {paginatedTrades.length ? (
                    <tbody>
                        {paginatedTrades.map(([id, t]: any) => {
                            const startTimeMs = t.timestamp;
                            const durationMs = t.minutes * 60 * 1000;

                            // Count-up timer: elapsed time since start
                            const elapsedMs = Math.min(Math.max(0, Date.now() - startTimeMs), durationMs);


                            return (
                                <tr key={id}>
                                    {/* Created Time */}
                                    <td className="px-4 py-3">
                                        <div>{getFormattedDateTime(t.timestamp).date}</div>
                                        <div className="text-[12px]">{getFormattedDateTime(t.timestamp).timeAMPM}</div>
                                    </td>

                                    {/* Coin */}
                                    <td className={`px-4 py-3 ${t.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                        {symbolmapping[t.coin.replace('@', '')] || t.coin}
                                    </td>

                                    {/* Size */}
                                    <td className={`px-4 py-3 ${t.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                        {t.sz}
                                    </td>

                                    {/* Executed Size */}
                                    <td className={`px-4 py-3 ${t.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                        {t.executedSz} {t.coin}
                                    </td>

                                    {/* Avg Price */}
                                    <td className="px-4 py-3">{mids[t.coin]}</td>

                                    {/* Runtime / Total */}
                                    {/* <td className="px-4 py-3">{t.minutes} minutes</td> */}
                                    <td className="px-4 py-3">
                                        {formatDuration(elapsedMs)} / {t.minutes} minutes
                                    </td>

                                    {/* Reduce Only */}
                                    <td className="px-4 py-3">{t.reduceOnly ? "Yes" : "No"}</td>

                                    {/* Randomize */}
                                    <td className="px-4 py-3">{t.randomize ? "Yes" : "No"}</td>

                                    {/* Terminate */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => cancelTwapOrder({ coinName: t.coin, orderId: id })}
                                            className="text-[#F74B60] hover:text-red-300"
                                        >
                                            Terminate
                                        </button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                ) : (
                    <TradeNoData data={twapStates} />
                )}
            </TableWrapper>

            <PaginateSelect
                setPage={setPage}
                pageCount={pageCount}
                number={number}
                setNumber={setNumber}
                data={twapStates}
                page={page}
            />
        </>
    );
};

const HistoryTable = ({ userTwapHistory, symbolmapping }: { userTwapHistory: any[], symbolmapping: any }) => {
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(userTwapHistory);
    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Time</th>
                        <th className="px-4 py-3 bg-black">Coin</th>
                        <th className="px-4 py-3 bg-black">Total Size</th>
                        <th className="px-4 py-3 bg-black">Executed Size</th>
                        <th className="px-4 py-3 bg-black">Avg Size</th>
                        <th className="px-4 py-3 bg-black">Total Runtime</th>
                        <th className="px-4 py-3 bg-black">Reduce Only</th>
                        <th className="px-4 py-3 bg-black">Randomize</th>
                        <th className="px-4 py-3 bg-black">Status</th>
                    </tr>
                </thead>

                {paginatedTrades.length ? (
                    <tbody>
                        {paginatedTrades.map((t, i) => {
                            return (
                                <tr key={i}>
                                    <td className="px-4 py-3">
                                        <div>{getFormattedDateTime(t.state.timestamp).date}</div>
                                        <div className="text-[12px]">{getFormattedDateTime(t.state.timestamp).timeAMPM}</div>
                                    </td>
                                    <td className={`px-4 py-3 ${t.state.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                        {symbolmapping[t.state.coin.replace('@', '')] || t.state.coin}
                                    </td>
                                    <td className={`px-4 py-3 ${t.state.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                        {getNumberTransformed( Number(t.state.executedSz) + Number(t.state.sz))} {t.state.coin}
                                    </td>
                                    <td className={`px-4 py-3 ${t.state.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>{t.state.executedSz} {t.state.coin}</td>
                                    <td className="px-4 py-3">{t.state.sz}</td>
                                    <td className="px-4 py-3">{t.state.minutes} minutes</td>
                                    <td className="px-4 py-3">{t.state.reduceOnly ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3">{t.state.randomize ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3">
                                        {toTitleCase(t.status.status)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                ) : (
                    <TradeNoData data={userTwapHistory} />
                )}
            </TableWrapper>
            <PaginateSelect setPage={setPage} pageCount={pageCount} number={number} setNumber={setNumber} data={userTwapHistory} page={page} />

        </>
    );
};
const FillHistoryTable = ({ userTwapSliceFills, symbolmapping }: { userTwapSliceFills: any[], symbolmapping: any }) => {
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(userTwapSliceFills);
    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Time</th>
                        <th className="px-4 py-3 bg-black">Coin</th>
                        <th className="px-4 py-3 bg-black">Direction</th>
                        <th className="px-4 py-3 bg-black">Price</th>
                        <th className="px-4 py-3 bg-black">Size</th>
                        <th className="px-4 py-3 bg-black">Trade Volume</th>
                        <th className="px-4 py-3 bg-black">Fee</th>
                        <th className="px-4 py-3 bg-black">Closed PNL</th>
                    </tr>
                </thead>

                {paginatedTrades.length ? (
                    <tbody>
                        {paginatedTrades.map((t, i) => (
                            <tr key={i}>
                                <td className="px-4 py-3">
                                    <div>{getFormattedDateTime(t.fill.time).date}</div>
                                    <div className="text-[12px]">
                                        {getFormattedDateTime(t.fill.time).timeAMPM}
                                    </div>
                                </td>
                                <td className={`px-4 py-3 ${t.fill.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                    {symbolmapping[t.fill.coin.replace('@', '')] || t.fill.coin}
                                </td>
                                <td className={`px-4 py-3 ${t.fill.side === "B" ? "text-[#2BC287]" : "text-[#F74B60]"}`}>
                                    {t.fill.dir}
                                </td>
                                <td className="px-4 py-3">{t.fill.px}</td>
                                <td className="px-4 py-3">{t.fill.sz} {t.fill.coin}</td>
                                <td className="px-4 py-3">{getNumberTransformed(t.fill.sz * t.fill.px)}</td>
                                <td className="px-4 py-3">{t.fill.fee} {t.fill.feeToken}</td>
                                <td className="px-4 py-3">{t.fill.closedPnl} {t.fill.feeToken}</td>
                            </tr>
                        ))}
                    </tbody>
                ) : (
                    <TradeNoData data={userTwapSliceFills} />
                )}
            </TableWrapper>
            <PaginateSelect setPage={setPage} pageCount={pageCount} number={number} setNumber={setNumber} data={userTwapSliceFills} page={page} />

        </>
    );
};


const CountdownTimer = ({ durationMinutes = 5 }: { durationMinutes?: number }) => {
    const [now, setNow] = useState(Date.now());

    // Update `now` every second
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Helper to format duration
    function formatDuration(ms: number) {
        if (ms <= 0) return "Completed";

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    const startTimeMs = Date.now(); // Start from now
    const durationMs = durationMinutes * 60 * 1000; // Convert minutes to ms
    const endTimeMs = startTimeMs + durationMs;
    const remainingMs = Math.max(0, endTimeMs - now);

    return (
        <div>
            <h2>Countdown:</h2>
            <p>{formatDuration(remainingMs)}</p>
        </div>
    );
};

export default CountdownTimer;
