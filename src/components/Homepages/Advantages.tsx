const Advantages = () => {
    return (
        <section className="py-20  text-white relative">
            <div className="max-w-5xl mx-auto relative z-10">

                {/* Section Heading */}
                <div className="text-center mb-14">
                    <h2 className="text-white text-4xl md:text-5xl font-bold text-center">Our Smart Contract Advantages</h2>
                    <p className="text-gray-400 text-center mt-4">
                        Secure, transparent, and automated blockchain technology.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 relative z-10">
                    {contracts.map((item, index) => (
                        <div
                            key={index}
                            className="transition-all duration-300"
                        >
                            <img
                                src={item.img}
                                alt={item.contract}
                                className="w-full mb-5 mx-auto"
                            />

                            <h3 className="text-xl font-semibold mb-3 text-center">
                                {item.contract}
                            </h3>

                            <p className="text-gray-400 text-center">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <img src="/images/looper-left.png" alt="" className="absolute left-0 -top-1/2 z-0" />
        </section>
    );
};

export default Advantages;


const contracts = [
    {
        contract: "Smart contract #1",
        description: "Smart contracts are simply programs stored and executed on a blockchain.",
        img: "/images/smart-contract-1.png",
    },
    {
        contract: "Smart contract #2",
        description: "They help automate workflows without the need for intermediaries.",
        img: "/images/smart-contract-2.png",
    },
    {
        contract: "Smart contract #3",
        description: "Smart contracts enhance transparency, security, and trust in digital agreements.",
        img: "/images/smart-contract-3.png",
    },
];
