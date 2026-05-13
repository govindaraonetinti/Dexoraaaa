import { useEffect, useState } from "react";
import { useAuthAddress } from "./useAuthAddress";
import { useLifiChains } from "./Lifi/useLifiChains";
import { useLifiTokens, type TokenData } from "./Lifi/useLifiTokens";
import { useWallets } from "@privy-io/react-auth";
import { getNumberTransformed } from "../../utils";
import { handleRoutesSubmit } from "./Lifi/useLifiRoutes";
import { getBalanceFromAPI, getTokenBalance, type TokenBalance } from "./Lifi/getLifiBalances";
import { handleSubmit } from "./Lifi/SelectQuote";
import { useNavigate } from "react-router-dom";
import { useUrlParams } from "./useQueryParams";
import { useLifiTransfers } from "./Lifi/useLifiTransfers";
import { executeRoute } from "./Lifi/ExecuteSwap";

/* ---------------- CONSTANT ---------------- */
export const TOTAL_TIME = 60; // seconds
export type TxStatus = 'idle' | 'pending' | 'completed' | 'failed';
/* ---------------- HOOK ---------------- */
export function useSwapLogic() {
    const { wallets } = useWallets();
    const navigate = useNavigate();
    const chains = useLifiChains();
    const tokens = useLifiTokens();

    const { address, ready, isAuthenticated, login } = useAuthAddress();
    const trasnfers = useLifiTransfers({ address: address ?? '' });
    const { updateParams } = useUrlParams();
    const params = new URLSearchParams(location.search);
    /* ---------------- STATE ---------------- */
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [routesData, setRoutesData] = useState<any>(null);
    const [swapData, setSwapData] = useState<any>(null);
    const isUserAuthenticated = ready && isAuthenticated && address;
    const paramData = {
        fromChainId: Number(params.get("fromChainId")),
        toChainId: Number(params.get("toChainId")),
        fromTokenAddress: params.get("fromTokenAddress"),
        toTokenAddress: params.get("toTokenAddress"),
        fromAmount: params.get("fromAmount"),
    };

    const [fromCurrency, setFromCurrency] = useState<TokenData | null>(null);
    const [toCurrency, setToCurrency] = useState<TokenData | null>(null);
    const [balances, setBalances] = useState<TokenBalance[] | null>(null);

    const [fromAmount, setFromAmount] = useState(paramData?.fromAmount ? paramData?.fromAmount : "");

    const [AvlBalance, setAvlBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwapLoading, setIsSwapLoading] = useState(false);
    const [isQuotes, setQuotes] = useState(false);

    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [completedTxData, setCompletedTxData] = useState<any>(null);  
    const [approveStatus, setApproveStatus] = useState<TxStatus>('idle');
    const [swapStatus, setSwapStatus] = useState<TxStatus>('idle');

    useEffect(() => {
        const fetchBalance = async () => {
            if (!address) return;

            const balance = await getBalanceFromAPI(address);
            if (!balance?.balances) return;

            const balancesByChain = balance.balances as Record<string, TokenBalance[]>;


            const flatBalances = Object.entries(balancesByChain).flatMap(
                ([chainId, tokens]) =>
                    tokens.map((token: TokenBalance) => ({
                        ...token,
                        chainId: Number(chainId),
                    }))
            );

            setBalances(flatBalances);
        };

        fetchBalance();
    }, [address]);


    useEffect(() => {
        if (!isUserAuthenticated) {
            setSwapData(null);
            setQuotes(false);
            setAvlBalance(0);
            setRoutesData(null);
            setTimeLeft(null);
            setFromCurrency(null);
            setToCurrency(null);
        }
    }, [isUserAuthenticated])

    useEffect(() => {
        if (fromAmount == '') {
            setRoutesData(null)
        }
    }, [fromAmount])

    useEffect(() => {
        if (fromCurrency) {
            if ((fromCurrency?.address == toCurrency?.address) && (fromCurrency?.chainId == toCurrency?.chainId)) {
                setToCurrency(tokens[0])
            }
        }
        if (toCurrency) {
            if ((fromCurrency?.address == toCurrency?.address) && (fromCurrency?.chainId == toCurrency?.chainId)) {
                setFromCurrency(tokens[0])
            }
        }
    }, [fromCurrency, toCurrency])

    useEffect(() => {
        if (!paramData || !tokens?.length) return;

        const selectedFromCurrency = tokens?.find(
            token =>
                Number(token.chainId) === Number(paramData?.fromChainId) &&
                token.address === paramData.fromTokenAddress
        );
        const selectedToCurrency = tokens?.find(
            token =>
                Number(token.chainId) === Number(paramData?.toChainId) &&
                token.address === paramData?.toTokenAddress
        );

        if (selectedFromCurrency) {
            setFromCurrency(selectedFromCurrency);

        }
        if (selectedToCurrency) {
            setToCurrency(selectedToCurrency)
        }
    }, [paramData, tokens]);

    /* ---------------- TIMER ---------------- */
    useEffect(() => {
        if (timeLeft === null || timeLeft === 0) return;

        const interval = setInterval(() => {
            setTimeLeft(t => (t ? t - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    /* ---------------- FETCH ROUTES ---------------- */
    const handleRoutes = async () => {
        await handleRoutesSubmit({
            address,
            isUserAuthenticated,
            navigate,
            fromCurrency,
            toCurrency,
            fromAmount,
            setRoutesData,
            setQuotes,
            setSwapData
        });
    };
    const handleSwap = (quote: any) => {
        executeRoute({
            address,
            isUserAuthenticated,
            quote,
            wallets,
            setIsSwapLoading,
            setRoutesData,
            setFromAmount,
            setAvlBalance,
            setFromCurrency,
            setToCurrency,
            navigate,
            setApproveStatus, setSwapStatus, setShowCompletedModal, setCompletedTxData
        });
    };

    const handleQuoteSubmit = (route: any) => {
        handleSubmit({
            address,
            isUserAuthenticated,
            route,
            setSwapData,
            setIsLoading,
        });
    };

    /* ---------------- DEBOUNCED FETCH (INPUT CHANGE) ---------------- */
    useEffect(() => {
        if (!fromAmount || Number(fromAmount) <= 0) return;
        if (!fromCurrency || !toCurrency) return;

        const t = setTimeout(() => {
            handleRoutes();
        }, 900);

        return () => clearTimeout(t);
    }, [fromAmount, fromCurrency, toCurrency, address]);

    /* ---------------- START / RESET TIMER WHEN ROUTES LOAD ---------------- */
    useEffect(() => {
        if (!routesData) return;

        setTimeLeft(TOTAL_TIME);
    }, [routesData]);

    /* ---------------- AUTO REFRESH WHEN TIMER HITS 0 ---------------- */
    useEffect(() => {
        if (timeLeft !== 0) return;
        if (!fromAmount || Number(fromAmount) <= 0) return;
        if (!fromCurrency || !toCurrency) return;

        handleRoutes();
    }, [timeLeft]);

    /* ---------------- BALANCE ---------------- */
    useEffect(() => {
        if (!fromCurrency) return;

        getTokenBalance(
            Number(fromCurrency.chainId),
            setAvlBalance,
            fromCurrency.address,
            address ?? ""
        );
    }, [fromCurrency, address]);

    /* ---------------- ACTIONS ---------------- */
    const handleSwapCurrencies = () => {
        const newFrom = toCurrency;
        const newTo = fromCurrency;

        setFromCurrency(newFrom);
        setToCurrency(newTo);

        navigate(
            `/swap?fromChainId=${newFrom?.chainId}&toChainId=${newTo?.chainId}` +
            `&fromTokenAddress=${newFrom?.address}&toTokenAddress=${newTo?.address}` +
            `&fromAmount=${fromAmount}`
        );
    };


    const setMaxAmount = () => {
        setFromAmount(getNumberTransformed(AvlBalance));
    };



    /* ---------------- RETURN ---------------- */
    return {
        fromAmount,
        fromCurrency,
        toCurrency,
        timeLeft,
        setFromAmount,
        setFromCurrency,
        setToCurrency,
        setSwapData,
        handleQuoteSubmit,
        handleSwap,
        setMaxAmount,
        handleRoutes,
        swapData,
        routesData,
        chains,
        tokens,
        navigate,
        AvlBalance,
        isLoading,
        isSwapLoading,
        isQuotes, updateParams,
        trasnfers,
        handleSwapCurrencies,
        isUserAuthenticated,
        login,
        balances, approveStatus, swapStatus, setApproveStatus, setSwapStatus ,showCompletedModal ,completedTxData ,setShowCompletedModal, setCompletedTxData
    };
}
