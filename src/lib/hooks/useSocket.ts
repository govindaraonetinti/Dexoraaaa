import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { socketUrl } from "../../utils";

type OrderbookLevel = { price: number | string; size: number | string };
type Orderbook = { bids: OrderbookLevel[]; asks: OrderbookLevel[] };
type Trade = { price: number | string; size: number | string; side: string; time: number };



export const useHyperliquidSocket = (resolvedMarket: string, resolveAddress: string) => {
  const market = resolvedMarket || "BTC";
  const isMockData = false;
  const address = !isMockData ? resolveAddress : '0x405F34617e9867F5FA3C5467B0E07D9ee85F1678';
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const dataRef = useRef<number[]>([]);
  const [tradeMode, setTradeMode] = useState<string>("cross");
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [userTrades, setUserTrades] = useState<any[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [orderbook, setOrderbook] = useState<Orderbook>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mids, setMids] = useState<any[]>([]);
  const [userFunding, setUserFundings] = useState<any[]>([]);
  const [leverage, setLeverage] = useState<string>("25");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [twapStates, setTwapStates] = useState<any[]>([]);
  const [userTwapHistory, setTwapHistory] = useState<any[]>([]);
  const [userbalances, setUserbalances] = useState<any[]>([]);
  const [userTwapSliceFills, setTwapSliceFills] = useState<any[]>([]);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [perpsEquity, setPerpsEquity] = useState<number>(0);
  const [accountValue, setAccountValue] = useState<number>(0);
  const [unrealizedPnl, setUnrealizedPnl] = useState<number>(0);
  const [crossMarginRatio, setCrossMarginRatio] = useState<number>(0);
  const [maintenanceMargin, setMaintenanceMargin] = useState<number>(0);
  const [crossAccountLeverage, setCrossAccountLeverage] = useState<number>(0);
  const [marketData, setMarketData] = useState<{
    price: number;
    type: string;
    change24h: string;
    coin: string;
    change24hRate?: string

  }>({ price: 0, type: "Buy", change24h: "0", coin: market, change24hRate: '0' });

  const addError = (msg: string) => console.error(msg);
  // useEffect(() => {
  //   console.log('ppppppppppppppppppppppppp', address)
  // }, [address])
  // useEffect(() => {
  //   console.log('leverage', leverage)
  // }, [leverage])

  useEffect(() => {
    let isUnmounted = false;
    const connect = () => {
      if (isUnmounted) return;

      // 🔥 Ensure old reconnect timers are cleared BEFORE reconnecting
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      // 🔥 Close old WebSocket instance before creating new one
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
      }

      setWsStatus("connecting");

      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted) return;
        setWsStatus("connected");
        setUseMockData(false);

        // 🔥 Always subscribe using the latest `market`
        ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "l2Book", coin: market } }));
        ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "trades", coin: market } }));
        ws.send(JSON.stringify({ method: "subscribe", subscription: { "type": "allMids", "dex": "ALL_DEXS" } }));
        ws.send(JSON.stringify({ method: "subscribe", topic: "meta" }));
        ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "activeAssetCtx", coin: market } }));
        ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "activeSpotAssetCtx", coin: market } }));
        if (address) {
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "activeAssetData", user: address, coin: market } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "userFundings", user: address } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "spotState", user: address } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "openOrders", user: address } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "userHistoricalOrders", user: address } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "twapStates", user: address, dex: "ALL_DEXS" } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "userTwapHistory", user: address } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "userTwapSliceFills", user: address } }));
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "notification", user: address } }))
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "orderUpdates", user: address } }))
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "allDexsClearinghouseState", user: address } }))
          ws.send(JSON.stringify({ method: "subscribe", subscription: { type: "userFills", user: address } }))
        }
        else {
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "activeAssetData", user: address, coin: market } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "userFundings", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "spotState", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "openOrders", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "userHistoricalOrders", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "twapStates", user: address, dex: "ALL_DEXS" } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "userTwapHistory", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "userTwapSliceFills", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "notification", user: address } }))
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "orderUpdates", user: address } }))
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "allDexsClearinghouseState", user: address } }));
          ws.send(JSON.stringify({ method: "unsubscribe", subscription: { type: "userFills", user: address } }))

          setUserbalances([]);
          setPerpsEquity(0);
          setAccountValue(0);
          setUnrealizedPnl(0);
          setCrossMarginRatio(0);
          setMaintenanceMargin(0);
          setCrossAccountLeverage(0);


          setUserPositions([]);
          setTwapHistory([]);
          setTwapSliceFills([]);
          setUserOrders([]);
          setOrderHistory([])
          setUserFundings([])
          setTrades([]);
          setUserTrades([]);
        }

        // Ping
        pingRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "ping" }));
          }
        }, 30000) as unknown as number;
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setUseMockData(true);
        addError("WebSocket error");
        ws.close();
      };

      ws.onclose = () => {
        if (isUnmounted) return;

        setWsStatus("disconnected");
        setUseMockData(true);

        if (pingRef.current) {
          clearInterval(pingRef.current);
          pingRef.current = null;
        }

        // 🔥 reconnect using *latest* market
        reconnectRef.current = window.setTimeout(() => {
          connect();
        }, 1000) as unknown as number;
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          if (msg.channel === 'spotState' && msg.data && msg.data.user.toLowerCase() == address.toLowerCase()) {
            // console.log ('spotState', msg.data.spotState.balances);
            setUserbalances(msg.data.spotState.balances);
          }
          // 📘 Orderbook
          if (msg.channel === "activeAssetData") {
            setLeverage(msg.data.leverage.value);
            setTradeMode(msg.data.leverage.type);
          }
          if (msg.channel === "twapStates") {
            setTwapStates(msg.data.states); // <-- states, not stats
          }
          if (msg.channel === "activeAssetCtx") {
            const prevDayPx = Number(msg.data.ctx.prevDayPx);
            const markPx = Number(msg.data.ctx.markPx);
            const changeRate = markPx - prevDayPx;
            const change24h =
              prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;

            setMarketData((prev) => ({
              ...prev,
              change24h: String(change24h.toFixed(2)),
              change24hRate: String(changeRate.toFixed(2))
            }));

          }
          if (msg.channel === "activeSpotAssetCtx") {
            const prevDayPx = Number(msg.data.ctx.prevDayPx);
            const markPx = Number(msg.data.ctx.markPx);
            const changeRate = markPx - prevDayPx;
            const change24h =
              prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;

            setMarketData((prev) => ({
              ...prev,
              change24h: String(change24h.toFixed(2)),
              change24hRate: String(changeRate.toFixed(2))
            }));

          }

          if (msg.channel === "allDexsClearinghouseState") {
            // console.log('allDexsClearinghouseState', msg.data)
            const accountState = msg.data.clearinghouseStates[0][1];
            const marginSummary = accountState.marginSummary || accountState.crossMarginSummary;
            const accountValueNum = parseFloat(marginSummary.accountValue) || 0;
            const totalRawUsd = parseFloat(marginSummary.totalRawUsd) || 0;
            const totalMarginUsed = parseFloat(marginSummary.totalMarginUsed) || 0;
            const crossMaintenanceMarginUsed = parseFloat(accountState.crossMaintenanceMarginUsed) || 0;
            const perpsEquityVal = accountValueNum;
            const accountValueVal = accountValueNum;
            const unrealizedPnlVal = accountValueNum - totalRawUsd;
            const crossMarginRatioVal = accountValueNum > 0 ? (totalMarginUsed / accountValueNum) * 100 : 0;
            const maintenanceMarginVal = crossMaintenanceMarginUsed;
            const crossAccountLeverageVal = totalMarginUsed > 0 ? accountValueNum / totalMarginUsed : 0;
            setPerpsEquity(perpsEquityVal);
            setAccountValue(accountValueVal);
            setUnrealizedPnl(unrealizedPnlVal);
            setCrossMarginRatio(crossMarginRatioVal);
            setMaintenanceMargin(maintenanceMarginVal);
            setCrossAccountLeverage(crossAccountLeverageVal);
            let _positions = [];
            for (const state of msg.data.clearinghouseStates) {
              //  console.log('state', state[1].assetPositions);
              _positions.push(...state[1].assetPositions);
            }
            // console.log('_positions', _positions)
            setUserPositions(_positions);
          }
          if (msg.channel === "userTwapHistory") {
            // console.log(msg.data.history)
            setTwapHistory(msg.data.history?.reverse());
          }
          if (msg.channel === "userTwapSliceFills") {
            setTwapSliceFills(msg.data.twapSliceFills?.reverse());
          }
          if (msg.channel === "openOrders") {
            setUserOrders(msg.data.orders);
          }
          if (msg.channel === "userFills") {
            if (msg.data.isSnapshot) {
              setUserTrades(msg.data.fills);
            } else {
              setUserTrades(prev => {
                const newFills = msg.data.fills || [];
                return [...newFills, ...(prev || [])];
              });
            }
          }
          if (msg.channel === "orderUpdates") {
            setUserOrders((prev) => {
               const currentOrders = prev || [];
               let updated = [...currentOrders];
               const updates = msg.data || [];
               for (let u of updates) {
                  if (u.status === 'open') {
                     let idx = updated.findIndex(o => o.oid === u.order.oid);
                     if (idx !== -1) {
                        // ✅ MERGE: preserve metadata fields (isTrigger, isPositionTpsl,
                        // reduceOnly, etc.) from the openOrders snapshot. The orderUpdates
                        // payload only contains changed fields (price, status) and strips
                        // these booleans — replacing would break TP/SL line detection.
                        updated[idx] = { ...updated[idx], ...u.order };
                     } else {
                        updated.unshift(u.order);
                     }
                  } else {
                     updated = updated.filter(o => o.oid !== u.order.oid);
                  }
               }
               return updated;
            });
          }
          if (msg.channel === "userHistoricalOrders") {
            setOrderHistory(msg.data.orderHistory?.reverse())
          }
          if (msg.channel === "allMids") {
            const mids = msg.data.mids;
            setMids(mids)

          }
          if (msg.channel === "notification") {
            toast.success(msg.data.notification)
          }
          if (msg.channel === "userFundings") {
            setUserFundings(msg.data.fundings?.reverse())
          }
          if (msg.channel === "l2Book" && msg.data?.levels && msg.data.coin === market) {
            const [bids, asks] = msg.data.levels;
            const newBids = (bids.reverse() || []).map((l: any) => ({
              price: l.px,
              size: l.sz,
            }));
            const newAsks = (asks || []).map((l: any) => ({
              price: l.px,
              size: l.sz,
            }));

            setOrderbook({ bids: newBids, asks: newAsks });
          }

          // 📘 Trades
          if (msg.channel === "trades" && Array.isArray(msg.data) && msg.data[0]?.coin === market) {
            const lastTrade = msg.data[0].px;
            const newTrades: Trade[] = msg.data.map((t: any) => ({
              price: t.px,
              size: t.sz,
              side: t.side,
              time: t.time,
            }));
            setTrades((prev) => [...newTrades, ...prev].slice(0, 50));
            if (newTrades[0]?.price) {
              setMarketData((prev) => ({
                ...prev,
                price: parseFloat(String(lastTrade)) || prev.price,
                type: newTrades[0].side === "B" ? "Buy" : "Sell",
                coin: market,
              }));
            }
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };
    };

    connect();

    // Cleanup
    return () => {
      isUnmounted = true;

      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (pingRef.current) clearInterval(pingRef.current);

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [market, address]);



  return {
    twapStates,
    userTwapHistory,
    userbalances,
    userTwapSliceFills,
    mids,
    orderHistory,
    userOrders,
    userFunding,
    wsStatus,
    orderbook,
    trades,
    marketData,
    useMockData,
    setMarketData,
    leverage,
    setLeverage, dataRef,
    tradeMode, setTradeMode, setUserOrders, userPositions, perpsEquity, accountValue, unrealizedPnl, crossMarginRatio, maintenanceMargin, crossAccountLeverage, userTrades
  };
};
