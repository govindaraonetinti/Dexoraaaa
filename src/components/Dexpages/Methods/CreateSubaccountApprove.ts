
import { ethers } from "ethers";
import type { ConnectedWallet } from "@privy-io/react-auth";
import type { MetaMaskProvider } from "../DepositForm";
import { getUserAgents } from "./ApproveWallet";
import toast from "react-hot-toast";
import { exchangeUrl } from "../../../utils";

interface CreateAgentParams {
    wallets: ConnectedWallet[];
    createWallet: () => void;
}

export const createSubaccountAndApproveAgent = async ({
    wallets,
    createWallet
}: CreateAgentParams) => {
    try {
        const agentwallets = wallets.find((w) => w.walletClientType === 'privy');
        const userwallets = wallets.filter((account:any) => account.walletClientType != "privy").sort((a:any, b:any) => b.connectedAt - a.connectedAt)[0];
        if (!agentwallets || !userwallets) {
            // console.log("Wallets missing, triggering creation/connection...");
            await createWallet();
            toast.error("Wallet connection initiated. Please retry.");
            throw new Error("Wallet connection initiated. Please retry.");
        }
        const userAddress = userwallets?.address?.toLowerCase();
        const agentWalletAddress = agentwallets?.address?.toLowerCase();
        const nonce = Date.now();
        let abc = await getUserAgents(userAddress ?? '', agentWalletAddress ?? '');
        // console.log(abc);
        if (abc.length > 0) {
            return true;
        }
        const message = {
            hyperliquidChain: "Mainnet",
            agentAddress: agentWalletAddress,
            agentName: "ABC Dex Agent",
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
        // Must match the "Primary type" and field list in your image exactly
        const types = {
            "HyperliquidTransaction:ApproveAgent": [
                { name: "hyperliquidChain", type: "string" },
                { name: "agentAddress", type: "address" },
                { name: "agentName", type: "string" },
                { name: "nonce", type: "uint64" }
            ]
        };

        const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
        const signer = await provider.getSigner();

        // 4. SIGN (This will now look identical to your screenshot)
        const signature = await signer.signTypedData(domain, types, message);
        const sig = ethers.Signature.from(signature);

        // 5. THE FINAL PAYLOAD
        // Note: The 'action' sent to the API DOES include signatureChainId
        const approvalPayload = {
            action: {
                type: "approveAgent",
                hyperliquidChain: "Mainnet",
                signatureChainId: "0xa4b1",
                agentAddress: agentWalletAddress,
                agentName: "ABC Dex Agent",
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
            body: JSON.stringify(approvalPayload),
        });
        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Agent approval failed:', error);
        toast.error(`Agent approval failed: ${(error as any).message}`);
        throw error;
    }
};