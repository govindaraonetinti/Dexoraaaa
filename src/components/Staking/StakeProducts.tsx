
import { useState, useMemo } from "react";
import { currencies } from "../../lib/Currencies";

// Build coin → icon map
const coinIconMap: Record<string, string> = {};
currencies.forEach((c) => {
    coinIconMap[c.vendors_vendorshortcode.toLowerCase()] =
        c.vendors_logopath;
});


export const StakingTable = ({ stake, setStake }: { stake: string, setStake: (stake: string) => void }) => {
    const [search, setSearch] = useState("");
    const [match, setMatch] = useState(false);
    const [page, setPage] = useState(1);
    console.log(stake)
    const perPage = 5;

    // Filter logic
    const filtered = useMemo(() => {
        return stakingProducts.filter((item) => {
            const s = search.toLowerCase();
            const matchesSearch = item.coin.toLowerCase().includes(s);

            const matchesAvailable = match
                ? currencies.some(
                    (c) =>
                        c.vendors_vendorshortcode.toLowerCase() ===
                        item.coin.toLowerCase()
                )
                : true;

            return matchesSearch && matchesAvailable;
        });
    }, [search, match]);

    const totalPages = Math.ceil(filtered.length / perPage);

    const paginated = filtered.slice(
        (page - 1) * perPage,
        page * perPage
    );

    return (
        <section className="text-white p-10">
            <div className="site-width-sm ">
                <div className="flex items-center justify-between gap-3 mb-5">
                    <h2 className="text-2xl font-bold mb-6">All products</h2>

                    {/* TOP CONTROLS */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={match}
                                onChange={(e) => setMatch(e.target.checked)}
                                className="w-4 h-4"
                            />
                            Match available assets
                        </label>

                        <div className="bg-[#FFFFFF]/20 rounded-lg px-4 py-2 flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="w-full rounded-xl overflow-hidden ">
                    <table className="w-full text-left">
                        <thead className="text-sm border-b border-[#2A2A32]">
                            <tr>
                                <th className="p-4">Coin</th>
                                <th className="p-4">Est. APR ↑</th>
                                <th className="p-4">Reward Coin</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-[#2A2A32] hover:bg-[#1A1B1F]"
                                >
                                    {/* COIN */}
                                    <td className="p-4 flex items-center gap-3">
                                        <img
                                            src={
                                                coinIconMap[
                                                item.coin.toLowerCase()
                                                ] || "/fallback.png"
                                            }
                                            className="w-7 h-7"
                                            alt={item.coin}
                                        />
                                        {item.coin}
                                    </td>

                                    {/* APR */}
                                    <td className="p-4 text-gray-200">
                                        {item.apr}
                                    </td>

                                    {/* REWARD COIN ICONS */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {item.rewards.map((r, i) => (
                                                <img
                                                    key={coinIconMap[
                                                        r.toLowerCase()
                                                    ] || i}
                                                    src={
                                                        coinIconMap[
                                                        r.toLowerCase()
                                                        ] || "/fallback.png"
                                                    }
                                                    className="w-7 h-7"
                                                    alt={r}
                                                />
                                            ))}
                                        </div>
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-4">
                                        <button className="px-6 py-2 rounded-xl bg-[#2D2F36] hover:bg-[#3A3C45] transition" onClick={() => setStake(item.coin)}>
                                            Stake
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-4 py-2 border rounded-lg ${page === i + 1
                                ? "bg-white text-black"
                                : "bg-[#1E1F24] border-[#333]"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

export const stakingProducts = [
    {
        coin: "BTC",
        apr: "3.01%",
        rewards: ["BNB", "ETH", "SOL", "BTC"]
    },
    {
        coin: "ETH",
        apr: "5.67% - 6.58%",
        rewards: ["BTC", "SOL", "ETH"]
    },
    {
        coin: "BNB",
        apr: "5.04%",
        rewards: ["BTC", "ETH", "BNB"]
    },
    {
        coin: "SOL",
        apr: "7.92%",
        rewards: ["SOL", "ETH"]
    },
    {
        coin: "BTC",
        apr: "0.00009%",
        rewards: ["BNB", "SOL", "ETH"]
    },
    {
        coin: "ETH",
        apr: "1.5%",
        rewards: ["ETH", "BNB", "BTC"]
    },
    {
        coin: "BTC",
        apr: "5.5%",
        rewards: ["BTC", "ETH"]
    },
    {
        coin: "ETH",
        apr: "0.00009%",
        rewards: ["BNB", "SOL"]
    },
    {
        coin: "ETH",
        apr: "5.4%",
        rewards: ["ETH", "BNB"]
    }
];
