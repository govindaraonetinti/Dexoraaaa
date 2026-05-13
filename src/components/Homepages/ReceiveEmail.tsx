
import { BsArrowRight } from "react-icons/bs"
import { Link } from "react-router-dom"

export const ReceiveEmail = () => {
    return (
        <section>
            <div className="site-width-sm text-center py-20 space-y-5">
                <h1 className="h3-tag">Receive transmissions</h1>
                <p><span className="text-[#898CA9]">Unsubscribe at any time. </span> <Link to={'/privacy-policy'} >Privacy policy</Link></p>
                <div className="flex items-center justify-between gap-2 border border-[#828284] w-[320px] px-4 py-4 rounded mx-auto">
                    <input type="text" placeholder="Email address" className="focus:outline-0 ring-0 w-full" />
                    <button><BsArrowRight /></button>
                </div>
            </div>
        </section>
    )
}