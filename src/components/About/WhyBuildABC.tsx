import { PiStarFourFill } from "react-icons/pi"

export const WhyBuiltABC = () => {
    return (
        <section className="2xl:py-24 lg:py-16">
            <div className="site-width-sm">
                <h3 className="h2-tag text-center mb-10">Why We Built ABCDEX ?</h3>
                <div className="grid md:grid-cols-2 gap-5 relative">
                    {whyabc.map((item) => {
                        return (
                            <div className="bg-[#1F1F25] 2xl:p-10 p-6 rounded-xl" key={item.header}>
                                <h4 className="h4-tag">{item.header}</h4>
                                <p className="2xl:text-xl text-md mt-4">{item.content}</p>
                            </div>
                        )
                    })}
                    <PiStarFourFill className="md:block hidden absolute xl:mt-1.5 2xl:mt-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1F1F25] text-4xl" />
                </div>
            </div>
            <RoadAhead />
        </section>
    )
}

const RoadAhead = () => {
    return (
        <section className="xl:pt-36 pt-16">
            <div className="site-width-sm">
                <h3 className="h2-tag text-center mb-8">The Road Ahead </h3>
                <p className="p-tag text-center max-w-270 mx-auto mb-5">ABCDEX is continuously evolving. We are expanding market coverage, introducing new financial instruments, improving liquidity routing, and preparing community-led governance. </p>
                <p className="p-tag text-center max-w-289 mx-auto">Our vision is to establish foundational infrastructure for the next generation of decentralized derivatives trading. The future of on-chain finance should be fast, transparent, permissionless, and accessible to all.  </p>
            </div>
        </section>
    )
}

const whyabc = [{
    header: "CEX - Grade Performance On - Chain:",
    content: "ABCDEX uses modern Layer - 2 technology to deliver near - instant execution, deep liquidity access, low fees, and consistent high - throughput settlement.This is on - chain trading designed to meet the demands of professional markets. "
},

{
    header: "True Self - Custody:",
    content: "We firmly believe in 'Not your keys, not your crypto.' On ABCDEX, there are no deposits in a centralized wallet.You connect your wallet, and your assets remain in your control until the moment a trade is executed via smart contract.We never hold your funds. "
},

{
    header: "Radical Transparency:",
    content: "Everything on ABCDEX is visible and verifiable.Trade execution, funding calculations, risk parameters, and insurance movements are recorded on - chain in real time.There are no hidden operations or opaque internal systems. "
},

{
    header: "Built for Traders, by Traders:",
    content: "The interface includes TradingView charting, a clean order book, responsive controls, and advanced order types.Margin and liquidation information is visible and updated.The workflow supports both high - frequency scalping and long - term directional strategies."
}]