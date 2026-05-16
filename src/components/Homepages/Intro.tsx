import { Link } from "react-router-dom";

export const Intro = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center text-center">

            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,200,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(0,100,255,0.12),transparent_40%)]"></div>

            {/* Content */}
            <div className="relative z-10 site-width">
                <h1 className="h1-tag font-bold mb-6 max-w-[900px] mx-auto">
                    We make crypto clear <br /> and simple
                </h1>

                <Link
                    to="/trade/BTC"
                    className="px-6 py-3 bg-white text-black text-lg rounded-full mt-6 inline-block hover:bg-gray-200 transition"
                >
                    Trade on Dexora
                </Link>
            </div>
        </section>
    );
};