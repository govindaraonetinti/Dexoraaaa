import { infoUrl, socketUrl } from "../../utils";

export class SimpleDatafeed {
    private fsym: string;
    private tsym: string;
    private _subs: Record<string, WebSocket> = {};
    private _lastCandle: Record<string, any> = {};

    constructor({ fsym = "BTC", tsym = "USDT" }: { fsym?: string; tsym?: string }) {
        this.fsym = fsym;
        this.tsym = tsym;
    }

    // Called by TradingView when widget initializes
    onReady(cb: any) {
        setTimeout(() => cb({
            supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "1D"],
        }), 0);
    }

    resolveSymbol(symbolName: string, onSymbolResolved: any) {
        setTimeout(() => onSymbolResolved({
            name: symbolName,
            ticker: symbolName,
            description: `${this.fsym}/${this.tsym} on ABC Dex`,
            type: "crypto",
            session: "24x7",
            timezone: "Etc/UTC",
            minmov: 1,
            pricescale: 1000000,
            supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "1D"],
            has_seconds: false,
            has_intraday: true,
            has_daily: true,
            volume_precision: 2,
            data_status: "streaming",
        }), 0);
    }

    mapInterval(resolution: string) {
        switch (resolution) {
            case "1": return "1m";
            case "5": return "5m";
            case "15": return "15m";
            case "30": return "30m";
            case "60": return "1h";
            case "240": return "4h";
            case "D":
            case "1D":
            case "1440": return "1d";
            case "W": return "1w";
            case "M": return "1M";
            default: return "1m";
        }
    }

    // Fetch historical candles
    async getBars(
        symbolInfo: any,
        resolution: string,
        periodParams: any,
        onHistory: any,
        onError: any
    ) {
        // console.log('symbolInfo', symbolInfo)
        try {
            const interval = this.mapInterval(resolution);

            const body = {
                req: {
                    symbolInfo,
                    coin: this.fsym,
                    startTime: periodParams.from * 1000,
                    endTime: periodParams.to * 1000,
                    interval,
                },
                type: "candleSnapshot",
                _: Date.now(), // prevent caching
            };

            const response = await fetch(infoUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!data?.length) {
                onHistory([], { noData: true });
                return;
            }

            // Map API response to TradingView bars
            const bars = data.map((candle: any) => ({
                time: Number(candle.t),
                open: Number(candle.o),
                high: Number(candle.h),
                low: Number(candle.l),
                close: Number(candle.c),
                volume: Number(candle.v),
            }));

            onHistory(bars, { noData: bars.length === 0 });

        } catch (err) {
            console.error("getBars ERROR:", err);
            onError(err);
        }
    }

    // Subscribe to live candles via WebSocket
    subscribeBars(
        symbolInfo: any,
        resolution: string,
        onRealtime: any,
        subscriberUID: string
    ) {
        // Only one WS per subscriber
        // console.log('symbolInfo', symbolInfo)
        if (this._subs[subscriberUID]) return;

        const interval = this.mapInterval(resolution);
        const ws = new WebSocket(socketUrl);

        ws.onopen = () => {
            ws.send(JSON.stringify({
                method: "subscribe",
                subscription: { type: "candle", coin: this.fsym, interval, symbolInfo }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.channel === "candle" && msg.data) {
                    const lastCandle = {
                        time: Number(msg.data.t),
                        open: Number(msg.data.o),
                        high: Number(msg.data.h),
                        low: Number(msg.data.l),
                        close: Number(msg.data.c),
                        volume: Number(msg.data.v),
                    };

                    const prev = this._lastCandle[subscriberUID];

                    // Update TradingView only if candle changed
                    if (!prev ||
                        prev.time !== lastCandle.time ||
                        prev.open !== lastCandle.open ||
                        prev.high !== lastCandle.high ||
                        prev.low !== lastCandle.low ||
                        prev.close !== lastCandle.close ||
                        prev.volume !== lastCandle.volume
                    ) {
                        this._lastCandle[subscriberUID] = lastCandle;
                        onRealtime(lastCandle);
                    }
                }
            } catch (err) {
                console.error("WS message parse error:", err);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => console.log(`WebSocket closed for subscriber ${subscriberUID}`);

        this._subs[subscriberUID] = ws;
    }

    // Unsubscribe / cleanup
    unsubscribeBars(subscriberUID: string) {
        const ws = this._subs[subscriberUID];
        if (ws) {
            ws.close();
            delete this._subs[subscriberUID];
            delete this._lastCandle[subscriberUID];
        }
    }
}