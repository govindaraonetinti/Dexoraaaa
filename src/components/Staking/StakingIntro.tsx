import StakeStats from "./StakeStats";

export default function StakingIntro() {
    return (
        <section className=" py-24 relative">
            <div className="site-width-sm">
                <h1 className="h2-tag font-bold text-white max-w-[945px] mx-auto text-center">
                    Stake & Earn – Own a Share of the Protocol’s Success
                </h1>
                <p className="text-center max-w-[1080px] mx-auto mt-4 p-tag">
                    Lock in your $ABCD tokens and earn real yield generated directly from ABCDEX’s trading activity. Staking gives you passive income, long-term alignment with the protocol, and a meaningful voice in the platform’s governance.
                </p>
                <StakeStats />
            </div>
        </section>
    );
}