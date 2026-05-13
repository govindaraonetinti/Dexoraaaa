export const RefHistory = () => {

    const mockData = [
        {
            address: "0xA3b5...91F2",
            joined: "2025-01-12",
            volume: "12,540.22",
            fees: "54.12",
            reward: "18.04"
        },
        {
            address: "0xC91D...77E4",
            joined: "2025-01-14",
            volume: "3,210.00",
            fees: "16.55",
            reward: "5.51"
        },
        {
            address: "0x9Bc1...F4A8",
            joined: "2025-01-18",
            volume: "980.11",
            fees: "4.02",
            reward: "1.34"
        }
    ];

    return (
        <section className="pt-24">
            <div className="site-width-sm">
                <h3 className="h3-tag">Referral history</h3>
                <p className="text-white/70 text-[20px] mb-8">* The statistics on the referral history will have a 1-2 hours delay.</p>
                <div className="overflow-x-auto  border-2 border-[#2A2A32]">

                    <table className="w-full text-left text-white text-[15px]">
                        <thead className="border-b-2 border-[#2A2A32]">
                            <tr>
                                <th className="px-5 py-4 font-medium">Friend's address</th>
                                <th className="px-5 py-4 font-medium">Date joined</th>
                                <th className="px-5 py-4 font-medium">Total volume (USDC)</th>
                                <th className="px-5 py-4 font-medium">Fees paid (USDC)</th>
                                <th className="px-5 py-4 font-medium">Your rewards (USDC)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {mockData.map((row, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-[#FFFFFF]/5 transition"
                                >
                                    <td className="px-5 py-4">{row.address}</td>
                                    <td className="px-5 py-4">{row.joined}</td>
                                    <td className="px-5 py-4">{row.volume}</td>
                                    <td className="px-5 py-4">{row.fees}</td>
                                    <td className="px-5 py-4">{row.reward}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>
        </section>
    );
};
