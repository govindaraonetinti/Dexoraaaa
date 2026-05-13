export const GetStarted = () => {
    const items = [
        { id: 1, image: '/images/step-1.png', title: "Create", content: "Create Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempos Lorem ipsum dolor." },
        { id: 2, image: '/images/step-2.png', title: "Connect", content: "Create Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempos Lorem ipsum dolor." },
        { id: 3, image: '/images/step-3.png', title: "Manage", content: "Create Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempos Lorem ipsum dolor." },
    ]
    return (
        <section className="py-24 ">
            <div className="site-width-sm">
                <ul className="grid grid-cols-3 items-center justify-between gap-5">
                    {items.map((item) => {
                        return (
                            <li key={item.title}>
                                <div className="bg-[#1A1B23] px-6 py-6 rounded-xl text-center space-y-5">
                                    <img src={item.image} alt={item.title} className="w-24 mx-auto" />
                                    <h4 className="h3-tag ">{item.title}</h4>
                                    <p className="text-[#898CA9] text-[18px]">{item.content}</p>
                                    <button className="text-[#B982FF] ">Get Started</button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}