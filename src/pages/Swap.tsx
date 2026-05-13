import React from "react";
import { SwapIntro } from "../components/Swap/SwapIntro";
import { FeaturesSection } from "../components/Swap/FeaturesSection";
import { SwapForm } from "../components/Swap/SwapForm";
import SEO from "../components/SEO";

const Swap: React.FC = () => {


  return (
    <>
      <SEO
        title="Crypto Swap | Best Cross-Chain Swap"
        description="Swap crypto instantly across chains with the best rates"
        url="https://abcdex.exchange/swap"
        image="https://abcdex.exchange/dexora-logo.png"
      />

      <section className="py-24">
        <div className="site-width-sm">
          <SwapIntro />
          <SwapForm />
          <FeaturesSection />
        </div>
      </section>
    </>
  );
};

export default Swap;





