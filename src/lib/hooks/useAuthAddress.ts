import { useEffect, useState, useCallback } from "react";
import { useLogin, usePrivy, useWallets } from "@privy-io/react-auth";


interface Meta {
    icon: string,
    id: string,
    name: string
}
export const useAuthAddress = () => {
    const { user, authenticated, logout, createWallet, ready } = usePrivy();
    const { wallets } = useWallets();
    const [address, setAddress] = useState<string | null>(null);
    const [walletClientType, setWalletClient] = useState<Meta | null>(null);
    const [isWalletLoading, setIsLoading] = useState<boolean>(true);
    const [chainId, setChainId] = useState<number | null>(null)
    const resolveAddress = useCallback(() => {
        if (wallets && wallets.length > 0) {
            let connectedwallet = wallets.filter(account => account.walletClientType != "privy").sort((a, b) => b.connectedAt - a.connectedAt);
            if (connectedwallet.length == 0) {
                return null;
            }
            setWalletClient(connectedwallet[0].meta as Meta);
            const chainId = connectedwallet[0].chainId;
            setChainId(Number(chainId.split(":")[1] ?? chainId))
            return connectedwallet[0].address;
        }
        // Fallback to user object
        // if (user?.wallet?.address) {
        //     return user.wallet.address;
        // }

        // Check linked accounts
        if (user?.linkedAccounts?.length) {
            const walletAccount = user.linkedAccounts.find(
                (acc: any) =>
                    acc?.walletClientType !== "privy" && "address" in acc
            );
            return (walletAccount as any)?.address ?? null;
        }

        return null;
    }, [wallets, user]);

    const { login } = useLogin({
        onComplete: async ({ user }) => {

            setIsLoading(true);
            try {
                // ✅ 1. Check embedded wallet via user object (MOST RELIABLE)
                const hasEmbeddedWallet =
                    !!user?.wallet ||
                    wallets.some(w => w.walletClientType === "privy");

                if (!hasEmbeddedWallet) {
                    try {
                        await createWallet();
                    } catch (err: any) {
                        // ✅ Ignore duplicate wallet error
                        if (
                            err?.message?.includes("already has an embedded wallet")
                        ) {
                            console.warn("Embedded wallet already exists, skipping");
                        } else {
                            throw err;
                        }
                    }
                }

                // ✅ 2. Handle injected wallets safely
                const injectedWallet = wallets.find(
                    w => w.walletClientType !== "privy"
                );

                if (injectedWallet) {
                    const provider = await injectedWallet.getEthereumProvider();
                    try {
                        await provider.request({
                            method: "eth_requestAccounts",
                        });
                        await provider.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: "0xa4b1" }], // Arbitrum One chainId in hex
                        });
                        // console.log("Switched to Arbitrum");

                    } catch (switchError: any) {
                        // This error code indicates that the chain has not been added to the wallet
                        if (switchError.code === 4902) {
                            try {
                                // Add Arbitrum network if not present
                                await provider.request({
                                    method: "wallet_addEthereumChain",
                                    params: [
                                        {
                                            chainId: "0xa4b1",
                                            chainName: "Arbitrum One",
                                            nativeCurrency: {
                                                name: "ETH",
                                                symbol: "ETH",
                                                decimals: 18,
                                            },
                                            rpcUrls: ["https://arb1.arbitrum.io/rpc"],
                                            blockExplorerUrls: ["https://arbiscan.io/"],
                                        },
                                    ],
                                });
                                // console.log("Arbitrum network added");
                            } catch (addError) {
                                console.error("Failed to add Arbitrum network:", addError);
                            }
                        } else {
                            console.error("Failed to switch to Arbitrum:", switchError);
                        }
                    }
                }

                // toast.success("Login and wallet setup complete!");
            } catch (err) {
                console.error("Wallet setup error:", err);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error) => {
            console.error("Login failed", error);
        },
    });
    const handleLogout = async () => {
        setIsLoading(true);
        try {

            // Option 1: Use useLogout hook (recommended)
            await logout();
            localStorage.clear();
            sessionStorage.clear();
            // Clear any additional storage if needed
            const storageKeys = Object.keys(localStorage).filter(key =>
                key.includes('privy') || key.includes('wagmi') || key.includes('auth')
            );
            storageKeys.forEach(key => localStorage.removeItem(key));

            // Force a small delay and reload to clear any stale state
            // setTimeout(() => {
            //     window.location.reload();
            // }, 100);

        } catch (error) {
            console.error("Logout error:", error);

            // Fallback: Clear everything and reload
            localStorage.clear();
            sessionStorage.clear();
            // window.location.reload();
        }
        finally {
            setAddress(null);
            setIsLoading(false);
        }
    };

    // 🔄 Update address on login / wallet change
    useEffect(() => {
        if (!ready) {
            setIsLoading(true);
            return;
        }

        // ⛔ Not authenticated
        if (!authenticated) {
            setAddress(null);
            setIsLoading(false);
            return;
        }

        const resolved = resolveAddress();

        if (resolved) {
            setAddress(resolved);
            setIsLoading(false); // ✅ stop loading ONLY when address exists
        } else {
            setIsLoading(true); // ⏳ keep loading until address appears
        }
    }, [ready, authenticated, wallets, user, resolveAddress]);



    return {
        walletClientType,
        address,
        isAuthenticated: authenticated,
        handleLogout,
        login: login,
        user, createWallet,
        wallets,
        ready,
        isWalletLoading, chainId
    };
};
