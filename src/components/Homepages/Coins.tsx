import { currencies } from "../../lib/Currencies";

export const Coins = () => {
    return (
        <section>
            <div className="max-w-120 w-full mx-auto">
                <div className="flex flex-wrap gap-4 justify-center">
                    {currencies.map((item, index) => (
                        <div key={index} className="bg-linear-to-l from-[#FFFFFF ]/15 to-white/10 p-5 rounded-2xl">
                            <img
                                src={item.vendors_logopath}
                                alt={`coin-${index + 1}`}
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
