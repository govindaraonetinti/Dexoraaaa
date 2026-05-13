import { ethers } from "ethers";
import type { MetaMaskProvider } from "../DepositForm";
import { exchangeUrl } from "../../../utils";

export const handleWithdraw = async (withdrawAmount: number | string) => {
        const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
        const signer = await provider.getSigner();
        const userAddress = (await signer.getAddress()).toLowerCase();
        // 1. Precise formatting: Hyperliquid expects a string
        // "2.0" or "2 " will fail. Ensure it's a clean string.
        const amountStr = String(withdrawAmount).trim();
        const nonce = Date.now();

        // 2. THE ACTION
        const action = {
            type: "withdraw3",
            hyperliquidChain: "Mainnet",
            signatureChainId: "0xa4b1",
            destination: userAddress,
            amount: amountStr,
            time: nonce,
        };

        // 3. THE DOMAIN
        // CRITICAL: For user-signed actions (withdraw/send), 
        // the name is "HyperliquidSignTransaction", NOT "Exchange".
        const domain = {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: 42161,
            verifyingContract: "0x0000000000000000000000000000000000000000"
        };

        // 4. THE TYPES
        // CRITICAL: The primary type must be namespaced.
        const types = {
            "HyperliquidTransaction:Withdraw": [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" }
            ]
        };

        // 5. SIGN AND SUBMIT
        const signature = await signer.signTypedData(domain, types, action);
        const sig = ethers.Signature.from(signature);

        const payload = {
            action: action,
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
            body: JSON.stringify(payload)
        });

        return await response.json();
    };