import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export default function AirdropGrid({ data }: { data: any[] }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string>("all");

    const filtered = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch = item.title
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesFilter =
                filter === "all" ? true : item.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [search, filter, data]);

    return (
        <div className="mt-10 site-width-sm">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-white">Airdrops</h2>
                    <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                        Create Airdrop
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Filters */}
                    <div className="flex rounded-full bg-white/15 p-1">
                        {["all", "active"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-5 py-2 rounded-full text-sm transition
                  ${filter === type
                                        ? "bg-white text-black"
                                        : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {type === "all" ? "All" : "Active"}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search airdrop"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2.5 rounded-full bg-white/15 text-white
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                </div>
            </section>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                    <AirdropCard key={item.id} item={item} />
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-12">
                        No airdrops found
                    </div>
                )}
            </div>
        </div>
    );
}

function AirdropCard({ item }: { item: any }) {
    const isActive = item.status === "active";

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition">
            <div className="flex gap-4">
                {/* Image */}
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                />

                {/* Content */}
                <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold text-lg leading-tight">
                            {item.title}
                        </h3>

                        {/* Status */}
                        <span
                            className={`text-xs px-2 py-1 rounded-full capitalize
                ${isActive
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                        >
                            {item.status}
                        </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-400">
                        Total:{" "}
                        <span className="text-white font-medium">
                            {item.total} {item.token}
                        </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                        Created: {item.created}
                    </div>

                    {/* Action */}
                    <Link to={`/airdrop-details/${item.id}`}
                        // disabled={!isActive}
                        className={`mt-4 w-fit px-4 py-1.5 rounded-lg text-sm font-medium transition
              ${isActive
                                ? "bg-white/20 text-white hover:bg-white/30"
                                : "bg-white/10 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Claim
                    </Link>
                </div>
            </div>
        </div>
    );
}
