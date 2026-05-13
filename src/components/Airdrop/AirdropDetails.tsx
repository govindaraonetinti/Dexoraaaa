import { useParams, Link } from "react-router-dom";
import { airdrops } from "./data";
import { ChevronLeft } from "lucide-react";

export default function AirdropDetails() {
    const { id } = useParams();
    const airdrop = airdrops.find((a) => Number(a.id) === Number(id));

    if (!airdrop) {
        return (
            <div className="text-center text-gray-400 mt-20">
                Airdrop not found
            </div>
        );
    }

    return (
        <div className="site-width-sm mt-10">
            {/* Back */}
            <Link
                to="/"
                className="text-sm text-gray-400 hover:text-white flex items-center"
            >
                <ChevronLeft /> Back to Airdrops
            </Link>

            {/* Header */}
            <div className="mt-6 flex flex-col md:flex-row gap-6">
                <img
                    src={airdrop.image}
                    className="w-32 h-32 rounded-2xl object-cover"
                />

                <div className="flex-1">
                    <h1 className="text-3xl font-semibold text-white">
                        {airdrop.title}
                    </h1>

                    <p className="text-gray-400 mt-2 max-w-xl">
                        {airdrop.description}
                    </p>

                    <div className="flex gap-6 mt-4 text-sm">
                        <div>
                            <div className="text-gray-500">Total</div>
                            <div className="text-white font-medium">
                                {airdrop.total} {airdrop.token}
                            </div>
                        </div>

                        <div>
                            <div className="text-gray-500">Status</div>
                            <div
                                className={
                                    airdrop.status === "active"
                                        ? "text-green-400"
                                        : "text-gray-400"
                                }
                            >
                                {airdrop.status}
                            </div>
                        </div>
                    </div>

                    <button className="mt-6 px-6 py-2 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition">
                        Claim Airdrop
                    </button>
                </div>
            </div>

            {/* Conditions */}
            <section className="mt-12">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Airdrop Conditions
                </h2>

                <ul className="space-y-3">
                    {airdrop.conditions.map((condition, i) => (
                        <li
                            key={i}
                            className="flex gap-3 text-gray-300"
                        >
                            <span className="mt-2 w-2 h-2 bg-white rounded-full" />
                            {condition}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Timeline */}
            <section className="mt-12">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Timeline
                </h2>

                <div className="grid sm:grid-cols-3 gap-4">
                    {airdrop.timeline.map((t, i) => (
                        <div
                            key={i}
                            className="border border-white/10 bg-white/5 rounded-xl p-4"
                        >
                            <div className="text-sm text-gray-400">
                                {t.label}
                            </div>
                            <div className="text-white mt-1">
                                {t.date}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Token", value: airdrop.token },
                    { label: "Total Airdrop", value: `${airdrop.total} ${airdrop.token}` },
                    { label: "Eligible Wallets", value: airdrop.eligible },
                    { label: "Network", value: airdrop.network },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="text-white font-semibold mt-1">
                            {item.value}
                        </div>
                    </div>
                ))}
            </section>
            <section className="mt-14 mb-20">
                <h2 className="text-xl font-semibold text-white mb-4">
                    FAQ
                </h2>

                <div className="space-y-4">
                    {airdrop.faq.map((item, i) => (
                        <div
                            key={i}
                            className=""
                        >
                            <div className="text-white font-medium">
                                {item.q}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                                {item.a}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
