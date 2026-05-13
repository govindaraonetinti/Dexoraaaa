export default function StatsSection() {
    const stats = [
        { label: "Your Total Rewards", value: "$4,823.50", sub: "Claimed + Pending" },
        { label: "Claimable Now", value: "$1,240.00", sub: "Eligible" },
        { label: "Upcoming Airdrops", value: "3", sub: "Next in 6 days" },
        { label: "Activity Score", value: "8,542", sub: "Top 5% contributor" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 mt-10">
            {stats.map((s, i) => (
                <div key={i} className="bg-[#111] border-2 border-[#2A2A32]">
                    <div className="text-[18px] p-5 border-b border-[#2A2A32]">{s.label}</div>
                    <div className=" p-5 ">
                        <div className="text-[24px] font-bold text-white mt-1">{s.value}</div>
                        <div className="text-lg text-[#868686] mt-1">{s.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
