export const AboutIntro = () => {
    return (
        <section className="relative py-24">
                     <div className="absolute bottom-1/4 -translate-x-1/2 -right-100 w-96 h-96 
  bg-linear-to-br from-[#ac3b22] to-[#ff6a00]
  opacity-60 blur-[100px] rounded-full z-1"></div>
            <div className="site-width">
                <div className="relative 2xl:py-36 py-24 px-12  bg-cover bg-center bg-no-repeat border border-[#A9A9A9]/30 rounded-xl overflow-hidden"
                    style={{ backgroundImage: "url('/images/about-bg.png')" }}>
                    
                    <div className="absolute inset-0 bg-[#11101087]"></div>
                    {/* Content */}
                    <div className="relative">
                        <h1 className="h2-tag md:text-4xl font-bold text-white max-w-270 mx-auto text-center">
                            The Future of Decentralized Trading is Fast, Secure and Non-Custodial.
                        </h1>
                        <p className="text-center max-w-270 mx-auto mt-4 p-tag text-gray-200">
                            ABCDEX is a next-generational decentralized exchange built for high-performance futures trading.
                            We focus on delivering CEX-level execution with the security and sovereignty of a DEX.
                            Our goal is to give traders a platform where speed, transparency, and self-custody work together
                            instead of working against each other.
                        </p>
                    </div>
                </div>
            </div>
            <OurMission />
        </section>
    );
};

const OurMission = () => {
    return (
        <section className="relative pt-24 ">
            <div className="site-width-sm">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-18">
                    {/* Content */}
                    <div className="relative">
                        <h1 className="h3-tag font-bold text-white">
                            Our Mission – Trade like a CEX. Own like a DEX.
                        </h1>
                        <p className="mt-4 p-tag text-gray-200">
                            For years, traders have faced a difficult choice between CEX speed and DEX security.
                        </p>
                    </div>
                    <div>
                        <ul className="list-disc pl-5 md:text-xl text-lg">
                            <li>Choose a centralized exchange and surrender custody. </li>
                            <li>Choose a decentralized platform and sacrifice performance.  </li>
                        </ul>
                        <p className="p-tag mt-5">ABCDEX removes this compromise by providing instant execution, transparent pricing,
                            and complete control of your assets. Every action is verifiable on-chain, and your funds
                            remain in your wallet at all times until a trade is executed by smart contract. </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
