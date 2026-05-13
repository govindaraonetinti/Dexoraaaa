
export const WhyChooseABCDex = () => {
    return (
        <section className="xl:py-24 pt-10 pb-20">
            <div className="site-width-sm">
                <div className="max-w-248 mx-auto">
                    <h3 className="h2-tag text-center mb-10">Why Traders Choose ABCDEX</h3>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 relative">
                        {whyabc.map((item) => {
                            return (
                                <div className="bg-[#1F1F25] px-6 py-8 rounded-xl">
                                    <p className="text-xl">{item}</p>
                                </div>
                            )
                        })}

                    </div>
                </div>
            </div>
        </section>
    )
}


const whyabc = [
    "Fast, reliable on-chain execution.",
    "CEX-grade tools, DEX-grade autonomy.",
    "Non-custodial trading for swaps and perpetuals.",
    "Transparent liquidity, pricing, and funding.",
    "High-performance risk engine.",
    "Optional ultra-high leverage mode."
]