import { ProductIntro } from "../components/Products/ProductsIntro"
import { StakeTabs } from "../components/Products/StakeTabs"
import { WhyChooseABCDex } from "../components/Products/WhyChooseABCDex"
import { StartEarning } from "../components/StartAbcDex"

export const Products = () => {
    return (
        <section>
            <ProductIntro />
            <StakeTabs />
            <WhyChooseABCDex />
            <StartEarning btnText="Connect Wallet" title=" Start Trading on ABCDEX" content="Your capital. Your wallet. Your rules. " className="" />
        </section>
    )
}

