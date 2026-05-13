// @ts-nocheck
import { useEffect, useState } from "react";
import { PositionsTable } from "./DataTables/PositionsTable";
import { OpenOrdersTable } from "./DataTables/OpenOrdersTable";
import { TWAPTable } from "./DataTables/TWAPTable";
import { TradeHistoryTable } from "./DataTables/TradeHistoryTable";
import { FundingHistoryTable } from "./DataTables/FundingHistoryTable";
import { OrderHistoryTable } from "./DataTables/OrderHistoryTable";
import { RiFileCloseLine } from "react-icons/ri";
import { BalancesTable } from "./DataTables/balanceTable";
import { cleanTokenName, infoUrl } from "../../utils";

type Tab = {
    id: number;
    tab: string;
    name?: string
};


// All props consolidated for tables
export type AccountsDataProps = {
    selectedCoin: string,
    editObj: any | null;
    setEditObj: (editObj: any | null) => void;
    cancelAllOrders: (payload: any | null) => void;
    closeAllPositions: (payload: any | null) => void;
    cancelOrder: (payload: any) => void;
    UpdatePosition: (payload: any) => void;
    cancelPositionOrder: (payload: any) => void;
    cancelTwapOrder: (payload: any) => void;
    mids: any,
    marketData?: { price?: number } | null,
    balances?: any[];
    userPositions: any[];
    userOrders?: any[];
    tradeHistory: any[];
    fundingHistory: any[];
    orderHistory: any[];
    twapStates: any[];
    userTwapHistory: any[];
    userTwapSliceFills: any[];
    perpsEquity: number;
    isLoading: boolean;
    leverage: any;
    options: any;
    spotMode: string;
};

export const AccountsTabsTables = ({ UpdatePosition, selectedCoin,
    twapStates = [], userTwapHistory = [], userTwapSliceFills = [],
    editObj, setEditObj, cancelAllOrders,
    cancelOrder,
    cancelPositionOrder,
    mids,
    marketData,
    balances = [],
    userPositions,
    userOrders = [],
    tradeHistory = [],
    fundingHistory = [],
    orderHistory, perpsEquity, isLoading, leverage, cancelTwapOrder, closeAllPositions, options, spotMode
}: AccountsDataProps) => {
    const [type, setType] = useState<string | null>(null)

    // 🔍 Filter data based on spotMode to prevent Perps showing in Spot and vice-versa
    const filteredOrders = (userOrders ?? []).filter(o =>
        o.coin && (spotMode === 'spot' ? o.coin.startsWith('@') : !o.coin.startsWith('@'))
    );

    const filteredPositions = (userPositions ?? []).filter(p => {
        const coin = p.position?.coin;
        return coin && (spotMode === 'spot' ? coin.startsWith('@') : !coin.startsWith('@'));
    });

    const filteredTradeHistory = (tradeHistory ?? []).filter(t =>
        t.coin && (spotMode === 'spot' ? t.coin.startsWith('@') : !t.coin.startsWith('@'))
    );

    const filteredOrderHistory = (orderHistory ?? []).filter(h => {
        const coin = h.order?.coin;
        return coin && (spotMode === 'spot' ? coin.startsWith('@') : !coin.startsWith('@'));
    });

    const TABS = [
        { id: 1, tab: "Balances", count: balances.length + 1 },
        { id: 2, tab: "Positions", count: filteredPositions.length },
        { id: 3, tab: "Open Orders", count: filteredOrders.length },
        { id: 4, tab: "TWAP", count: twapStates.length },
        { id: 5, tab: "Trade History", count: 0 },
        { id: 6, tab: "Funding History", count: 0 },
        { id: 7, tab: "Order History", count: 0 },
    ];
    const [active, setActive] = useState<Tab>(TABS[0]);
    async function getSymbolMapping() {
        try {
            const response = await fetch(infoUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'spotMeta' })
            });
            const data = await response.json();
            const symbolMap = {};
            const tokenMap = {};
            // Helper function to clean token names
            // First, map token indices to cleaned names
            if (data.tokens && Array.isArray(data.tokens)) {
                data.tokens.forEach(token => {
                    tokenMap[token.index] = cleanTokenName(token.name);
                });
            }
            // Then create pair names from token indices
            if (data.universe && Array.isArray(data.universe)) {
                data.universe.forEach(item => {
                    if (item.tokens && item.tokens.length === 2) {
                        const baseName = tokenMap[item.tokens[0]];
                        const quoteName = tokenMap[item.tokens[1]];
                        symbolMap[item.index] = `${baseName}/${quoteName}`;
                    }
                });
            }
            return symbolMap;
        } catch (error) {
            console.error('Error fetching symbols:', error);
            return {};
        }
    }

    useEffect(() => {
        const fetchSymbols = async () => {
            const symbolMap = await getSymbolMapping();
            setSymbolMapping(symbolMap);
        };
        fetchSymbols();
    }, []);
    const [symbolmapping, setSymbolMapping] = useState({});
    return (
        <div className="pt-3">
            {/* Tabs */}
            <nav className="flex gap-6 overflow-x-auto custom-scroll">
                {TABS.map((t) => {
                    const isActive = t.id === active.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActive(t)}
                            className={`flex items-center cursor-pointer py-2 whitespace-nowrap transition relative ${isActive ? "text-[#2BC287]" : "opacity-50"}`}
                        >
                            <div className="relative pb-2">
                                {t.tab}

                                {/* underline */}
                                <div
                                    className={`h-0.5 w-6 absolute bottom-0 left-1/2 -translate-x-1/2 origin-center transition-all duration-300 ${isActive ? "bg-[#2BC287] scale-x-100" : "bg-white/0 scale-x-0"}`}
                                ></div>
                            </div>

                            {t?.count > 0 && (
                                <span
                                    className={`ml-2 rounded-full relative -top-1 px-2 py-0.5 text-[11px] font-semibold ${isActive ? "bg-[#2BC287] text-black" : "bg-white/80 text-black"} `} >
                                    {t.count}
                                </span>
                            )}
                        </button>

                    );
                })}
            </nav>

            {/* Dynamic Table Renderer */}
            <div className="">
                <Tables setType={setType} type={type ?? ''} isLoading={isLoading} selectedCoin={selectedCoin}
                    cancelAllOrders={cancelAllOrders}
                    UpdatePosition={UpdatePosition}
                    twapStates={twapStates}
                    userTwapHistory={userTwapHistory}
                    userTwapSliceFills={userTwapSliceFills}
                    editObj={editObj} setEditObj={setEditObj}
                    cancelOrder={cancelOrder}
                    cancelPositionOrder={cancelPositionOrder}
                    mids={mids}
                    marketData={marketData}
                    activeTab={active.tab}
                    balances={balances}
                    userPositions={filteredPositions}
                    userOrders={filteredOrders}
                    tradeHistory={filteredTradeHistory}
                    fundingHistory={fundingHistory}
                    orderHistory={filteredOrderHistory}
                    perpsEquity={perpsEquity}
                    leverage={leverage}
                    cancelTwapOrder={cancelTwapOrder}
                    closeAllPositions={closeAllPositions}
                    symbolmapping={symbolmapping}
                    options={options}
                    spotMode={spotMode}
                />
            </div>

        </div>
    );
};

/* -----------------------------------------------------------------------
   TABLES SWITCHER
------------------------------------------------------------------------ */

const Tables = ({
    editObj,
    setEditObj,
    mids,
    cancelAllOrders,
    cancelOrder,
    cancelPositionOrder,
    activeTab,
    balances,
    marketData,
    userPositions,
    userOrders,
    twapStates,
    userTwapHistory,
    userTwapSliceFills,
    tradeHistory,
    fundingHistory,
    orderHistory, UpdatePosition, perpsEquity, setType, type, isLoading, selectedCoin, leverage, cancelTwapOrder, closeAllPositions, symbolmapping, options, spotMode
}: {
    activeTab: string; setType: (type: string | null) => void, type: string | null,
} & AccountsDataProps) => {
    return (
        <section className="overflow-x-auto ">
            {activeTab === "Balances" && <BalancesTable balances={balances ?? []} positions={userPositions ?? []} perpsEquity={perpsEquity ?? 0} mids={mids} />}
            {activeTab === "Positions" && <PositionsTable options={options} orders={userOrders ?? []} positions={userPositions ?? []} mids={mids} closeAllPositions={closeAllPositions} leverage={leverage}
                UpdatePosition={UpdatePosition} cancelOrder={cancelOrder} setType={setType} type={type} isLoading={isLoading} selectedCoin={selectedCoin}
                cancelPositionOrder={cancelPositionOrder} editObj={editObj} setEditObj={setEditObj} marketData={marketData} perpsEquity={perpsEquity} />}
            {activeTab === "Open Orders" && <OpenOrdersTable orders={userOrders ?? []} cancelOrder={cancelOrder} cancelAllOrders={cancelAllOrders} symbolmapping={symbolmapping} />}
            {activeTab === "TWAP" && <TWAPTable mids={mids} twapStates={twapStates ?? []} userTwapHistory={userTwapHistory ?? []} userTwapSliceFills={userTwapSliceFills ?? []} cancelTwapOrder={cancelTwapOrder} symbolmapping={symbolmapping} />}
            {activeTab === "Trade History" && <TradeHistoryTable trades={tradeHistory ?? []} symbolmapping={symbolmapping} />}
            {activeTab === "Funding History" && <FundingHistoryTable fundings={fundingHistory ?? []} />}
            {activeTab === "Order History" && <OrderHistoryTable history={orderHistory} symbolmapping={symbolmapping} />}
        </section>
    );
};

export const TableWrapper = ({ children }: any) => (
    <div className="h-110 overflow-auto relative custom-scroll">
        <table className="table-auto w-full text-sm border-collapse ">
            {children}
        </table>
    </div>
);

export const TradeNoData = ({ data }: { data: any[] }) => {
    return (
        <>
            {data.length == 0 &&
                <tr className="absolute inset-0 pointer-events-none">
                    <td className="p-0">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                            <RiFileCloseLine className="text-4xl mb-2" />
                            <span>No Data</span>
                        </div>
                    </td>
                </tr>}
            {!data && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Loading...</div>}

        </>
    )
}