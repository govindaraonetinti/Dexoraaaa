// @ts-nocheck
import { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { getNumberTransformed } from "../../utils";

type TimeRange = "24H" | "7D" | "14D" | "30D" | "All time";

export const AccountSummary = ({
  portfolio,
  pnlportfolio,
  spotbalance,
  perpbalance,
}: {
  portfolio: any;
  pnlportfolio: any;
  spotbalance: number;
  perpbalance: number;
}) => {
  const topTabs = ["Account", "PNL"];
  const [topTab, setTopTab] = useState<"Account" | "PNL">("Account");
  const [timeTab, setTimeTab] = useState<TimeRange>("24H");

  const activeData = topTab === "Account" ? portfolio : pnlportfolio;

const TIME_ORDER: TimeRange[] = ["24H", "7D", "14D", "30D", "All time"];

const timeTabs: TimeRange[] = useMemo(() => {
  if (!activeData) return [];

  return TIME_ORDER.filter((t) => t in activeData);
}, [activeData]);


  const chartData = activeData?.[timeTab] ?? [];

  /* ---------- FIXED VOLUME CALC ---------- */
  const volume = portfolio?.[timeTab]?.length
    ? portfolio[timeTab].reduce(
      (sum: number, p: any, i: number, arr: any[]) => {
        if (i === 0) return 0;
        return sum + Math.abs(p.value - arr[i - 1].value);
      },
      0
    )
    : 0;

  const pnl =
    pnlportfolio?.[timeTab]?.length > 0
      ? pnlportfolio[timeTab][pnlportfolio[timeTab].length - 1].value
      : 0;

  const balanceTypes = {
    "Perp balance": perpbalance,
    "Spot balance": spotbalance,
    "Earn balance": 0,
  };

  const graphColor =
    topTab === "PNL"
      ? pnl >= 0
        ? "#2BC287"
        : "#F74B60"
      : "#2BC287";
  const isPositivePnl = pnl > 0 ? 'text-[#2BC287]' : pnl < 0 ? 'text-[#F74B60]' : 'text-white/75'
  return (
    <>
      {/* ---------- LEFT PANEL ---------- */}
      <div className="bg-[#FFFFFF]/8 p-6">
        <div className="font-medium text-[20px]">Account balance</div>
        <div className="text-white/75 mt-1">
          {getNumberTransformed(spotbalance + perpbalance)}
        </div>

        <div className="mt-6 space-y-3 border-y-2 border-[#2A2A32] py-8">
          <div className="flex justify-between text-white/75">
            <span>Volume ({timeTab})</span>
            <span>{getNumberTransformed(Number(volume.toFixed(2)))}</span>
          </div>

          <div className="flex justify-between text-white/75">
            <span>PNL ({timeTab})</span>
            <span className={isPositivePnl}>{getNumberTransformed(Number(pnl.toFixed(2)))}%</span>
          </div>
        </div>

        <div className="mt-8 font-medium text-[20px]">Products</div>
        <div className="mt-4 space-y-3">
          {Object.entries(balanceTypes).map(([label, value]) => (
            <div key={label} className="flex justify-between text-white/75">
              <span>{label}</span>
              <span className="text-white font-medium">
                {getNumberTransformed(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- RIGHT PANEL ---------- */}
      <div className="col-span-2 p-6 border-2 border-[#2a2a32]">
        {/* TOP TABS */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <div className="flex gap-3">
            {topTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setTopTab(tab as any)}
                className={`lg:px-4 px-3 py-1 lg:text-md text-[14px] rounded-lg border ${tab === topTab
                  ? "bg-[#27272A] text-white border-white"
                  : "bg-black border-[#37373C] text-white/50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 lg:justify-end justify-start">
            {timeTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTimeTab(t)}
                className={`lg:px-4 px-3 py-1 lg:text-md text-[14px] rounded-lg border ${t === timeTab
                  ? "bg-[#27272A] text-white border-white"
                  : "bg-black border-[#37373C] text-white/50"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* GRAPH */}
        <div className="h-65 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={graphColor} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={graphColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>


              <CartesianGrid strokeDasharray="4 4" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1c",
                  border: "1px solid #333",
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={graphColor}
                fill="url(#lineGradient)"
                strokeWidth={2}
                dot={false}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
