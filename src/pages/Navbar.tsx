import { useEffect, useState } from "react";
import { LogOutIcon, Menu, X } from "lucide-react";
import { FaDiscord, FaTelegram, FaTwitter } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuthAddress } from "../lib/hooks/useAuthAddress";
import { DepositBtn } from "../components/Dexpages/DepositBtn";
import { formatWalletAddress } from "../utils";

const Navbar = () => {
    const {
        address,
        isAuthenticated,
        ready,
        login,
        handleLogout,
        isWalletLoading
    } = useAuthAddress();

    const [isOpen, setOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: "Swap(Beta)", path: "/swap", status: "live" },
        { name: "Trade", path: "/trade/BTC", status: "live" },
        { name: "Airdrop", path: "/airdrop", status: "live" },
        { name: "Portfolio", path: "/portfolio", status: "live" },
        {
            name: "Live",
            path: "https://dexora.live/",
            status: "external"
        }
    ];

    const isUserAuthenticated = ready && isAuthenticated;

    const isHome = location.pathname === "/";

    const isActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        link: { status: string; path: string }
    ) => {
        if (link.status === "external") {
            e.preventDefault();
            window.open(link.path, "_blank");
        }
    };

    return (
        <section
            className={`text-sm 2xl:text-[16px] ${
                isHome
                    ? "max-w-full px-5 mx-auto"
                    : "max-w-full px-5 mx-auto"
            }`}
        >
            <nav
                className={`w-full bg-[#FFFFFF]/8 shadow-md py-4 px-6 relative z-50 ${
                    isOpen ? "rounded-lg" : "rounded-full"
                } mx-auto`}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/">
                        <img
                            src="/images/logo.png"
                            alt="logo"
                            className="2xl:w-40 lg:w-28 w-30"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex font-medium 2xl:gap-2 gap-1">
                        {navLinks.map((link) => (
                            <li key={link.name} className="relative group">
                                <Link
                                    to={
                                        link.status === "external"
                                            ? "#"
                                            : link.path
                                    }
                                    onClick={(e) =>
                                        handleNavClick(e, link)
                                    }
                                    className={`2xl:px-5 lg:px-3 2xl:py-2 py-1 rounded-full hover:text-[#2BC287] cursor-pointer
                                    ${
                                        isActive(link.path)
                                            ? "text-[#2BC287]"
                                            : ""
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop Right - Socials OR Wallet */}
                    {isHome ? (
                        <div className="hidden lg:flex items-center gap-5 text-xl">
                            <FaTwitter className="cursor-pointer hover:text-[#2BC287]" />
                            <FaTelegram className="cursor-pointer hover:text-[#2BC287]" />
                            <FaDiscord className="cursor-pointer hover:text-[#2BC287]" />
                        </div>
                    ) : (
                        <div className="hidden lg:block">
                            {isUserAuthenticated && address ? (
                                <div className="flex items-center gap-3">
                                    <DepositBtn />

                                    <button
                                        onClick={handleLogout}
                                        className="cursor-pointer bg-white px-5 py-2 text-black font-bold rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="text-sm">
                                            {formatWalletAddress(address)}
                                        </div>

                                        <LogOutIcon size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={login}
                                    className="cursor-pointer bg-white px-5 py-2 text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    {isWalletLoading &&
                                    !address &&
                                    !isAuthenticated
                                        ? "Loading..."
                                        : "Connect Wallet"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden text-3xl"
                        onClick={() => setOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="mt-2 text-white py-5 shadow-lg rounded-xl">
                        <ul className="flex flex-col font-medium gap-0">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={
                                            link.status === "external"
                                                ? "#"
                                                : link.path
                                        }
                                        className={`py-1 ${
                                            isActive(link.path)
                                                ? "text-[#2BC287] font-semibold"
                                                : ""
                                        }`}
                                        onClick={(e) => {
                                            handleNavClick(e, link);
                                            setOpen(false);
                                        }}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}

                            {/* Auth Section */}
                            <li className="pt-4">
                                {isUserAuthenticated && address ? (
                                    <div className="flex flex-col w-fit gap-3">
                                        <DepositBtn />

                                        <button
                                            onClick={handleLogout}
                                            className="cursor-pointer bg-white px-5 py-2 text-black font-bold rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="text-sm">
                                                {formatWalletAddress(address)}
                                            </div>

                                            <LogOutIcon size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={login}
                                        className="cursor-pointer bg-white px-5 py-2 text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        {isWalletLoading &&
                                        !address &&
                                        !isAuthenticated
                                            ? "Loading..."
                                            : "Connect Wallet"}
                                    </button>
                                )}
                            </li>

                            {/* Social Icons (Mobile) */}
                            {isHome && (
                                <li className="flex items-center justify-center gap-6 pt-4">
                                    <FaTwitter className="cursor-pointer hover:text-[#2BC287]" />
                                    <FaTelegram className="cursor-pointer hover:text-[#2BC287]" />
                                    <FaDiscord className="cursor-pointer hover:text-[#2BC287]" />
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </nav>
        </section>
    );
};

export default Navbar;