import { AiOutlineSwap } from "react-icons/ai";
import { useSwapLogic } from "../../lib/hooks/useSwapLogic";
import { SwapAmountBox } from "./SwapBox";
import SwapSummary from "./SwapSummary";
import { type TokenData } from "../../lib/hooks/Lifi/useLifiTokens";
import { getNumberTransformed } from "../../utils";
import QuoteList from "./Quotes/QuoteList";
import { SwapBoxSkeleton } from "./SkeletonComponents";
import { WalletConnection } from "./WalletConnectionData";
import { useState } from "react";
import { getChain } from "./TransferCard";
export const SwapForm = () => {
    const {
        fromAmount,
        fromCurrency,
        toCurrency,
        setFromAmount,
        setFromCurrency,
        setToCurrency,
        swapData, setSwapData, isLoading,
        chains, tokens, handleSwap,
        setMaxAmount, isSwapLoading, AvlBalance,
        routesData, handleQuoteSubmit, isQuotes, handleRoutes,
        updateParams, handleSwapCurrencies, isUserAuthenticated,
        login, balances, approveStatus, swapStatus, setApproveStatus,
        setSwapStatus, showCompletedModal, completedTxData, setShowCompletedModal, setCompletedTxData
    } = useSwapLogic();
    const [isSwap, setIsSwap] = useState(false);

    const clearAll = () => {
        setSwapData(null);
        setApproveStatus('idle');
        setSwapStatus('idle')
    }
    return (
        <>

            <ul className={`flex items-center justify-between mx-auto mt-10 ${routesData && routesData?.length != 0 ? 'max-w-216' : 'max-w-108'} transition-all duration-300`}>
                <li><h2 className="h4-tag">Exchange</h2></li>
                <li className="relative">
                    <WalletConnection chains={chains} />
                </li>

            </ul>
            <div className={`grid min-w-108 ${routesData && routesData?.length != 0 ? 'grid-cols-2 max-w-216' : 'grid-cols-1 max-w-108'} transition-all duration-300 items-start justify-center gap-5 mx-auto  mt-2`}>
                <div className="max-w-108 text-white w-full relative">

                    {swapData ? <SwapSummary chains={chains} data={swapData} clearData={() => clearAll()}
                        handleSwap={handleSwap} isSwapLoading={isSwapLoading} showCompletedModal={showCompletedModal}
                        completedTxData={completedTxData} setShowCompletedModal={setShowCompletedModal} setCompletedTxData={setCompletedTxData}
                        approveStatus={approveStatus} swapStatus={swapStatus} /> :
                        <div className="relative">
                            {!isLoading ?
                                <>

                                    {<div className="relative">
                                        <SwapAmountBox
                                            balances={balances}
                                            fromCurrency={fromCurrency ?? null}
                                            toCurrency={toCurrency ?? null}
                                            chains={chains}
                                            label="From"
                                            amount={fromAmount}
                                            currency={fromCurrency ?? null}
                                            tokens={tokens}
                                            // onAmountChange={(e) => setFromAmount(e.target.value)}
                                            onCurrencyChange={(token: TokenData) => {
                                                const selected = tokens.find(
                                                    (c) => c.symbol == token.symbol && c.chainId == token.chainId
                                                );
                                                if (!selected) return
                                                setFromAmount('');
                                                setFromCurrency(selected);
                                                updateParams({
                                                    fromChainId: selected?.chainId,
                                                    fromTokenAddress: selected?.address,
                                                    fromAmount: undefined,
                                                });
                                            }}
                                        />
                                        {/* SWAP BUTTON */}
                                        <div className="flex justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <button
                                                onClick={() => {
                                                    handleSwapCurrencies();
                                                    setIsSwap((prev) => !prev);
                                                }}
                                                className="border-2 border-[#2a2a32] p-2 rounded-full bg-black"
                                            >

                                                <AiOutlineSwap
                                                    className={`w-6 h-6 transition-transform duration-300 ${isSwap ? "rotate-270" : "rotate-90"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                        {/* TO */}
                                        <SwapAmountBox
                                            balances={balances}
                                            fromCurrency={fromCurrency ?? null}
                                            toCurrency={toCurrency ?? null}
                                            chains={chains}
                                            label="To"
                                            currency={toCurrency ?? null}
                                            tokens={tokens}
                                            // onAmountChange={(e) => console.log(e.target.value)}
                                            onCurrencyChange={(token: TokenData) => {
                                                const selected = tokens.find(
                                                    (c) => c.symbol == token.symbol && c.chainId == token.chainId
                                                );
                                                if (!selected) return
                                                setFromAmount('');
                                                setToCurrency(selected);
                                                updateParams({
                                                    toChainId: selected?.chainId,
                                                    toTokenAddress: selected?.address,
                                                    fromAmount: undefined,
                                                });
                                            }}

                                        />
                                    </div>} </> :
                                <SwapBoxSkeleton />}
                            {!isLoading && fromCurrency &&
                                <div className="border-2 border-[#2a2a32] rounded-lg px-5 py-4 gap-2">
                                    <label htmlFor="" className="text-white/75 font-semibold mb-2">Enter Amount</label>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="w-8 relative">
                                                <img src={fromCurrency?.logoURI} alt={fromCurrency?.symbol} className="w-8 rounded-full" />
                                                <img src={getChain(chains, Number(fromCurrency?.chainId))?.logoURI} className="w-4 inline rounded-full absolute -bottom-1 -right-1" />
                                            </div>
                                            <div>

                                                <input
                                                    type="number"
                                                    value={fromAmount}
                                                    onChange={(e) => setFromAmount(e.target.value)}
                                                    placeholder="0.0"
                                                    className="bg-transparent outline-none w-full text-white placeholder-white/75 text-[24px]"
                                                />
                                                <p className="mt-1 text-white/75">${getNumberTransformed(Number(fromAmount) * Number(fromCurrency?.priceUSD))}</p>
                                            </div>
                                        </div>
                                        {fromCurrency &&
                                            <div className="flex flex-col items-end">
                                                <button className="text-sm" disabled={AvlBalance == 0} title={`${AvlBalance == 0 ? 'No' : AvlBalance} balance`} onClick={() => setMaxAmount()}>Max</button>
                                                <p className="text-xs text-end whitespace-nowrap">{getNumberTransformed(AvlBalance)} {fromCurrency.symbol}</p>
                                            </div>
                                        }
                                    </div>
                                </div>}
                        </div>}
                </div>
                {!isUserAuthenticated && <button className="py-2.5 px-3 bg-white text-black font-semibold rounded-md" onClick={login}>Connect wallet</button>}
                <div
                    className={`
      w-full max-w-108
      transition-all duration-500 ease-out
      ${routesData
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 pointer-events-none"
                        }
    `}
                >
                    {routesData && routesData?.length != 0 && (
                        <QuoteList
                            data={routesData}
                            handleSubmit={(route: any) => handleQuoteSubmit(route)}
                            isQuotes={isQuotes}
                            handleRoutes={handleRoutes}
                            chains={chains}
                        />
                    )}
                </div>
            </div>

        </>
    );
};


