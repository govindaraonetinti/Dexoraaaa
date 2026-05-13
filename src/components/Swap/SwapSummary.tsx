import { getNumberFixedDecimal, getNumberTransformed } from "../../utils";
import { CHAIN_ID_TO_NETWORK } from "../../lib/hooks/Lifi/useLifiTokens";
import { useState } from "react";
import { BiSolidChevronDownCircle } from "react-icons/bi";
import { ArrowLeft } from "lucide-react";
import type { TxStatus } from "../../lib/hooks/useSwapLogic";
import type { ChainsData } from "../../lib/hooks/Lifi/useLifiChains";
import TransactionCompletedModal from "./TxnCompleteModal";

interface Props {
    chains: ChainsData[],
    data: any; // LiFi response
    clearData: () => void;
    handleSwap: any;
    isSwapLoading: boolean;
    approveStatus: TxStatus;
    swapStatus: TxStatus;
    showCompletedModal: boolean; completedTxData: any; setShowCompletedModal: any, setCompletedTxData: any
}

export default function SwapSummary({
    chains,
    data,
    clearData,
    handleSwap,
    isSwapLoading, approveStatus, swapStatus, showCompletedModal, completedTxData, setShowCompletedModal, setCompletedTxData

}: Props) {
    console.log(isSwapLoading, approveStatus, swapStatus
    )
    if (!data) return null;
    const { action, estimate, toolDetails } = data.steps[data.steps.length - 1];
    const from = action?.fromToken;
    const to = action?.toToken;
    const gas = estimate?.gasCosts?.[0];
    const fromAmount =
        Number(action?.fromAmount) /
        10 ** action?.fromToken.decimals;

    const toAmount =
        Number(estimate?.toAmount) /
        10 ** action?.toToken?.decimals;

    const rate = toAmount / fromAmount;
    const isSwap = from?.chainId === to?.chainId ? 'Swap' : 'Bridge';
    const slippagePercent =
        getNumberFixedDecimal(((1 - Number(estimate?.toAmountMin) / Number(estimate?.toAmount)) * 100), 2);

    const [hidden, setHidden] = useState(false);
    const openDetails = () => {
        setHidden(!hidden)
    }
    const [isSwapped, setIsSwapped] = useState(false);

    const fromToken = isSwapped ? action?.toToken : action?.fromToken;
    const toToken = isSwapped ? action?.fromToken : action?.toToken;

    // If rate is 1 from → to
    const displayRate = isSwapped
        ? 1 / Number(rate)
        : Number(rate);
    const handleSwapLabel = () => {
        setIsSwapped(prev => !prev);
    };

    return (
        <div className="w-full max-w-md mx-auto my-0 rounded-2xl bg-[#232323] p-4 text-white shadow-lg space-y-4 relative overflow-hidden">

            {/* Close */}


            {/* Header */}
            <div className="flex items-center justify-between pt-5">
                <button onClick={clearData}>
                    <ArrowLeft />
                </button>
                <h2 className="text-lg font-semibold">{isSwap} Summary</h2>
            </div>

            {/* Tokens */}
            <div className="flex flex-col gap-5 items-start justify-between bg-[#2f2f33] rounded-xl p-5">
                <TokenRow token={from} amount={getNumberTransformed(action?.fromAmount)} />
                <div className="flex items-center gap-2 text-lg ">
                    <img src={toolDetails?.logoURI} className="w-8 h-8 rounded-full" />
                    {toolDetails?.name}
                </div>



                {approveStatus !== 'idle' && (
                    <div className="flex items-center gap-3 text-lg">
                        {approveStatus === 'pending' ? (
                            <>
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[15px]">Approving {from?.symbol}...</span>
                            </>
                        ) : approveStatus === 'completed' ? (
                            <>
                                <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-between mx-auto">
                                    <svg className="w-5 h-5 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-[15px]">{from?.symbol} Approved</span>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-between mx-auto">
                                    <svg className="w-5 h-5 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <span className="text-red-500 text-[15px]">Approval Failed</span>
                            </>
                        )}
                    </div>
                )}

                {swapStatus !== 'idle' && (
                    <div className="flex items-center gap-3 text-lg">
                        {swapStatus === 'pending' ? (
                            <>
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[15px]">{from.chainId === to.chainId ? 'Swapping' : 'Bridging'}...</span>
                            </>
                        ) : swapStatus === 'completed' ? (
                            <>
                                <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-between mx-auto">
                                    <svg className="w-5 h-5 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-[15px]">{from.chainId === to.chainId ? 'Swap' : 'Bridge'} Completed</span>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-between mx-auto">
                                    <svg className="w-5 h-5 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <span className="text-red-500 text-[15px]">{from.chainId === to.chainId ? 'Swap' : 'Bridge'} Failed</span>
                            </>
                        )}
                    </div>
                )}

                <TokenRow token={to} amount={getNumberTransformed(estimate?.toAmount)} />
            </div>
            <TransactionCompletedModal
                chains={chains}
                isOpen={showCompletedModal}
                onClose={() => {
                    setShowCompletedModal(false);
                    setCompletedTxData(null);
                    clearData()
                }}
                transactionData={completedTxData}
            />

            {/* Details */}
            <div className={` text-sm border-[#2f2f33] border-2 rounded-xl p-5 transition-all duration-300 space-y-3 ${hidden ? 'h-full' : 'h-15 overflow-hidden'}`}>

                <DetailRow label={`1 ${fromToken?.symbol} ≈ ${getNumberTransformed(displayRate)} ${toToken?.symbol}`} value='' openDetails={openDetails} hidden={hidden} handleSwapLabel={handleSwapLabel} />
                <DetailRow label="Network" value={CHAIN_ID_TO_NETWORK[action?.toToken?.chainId]?.name} />
                <DetailRow label="Slippage" value={`${slippagePercent}%`} />
                <DetailRow
                    label="Estimated Gas"
                    value={`~$${getNumberTransformed(gas?.amountUSD)}`}
                />
                <DetailRow
                    label="Min Received"
                    value={`${getNumberTransformed((estimate?.toAmountMin) / 10 ** to?.decimals)} ${to?.symbol}`}
                />
            </div>
            {/* <div className="bg-[#FFEFAD] p-4 text-sm text-[14px] text-black rounded-lg">You don't have enough funds to complete the transaction.</div> */}

            {/* CTA */}
            {!completedTxData &&
                <button
                    onClick={() => handleSwap(data)}
                    className="px-3 py-2 bg-white text-black font-semibold rounded-lg w-full"
                >
                    {isSwapLoading ? "Confirming..." : isSwap}
                </button>}
        </div >
    );
}


/* ----------------- Sub Components ---------------- */

function TokenRow({ token, amount }: any) {
    return (
        <div className="flex items-center gap-2">
            <img src={token?.logoURI || `/images/coins/${token?.symbol?.toLowerCase()}.png`} className="w-8 h-8 rounded-full" />
            <div>
                <p className="font-medium">
                    {getNumberTransformed((amount) / 10 ** token?.decimals)} {token?.symbol}
                </p>
                <p className="text-xs text-white/75">${getNumberTransformed(((amount) / 10 ** token?.decimals) * token?.priceUSD)} = {token?.name} on {CHAIN_ID_TO_NETWORK[token?.chainId]?.name}</p>

            </div>
        </div>
    );
}

function DetailRow({ label, value, openDetails, hidden, handleSwapLabel }: { label: string; value: string, openDetails?: () => void, hidden?: boolean, handleSwapLabel?: () => void }) {
    return (
        <div className={`flex justify-between  ${value == '' ? 'cursor-pointer' : ''}`} >
            <span onClick={() => { handleSwapLabel?.() }}>{label}</span>
            {value != '' ? <span className="text-white flex items-center gap-1">{value}</span> :
                <span onClick={() => { openDetails?.() }}><BiSolidChevronDownCircle className={`text-xl text-[#7a7a7a] transition-all duration-300 ${hidden ? 'rotate-180' : ''}`} /></span>}

        </div >
    );
}

