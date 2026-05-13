import { useState } from "react"
import StakeInfoModal from "../components/Staking/StakeInfoModal"
import StakingIntro from "../components/Staking/StakingIntro"
import WhyStake from "../components/Staking/WhyStake"
import { StartEarning } from "../components/StartAbcDex"

export const Staking = () => {
    const [stake, setStake] = useState<string>('')
    return (
        <section>
            <div className="">
                <StakingIntro />
                <WhyStake />
                <StartEarning title="Start Earning Rewards Today " content="Lock in your tokens and watch your rewards grow block by block." btnText="Start Staking" className="pb-24 pt-12" />
                <StakeInfoModal stake={stake} setStake={setStake} />
            </div>
        </section>
    )
}