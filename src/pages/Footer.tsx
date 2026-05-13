import { Copyright } from "lucide-react";
import { BiLogoTelegram } from "react-icons/bi";
import { BsDiscord, BsMedium, BsTwitterX } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
export default function Footer() {



    const noFooter = ["perp", "spot","trade"];

    const location = useLocation();
    // e.g. "/perp/BTC", "/spot/ETH"

    const firstSegment = location.pathname.split("/")[1];

    const hideFooter = noFooter.includes(firstSegment);

    // console.log({
    //     pathname: location.pathname,
    //     firstSegment,
    //     hideFooter,
    // });

    if (!hideFooter)
        return (
            <footer className="w-full py-16 relative bg-transparent">
                {/* Background Image */}
                <img
                    src="/images/bg-gradient-img2.png"
                    alt=""
                    className="absolute left-0 bottom-0 pointer-events-none select-none"
                />

                <div className="site-width-sm mx-auto relative z-10 sm:text-start text-center">
                    <img src="/images/sphere.png" alt="" className="absolute right-[20%] -bottom-[16%] w-25" />
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">

                        {/* Glow Element */}
                        {/* <div className="absolute -top-12 right-12 w-28 h-28 bg-orange-500 opacity-50 blur-[70px] rounded-full"></div> */}

                        {/* GRID */}
                        <div className="
                        grid 
                        grid-cols-1 
                        sm:grid-cols-2 
                        lg:grid-cols-4 
                        gap-10
                        relative z-20
                    ">

                            {/* Logo */}
                            <div className="flex flex-col gap-4">
                                <img src="/images/logo.png" alt="logo" className="w-32 sm:mx-0 mx-auto" />
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    The most trusted platform for trading, staking & crypto utilities.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div className="md:ml-[38%]">
                                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li><Link to="/" className="hover:text-white">Home</Link></li>
                                    <li><Link to="/" className="hover:text-white ">About</Link></li>
                                    {/* <li><Link to="/" className="hover:text-white">Products</Link></li> */}
                                    <li><Link to="/" className="hover:text-white">Contact</Link></li>
                                </ul>
                            </div>

                            {/* Others */}
                            <div className="lg:ml-[38%]">
                                <h3 className="text-white font-semibold mb-4">Others</h3>
                                <ul className="space-y-2 text-gray-300">
                                    {/* <li><Link to="/" className="hover:text-white">Referrals</Link></li> */}
                                    <li><Link to="/" className="hover:text-white">Staking</Link></li>
                                    <li><Link to="/" className="hover:text-white">Airdrop</Link></li>
                                    <li><Link to="/" className="hover:text-white">FAQ</Link></li>
                                </ul>
                            </div>

                            {/* Payment Systems */}
                            <div>
                                <h3 className="text-white font-semibold mb-4">
                                    We accept the following <br /> payment systems
                                </h3>

                                <div className="flex items-center gap-4 mt-3">

                                    {/* <div className="px-2  py-3 bg-white/10 rounded-lg w-24 h-13.5">
                                        <img src="/images/visa-icon.png" className="w-15 h-8 object-contain" alt="" />
                                    </div>
                                    <div className="px-2  py-3 bg-white/10 rounded-lg w-24 h-13.5">
                                        <img src="/images/mastercard-icon.png" className="w-15 h-8 object-contain" alt="" />
                                    </div> */}
                                    <div className="">
                                        <img src="/images/btc-icon.png" className="w-10 object-contain" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-white/10 my-8"></div>

                        {/* Bottom Bar */}
                        <div
                            className="
                            grid 
                        grid-cols-1 
                        sm:grid-cols-2 
                        lg:grid-cols-4 
                        sm:gap-10 gap-6
                        relative z-20
                        "
                        >
                            <p className="flex gap-1"> <Copyright /> {new Date().getFullYear()} ABCDEX. All rights reserved.</p>


                            <Link to="/" className="hover:text-white sm:ml-[38%] whitespace-nowrap">
                                Terms and conditions
                            </Link>
                            <Link to="/" className="hover:text-white lg:ml-[38%]">
                                Privacy policy
                            </Link>

                            {/* Social Icons */}
                            <div className="flex items-center gap-5 text-white text-xl sm:justify-end justify-center">
                                <BsTwitterX className="cursor-pointer hover:text-gray-300" />
                                <BiLogoTelegram className="cursor-pointer hover:text-gray-300" />
                                <BsDiscord className="cursor-pointer hover:text-gray-300" />
                                <BsMedium className="cursor-pointer hover:text-gray-300" />
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        );
}
