import AirdropGrid from "../components/Airdrop/AirdropGrid";
import { airdrops } from "../components/Airdrop/data";
import Governance from "../components/Airdrop/Governance";
import HowToEarn from "../components/Airdrop/HowToEarn";
import AirdroIntro from "../components/Airdrop/AirdroIntro";
import { BuildOn, WhyAirdrop } from "../components/Airdrop/WhyAirdrop";
import { StartEarning } from "../components/StartAbcDex";


export default function AirdropPage() {
    return (
        <div className="overflow-x-hidden">

            <AirdroIntro />
            <AirdropGrid data={airdrops} />
            <Governance />
            <HowToEarn />
            <WhyAirdrop />
            <BuildOn />
            <StartEarning btnText="Connect Wallet" title="Start Earning Airdrop for Real Activity " 
            content="Connect your wallet to see your eligibility and claim your rewards today."
             className="pt-24 pb-12" />
        </div>
    );
}
