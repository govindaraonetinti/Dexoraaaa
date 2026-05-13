import { useState } from "react";

export const StakeTabs = () => {
    return (
        <section className="py-16">
            <TABS />
        </section>
    );
};

const TABS = () => {
    const Tabs = [
        "Swap",
        "Perpetual Futures",
        "1001x Leverage Mode",
        "Liquidity Vaults (Earn)",
        "Staking",
        "Pro Developer APIs"
    ];

    const [activeTab, setActiveTab] = useState<number>(1);

    return (
        <>
            <section className="bg-[#FFFFFF]/8">
                <div className="site-width-sm">
                    {/* TAB BUTTONS */}
                    <div className="flex items-center justify-between gap-5 py-4 overflow-x-auto">
                        {Tabs.map((tab, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer whitespace-nowrap transition-all duration-300 px-8 text-lg rounded-full py-3 ${activeTab === index + 1 ? "bg-[#FFFFFF]/10" : ""
                                    }`}
                                onClick={() => setActiveTab(index + 1)}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section>
                <div className="site-width-sm">
                    {/* TAB CONTENT */}
                    <div className="mt-10">
                        <TabContent activeTab={activeTab} />
                    </div>
                </div>
            </section>
        </>
    );
};


/* TAB CONTENT COMPONENT */
const TabContent = ({ activeTab }: { activeTab: number }) => {
    const data = tabContent[activeTab - 1];

    return (
        <div className="text-white">
            <p className="p-tag leading-relaxed">{data.paragraph}</p>
            <p className="p-tag leading-relaxed">{data.paragraph1}</p>

            {/* SECTION 1 */}
            <h3 className="h4-tag font-semibold mt-8 mb-3">{data.header1}</h3>
            <ul className="space-y-2 list-disc pl-6  text-xl">
                {data.whatItDoes.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>

            {/* SECTION 2 */}
            <h3 className="h4-tag font-semibold mt-8 mb-3">{data.header2}</h3>
            <ul className="space-y-2 list-disc pl-6  text-xl">
                {data.whatMakesItDifferent.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
            <button className="cursor-pointer mt-10 bg-white  px-6 py-3 text-black font-bold rounded-full text-lg">Start Swapping</button>
        </div>
    );
};



/* ALL TAB CONTENT DATA */
const tabContent = [
    {
        // TAB 1 → Swap
        paragraph:
            "Seamless, friction-free asset exchange powered by deep liquidity and smart routing. ",
        paragraph1: "Swap any supported asset directly from your wallet with instant settlement and full custody control.",

        header1: "What It Does",
        whatItDoes: [
            "Aggregates liquidity across internal and external pools for competitive execution.",
            "Intelligent routing minimizes slippage and scans for best-price paths in real time.",
            "Instant, wallet-native settlement that does not require deposits, withdrawals, or waiting."
        ],

        header2: "What Makes It Different",
        whatMakesItDifferent: [
            "Lightning-Fast Execution: Near-instant swaps with optimized gas usage.",
            "Best Price Routing: Aggregator engine ensures you always receive the most efficient fill.",
            "Collateral Convenience: Instantly acquire stablecoins to fund your perpetual futures margin without leaving the platform.",
            "Platform Utility: Manage and rebalance your trading assets effortlessly."
        ]
    },

    // TAB 2 → Perpetual Futures
    {
        paragraph:
            "Trade high-performance perpetual futures with deep liquidity, fast execution, and full transparency.",
        header1: "What It Does",
        whatItDoes: [
            "Supports long and short positions with isolated & cross margin.",
            "Delivers real-time mark prices and funding rate updates.",
            "Ensures self-custodial futures trading without centralized control."
        ],
        header2: "What Makes It Different",
        whatMakesItDifferent: [
            "DEX-grade transparency with CEX-level execution speed.",
            "Smart liquidation engine reduces unnecessary liquidations.",
            "Low fee structure optimized for active derivatives traders."
        ]
    },

    // TAB 3 → 1001x Leverage Mode
    {
        paragraph:
            "Experience ultra-high leverage trading with advanced risk protection and instant execution.",
        header1: "What It Does",
        whatItDoes: [
            "Enables traders to operate with extremely high leverage.",
            "Delivers fast position entry with minimal slippage.",
            "Optimized for short-term volatility strategies."
        ],
        header2: "What Makes It Different",
        whatMakesItDifferent: [
            "Dynamic risk controls to prevent unfair liquidations.",
            "Custom-built engine designed for ultra-high-leverage scenarios.",
            "Unmatched speed and stability during volatile markets."
        ]
    },

    // TAB 4 → Liquidity Vaults
    {
        paragraph:
            "Earn passive yield through automated liquidity vaults optimized for low-risk and sustainable rewards.",
        header1: "What It Does",
        whatItDoes: [
            "Provides automated liquidity provisioning pools.",
            "Optimizes yield generation based on market conditions.",
            "Supports single-sided and multi-asset vaults."
        ],
        header2: "What Makes It Different",
        whatMakesItDifferent: [
            "Smart rebalancing minimizes impermanent loss.",
            "Transparent on-chain performance metrics.",
            "Flexible deposits and withdrawals without lockups."
        ]
    },

    // TAB 5 → Staking
    {
        paragraph:
            "Stake native assets to secure the platform and earn high-quality rewards.",
        header1: "What It Does",
        whatItDoes: [
            "Allows users to stake tokens for passive yields.",
            "Supports flexible and locked staking.",
            "Automated compounding for long-term growth."
        ],
        header2: "What Makes It Different",
        whatMakesItDifferent: [
            "Sustainable reward emissions.",
            "Zero custody risk—staking stays in your wallet.",
            "Boosted APR during ecosystem events."
        ]
    },

    // TAB 6 → Developer APIs
    {
        paragraph:
            "Build next-generation trading apps using powerful APIs designed for speed, scale, and security.",
        header1: "What It Does",
        whatItDoes: [
            "Offers fast WebSocket and REST trading APIs.",
            "Supports automated bots, market makers, and analytics tools.",
            "Provides webhook integrations for real-time events."
        ],
        header2: "What Makes It Different",
        whatMakesItDifferent: [
            "Ultra-low latency execution pipeline.",
            "Sandbox environment for safe testing.",
            "Enterprise-grade documentation and SDKs."
        ]
    }
];