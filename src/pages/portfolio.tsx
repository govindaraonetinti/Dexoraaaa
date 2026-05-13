import { useEffect, useMemo, useState } from "react";
import { AccountSummary } from "../components/portfolio/AccountSummary";
import { PerpCard } from "../components/portfolio/PerpCard";
import { SpotCard } from "../components/portfolio/SpotCard";
import { getNumberTransformed, infoUrl } from "../utils";
import { useAuthAddress } from "../lib/hooks/useAuthAddress";
import { useTradingEngine } from "../lib/hooks/useTradingActions";


const EMPTY_TIME_SERIES = {
    "24H": [],
    "7D": [],
    "14D": [],
    "30D": [],
    "All time": [],
};

export default function Portfolio() {
    const trading = useTradingEngine();

    const { isAuthenticated, login, isWalletLoading } = useAuthAddress();
    const { address } = useAuthAddress();

    const [portfolio, setPortfolio] = useState(EMPTY_TIME_SERIES);
    const [pnlportfolio, setPnlPortfolio] = useState(EMPTY_TIME_SERIES);

    /* ---------- PRICE LOOKUP ---------- */
    const getAssetPrice = (coin: string): number => {
        if (coin === "USDC") return 1;

        const base = coin.startsWith("@") ? coin.slice(1) : coin;
        const keys = [
            coin,
            base,
            `flx:${coin}`,
            `flx:${base}`,
            `hyna:${coin}`,
            `hyna:${base}`,
            `k${coin}`,
            `k${base}`,
        ];

        for (const k of keys) {
            if (trading.mids?.[k as keyof typeof trading.mids] != null) return Number(trading.mids[k as keyof typeof trading.mids]);
        }
        return 0;
    };

    /* ---------- SPOT BALANCE (NUMBER) ---------- */
    const spotBalanceNumber = useMemo(() => {
        return trading.userbalances.reduce((sum, b) => {
            const price = getAssetPrice(b.coin);
            const available = Number(b.total) - Number(b.hold);
            return sum + price * available;
        }, 0);
    }, [trading.userbalances, trading.mids]);

    /* ---------- DATA PARSER ---------- */
    const parseHyperliquidData = (data: any[]) => {
        const pnlData: any = {};
        const accountSummary: any = {};

        const keyMap: Record<string, string> = {
            day: "24H",
            week: "7D",
            twoweek: "14D",
            month: "30D",
            allTime: "All time",
        };

        const formatTime = (ts: number, range: string) => {
            const d = new Date(ts);
            if (range === "day")
                return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            if (range === "week")
                return d.toLocaleDateString([], { weekday: "short" });
            return d.toLocaleDateString([], { month: "short", day: "numeric" });
        };

        data.forEach(([rangeKey, rangeData]) => {
            const key = keyMap[rangeKey];
            if (!key) return;

            const account = rangeData.accountValueHistory.map(
                ([ts, val]: [number, string]) => ({
                    time: formatTime(ts, rangeKey),
                    value: Number(val),
                    fullTimestamp: ts,
                })
            );

            const pnl = rangeData.pnlHistory.map(
                ([ts, val]: [number, string]) => ({
                    time: formatTime(ts, rangeKey),
                    value: Number(val),
                    fullTimestamp: ts,
                })
            );

            const volume = account.reduce((sum: any, p: any, i: any) => {
                if (i === 0) return 0;
                return sum + Math.abs(p.value - account[i - 1].value);
            }, 0);

            accountSummary[key] = account.map((p: any) => ({ ...p, volume }));
            pnlData[key] = pnl;
        });

        if (accountSummary["30D"]) {
            const cutoff = Date.now() - 14 * 86400000;
            accountSummary["14D"] = accountSummary["30D"].filter(
                (p: any) => p.fullTimestamp >= cutoff
            );
            pnlData["14D"] = pnlData["30D"].filter(
                (p: any) => p.fullTimestamp >= cutoff
            );
        }

        Object.keys(EMPTY_TIME_SERIES).forEach(k => {
            accountSummary[k] ||= [];
            pnlData[k] ||= [];
        });

        return { pnlData, accountSummary };
    };

    /* ---------- FETCH ---------- */
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await fetch(infoUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "portfolio", user: address }),
                });

                if (!res.ok) throw new Error("Hyperliquid API error");

                const data = await res.json();
                const { pnlData, accountSummary } = parseHyperliquidData(data);

                setPortfolio(accountSummary);
                setPnlPortfolio(pnlData);
            } catch (err) {
                console.error("Portfolio fetch failed:", err);
                setPortfolio(EMPTY_TIME_SERIES);
                setPnlPortfolio(EMPTY_TIME_SERIES);
            }
        };

        fetchPortfolio();
    }, [address]);

    return (
        <section className="xl:py-24 pt-16 pb-5">
            <div className="site-width">
                <h1 className="h2-tag font-semibold mb-6">Portfolio</h1>

                <div className="relative">
                    {!isAuthenticated &&
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/15 flex items-center justify-center backdrop-blur-sm z-1">
                            <IsWalletConnected login={login} isWalletLoading={isWalletLoading} isAuthenticated={isAuthenticated} />
                        </div>}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        <AccountSummary
                            portfolio={portfolio}
                            pnlportfolio={pnlportfolio}
                            spotbalance={spotBalanceNumber}
                            perpbalance={trading.perpsEquity}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                        <PerpCard balance={trading.perpsEquity} />
                        <SpotCard balance={getNumberTransformed(spotBalanceNumber)} />
                        {/* <EarnCard balance="0" /> */}
                    </div>
                </div>
            </div>
        </section>
    );
}


const IsWalletConnected = ({ login, isWalletLoading, isAuthenticated }: { login: any, isWalletLoading: any, isAuthenticated: any }) => {
    return (
        <button
            onClick={() => {
                login();
            }}
            className="w-60 cursor-pointer bg-white px-5 py-3 text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
        >
            {isWalletLoading && !isAuthenticated ? "Loading..." : "Connect Wallet"}
        </button>
    )
}