import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Slider from "react-slick";

export default function WhyStake() {
    const sliderRef = useRef<Slider | null>(null)
    const slides = [
        {
            title: "Real Yield – No Inflation",
            desc: "Earn rewards tied to true platform usage. No printed tokens or dilution, just real revenue.",
            points: [
                "Paid in Stablecoins: Staking rewards are distributed in USDC (or ETH), giving you stable, realized earnings. ",
                "Sustainable Income: Yield only comes from a real trader paying real fees. A model built for long-term growth.",
                "On-Chain Transparency: Every payout is fully verifiable via audited smart contracts. "
            ],
        },
        {
            title: "Governance Rights ",
            desc: "Stakers become active participants in the future of ABCDEX. ",
            points: [
                "Vote on Key Proposals: Listings, fee structures, risk parameters, treasury management, DAO upgrades. ",
                "Shape the Protocol: Your stake literally defines the direction of ABCDEX. "
            ],
        },
        {
            title: "Boosted Rewards for Lockups ",
            desc: "ong-term conviction = amplified benefits. ",
            points: [
                "Lock-Up & Multipliers: No Lock = 1x , 3 Months = 1.5x , 1 Year = 3x ",
                "Higher Reward Share: Locking increases your “Staking Weight Multiplier,” boosting both rewards and governance influence. ",
                "Designed for Builders: The more committed you are, the more value you extract from the protocol growth. ",
            ],
        },
    ];


    const settings = {
        infinite: false,         // disable infinite
        speed: 500,
        slidesToShow: 1.5,       // first full, next half visible
        slidesToScroll: 1,
        centerMode: false,       // align first slide left
        initialSlide: 0,
        arrows: false,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 1.2, // partial slide for mobile
                    arrows: false,
                },
            },
        ],
    };

    // External arrow handlers
    const handleNext = () => sliderRef.current?.slickNext();
    const handlePrev = () => sliderRef.current?.slickPrev();

    return (
        <section className="w-full 2xl:py-32 py-24 bg-[#0d0d0d] text-white overflow-hidden">
            <div className="site-width-sm mx-auto px-6">
                <h1 className="h2-tag font-bold mb-4 text-center">
                    Why Stake on ABCDEX?
                </h1>
                <p className="text-gray-400 max-w-2xl p-tag mx-auto mb-10 text-center">
                    ABCDEX is shifting away from unsustainable token emissions. Instead of inflationary rewards, stakers earn real yield,
                    backed by actual economic activity across swaps, perps, liquidations, and protocol fees.
                </p>
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={handlePrev}
                        className="
                        p-3 rounded-full bg-[#1f1f1f]
                        border border-white/10 hover:bg-[#2a2a2a]
                        transition-all duration-200 shadow-lg
                    "
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="
                        p-3 rounded-full bg-[#1f1f1f]
                        border border-white/10 hover:bg-[#2a2a2a]
                        transition-all duration-200 shadow-lg
                    "
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            <div className="relative max-w-full md:max-w-233 xl:max-w-295 2xl:max-w-400 ml-auto md:px-0 pl-8">
                <Slider ref={sliderRef} {...settings}>
                    {slides.map((item, idx) => (
                        <div key={idx} className="px-2 ">
                            <div className="bg-[#1a1a1a] rounded-xl p-7 shadow-lg border border-[#2a2a2a] text-left h-92.5">
                                <h2 className="h4-tag font-semibold mb-4">{item.title}</h2>
                                <p className="p-tag text-gray-400 mb-4">{item.desc}</p>
                                <ul className="text-xl text-gray-400 space-y-3">
                                    {item.points.map((p, idx2) => (
                                        <li key={idx2}>• {p}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
}
