
import { ethers } from "ethers";
import type { MetaMaskProvider } from "../DepositForm";
import toast from "react-hot-toast";
import { exchangeUrl } from "../../../utils";

export const handleTransfer = async ({ payload, setLoading, setTransferPopup }: any) => {
    const { amount, toPerp } = payload;
    try {
        // console.log("Transferring from Spot to Perp...", amount);
        const nonce = Date.now();
        // 1. THE MESSAGE
        const message = {
            hyperliquidChain: "Mainnet",
            amount: amount,
            toPerp: toPerp,
            nonce: nonce
        };
        // 2. THE DOMAIN
        const domain = {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: 42161,
            verifyingContract: "0x0000000000000000000000000000000000000000",
        };
        // 3. THE TYPES
        const types = {
            "HyperliquidTransaction:UsdClassTransfer": [
                { name: "hyperliquidChain", type: "string" },
                { name: "amount", type: "string" },
                { name: "toPerp", type: "bool" },
                { name: "nonce", type: "uint64" }
            ]
        };
        const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
        const signer = await provider.getSigner();
        // 4. SIGN
        const signature = await signer.signTypedData(domain, types, message);
        const sig = ethers.Signature.from(signature);
        // 5. THE FINAL PAYLOAD
        const transferPayload = {
            action: {
                type: "usdClassTransfer",
                hyperliquidChain: "Mainnet",
                signatureChainId: "0xa4b1",
                amount: amount,
                toPerp: toPerp,
                nonce: nonce
            },
            nonce: nonce,
            signature: {
                r: sig.r,
                s: sig.s,
                v: sig.v
            },
            vaultAddress: null
        };
        const response = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferPayload),
        });
        const result = await response.json();
        // console.log("Transfer result:", result);
        if (result.status === "err") {
            toast.error(result.response || "Transfer failed");
        } else {
            toast.success("Transfer successful");
        }
        return result;
    } catch (error) {
        console.error('Transfer from Spot to Perp failed:', error);
        throw error;
    } finally {
        setLoading(false);
        setTransferPopup(false);
    }
};