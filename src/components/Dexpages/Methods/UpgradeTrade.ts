import toast from "react-hot-toast";
import { getAssetIndex } from "./FetchAvailPairs";
import { ethers } from "ethers";
import { exchangeUrl, loadMsgpackFromCdn, toastinfo } from "../../../utils";

interface UpdateTradeModeParams {
    mode: 'cross' | 'isolated';
    wallets: any;
    market: any;
    leverage: any;
    setLoading: (v: boolean) => void;
}
export const updateTradeMode = async ({
    mode,
    wallets,
    market,
    leverage,
    setLoading
}: UpdateTradeModeParams) => {
    // console.log('Updating trade mode via Agent:', mode);
    const privyWallet = wallets.find((w: any) => w.walletClientType === 'privy');
    if (!privyWallet) {
        toast.error("Agent wallet not found.");
        throw new Error("No active Privy wallet instance.");
    }
    try {
        setLoading(true);
        const eip1193Provider = await privyWallet.getEthereumProvider();
        // Ensure we have a valid asset index for the current market
        const assetIndex = await getAssetIndex(market || '');
        const nonce = Date.now();
        // 1. Build the Action
        const action = {
            type: "updateLeverage",
            asset: assetIndex,
            isCross: mode == "cross", // true for cross, false for isolated
            leverage: leverage // Default to 1x if not specified, or pass current leverage
        };
        // 2. Generate Connection ID (MsgPack + Nonce + Vault)
        const msgpackLib = await loadMsgpackFromCdn();
        const actionData = msgpackLib.encode(action);
        const nonceBytes = new Uint8Array(8);
        new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
        const combined = new Uint8Array([...actionData, ...nonceBytes, 0x00]);
        const connectionId = ethers.keccak256(combined);
        // 3. EIP-712 Signing Data (Standard Agent Format)
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
        // 4. Request Headless Signature from Privy
        const signature = await eip1193Provider.request({
            method: 'eth_signTypedData_v4',
            params: [
                privyWallet.address,
                JSON.stringify({
                    domain,
                    types,
                    primaryType: "Agent",
                    message: { source: "a", connectionId }
                })
            ]
        });
        const sig = ethers.Signature.from(signature);
        // 5. Post to API
        const payload = {
            action,
            nonce,
            signature: { r: sig.r, s: sig.s, v: sig.v },
            vaultAddress: null
        };
        const response = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        let _result = result.response.data.statuses.filter((status: any) => status.error );
        if(_result.length > 0) {
            toast.error(`Failed: ${_result[0].error}`);
            throw new Error(_result[0].error);
        } else if (result.status === "ok") {
            toast.success(`Successfully switched to ${mode} margin!`);
            return result;
        } else {
            const errorMsg = result.response?.data?.statuses?.[0]?.error || "Mode update failed";
            toastinfo(errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error: any) {
        console.error('Failed to update trade mode:', error);
        toast.error(`Margin Mode Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
};



