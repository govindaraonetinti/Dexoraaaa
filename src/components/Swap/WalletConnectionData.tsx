import { ChevronDown, Copy, ExternalLink, Power } from "lucide-react";
import { copyToClipboard, formatWalletAddress } from "../../utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthAddress } from "../../lib/hooks/useAuthAddress";
import { CHAIN_ID_TO_NETWORK } from "../../lib/hooks/Lifi/useLifiTokens";
import type { ChainsData } from "../../lib/hooks/Lifi/useLifiChains";

export const WalletConnection = ({ chains }: { chains: ChainsData[] }) => {
    const [open, setOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const {
        address,
        isAuthenticated,
        ready,
        handleLogout,
        walletClientType,
        chainId,
    } = useAuthAddress();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const chainInfo = useMemo(() => {
        if (!chainId || !chains?.length) return null;

        const mapped = CHAIN_ID_TO_NETWORK[chainId];
        if (!mapped) return null;

        return (
            chains.find((chain) => chain.chainId === mapped.chainId) ?? null
        );
    }, [chainId, chains]);

    const isUserAuthenticated = ready && isAuthenticated;

    if (!isUserAuthenticated || !address) return

    return (
        <div className="relative" ref={popupRef}>
            {/* TRIGGER */}
            <button
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-3 cursor-pointer hover:bg-[#232323] px-3 py-2 rounded-xl"
            >
                <div className="relative">
                    <img
                        src={walletClientType?.icon}
                        alt={walletClientType?.name}
                        title={walletClientType?.name}
                        className="w-7"
                    />
                    {chainInfo?.logoURI && (
                        <img
                            src={chainInfo.logoURI}
                            alt={chainInfo.name}
                            title={chainInfo.name}
                            className="w-4 absolute -right-2 -bottom-2 rounded-full border border-black"
                        />
                    )}
                </div>

                <span>{formatWalletAddress(address)}</span>
                <ChevronDown className="w-4" />
            </button>

            {/* POPUP */}
            {open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-10 z-50 w-64 rounded-xl bg-[#232323] border-2 border-[#2a2a32] shadow-xl p-4"
                >
                    <div className="flex gap-6 text-white">
                        {/* ADDRESS */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-7">
                                <img
                                    src={walletClientType?.icon}
                                    alt={walletClientType?.name}
                                    title={walletClientType?.name}
                                    className="w-7"
                                />
                                {chainInfo?.logoURI && (
                                    <img
                                        src={chainInfo.logoURI}
                                        alt={chainInfo.name}
                                        title={chainInfo.name}
                                        className="w-4 absolute -right-2 -bottom-2 rounded-full border border-black"
                                    />
                                )}
                            </div>
                            <div className="text-sm">
                                <div className="font-semibold">
                                    {formatWalletAddress(address)}
                                </div>
                                <div className="text-xs text-white/75">
                                    Chain: {chainInfo?.name ?? "Unknown"}
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => copyToClipboard(address)} title="Copy"
                                className="flex items-center gap-2 text-sm hover:text-emerald-400"
                            >
                                <Copy size={16} />
                            </button>

                            {chainInfo?.metamask?.blockExplorerUrls?.[0] && (
                                <button title="External link"
                                    onClick={() =>
                                        window.open(
                                            `${chainInfo.metamask.blockExplorerUrls[0]}address/${address}`,
                                            "_blank"
                                        )
                                    }
                                    className="flex items-center gap-2 text-sm hover:text-emerald-400"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            )}

                            <button title="Log out"
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm hover:text-emerald-400"
                            >
                                <Power size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
