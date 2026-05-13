import { useState } from "react";
import { content } from "./data";

export default function HowToEarn() {
    return (
        <section className="2xl:py-36 py-24 mt-12  bg-[#1F1F25]">
            <div className="site-width-sm">
                <h2 className="h2-tag font-bold text-white text-center">How to Earn Points </h2>
                <p className="max-w-7xl mx-auto mt-3 p-tag text-center">ABCDEX rewards actions that generate real economic value and deepen the network’s liquidity. The more you contribute, the higher you score, and the more future governance weight you secure.  </p>
                <div className="border-2 border-[#3A3A46] p-8 mt-24 max-w-3xl mx-auto relative">
                    <FiveStepTabs />
                </div>
            </div>
        </section>
    );
}


function FiveStepTabs() {
    const tabs = [
        { key: "tab1", label: "Trading Volume " },
        { key: "tab2", label: "Providing Liquidity (Earn) " },
        { key: "tab3", label: "Referral Boost" },
        { key: "tab4", label: "Referral Center " },
        { key: "tab5", label: "Program Structure & Seasons" },
    ];

    const [active, setActive] = useState("tab1");
    return (
        <div className="w-full ">
            {/* TABS */}
            <div className="flex gap-3 overflow-x-auto absolute -translate-x-1/2 top-0 -translate-y-1/2 left-1/2 bg-[#1F1F25] px-4">
                {tabs.map((t, index) => (
                    <button
                        key={t.key}
                        onClick={() => setActive(t.key)}
                        className={`px-4 py-4 w-15 h-15 rounded-full text-lg font-medium transition border ${active === t.key
                            ? "bg-white text-[#0B0B0F] border-[#fffff]"
                            : "bg-transparent text-white border-[#2A2A32]"
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="my-6  space-y-6">
                {content[active].map((item, index) => (
                    <div key={index} className="space-y-3">
                        {/* Header */}
                        <h3 className="text-white text-xl font-semibold">{item.header}</h3>

                        {/* Main paragraph */}
                        <p className="p-tag">{item.content}</p>

                        {/* Steps */}
                        <div className="ml-2 space-y-2">
                            {item.data.map((d, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-2 h-2 flex items-center justify-center rounded-full bg-white" />
                                    <p className="text-gray-300">{d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

