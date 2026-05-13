import { BiSolidGasPump } from "react-icons/bi";
import { getNumberTransformed } from "../../../utils";
import { QuoteSkeleton } from "../SkeletonComponents";
import { RiTimerLine } from "react-icons/ri";
import CircleTimer from "../CircleTimer";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ChainsData } from "../../../lib/hooks/Lifi/useLifiChains";

interface Props {
    data: any;
    handleSubmit?: (route: any) => void;
    isQuotes: boolean;
    handleRoutes: () => void;
    chains: ChainsData[]
}

export default function QuoteList({ data, handleSubmit, isQuotes, handleRoutes, chains }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const setParam = (id: string) => {
        setSelectedRoute(id);
        params.set("id", id);
        navigate({
            pathname: location.pathname,
            search: `?${params.toString()}`,
        });
    };
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        if (id) setSelectedRoute(id);
    }, [location.search]);


    if (isQuotes) {
        return (
            <div className="space-y-3 max-w-108 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                    <QuoteSkeleton key={i} />
                ))}
            </div>
        );
    }
    // Normalize data shape
    const routesRaw = Array.isArray(data)
        ? data
        : data?.routes
            ? data.routes
            : data?.id
                ? [data]
                : [];

    if (!routesRaw.length) return null;
    const tagPriority: Record<string, number> = {
        "best return": 0,
        "fastest": 1,
    };

    const normalizeTag = (tag?: string | null) =>
        tag?.trim().toLowerCase() ?? '';
    const routes = classifyRoutes(routesRaw)
    routes.sort((a, b) => {
        const aPriority = tagPriority[normalizeTag(a.tag)] ?? 2;
        const bPriority = tagPriority[normalizeTag(b.tag)] ?? 2;
        return aPriority - bPriority;
    });
    return (
        <div className="space-y-3 max-w-115 w-full border-2 border-[#2a2a32] rounded-lg px-5 py-4">
            <div className="flex items-center gap-2 justify-between"><span>Receive</span>
                <button onClick={() => handleRoutes()}><CircleTimer /></button> </div>
            {routes ?
                <div className="space-y-4">
                    {routes.map((route: any) => {
                        const step = route.steps?.[route?.steps.length - 1];
                        const action = step?.action;
                        const estimate = step?.estimate;
                        const toToken = route?.toToken;
                        const toolDetails = step?.toolDetails;
                        const gas = estimate?.gasCosts?.[0];
                        const chainData = chains.find((chain) => {
                            return chain.chainId == toToken?.chainId;
                        })
                        if (!action || !estimate) return null;

                        const fromAmount =
                            Number(action.fromAmount) /
                            10 ** action.fromToken.decimals;

                        const toAmount =
                            Number(estimate.toAmount) /
                            10 ** action.toToken.decimals;

                        const rate = toAmount / fromAmount;

                        return (
                            <div
                                key={route.id}
                                onClick={() => { handleSubmit?.(route); setParam(route.id) }}
                                className={`rounded-xl p-4 cursor-pointer transition max-w-108 mx-auto relative overflow-hidden ${selectedRoute == route.id ? 'border-2 border-emerald-400' : 'border-2 border-transparent'}
              ${route.tag === "Best Return"
                                        ? "bg-white/90 text-black "
                                        : "bg-[#232323] text-white "
                                    }`}
                            >
                                {/* {selectedRoute == route.id && <span className="absolute bottom-0 right-0 rounded-md w-full h-2 bg-emerald-500 "></span>} */}
                                {/* TAG */}
                                {route.tag && (
                                    <div className="mb-2 text-end absolute top-1.5 right-3">
                                        <span className={`inline-block  animate-pulse text-xs rounded-full font-semibold 
                                     ${route.tag !== "Best Return" ? ' text-white' : ' text-black'}`}>
                                            {route.tag}
                                        </span>
                                    </div>
                                )}

                                {/* TOP ROW */}
                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <img src={toToken?.logoURI || `/images/coins/${toToken?.symbol?.toLowerCase()}.png`} alt="" className="w-10 rounded-full" />
                                            <img src={chainData?.logoURI} alt="" className="w-4 absolute right-0 bottom-0 rounded-full" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold">
                                                {getNumberTransformed(toAmount)}
                                            </div>
                                            <div className={`text-sm  ${route.tag === "Best Return" ? 'text-black' : 'text-white'}`}>
                                                ${getNumberTransformed(estimate.toAmountUSD)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`mt-2 text-sm font-medium ${route.tag === "Best Return" ? 'text-black' : 'text-white'} flex items-center gap-1`}>
                                        <img
                                            src={toolDetails?.logoURI}
                                            alt={toolDetails?.name}
                                            className="w-6 rounded-full"
                                        />
                                        <span style={{ width: 'min-content' }}> {toolDetails?.name}</span>
                                    </div>
                                </div>

                                {/* RATE */}
                                <div className="mt-2 text-sm flex items-center justify-between gap-3 font-semibold">
                                    <span className="">
                                        1 {action.fromToken.symbol} ≈ {getNumberTransformed(rate)} {action.toToken.symbol}
                                    </span>
                                    <div className=" flex items-center justify-between text-sm gap-2">
                                        <span className="flex items-center">
                                            <BiSolidGasPump /> ${Number(gas?.amountUSD || 0).toFixed(2)}
                                        </span>
                                        <span className="flex items-center">
                                            <RiTimerLine />
                                            {estimate.executionDuration
                                                ? `${Math.max(1, Math.round(estimate.executionDuration / 60))}m`
                                                : "1m"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div> :
                <div className="text-center"><h6 className="text-2xl font-semibold">No routes available</h6>
                    <p>Reasons for that could be: low liquidity, amount selected is too low, gas costs are too high or there are no routes for the selected combination.</p>
                </div>}
        </div>
    );
}

/* -------------------- Helpers -------------------- */

function classifyRoutes(routes: any[]) {
    if (!routes.length) return [];

    const byReturn = [...routes].sort(
        (a, b) =>
            Number(b.steps[b.steps.length - 1].estimate.toAmount) -
            Number(a.steps[a.steps.length - 1].estimate.toAmount)
    );

    const byTime = [...routes].sort(
        (a, b) =>
            (a.steps[a.steps.length - 1].estimate.executionDuration || 0) -
            (b.steps[b.steps.length - 1].estimate.executionDuration || 0)
    );

    return routes.map((route) => ({
        ...route,
        tag:
            route.id === byReturn[0].id
                ? "Best Return"
                : route.id === byTime[0].id
                    ? "Fastest"
                    : null,
    }));
}


