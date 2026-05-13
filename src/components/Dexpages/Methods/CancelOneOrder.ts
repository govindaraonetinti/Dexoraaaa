import toast from "react-hot-toast";
import { exchangeUrl, loadMsgpackFromCdn } from "../../../utils";
import { ethers } from "ethers";
import { getAssetIndex } from "./FetchAvailPairs";

export const handleCancelOrder = async ({ wallets, setLoading, coinName, orderId }: { wallets: any, setLoading: any, coinName: string, orderId: number }) => {
    // 1. Locate the Privy Embedded Wallet
    const privyWallet = wallets.find((w: any) => w.walletClientType === 'privy');
    if (!privyWallet) {
        toast.error("Agent wallet not found. Please log in.");
        throw new Error("No active Privy wallet instance.");
    }
    try {
        setLoading(true);
        // 2. Setup Provider and Asset Info
        const eip1193Provider = await privyWallet.getEthereumProvider();
        const assetIndex = coinName.indexOf('@') >= 0 ? "10" + coinName.replace(/[^0-9.-]+/g, "") : await getAssetIndex(coinName);
        const nonce = Date.now();
        // 3. Build Action Object (Hyperliquid "cancel" structure)
        const action = {
            type: "cancel",
            cancels: [{
                a: Number(assetIndex),
                o: orderId
            }]
        };
        // 4. Generate Connection ID (MsgPack + Nonce + Vault)
        const msgpackLib = await loadMsgpackFromCdn();
        const actionData = msgpackLib.encode(action);
        const nonceBytes = new Uint8Array(8);
        new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
        // Concatenate: action + nonce + vault(0x00)
        const combined = new Uint8Array([...actionData, ...nonceBytes, 0x00]);
        const connectionId = ethers.keccak256(combined);
        // 5. EIP-712 Signing Data
        const domain = {
            name: "Exchange",
            version: "1",
            chainId: 1337,
            verifyingContract: "0x0000000000000000000000000000000000000000",
        };
        const types = {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" }
            ],
            Agent: [
                { name: "source", type: "string" },
                { name: "connectionId", type: "bytes32" }
            ]
        };
        const message = {
            source: "a",
            connectionId: connectionId
        };
        // 6. Headless Signature Request
        // This will not show a popup if Privy "Automatic Signing" is enabled
        const signature = await eip1193Provider.request({
            method: 'eth_signTypedData_v4',
            params: [
                privyWallet.address,
                JSON.stringify({
                    domain,
                    types,
                    primaryType: "Agent",
                    message
                })
            ]
        });
        const sig = ethers.Signature.from(signature);
        // 7. Post to Hyperliquid
        const cancelPayload = {
            action,
            nonce,
            signature: { r: sig.r, s: sig.s, v: sig.v },
            vaultAddress: null
        };

        const response = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cancelPayload),
        });

        const result = await response.json();

        let _result = result.response.data.statuses.filter((status: any) => status.error );
        if(_result.length > 0) {
            toast.error(`Failed: ${_result[0].error}`);
            throw new Error(_result[0].error);
        } else if (result.status === "ok") {
            toast.success(`Order cancelled successfully!`);
            // Trigger UI refreshes
         
            return result;
        } else {
            toast.error(`Cancellation failed: ${result.response || "Unknown error"}`);
            throw new Error(result.response || "Cancellation failed");
        }

    } catch (error: any) {
        console.error('Cancellation failed:', error);
        toast.error(`Cancel Failed: ${error.message}`);
        throw error;
    } finally {
        setLoading(false);
    }
};