export const CryptoTradingPlatform = () => {
    return (
        <section className="py-24 relative">
            <div className="site-width-sm relative z-1">
                <div className="max-w-290 mx-auto">
                    <h2 className="h2-tag text-center">A cryto trading platform that invest in you</h2>
                    <p className="text-[#898CA9] text-center text-[18px] max-w-160 mx-auto">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempos Lorem ipsum dolor</p>

                    <div className="grid md:grid-cols-[510px_1fr] grid-cols-1 mt-24 items-center">
                        <div className="relative">
                            <img src="/images/shield.png" alt="" className="relative z-1 w-100" />
                        </div>
                        <div className="space-y-5">
                            <h3 className="h3-tag">24/7 access to full service customer support</h3>
                            <p className="text-[#898CA9] text-[18px]">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempos Lorem ipsum dolor sit amet, consectetur</p>
                            <button className="border border-white px-6 py-4 rounded-md text-[18px]">Get Started</button>
                        </div>
                    </div>
                </div>
            </div>
            <img src="/images/looper.png" alt="" className="absolute right-0 -top-1/2 z-0" />
            <img src="/images/shadow-orange.png" alt="" className="absolute -left-75 -top-1/2 z-0 w-1/2" />
        </section>
    )
}