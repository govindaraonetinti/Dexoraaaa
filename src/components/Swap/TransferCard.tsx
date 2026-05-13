import type { ChainsData } from "../../lib/hooks/Lifi/useLifiChains";
import { formatSmallNumber, getDate } from "../../utils";

export default function TransfersList({ transfers, chains }: { transfers: Transfer[], chains: ChainsData[] }) {

    return (
        <div className="max-w-108 w-full gap-4 p-4 ">
            {transfers.map((transfer) => (
                <TransferCard key={transfer.transactionId} transfer={transfer} chains={chains} />
            ))}
        </div>
    );
}

function TransferCard({ transfer, chains }: { transfer: Transfer, chains: ChainsData[] }) {
    const formattedFromAmount = Number(transfer.sending.amount) / Math.pow(10, transfer.sending.token.decimals);
    const formattedToAmount = Number(transfer.receiving.amount) / Math.pow(10, transfer.receiving.token.decimals);

    return (
        <div className="border-2 border-[#2a2a32] rounded-lg px-5 py-4 gap-2]">
            <ul className="flex items-center justify-between gap-2 text-xs">
                <li>{getDate(transfer.sending.timestamp)?.date}</li>
                <li>{getDate(transfer.sending.timestamp)?.time}</li>
            </ul>
            <div className="flex flex-col justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <div className="relative w-9">
                            <img src={transfer.sending.token.logoURI} alt={transfer.sending.token.symbol} className="w-full inline rounded-full" />
                            <img src={getChain(chains, transfer.sending.token.chainId)?.logoURI} alt={transfer.sending.token.symbol} className="w-4 inline rounded-full absolute -bottom-1 -right-1" />
                        </div>
                        <div>
                            <h4 className="h4-tag">{formatSmallNumber(formattedFromAmount)}</h4>
                            <p className="text-xs text-white/75">{formattedFromAmount > 0.01 ? formatSmallNumber(formattedFromAmount) : `< 0.01`} = {transfer.sending.token.symbol} on {getChain(chains, transfer.sending.token.chainId)?.name}</p>
                        </div>
                    </div>
                </div>
                <div className="w-0.5 bg-white/30 h-6 relative left-4"></div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <div className="relative w-9">
                            <img src={transfer.receiving.token.logoURI} alt={transfer.receiving.token.symbol} className="w-full inline rounded-full" />
                            <img src={getChain(chains, transfer.receiving.token.chainId)?.logoURI} alt={transfer.receiving.token.symbol} className="w-4 inline rounded-full absolute -bottom-1 -right-1" />
                        </div>
                        <div>
                            <h4 className="h4-tag">{formatSmallNumber(formattedToAmount)}</h4>
                            <p className="text-xs text-white/75">{formattedToAmount > 0.01 ? formatSmallNumber(formattedToAmount) : `< 0.01`} = {transfer.receiving.token.symbol} on {getChain(chains, transfer.receiving.token.chainId)?.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


interface Token {
    address: string;
    chainId: number;
    symbol: string;
    decimals: number;
    name: string;
    logoURI: string;
    priceUSD: string;
}

interface Step {
    tool: string;
    toolDetails: { name: string; logoURI: string; webUrl: string };
    fromAmount: string;
    fromToken: Token;
    toAmount: string;
    toToken: Token;
}

export interface Transfer {
    transactionId: string;
    fromAddress: string;
    toAddress: string;
    sending: {
        txHash: string;
        txLink: string;
        token: Token;
        amount: string;
        amountUSD: string;
        gasUsed: string;
        gasAmountUSD: string;
        includedSteps: Step[];
        timestamp: number;
    };
    receiving: {
        txHash: string;
        txLink: string;
        token: Token;
        amount: string;
        amountUSD: string;
        gasUsed: string;
        gasAmountUSD: string;
        timestamp: number
    };
    status: string;
    substatus: string;
    substatusMessage: string;
    lifiExplorerLink: string;
}


export const getChain = (chains: ChainsData[], id: number) => {
    const matched = chains?.find((chain: ChainsData) => chain.chainId == id);
    return matched
}