import { handleWithdraw_spot } from './../../components/Spot/Withdraw_spot';
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthAddress } from "./useAuthAddress";
import { useHyperliquidSocket } from "./useSocket";
import { fetchPrices, getAllPerpMetas, getAllSpotMetas } from "../../components/Dexpages/Methods/FetchAvailPairs";
import { getAssetInfo, getNumberFixedDecimal } from "../../utils";
import { handleWithdraw } from "../../components/Dexpages/Methods/Withdraw";
import { closeAllPositions } from "../../components/Dexpages/Methods/CloseAllPositions";
import { handleTransfer } from "../../components/Dexpages/Methods/TransferFunds";
import { cancelTwapOrder } from "../../components/Dexpages/Methods/CancelTwapOrder";
import { handleCancelAllOrders } from "../../components/Dexpages/Methods/CancelAllOrders";
import { handleCancelOrder } from "../../components/Dexpages/Methods/CancelOneOrder";
import { handlePlaceSpotLongOrder } from "../../components/Dexpages/Methods/SpotPlacingLongOrder";
import type { OrderPayload } from "../../components/Dexpages/TradeForms";
import { handlePlaceLongOrder } from "../../components/Dexpages/Methods/PlaceLongOrder";
import { currencies } from "../Currencies";
import { updateTradeMode } from "../../components/Dexpages/Methods/UpgradeTrade";
import { changeLeverage } from "../../components/Dexpages/Methods/ChangeLeverage";

const basePrices: Record<string, number> = { BTC: 97500, ETH: 3400, SOL: 175, ARB: 0.85, DOGE: 0.38, AVAX: 38, POL: 0.52 };
const coinMapping: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    ARB: 'arbitrum',
    DOGE: 'dogecoin',
    AVAX: 'avalanche-2',
    POL: 'polygon-ecosystem-token'
};
const fallbackPrices = { ...basePrices };
export const useTradingEngine = () => {

    const [pairmappingid, setPairMappingId] = useState<string>("");
    const { address, login, user, createWallet, wallets } = useAuthAddress();
    const { market, vendor } = useParams<{ market: string, vendor: string }>();
    const spotMode = useMemo(() => {
        return vendor ? 'spot' : 'perp'
    }, [vendor]);
    useEffect(() => {
        if (market) setSelectedCoin(market);   // only update when route param changes
        getAllPerpMetas(currencies, setPerpInfo);
    }, [market]);
    useEffect(() => {
        getAllSpotMetas(setSpotInfo, setPairMappingId, vendor, market);
        if (market) setSelectedCoin(market);   // only update when route param changes
        if (vendor) setSelectedToCoin(vendor)
    }, [market, vendor]);
    useEffect(() => {
        if (spotMode !== 'spot') {
            setPairMappingId('')
        }
    }, [spotMode])
    const [isActive, setIsActive] = useState<string>('orderbook');
    const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
    const [selectedToCoin, setSelectedToCoin] = useState<string>(vendor ? vendor : "USDC");
    const [mainTab, setMainTab] = useState<string>("markets");
    const [marketsTab, setMarketsTab] = useState<string>("chart");
    const [inputCurrency, setInputCurrency] = useState<string>(selectedCoin);
    const [isConfirm, setIsConfirm] = useState<boolean>(false);
    const [transferPopup, setTransferPopup] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const confirmResolver = useRef<((v: boolean) => void) | null>(null);
    const pendingPayloadRef = useRef<OrderPayload | null>(null);
    const [perpinfo, setPerpInfo] = useState<any[]>([]);
    const [spotinfo, setSpotInfo] = useState<any[]>([]);
    const [errors, setErrors] = useState<{ id: number; msg: string }[]>([]);
    const [spotEquity, setSpotEquity] = useState<number>(0);
    const [usdcSpot, setUsdcSpot] = useState<number>(0);
    const [editObj, setEditObj] = useState<any | null>(null);

    const spotInfoRef = useRef(spotinfo);
    useEffect(() => {
        spotInfoRef.current = spotinfo;
    }, [spotinfo]);
    const perpInfoRef = useRef(perpinfo);
    useEffect(() => {
        perpInfoRef.current = perpinfo;
    }, [perpinfo]);
    const walletsRef = useRef(wallets);

    useEffect(() => {
        walletsRef.current = wallets;
    }, [wallets]);
    const options = [selectedCoin, selectedToCoin ?? "USDC"];
    const {
        mids, userOrders, orderHistory, twapStates, userTwapHistory, userTwapSliceFills,
        orderbook, trades, marketData, userFunding, setMarketData, leverage, setLeverage, tradeMode, setTradeMode, userbalances, userPositions, perpsEquity, accountValue, unrealizedPnl, crossMarginRatio, maintenanceMargin, crossAccountLeverage, userTrades
    } = useHyperliquidSocket(pairmappingid ? pairmappingid : market ?? "", address as string);
    const marketPriceRef = useRef(marketData);

    useEffect(() => {
        if (marketData) {
            marketPriceRef.current = marketData;
        }
    }, [marketData]);

    useEffect(() => {
        if (!isConfirm && !transferPopup)
            setLoading(false)
    }, [isConfirm, transferPopup])

    const withReload = async (fn: () => Promise<void>) => {
        //sharath
        setLoading(true);
        try {
            await fn();
        } catch (err) {
            console.error("withReload error:", err);
        } finally {
            setLoading(false);
        }
    };

    // fetch prices once on mount
    useEffect(() => {
        const loadPrices = async () => {
            await fetchPrices({
                coinMapping, selectedCoin, basePrices, fallbackPrices, setMarketData
            });
        };

        loadPrices();
    }, [coinMapping, selectedCoin]);

    useEffect(() => {
        let spotEquity = 0;
        let usdcspotequity = 0;
        Object.values(userbalances).forEach(balance => {
            const price = getAssetInfo(mids, balance.coin)?.price || 0;
            spotEquity += Number(balance.total) * Number(price);
            if (balance.coin === 'USDC') {
                const price = getAssetInfo(mids, balance.coin)?.price || 0;
                usdcspotequity += Number(balance.total) * Number(price);
            }
        });
        setUsdcSpot(usdcspotequity);
        setSpotEquity(spotEquity);
    }, [userbalances, mids])


    const handleUpdateTradeMode = async (
        mode: "cross" | "isolated"
    ) => {
        withReload(() =>
            updateTradeMode({
                mode, wallets, market, leverage: crossAccountLeverage, setLoading
            }));
    };
    const handleCloseAllPositions = async () => {
        withReload(() =>
            closeAllPositions({
                wallets, setLoading, perpinfo
            }));
    };
    const handleChangeLeverage = async (payload: any) => {
        withReload(() =>
            changeLeverage({
                payload, wallets, setLoading, createWallet
            }));
    };
    const handleCancelTwapOrder = async ({ coinName, orderId }: any) => {
        withReload(() =>
            cancelTwapOrder({
                wallets, setLoading, coinName, orderId
            }));
    };
    const transferFunds = async (payload: any) => {
        withReload(() =>
            handleTransfer({
                payload, user, setLoading, setTransferPopup
            }));
    };
    const cancelOrder = async ({ coinName, orderId }: { coinName: string, orderId: number }) => {
        withReload(() =>
            handleCancelOrder({
                coinName, orderId, setLoading, wallets
            }));
    };
    const withdraw = async (withdrawAmount: any, address: any, currency: any) => {
        if (!address) {
            return handleWithdraw(withdrawAmount);
        } else {
            return handleWithdraw_spot(withdrawAmount, address, currency);
        }
    };

    const cancelAllOrders = () => {
        if (!address) return
        return handleCancelAllOrders({
            wallets, setLoading
        })
    }



    // --- Actions ---
    const placeSpotLongOrder = (payload: any) =>
        handlePlaceSpotLongOrder({
            payload, isLoading, confirmResolver,
            setIsConfirm, pendingPayloadRef,
            spotinfo: spotInfoRef.current, marketData: marketPriceRef, wallets: walletsRef.current,
            createWallet, setLoading,
            setEditObj,
            market, vendor, pairmappingid,
        }
        );

    const placePerpLongOrder = (payload: OrderPayload) => {
        handlePlaceLongOrder({
            payload, isLoading, confirmResolver,
            setIsConfirm, pendingPayloadRef,
            perpinfo: perpInfoRef.current, marketData: marketPriceRef, wallets: walletsRef.current,
            createWallet, setLoading,
            setEditObj
        })
    }
    const UpdatePosition = async (payload: any) => {
        let _finalobject: any = {
            "side": Number(payload.position.szi) > 0 ? "Sell" : "Buy",
            "price": payload.payload.entryPrice,
            "size": 0,
            "market": payload.position.coin,
            "mode": payload.position.leverage.type,
            "leverage": payload.position.leverage.value,
            "reduceOnly": true,
            "tpsl": true,
            "orderType": "tpsledit",
            "tp": payload.payload.takeProfit,
            "sl": payload.payload.stopLoss
        }
        if (spotMode == 'spot') {
            placeSpotLongOrder(_finalobject);
        } else {
            placePerpLongOrder(_finalobject);
        }

    }
    const cancelPositionOrder = async (payload: OrderPayload) => {
        const assetIndexdec = perpinfo?.find(c => c.name === payload?.position?.coin).decimal;
        let _finalprice = Number(payload.position.szi) < 0 ? String(getNumberFixedDecimal(mids[payload.position.coin] * 1.08, assetIndexdec)) : String(getNumberFixedDecimal(mids[payload.position.coin] / 1.08, assetIndexdec))
        let _finalobject: any = {
            "side": Number(payload.position.szi) > 0 ? "Sell" : "Buy",
            "price": payload.type == 'Limit' ? payload.editedMarketprice : _finalprice,
            "size": payload.editedSize,
            "market": payload.position.coin,
            "mode": payload.position.leverage.type,
            "leverage": payload.position.leverage.value,
            "reduceOnly": true,
            "tpsl": false,
            "orderType": "market"
        }
        if (spotMode == 'spot') {
            placeSpotLongOrder(_finalobject);
        } else {
            placePerpLongOrder(_finalobject);
        }

    };
    const removeError = (id: number) => setErrors(prev => prev.filter(e => e.id !== id));
    // Global error listeners (debugging)
    useEffect(() => {
        const onErr = (e: ErrorEvent) => { console.log('GLOBAL ERROR:', e.error); };
        const onRej = (e: PromiseRejectionEvent) => { console.log('PROMISE ERROR:', e.reason); };
        window.addEventListener('error', onErr);
        window.addEventListener('unhandledrejection', onRej as any);
        return () => {
            window.removeEventListener('error', onErr);
            window.removeEventListener('unhandledrejection', onRej as any);
        };
    }, []);
    return {
        pairmappingid, setPairMappingId, selectedCoin, setSelectedCoin, selectedToCoin, setSelectedToCoin, spotinfo, userTrades, isLoading, address, market, setTransferPopup, setEditObj,
        placeSpotLongOrder, placePerpLongOrder, cancelOrder, transferFunds, handleCloseAllPositions, withdraw, mids,
        UpdatePosition, cancelPositionOrder, spotEquity, perpsEquity, accountValue, unrealizedPnl, usdcSpot,
        crossMarginRatio, maintenanceMargin, crossAccountLeverage, userOrders, orderHistory, twapStates, userTwapHistory,
        userTwapSliceFills, orderbook, trades, marketData, userFunding, setMarketData, leverage, setLeverage, userbalances, userPositions, withReload,
        login, editObj, isConfirm, removeError, errors, pendingPayloadRef, confirmResolver, setIsConfirm, perpinfo, isActive, setIsActive, transferPopup,
        mainTab, setMainTab, marketsTab, setMarketsTab, inputCurrency, setInputCurrency, tradeMode, setTradeMode, handleUpdateTradeMode, handleChangeLeverage, cancelAllOrders,
        handleCancelTwapOrder, vendor, spotMode, options, setLoading

    };
};