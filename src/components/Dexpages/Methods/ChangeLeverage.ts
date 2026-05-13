import { ethers } from "ethers";
import { exchangeUrl, loadMsgpackFromCdn, toastinfo } from "../../../utils";
import { getAssetIndex } from "./FetchAvailPairs";
import toast from "react-hot-toast";
import { getUserAgents } from "./ApproveWallet";
import { createSubaccountAndApproveAgent } from "./CreateSubaccountApprove";

export const changeLeverage = async ({ payload, wallets, setLoading, createWallet }: any) => {
    const privyWallet = wallets.find((w: any) => w.walletClientType === 'privy');
    if (!privyWallet) {
        toastinfo("Agent wallet not found. Please log in again.");
        throw new Error("No active Privy wallet instance.");
    }

    try {
        const userwallets = wallets.filter((account: any) => account.walletClientType != "privy").sort((a: any, b: any) => b.connectedAt - a.connectedAt)[0];
        const existingAgents = privyWallet && userwallets
            ? await getUserAgents(userwallets.address.toLowerCase(), privyWallet.address.toLowerCase())
            : [];
        if (!privyWallet || existingAgents.length === 0) {
            const success = await createSubaccountAndApproveAgent({ wallets, createWallet });
            if (!success) {
                toast.error("Failed to authorize Agent wallet.");
                throw new Error("Agent authorization failed");
            }
        }
        setLoading(true);
        const eip1193Provider = await privyWallet.getEthereumProvider();
        const assetIndex = await getAssetIndex(payload.marketCoin);
        const nonce = Date.now();

        // 1. DATA FIX: Ensure leverage is a strictly typed Integer
        const leverageValue = Math.floor(Number(payload.localLeverage));

        // 2. Build Action Object
        // The structure MUST match this exactly for the backend to deserialize it
        const action = {
            type: "updateLeverage",
            asset: assetIndex,
            isCross: payload.mode == "cross",
            leverage: leverageValue
        };

        // 3. Connection ID Generation
        const msgpackLib = await loadMsgpackFromCdn();
        const actionData = msgpackLib.encode(action);
        const nonceBytes = new Uint8Array(8);
        new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
        const combined = new Uint8Array([...actionData, ...nonceBytes, 0x00]);
        const connectionId = ethers.keccak256(combined);

        // 4. Signing
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

        const signature = await eip1193Provider.request({
            method: 'eth_signTypedData_v4',
            params: [
                privyWallet.address,
                JSON.stringify({ domain, types, primaryType: "Agent", message: { source: "a", connectionId } })
            ]
        });

        const sig = ethers.Signature.from(signature);

        // 5. POST Payload
        const leveragePayload = {
            action,
            nonce,
            signature: { r: sig.r, s: sig.s, v: sig.v },
            vaultAddress: null
        };

        const response = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leveragePayload), // This is where the deserialization happens
        });

        const result = await response.json();

        let _result = result.response.data.statuses.filter((status: any) => status.error );
        if(_result.length > 0) {
            toast.error(`Failed: ${_result[0].error}`);
            throw new Error(_result[0].error);
        } else if (result.status === "ok") {
            toast.success(`Leverage set to ${leverageValue}x`);
            return result;
        } else {
            toastinfo(result.response || "Failed to update leverage");
            throw new Error(result.response || "Failed to update leverage");
        }

    } catch (error: any) {
        console.error('Leverage Error:', error);
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
};