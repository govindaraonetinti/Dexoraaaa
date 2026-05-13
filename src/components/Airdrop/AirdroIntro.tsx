import StatsSection from "./StatsSection";

export default function AirdroIntro() {
    return (
        <section className="text-center py-24 relative">
            <div className="site-width-sm">
                <h1 className="h2-tag md:text-4xl font-bold text-white max-w-[900px] mx-auto">
                    Claim. Earn. Rise in Rank. Build Your Share of ABCDEX
                </h1>
                <p className=" max-w-[1080px] mx-auto mt-4 p-tag">
                    ABCDEX rewards the traders, LPs, stakers, and referrers who fuel the network. Every action that strengthens the ecosystem earns you points — and those points help determine your future share of governance power through the potential distribution of the $ABCD token. 
                </p>
                <p className=" max-w-[1080px] mx-auto mt-12 mb-24 p-tag">This is your pathway to becoming an early owner of the protocol.</p>
                <StatsSection />
            </div>
            <div className="absolute top-1/2 -translate-x-1/2 -left-20 w-96 h-96 
  bg-linear-to-br from-[#ac3b22] to-[#ff6a00]
  opacity-60 blur-[70px] rounded-full">
            </div>
         
        </section>
    );
}
