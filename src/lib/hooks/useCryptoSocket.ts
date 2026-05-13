import { useEffect, useRef, useState } from "react";
import { socketUrl } from "../../utils";
import type { Candle } from "../../components/Homepages/CryptoTable";

export const useCryprtoSocket = (market: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const pingRef = useRef<number | null>(null);

  const [marketData, setMarketData] = useState({
    coin: market,
    price: 0,
    type: "Buy",
    change24h: "0",       // absolute change
    change24hRate: "0",   // percentage
    candles: [] as number[],
  });

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          method: "subscribe",
          subscription: {
            type: "candle",
            coin: market,
            interval: "1m",
          },
        }));

        ws.send(JSON.stringify({
          method: "subscribe",
          subscription: {
            type: "activeAssetCtx",
            coin: market,
          },
        }));

        pingRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "ping" }));
          }
        }, 15000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          // 📈 Candles
          if (msg.channel === "candle") {
            const candle: Candle = msg.data;
            const close = Number(candle.c);

            setMarketData((prev) => ({
              ...prev,
              candles: [...prev.candles.slice(-29), close],
            }));
          }

          // 💰 Price + 24h change
          if (msg.channel === "activeAssetCtx") {
            const prevDayPx = Number(msg.data.ctx.prevDayPx);
            const markPx = Number(msg.data.ctx.markPx);
            const changeRate = markPx - prevDayPx;
            const change24h =
              prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;

            setMarketData((prev) => ({
              ...prev,
              price: markPx,
              change24h: String(change24h),
              change24hRate: String(changeRate)
            }));

          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onerror = () => ws.close();

      ws.onclose = () => {
        if (!isUnmounted) {
          reconnectRef.current = window.setTimeout(connect, 1000);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, [market]);

  return { marketData };
};
