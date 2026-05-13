import { Link } from "react-router-dom";

export const Intro = () => {
    return (
        <section className="relative py-65 overflow-hidden">

            {/* Background Video */}
            <video
                className="absolute inset-0 w-full h-[90%] object-cover"
                src="/videos/home-intro.mp4"
                autoPlay
                loop
                muted
                playsInline
            />

            {/* Optional dark overlay for readability */}
            {/* <div className="absolute inset-0 bg-black/40"></div> */}

            {/* Content */}
            <div className="relative site-width text-center">
                <h1 className="h1-tag font-bold mb-6 max-w-[910px] text-center mx-auto">
                    We make crypto clear and simple
                </h1>

                <Link  to ="/trade/BTC" className="px-6 py-3 bg-white text-black text-[20px] rounded-full mt-12">
                    Trade on Dexora
                </Link>
            </div>
        </section>
    );
};
