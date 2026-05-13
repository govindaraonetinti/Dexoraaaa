import { usePagination } from "../../../lib/hooks/usepagination";
import { getAssetInfo, getNumberTransformed ,cleanTokenName} from "../../../utils";
import { TableWrapper } from "../AccountsTabTables";
import { PaginateSelect } from "./NumberSelect";
import WithdrawPopupForm from "./../WithdrawForm";
import WithdrawPopupForm_spot from "./../../Spot/WithdrawForm_spot";
import { useState } from "react";
import { useTradingEngine } from "./../../../lib/hooks/useTradingActions";


export const BalancesTable = ({ balances, positions, perpsEquity, mids }: { balances: any[], positions: any[], perpsEquity: any, mids: any }) => {
    const { page, setPage, pageCount, paginatedData: paginatedTrades, setNumber, number } = usePagination(balances);
    const [openWithdraw, setWithdraw] = useState<boolean>(false);
    const [activeWithdrawCoin, setActiveWithdrawCoin] = useState<string | null>(null);
    const trading = useTradingEngine();

    const marginUsed = positions .map((p) => p.position.marginUsed).reduce((a, b) => Number(a) + Number(b), 0);
    const availablePerps = perpsEquity - marginUsed;
    return (
        <>
            <TableWrapper>
                <thead>
                    <tr className="sticky top-0">
                        <th className="px-4 py-3 bg-black">Asset</th>
                        <th className="px-4 py-3 bg-black">Total Balance</th>
                        <th className="px-4 py-3 bg-black">Available</th>
                        <th className="px-4 py-3 bg-black">In Orders</th>
                        <th className="px-4 py-3 bg-black">Value (USD)</th>
                        <th className="px-4 py-3 bg-black">Withdraw</th>
                    </tr>
                </thead>
                <tbody>
                    {/* ── USDC (Perps) row ── */}
                    <tr key={-1}>
                        <td className="px-4 py-3">USDC (Perps)</td>
                        <td className="px-4 py-3">{getNumberTransformed(perpsEquity)}</td>
                        <td className="px-4 py-3">{getNumberTransformed(availablePerps)}</td>
                        <td className="px-4 py-3">{marginUsed}</td>
                        <td className="px-4 py-3">${getNumberTransformed(availablePerps)}</td>
                        <td className="px-4 py-3" onClick={() => setWithdraw(true)}>
                            <WithdrawPopupForm
                                withdrawPopup={openWithdraw}
                                setWithdrawPopup={setWithdraw}
                                withdraw={trading.withdraw}
                                perpsEquity={getNumberTransformed(availablePerps)}
                            />
                            Withdraw
                        </td>
                    </tr>
                    {paginatedTrades.map((b, i) => {
                        if (Number(b.total) <= 0) return null;
                        const assetInfo  = getAssetInfo(mids, b.coin);
                        const available  = Number(b.total) - Number(b.hold);
                        const isUSDC     = b.coin === "USDC";
                        const isPopupOpen = activeWithdrawCoin === b.coin;
                        return (
                            <tr key={i}>
                                <td className="px-4 py-3">{cleanTokenName (assetInfo.name || b.coin)} (Spot)</td>
                                <td className="px-4 py-3">{b.total}</td>
                                <td className="px-4 py-3">{getNumberTransformed(available)}</td>
                                <td className="px-4 py-3">{getNumberTransformed(b.hold)}</td>
                                <td className="px-4 py-3">
                                    ${getNumberTransformed(assetInfo.price * available)}
                                </td>
                                <td className="px-4 py-3" onClick={() => { if (!isUSDC) setActiveWithdrawCoin(b.coin); }} >
                                    Withdraw
                                    {!isUSDC && (
                                        <WithdrawPopupForm_spot
                                            withdrawPopup={isPopupOpen}
                                            setWithdrawPopup={(open: boolean) =>
                                                setActiveWithdrawCoin(open ? b.coin : null)
                                            }
                                            withdraw={trading.withdraw}
                                            perpsEquity={getNumberTransformed(available)}
                                            currency={String(assetInfo.name || b.coin)}
                                        />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </TableWrapper>
            {/* PAGINATION */}
            <PaginateSelect setPage={setPage} pageCount={pageCount} number={number} setNumber={setNumber} data={balances} page={page} />
        </>
    );
};