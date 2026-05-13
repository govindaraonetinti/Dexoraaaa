import Advantages from "../components/Homepages/Advantages"
import { Coins } from "../components/Homepages/Coins"
import { CryptoInvesting } from "../components/Homepages/CryptoInvesting"
import CryptoTable from "../components/Homepages/CryptoTable"
import { CryptoTradingPlatform } from "../components/Homepages/CryptoTradingPlatform"
import { GetStarted } from "../components/Homepages/GetStarted"
import { Intro } from "../components/Homepages/Intro"
import { ReceiveEmail } from "../components/Homepages/ReceiveEmail"
import SEO from "../components/SEO"

const HomePage = () => {

    return (
        <section>
            <SEO />
            <Intro />
            <GetStarted />
            <CryptoTradingPlatform />
            <CryptoTable />
            <Advantages />
            <CryptoInvesting />
            <Coins />
            <ReceiveEmail />
        </section>
    )
}

export default HomePage