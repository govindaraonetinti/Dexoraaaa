import React, { useEffect, useRef, useState } from "react";
import { SimpleDatafeed } from "./SampleDataFeed";
import { AbcDexLoader } from "./OrderBook";


interface TradingChartProps {
    pair: string;
    userPositions?: any[];
    userOrders?: any[];
    mids?: any;
    selectedCoin?: string;
    spotMode?: string;
}

function loadInterval() {
    return localStorage.getItem("chart_interval") || "5"; // default = "5"
}

function syncPositionLines(
    chart: any,
    userPositions: any[],
    userOrders: any[],
    coin: string,
    linesRef: React.MutableRefObject<any[]>,
) {
    // 1. Remove all existing lines safely
    linesRef.current.forEach((line) => {
        try { line.remove(); } catch (_) { }
    });
    linesRef.current = [];

    if (!userPositions?.length || !coin) return;

    // 2. Find the open position for this coin
    const posEntry = userPositions.find((p: any) => p?.position?.coin === coin);
    if (!posEntry) return;

    const pos = posEntry.position;
    const szi = parseFloat(pos.szi ?? "0");
    if (szi === 0) return;

    const isLong = szi > 0;
    const entryPrice = parseFloat(pos.entryPx ?? "0");
    const size = Math.abs(szi);
    const leverage = pos.leverage?.value ?? 1;

    const longColor = "#2bc287";
    const shortColor = "#f74b60";
    const posColor = isLong ? longColor : shortColor;
    const posBgDark = isLong ? "#0f3d26" : "#3d0f16";

    // 3. Draw Entry / Position line (Read-Only)
    try {
        const posLine = chart
            .createPositionLine()
            .setPrice(entryPrice)
            .setText(`${isLong ? "▲ LONG" : "▼ SHORT"}  ${leverage}x`)
            .setLineColor(posColor)
            .setBodyTextColor("#ffffff")
            .setBodyBackgroundColor(posColor)
            .setBodyBorderColor(posColor)
            .setQuantity(String(size))
            .setQuantityTextColor("#ffffff")
            .setQuantityBackgroundColor(posBgDark)
            .setQuantityBorderColor(posColor);
        linesRef.current.push(posLine);
    } catch (e) {
        console.warn("Could not draw position line:", e);
    }

    // 4. Draw TP / SL order lines (Read-Only)
    const relatedOrders = (userOrders ?? []).filter(
        (o: any) =>
            o.coin === coin &&
            o.reduceOnly &&
            o.isTrigger &&
            o.isPositionTpsl
    );

    const addedOids = new Set();
    for (const order of relatedOrders) {
        if (addedOids.has(order.oid)) continue;
        addedOids.add(order.oid);

        const triggerPx = parseFloat(order.triggerPx ?? "0");
        if (!triggerPx) continue;

        const isTP = isLong ? triggerPx > entryPrice : triggerPx < entryPrice;
        const label = isTP ? "TP" : "SL";
        const lineColor = isTP ? longColor : shortColor;
        const lineBg = isTP ? "#0d2e1c" : "#2e0d14";

        try {
            const orderLine = chart
                .createOrderLine()
                .setPrice(triggerPx)
                .setText(`${label}  ${triggerPx}`)
                .setLineColor(lineColor)
                .setBodyTextColor("#ffffff")
                .setBodyBackgroundColor(lineBg)
                .setBodyBorderColor(lineColor)
                .setQuantity(label)
                .setQuantityTextColor("#ffffff")
                .setQuantityBackgroundColor(lineColor)
                .setQuantityBorderColor(lineColor)
                .setLineStyle(2)   // dashed for orders
                .setEditable(false);

            linesRef.current.push(orderLine);
        } catch (e) {
            console.warn(`Could not draw ${label} line:`, e);
        }
    }
}

export default function TradingChart({
    pair,
    userPositions = [],
    userOrders = [],
    selectedCoin,
}: TradingChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const tvWidgetRef = useRef<any>(null);

    const chartRef = useRef<any>(null);
    const positionLinesRef = useRef<any[]>([]);
    const [isChartReady, setIsChartReady] = useState(false);

    // ── Re-draw position / TP / SL lines whenever data changes ────────────────
    const dataKey = JSON.stringify({
        p: userPositions.map(p => ({ szi: p.position?.szi, px: p.position?.entryPx })),
        o: userOrders.map(o => ({ oid: o.oid, px: o.triggerPx, status: o.status }))
    });

    useEffect(() => {
        if (!isChartReady || !chartRef.current) return;
        const coin = selectedCoin ?? pair.split("_")[0];

        const timer = setTimeout(() => {
            syncPositionLines(chartRef.current, userPositions, userOrders, coin, positionLinesRef);
        }, 100);

        return () => clearTimeout(timer);
    }, [isChartReady, dataKey, selectedCoin]);

    // ── Initialize TradingView widget once per pair ────────────────────────────
    useEffect(() => {
        if (!chartContainerRef.current) return;
        if (!(window as any).TradingView) {
            console.warn("TradingView library not found yet, retrying...");
            const timer = setTimeout(() => setIsLoading(prev => !prev), 1000);
            return () => clearTimeout(timer);
        }

        setIsLoading(true);
        setIsChartReady(false);
        chartRef.current = null;

        if (tvWidgetRef.current?.remove) {
            try { tvWidgetRef.current.remove(); } catch (_) { }
            tvWidgetRef.current = null;
        }

        const [fsym, tsym] = pair.split("_");
        const datafeed = new SimpleDatafeed({ fsym, tsym });

        const toolbarColor = "#000";
        const savedInterval = loadInterval();

        let savedData: any = undefined;
        try {
            const stored = localStorage.getItem("tv_layout_" + pair);
            if (stored) {
                savedData = JSON.parse(stored);
                if (Array.isArray(savedData?.charts)) {
                    savedData.charts.forEach((chart: any) => {
                        const msp = chart?.chartProperties?.mainSeriesProperties;
                        if (msp) msp.showCountdown = true;
                        const sp = chart?.chartProperties?.scalesProperties;
                        if (sp && "showCountdown" in sp) sp.showCountdown = true;
                    });
                }
            }
        } catch (e) {
            console.error("Error loading chart layout:", e);
        }

        const widgetOptions: any = {
            symbol: pair,
            datafeed,
            container: chartContainerRef.current,
            library_path: "/static/charting_library/",
            locale: "en",
            interval: savedInterval,
            fullscreen: false,
            autosize: true,
            theme: "Dark",
            toolbar_bg: toolbarColor,
            saved_data: savedData,
            auto_save_delay: 1,
            disabled_features: [
                "snapshot_trading_drawings",
                "header_saveload",
                "header_settings",
                "symbol_info",
                "caption_buttons_text_if_possible",
                "header_symbol_search",
                "symbol_search_hot_key",
                "edit_buttons_in_legend",
            ],
            enabled_features: [
                "study_templates",
                "dont_show_boolean_study_arguments",
                "hide_last_na_study_output",
                "move_logo_to_main_pane",
                "same_data_requery",
                "countdown",
            ],
            loading_screen: {
                backgroundColor: toolbarColor,
                foregroundColor: toolbarColor,
            },
            overrides: {
                "paneProperties.background": toolbarColor,
                "paneProperties.backgroundType": "solid",
                "paneProperties.vertGridProperties.color": "#1e2329",
                "paneProperties.horzGridProperties.color": "#1e2329",
                "scalesProperties.backgroundColor": toolbarColor,
                "scalesProperties.lineColor": "#2b3139",
                "scalesProperties.textColor": "#fff",
                "mainSeriesProperties.candleStyle.upColor": "#2bc287",
                "mainSeriesProperties.candleStyle.downColor": "#f74b60",
                "mainSeriesProperties.candleStyle.drawWick": true,
                "mainSeriesProperties.candleStyle.drawBorder": true,
                "mainSeriesProperties.candleStyle.borderUpColor": "#2bc287",
                "mainSeriesProperties.candleStyle.borderDownColor": "#f74b60",
                "mainSeriesProperties.candleStyle.wickUpColor": "#2bc287",
                "mainSeriesProperties.candleStyle.wickDownColor": "#f74b60",
                "mainSeriesProperties.areaStyle.color1": "#16a34a33",
                "mainSeriesProperties.areaStyle.color2": "#16a34a00",
                "mainSeriesProperties.areaStyle.linecolor": "#16a34a",
                "mainSeriesProperties.areaStyle.linewidth": 2,
                "mainSeriesProperties.lineStyle.color": "#2bc287",
                "mainSeriesProperties.lineStyle.linewidth": 2,
                "mainSeriesProperties.statusViewStyle.symbolTextSource": "ticker",
                "scalesProperties.showCountdown": true,
                "mainSeriesProperties.showCountdown": true,
            },
            time_frames: [
                { text: "1h", resolution: "1", description: "1 Hour" },
                { text: "4h", resolution: "5", description: "4 Hours" },
                { text: "1d", resolution: "5", description: "1 Day" },
                { text: "1w", resolution: "30", description: "1 Week" },
                { text: "1M", resolution: "D", description: "1 Month" },
                { text: "3M", resolution: "D", description: "3 Months" },
            ],
            custom_css_url: "/static/chart_custom.css",
        };

        const tvWidget = new (window as any).TradingView.widget(widgetOptions);
        tvWidgetRef.current = tvWidget;

        tvWidget.onChartReady(() => {
            setIsLoading(false);
            setIsChartReady(true);
            const chart = tvWidget.chart();
            chartRef.current = chart;

            tvWidget.subscribe("onIntervalChanged", (interval: string) => {
                localStorage.setItem("chart_interval", interval);
            });
        });

        return () => {
            if (tvWidgetRef.current) {
                try { tvWidgetRef.current.remove(); } catch (_) { }
                tvWidgetRef.current = null;
            }
        };
    }, [pair]);

    return (
        <div className="relative w-full h-full min-h-[400px] bg-black overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <AbcDexLoader />
                </div>
            )}
            <div
                ref={chartContainerRef}
                id="tv_chart_container"
                className="w-full h-full"
            />
        </div>
    );
}