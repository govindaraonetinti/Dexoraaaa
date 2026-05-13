import { ethers } from "ethers";
import { exchangeUrl, infoUrl, loadMsgpackFromCdn, roundPriceToTickSize } from "../../../utils";
import { getAssetIndex } from "./FetchAvailPairs";
import toast from "react-hot-toast";


export const closeAllPositions = async ({ wallets, setLoading }: any) => {
    const privyWallet = wallets.find((w: any) => w.walletClientType === 'privy');
    const userWallet = wallets.filter((account: any) => account.walletClientType != "privy").sort((a: any, b: any) => b.connectedAt - a.connectedAt)[0];
    if (!privyWallet) {
        toast.error("Agent wallet not found.");
        throw new Error("No active Privy wallet instance.");
    }
    try {
        setLoading(true);
        // 1. Fetch current positions from the clearinghouseState info endpoint
        const responseState = await fetch(infoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "clearinghouseState",
                user: userWallet?.address
            })
        });
        const state = await responseState.json();
        const positions = state?.assetPositions || [];
        // Filter only active positions (size != 0)
        const activePositions = positions.filter((p: any) => parseFloat(p.position.szi) !== 0);
        if (activePositions.length === 0) {
            toast.error("No active positions to close.");
            return;
        }

        // 1b. Fetch current live market prices (allMids) so slippage is based on real price
        let liveMids: Record<string, number> = {};
        try {
            const midsRes = await fetch(infoUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: "allMids" })
            });
            const midsData = await midsRes.json();
            // allMids returns { mids: { BTC: "95000", ETH: "3000", ... } }
            if (midsData?.mids) {
                Object.entries(midsData.mids).forEach(([k, v]) => {
                    liveMids[k] = parseFloat(v as string);
                });
            }
        } catch (e) {
            console.warn("Failed to fetch live mids, falling back to entryPx for slippage", e);
        }

        const nonce = Date.now();
        const eip1193Provider = await privyWallet.getEthereumProvider();

        // 2. Build the orders array to close positions
        // To close: we place a Market Order with the opposite side and 'reduceOnly: true'
        let closeOrders: any[] = [];

        for (const p of activePositions) {
            const pos = p.position;
            const coin = pos.coin;
            const assetIndex = await getAssetIndex(coin);
            const size = Math.abs(parseFloat(pos.szi)); // Absolute size
            const isLong = parseFloat(pos.szi) > 0;
            // Use live market price; fall back to entryPx only if mid is unavailable
            const currentMid = liveMids[coin] || parseFloat(pos.entryPx || "0");
            // Apply 10% slippage buffer so the IOC fills even with fast market moves
            const slippagePrice = isLong ? currentMid * 0.9 : currentMid * 1.1;
            closeOrders.push({
                a: assetIndex,
                b: !isLong,
                p: String(roundPriceToTickSize(slippagePrice)),
                s: String(size),
                r: true, // reduceOnly must always be true to close
                t: {
                    limit: { tif: "Ioc" } // Immediate-or-Cancel for market-like behavior
                }
            });
        }

        // 3. Build Action Object
        const action = {
            type: "order",
            orders: closeOrders,
            grouping: "na"
        };

        // 4. Generate Connection ID
        const msgpackLib = await loadMsgpackFromCdn();
        const actionData = msgpackLib.encode(action);
        const nonceBytes = new Uint8Array(8);
        new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
        const combined = new Uint8Array([...actionData, ...nonceBytes, 0x00]);
        const connectionId = ethers.keccak256(combined);

        // 5. EIP-712 Signing (Headless)
        const domain = {
            name: "Exchange",
            version: "1",
            chainId: 1337,
            verifyingContract: "0x0000000000000000000000000000000000000000",
        };

        const types = {
            EIP712Domain: [
                { name: "name", type: "string" }, { name: "version", type: "string" },
                { name: "chainId", type: "uint256" }, { name: "verifyingContract", type: "address" }
            ],
            Agent: [
                { name: "source", type: "string" },
                { name: "connectionId", type: "bytes32" }
            ]
        };

        const message = { source: "a", connectionId };

        // 6. Sign via Privy
        const signature = await eip1193Provider.request({
            method: 'eth_signTypedData_v4',
            params: [privyWallet.address, JSON.stringify({ domain, types, primaryType: "Agent", message })]
        });

        const sig = ethers.Signature.from(signature);

        // 7. Post to API
        const payload = {
            action,
            nonce,
            signature: { r: sig.r, s: sig.s, v: sig.v },
            vaultAddress: null
        };

        const resultResponse = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await resultResponse.json();
        let _result = result.response.data.statuses.filter((status: any) => status.error);
        if (_result.length > 0) {
            toast.error(`Failed: ${_result[0].error}`);
            throw new Error(_result[0].error);
        } else if (result.status === "ok") {
            if (activePositions.length === 1) {
                toast.success(`Closing ${activePositions.length} position...`);
            } else {
                toast.success(`Closing ${activePositions.length} positions...`);
            }

            return result;
        } else {
            toast.error(`Error closing positions: ${result.response}`);
            throw new Error(result.response || "Close positions failed");
        }

    } catch (error: any) {
        console.error('Close positions failed:', error);
        toast.error(`Error closing positions: ${error.message}`);
    } finally {
        setLoading(false);
    }
};