import { AlertCircle, X } from 'lucide-react';
import ConfirmationTxnPopup from '../lib/popups/ConfirmrationTxnPopup';
import { DexHeader } from '../components/Dexpages/DexHeader';
import TradingChart from '../components/Dexpages/TradingChart';
import TradingForm from '../components/Dexpages/TradeForms';
import { AccountsTabsTables } from '../components/Dexpages/AccountsTabTables';
import { OrderBook } from '../components/Dexpages/OrderBook';
import { RecentTrades } from '../components/Dexpages/RecentTrades';
import { AccountSummaryCard } from '../components/Dexpages/AccountSummaryCard';
import { useTradingEngine } from '../lib/hooks/useTradingActions';
import { useEffect, useMemo } from 'react';
import { BiSolidCoinStack } from 'react-icons/bi';
import { TbGitBranchDeleted } from 'react-icons/tb';
import { RiAccountCircleLine } from 'react-icons/ri';
import SEO from '../components/SEO';


const tabs = [
    { tab: "markets", icon: <BiSolidCoinStack className='w-5 h-5' /> },
    { tab: "trade", icon: <TbGitBranchDeleted className='w-5 h-5' /> },
    { tab: "accounts", icon: <RiAccountCircleLine className='w-5 h-5' /> }
]

export default function Trade() {
    const trading = useTradingEngine();
    const placeLongOrder = useMemo(
        () =>
            trading.spotMode === "spot"
                ? trading.placeSpotLongOrder
                : trading.placePerpLongOrder,
        [trading.spotMode]
    );
    useEffect(() => {
        if (!trading.isConfirm) {
            trading.pendingPayloadRef.current = null;
            trading.confirmResolver.current = null;
            trading.setLoading(false);
        }
    }, [trading.isConfirm]);
    const mode = trading.spotMode === "spot" ? "Spot" : "Perps";
    const priceForSeo = trading.marketData?.price;
    const title = `${trading.market}  ${trading.vendor ? `| ${trading.vendor}` : ""} | ${mode} | ${priceForSeo > 0 ? `$${priceForSeo.toFixed(2)}` : 0} | ABC DEX`;

    const description = `Trade ${trading.market} ${trading.vendor} ${mode} on ABC DEX with real-time charts, deep liquidity, and low fees.`;

    const url = `https://abc-dex.vercel.app/trade/${trading.market}/${trading.vendor}`;
    return (
        <>
            {title && <SEO
                title={title}
                description={description}
                url={url}
            />}
            <div className="mt-5 text-sm p-2 pb-1">
                {trading.errors.length > 0 && (
                    <div className="fixed top-4 right-4 z-50 space-y-2">
                        {trading.errors.map(err => (
                            <div key={err.id} className="bg-red-900/90 border border-red-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{err.msg}</span>
                                <X className="w-4 h-4 cursor-pointer hover:text-red-300" onClick={() => trading.removeError(err.id)} />
                            </div>
                        ))}
                    </div>
                )}
                <ConfirmationTxnPopup
                    spotMode={trading.spotMode}
                    isOpen={trading.isConfirm}
                    payload={trading.pendingPayloadRef.current}
                    marketData={trading.marketData}
                    onConfirm={() => {
                        trading.confirmResolver.current?.(true);
                        trading.confirmResolver.current = null;
                    }}
                    onCancel={() => {
                        trading.setIsConfirm(false);
                        trading.confirmResolver.current?.(false);
                        trading.confirmResolver.current = null;
                        trading.pendingPayloadRef.current = null;
                    }}
                />


                <div className=' lg:block hidden'>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
                        {/* LEFT SIDE */}
                        <div className='overflow-x-auto'>
                            <div className="grid grid-cols-1 2xl:grid-cols-[1fr_320px] gap-3">
                                <div className="flex-1 flex flex-col border border-[#232332]">
                                    <DexHeader perpinfo={trading.perpinfo} spotMode={trading.spotMode}
                                        spotinfo={trading.spotinfo}
                                        selectedCoin={trading.selectedCoin}
                                        setSelectedCoin={trading.setSelectedCoin}
                                        selectedToCoin={trading.selectedToCoin}
                                        setSelectedToCoin={trading.setSelectedToCoin}
                                        marketData={trading.marketData}
                                        priceChange={Number(trading.marketData.change24h) || 0}
                                    />
                                    <TradingChart
                                        pair={trading.pairmappingid ? trading.pairmappingid : trading.selectedCoin}
                                        userPositions={trading.userPositions}
                                        userOrders={trading.userOrders}
                                        mids={trading.mids}
                                        selectedCoin={trading.selectedCoin}
                                        spotMode={trading.spotMode}
                                    />
                                </div>
                                <div className='2xl:block hidden  border border-[#232332]'>
                                    <TradingForm options={trading.options} spotMode={trading.spotMode} address={trading.address ?? ''} updateTradeMode={trading.handleUpdateTradeMode} perpinfo={trading.perpinfo}
                                        inputCurrency={trading.inputCurrency} setInputCurrency={trading.setInputCurrency}
                                        tradeMode={trading.tradeMode} setTradeMode={trading.setTradeMode} isLoading={trading.isLoading}
                                        marketCoin={trading.market ?? ''}
                                        changeLeverage={trading.handleChangeLeverage}
                                        leverage={trading.spotMode == 'spot' ? '1' : trading.leverage} setLeverage={trading.setLeverage}
                                        userPositions={trading.userPositions}
                                        marketData={trading.marketData}
                                        userbalances={trading.userbalances}
                                        selectedCoin={trading.selectedCoin}
                                        connectWallet={trading.login}
                                        placeLongOrder={placeLongOrder}
                                        balances={{
                                            spotEquity: trading.spotEquity,
                                            perpsEquity: trading.perpsEquity,
                                            accountValue: trading.accountValue,
                                            unrealizedPnl: trading.unrealizedPnl,
                                            crossMarginRatio: trading.crossMarginRatio,
                                            maintenanceMargin: trading.maintenanceMargin,
                                            crossAccountLeverage: trading.crossAccountLeverage,
                                            setTransferPopup: trading.setTransferPopup,
                                            transferFunds: trading.transferFunds,
                                            transferPopup: trading.transferPopup,
                                            withdraw: trading.withdraw,
                                            usdcSpot: trading.usdcSpot
                                        }}
                                    />
                                </div>
                            </div>

                            <AccountsTabsTables options={trading.options} editObj={trading.editObj} setEditObj={trading.setEditObj} UpdatePosition={trading.UpdatePosition} selectedCoin={trading.selectedCoin}
                                twapStates={trading.twapStates} userTwapHistory={trading.userTwapHistory} userTwapSliceFills={trading.userTwapSliceFills}
                                cancelPositionOrder={trading.cancelPositionOrder}
                                cancelOrder={trading.cancelOrder}
                                cancelAllOrders={trading.cancelAllOrders}
                                mids={trading.mids}
                                marketData={trading.marketData}
                                userOrders={trading.userOrders}
                                userPositions={trading.userPositions}
                                balances={trading.userbalances}
                                fundingHistory={trading.userFunding}
                                orderHistory={trading.orderHistory}
                                tradeHistory={trading.userTrades}
                                perpsEquity={trading.perpsEquity}
                                isLoading={trading.isLoading}
                                leverage={trading.spotMode == 'spot' ? '1' : trading.leverage}
                                cancelTwapOrder={trading.handleCancelTwapOrder}
                                closeAllPositions={trading.handleCloseAllPositions}
                                spotMode={trading.spotMode}
                            />
                        </div>
                        <div className="space-y-4">


                            <div className='2xl:hidden block   border border-[#232332]'>
                                <TradingForm options={trading.options} spotMode={trading.spotMode} address={trading.address ?? ''} updateTradeMode={trading.handleUpdateTradeMode} perpinfo={trading.perpinfo}
                                    inputCurrency={trading.inputCurrency} setInputCurrency={trading.setInputCurrency}
                                    tradeMode={trading.tradeMode} setTradeMode={trading.setTradeMode} isLoading={trading.isLoading}
                                    marketCoin={trading.market ?? ''}
                                    changeLeverage={trading.handleChangeLeverage}
                                    leverage={trading.spotMode == 'spot' ? '1' : trading.leverage} setLeverage={trading.setLeverage}
                                    userPositions={trading.userPositions}
                                    userbalances={trading.userbalances}
                                    marketData={trading.marketData}
                                    selectedCoin={trading.selectedCoin}
                                    connectWallet={trading.login}
                                    placeLongOrder={placeLongOrder}
                                    balances={{
                                        spotEquity: trading.spotEquity,
                                        perpsEquity: trading.perpsEquity,
                                        accountValue: trading.accountValue,
                                        unrealizedPnl: trading.unrealizedPnl,
                                        crossMarginRatio: trading.crossMarginRatio,
                                        maintenanceMargin: trading.maintenanceMargin,
                                        crossAccountLeverage: trading.crossAccountLeverage,
                                        setTransferPopup: trading.setTransferPopup,
                                        transferFunds: trading.transferFunds,
                                        transferPopup: trading.transferPopup,
                                        withdraw: trading.withdraw,
                                        usdcSpot: trading.usdcSpot
                                    }}
                                />
                            </div>
                            <div className="border border-[#2A2A32]">
                                <ul className="relative flex items-center justify-between border-b border-[#2A2A32] text-[14px] w-full">
                                    <li
                                        onClick={() => trading.setIsActive("orderbook")}
                                        className={`relative py-2.5 px-6 cursor-pointer text-white/75 transition-colors duration-300 ease-in-out w-full text-center
                                     ${trading.isActive === "orderbook" ? "text-white" : ""}`}
                                    >
                                        Order Book
                                        {/* Sliding underline */}
                                        <span
                                            className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-300 ease-in-out
                                       ${trading.isActive === "orderbook" ? "w-full" : "w-0"}`}
                                        />
                                    </li>

                                    <li
                                        onClick={() => trading.setIsActive("trades")}
                                        className={`relative py-2.5 px-6 cursor-pointer text-white/75 transition-colors duration-300 ease-in-out  w-full text-center
                                     ${trading.isActive === "trades" ? "text-white" : ""}`}
                                    >
                                        Trades
                                        <span
                                            className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-300 ease-in-out
                                       ${trading.isActive === "trades" ? "w-full" : "w-0"}`}
                                        />
                                    </li>
                                </ul>

                                {trading.isActive == "orderbook" && (
                                    <OrderBook inputCurrency={trading.inputCurrency}
                                        market={trading.market ?? ""}
                                        orderbook={trading.orderbook}
                                        marketData={trading.marketData}

                                    />
                                )}

                                {trading.isActive == "trades" && (
                                    <RecentTrades trades={trading.trades} market={trading.market ?? ""} />
                                )}
                            </div>
                            <AccountSummaryCard userPositions={trading.userPositions} spotMode={trading.spotMode} props={{
                                withdraw: trading.withdraw,
                                spotEquity: trading.spotEquity,
                                perpsEquity: trading.perpsEquity,
                                accountValue: trading.accountValue,
                                unrealizedPnl: trading.unrealizedPnl,
                                crossMarginRatio: trading.crossMarginRatio,
                                maintenanceMargin: trading.maintenanceMargin,
                                crossAccountLeverage: trading.crossAccountLeverage,
                                transferFunds: trading.transferFunds,
                                transferPopup: trading.transferPopup,
                                setTransferPopup: trading.setTransferPopup,
                                usdcSpot: trading.usdcSpot
                            }} />

                        </div>
                    </div>
                </div>
                <div className="lg:hidden block w-full text-white">
                    <div className="flex justify-around bg-[#141414] border-t border-[#2A2A32] text-sm fixed bottom-0 left-0 w-full z-50">
                        {tabs.map(tab => (
                            <button
                                key={tab.tab}
                                onClick={() => trading.setMainTab(tab.tab)}
                                className={`py-5 w-full flex items-center gap-1 justify-center capitalize cursor-pointer font-semibold ${trading.mainTab === tab.tab ? "text-[#2BC287] " : "text-white/75"
                                    }`}
                            >
                                {tab.tab} {tab.icon}
                            </button>
                        ))}
                    </div>
                    {trading.mainTab === "markets" && (
                        <div className="p-2 pb-20">
                            <DexHeader perpinfo={trading.perpinfo} spotMode={trading.spotMode}
                                spotinfo={trading.spotinfo}
                                selectedCoin={trading.selectedCoin}
                                setSelectedCoin={trading.setSelectedCoin}
                                selectedToCoin={trading.selectedToCoin}
                                setSelectedToCoin={trading.setSelectedToCoin}
                                marketData={trading.marketData}
                                priceChange={Number(trading.marketData.change24h) || 0}
                            />
                            <div className="flex justify-around border-b border-[#2A2A32] text-md mb-3">
                                {["chart", "orderbook", "trades"].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => trading.setMarketsTab(tab)}
                                        className={`py-2 w-full capitalize cursor-pointer ${trading.marketsTab === tab ? "border-b-2 border-white" : "text-gray-400"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            {trading.marketsTab === "chart" && (
                                <>

                                    <TradingChart
                                        pair={trading.pairmappingid ? trading.pairmappingid : trading.selectedCoin}
                                        userPositions={trading.userPositions}
                                        userOrders={trading.userOrders}
                                        mids={trading.mids}
                                        selectedCoin={trading.selectedCoin}
                                        spotMode={trading.spotMode}
                                    />
                                    <AccountsTabsTables options={trading.options} editObj={trading.editObj} setEditObj={trading.setEditObj} UpdatePosition={trading.UpdatePosition} selectedCoin={trading.selectedCoin}
                                        twapStates={trading.twapStates} userTwapHistory={trading.userTwapHistory} userTwapSliceFills={trading.userTwapSliceFills}
                                        cancelPositionOrder={trading.cancelPositionOrder}
                                        cancelOrder={trading.cancelOrder}
                                        cancelAllOrders={trading.cancelAllOrders}
                                        mids={trading.mids}
                                        marketData={trading.marketData}
                                        userOrders={trading.userOrders}
                                        userPositions={trading.userPositions}
                                        balances={trading.userbalances}
                                        fundingHistory={trading.userFunding}
                                        orderHistory={trading.orderHistory}
                                        tradeHistory={trading.userTrades}
                                        perpsEquity={trading.perpsEquity}
                                        isLoading={trading.isLoading}
                                        leverage={trading.spotMode == 'spot' ? '1' : trading.leverage}
                                        cancelTwapOrder={trading.handleCancelTwapOrder}
                                        closeAllPositions={trading.handleCloseAllPositions}
                                        spotMode={trading.spotMode}
                                    />
                                </>

                            )}

                            {trading.marketsTab === "orderbook" && (
                                <OrderBook inputCurrency={trading.inputCurrency}
                                    market={trading.market ?? ''}
                                    orderbook={trading.orderbook}
                                    marketData={trading.marketData}

                                />
                            )}

                            {trading.marketsTab === "trades" && (
                                <RecentTrades trades={trading.trades} market={trading.market ?? ''} />
                            )}
                        </div>
                    )}
                    {trading.mainTab === "trade" && (
                        <div className="p-2 pb-20">
                            <TradingForm options={trading.options} spotMode={trading.spotMode} address={trading.address ?? ''} updateTradeMode={trading.handleUpdateTradeMode} perpinfo={trading.perpinfo}
                                inputCurrency={trading.inputCurrency} setInputCurrency={trading.setInputCurrency}
                                tradeMode={trading.tradeMode} setTradeMode={trading.setTradeMode} isLoading={trading.isLoading}
                                marketCoin={trading.market ?? ''}
                                changeLeverage={trading.handleChangeLeverage}
                                leverage={trading.spotMode == 'spot' ? '1' : trading.leverage} setLeverage={trading.setLeverage}
                                userPositions={trading.userPositions}
                                userbalances={trading.userbalances}
                                marketData={trading.marketData}
                                selectedCoin={trading.selectedCoin}
                                connectWallet={trading.login}
                                placeLongOrder={placeLongOrder}
                                balances={{
                                    spotEquity: trading.spotEquity,
                                    perpsEquity: trading.perpsEquity,
                                    accountValue: trading.accountValue,
                                    unrealizedPnl: trading.unrealizedPnl,
                                    crossMarginRatio: trading.crossMarginRatio,
                                    maintenanceMargin: trading.maintenanceMargin,
                                    crossAccountLeverage: trading.crossAccountLeverage,
                                    setTransferPopup: trading.setTransferPopup,
                                    transferFunds: trading.transferFunds,
                                    transferPopup: trading.transferPopup,
                                    withdraw: trading.withdraw,
                                    usdcSpot: trading.usdcSpot
                                }}
                            />
                        </div>
                    )}

                    {trading.mainTab === "accounts" && (
                        <div className="p-2 pb-20">
                            <AccountSummaryCard spotMode={trading.spotMode} userPositions={trading.userPositions} props={{
                                withdraw: trading.withdraw,
                                spotEquity: trading.spotEquity,
                                perpsEquity: trading.perpsEquity,
                                accountValue: trading.accountValue,
                                unrealizedPnl: trading.unrealizedPnl,
                                crossMarginRatio: trading.crossMarginRatio,
                                maintenanceMargin: trading.maintenanceMargin,
                                crossAccountLeverage: trading.crossAccountLeverage,
                                transferFunds: trading.transferFunds,
                                transferPopup: trading.transferPopup,
                                setTransferPopup: trading.setTransferPopup,
                                usdcSpot: trading.usdcSpot
                            }} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}