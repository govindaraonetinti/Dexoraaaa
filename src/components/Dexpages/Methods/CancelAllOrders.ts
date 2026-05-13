import toast from "react-hot-toast";
import { fetchOpenOrders, getAssetIndex } from "./FetchAvailPairs";
import { exchangeUrl, loadMsgpackFromCdn } from "../../../utils";
import { ethers } from "ethers";

export const handleCancelAllOrders = async ({ wallets, setLoading }: any) => {
    // 1. Find the active Privy Embedded Wallet
    const privyWallet = wallets.find((w: any) => w.walletClientType === 'privy');
    const userWallet = wallets.filter((account:any) => account.walletClientType != "privy").sort((a:any, b:any) => b.connectedAt - a.connectedAt)[0];
    if (!privyWallet) {
        toast.error("Agent wallet not found. Please log in.");
        throw new Error("No active Privy wallet instance.");
    }
    try {
        setLoading(true);
        // 2. Fetch current open orders to build the cancellation list

        let _openorders = await fetchOpenOrders(userWallet ? userWallet?.address : '');
        if (!_openorders || _openorders.length === 0) {
            toast.error("No open orders to cancel.");
            return;
        }

        const nonce = Date.now();
        const eip1193Provider = await privyWallet.getEthereumProvider();
        // 3. Group orders by coin and build the cancels array
        let _orderstocancel: any[] = [];
        const ordersByCoin: Record<string, any[]> = _openorders.reduce((acc: any, order: any) => {
            if (!acc[order.coin]) acc[order.coin] = [];
            acc[order.coin].push(order);
            return acc;
        }, {});
        for (const [coin, orders] of Object.entries(ordersByCoin)) {
            const assetIndex = coin.indexOf('@') >= 0 ? "10" + coin.replace(/[^0-9.-]+/g, "") : await getAssetIndex(coin);
            orders.forEach((order) => {
                _orderstocancel.push({
                    a: Number(assetIndex),
                    o: order.oid
                });
            });
        }
        // 4. Build Action Object
        const action = {
            type: "cancel",
            cancels: _orderstocancel
        };
        // 5. Generate Connection ID (MsgPack + Nonce + Vault)
        const msgpackLib = await loadMsgpackFromCdn();
        const actionData = msgpackLib.encode(action);
        const nonceBytes = new Uint8Array(8);
        new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
        const combined = new Uint8Array([...actionData, ...nonceBytes, 0x00]);
        const connectionId = ethers.keccak256(combined);
        // 6. EIP-712 Signing Data (Headless)
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
        // 7. Request Signature from Privy (Background)
        const signature = await eip1193Provider.request({
            method: 'eth_signTypedData_v4',
            params: [
                privyWallet.address,
                JSON.stringify({ domain, types, primaryType: "Agent", message })
            ]
        });
        const sig = ethers.Signature.from(signature);
        // 8. Construct Payload and API Call
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
            toast.success(`All orders cancelled!`);
            return result;
        } else {
            toast.error(`Bulk cancellation failed: ${result.response}`);
            throw new Error(result.response || "Bulk cancellation failed");
        }
    } catch (error: any) {
        console.error('Bulk cancellation failed:', error);
        toast.error(`Error: ${error.message}`);
        throw error;
    } finally {
        setLoading(false);
    }
};