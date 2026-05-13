import { TbCheck } from "react-icons/tb"

export const WhyAirdrop = () => {
    return (
        <section className="2xl:py-36 py-24">
            <div className="site-width-sm">
                <h2 className="h2-tag font-bold text-white text-center max-w-225 mx-auto">Why Traders Love the ABCDEX Airdrop Program </h2>
                <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-3 mt-12">
                    {data.map((item, index) => {
                        return (
                            <div className="bg-[#1F1F25] py-6 px-4 text-xl flex items-center rounded-xl" key={index}>{item}</div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

const data = [
    "Transparent, on - chain tracking ",
    "Rewards are tied to real activity, not vanity metrics. ",
    "Opportunities for traders, LPs, stakers, and referrers. ",
    "Clear incentives that scale with your contribution. ",
    "Early adopters secure long - term governance influence."
]


export const BuildOn = () => {
    return (
        <section className="site-width-sm 2xl:pb-24">
            <div className="border-2 border-[#3A3A46] p-8 max-w-3xl mx-auto relative text-center">
                <h3 className="h3-tag">Built on Transparency </h3>
                <ul className="text-lg grid md:grid-cols-[240px_180px_240px] items-center gap-3 py-2">
                    <li className="flex items-center md:justify-start justify-center gap-1" ><TbCheck /> No surprise requirements</li>
                    <li className="flex items-center md:justify-start justify-center gap-1 md:border-x border-white md:px-3"> <TbCheck /> No hidden tiers </li>
                    <li className="flex items-center md:justify-start justify-center gap-1" ><TbCheck /> On-chain verification</li>
                </ul>
            </div>
        </section>
    )
}
