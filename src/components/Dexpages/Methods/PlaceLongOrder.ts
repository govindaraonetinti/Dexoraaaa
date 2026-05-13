import toast from "react-hot-toast";
import { exchangeUrl, getNumberFixedDecimal, loadMsgpackFromCdn, MAX_FEE_RATE, middlemanAddress, roundPriceToTickSize } from "../../../utils";
import { createSubaccountAndApproveAgent } from "./CreateSubaccountApprove";
import { generateScaleOrders, getAssetDecimals, getAssetIndex } from "./FetchAvailPairs";
import { getUserAgents, handleApprove } from "./ApproveWallet";
import { ethers } from "ethers";
import type { OrderPayload } from "../TradeForms";

export const handlePlaceLongOrder = async ({ payload, isLoading, confirmResolver,
    setIsConfirm, pendingPayloadRef,
    marketData, wallets,
    createWallet, setLoading, setEditObj }: any) => {
    const marketDataRef = marketData.current

    const confirmed = await waitForConfirmation({ payload, pendingPayloadRef, marketData, isLoading, setIsConfirm, confirmResolver });
    if (!confirmed) return;
    const confirmedPayload = pendingPayloadRef.current;
    if (!confirmedPayload) return;
    const coinName = payload.market;
    const assetIndex = await getAssetIndex(coinName);
    const assetIndexdec = await getAssetDecimals(coinName);
    const side = payload.side === "Buy";
    const size = payload.size;
    const reduceOnly = payload.reduceOnly;
    const nonce = Date.now();
    let price = payload.price;

    if (marketDataRef?.price == 0) {
        toast.error('Invalid market price. Cannot place order.');
        setLoading(false);
        setIsConfirm(false);
        return;
    }
    if ((payload.orderType == "takemarket") || (payload.orderType == "stopmarket")) {
        price = roundPriceToTickSize(payload?.triggerPrice * 1.03);
    } else if (!price) {
        price = side ?
            roundPriceToTickSize(marketDataRef?.price * 1.03) :
            roundPriceToTickSize(marketDataRef?.price / 1.03);
    }
    // 2. Locate the Privy Embedded Wallet from the useWallets() hook
    const privyWallet = wallets.find((w: any) => w.walletClientType === 'privy');
    const userWallet = wallets.filter((account: any) => account.walletClientType != "privy").sort((a: any, b: any) => b.connectedAt - a.connectedAt)[0];

    // 1. Validation: Ensure both wallets exist
    if (!userWallet) {
        toast.error("User wallet not found. Please Connect.");
        throw new Error("User wallet missing");
    }
    // 2. Logic: If Privy wallet missing OR Agent not authorized, trigger creation
    const existingAgents = privyWallet && userWallet
        ? await getUserAgents(userWallet.address.toLowerCase(), privyWallet.address.toLowerCase())
        : [];
    if (!privyWallet || existingAgents.length === 0) {
        const success = await createSubaccountAndApproveAgent({ wallets, createWallet });
        if (!success) {
            toast.error("Failed to authorize Agent wallet.");
            throw new Error("Agent authorization failed");
        }
    }
    try {
        setLoading(true);
        let status = await handleApprove();
        if (!status) return;
        // 3. Get the EIP-1193 provider
        if (!privyWallet) {
            toast.error("Privy Wallet not found. Please Connect.");
            throw new Error("Privy Wallet not found");
        }
        const eip1193Provider = await privyWallet.getEthereumProvider();
        // 4. Build Action Object
        const cloidHex = Date.now().toString(16).padStart(32, '0');
        const cloid = `0x${cloidHex}`;
        let orders = [];
        console.log('payload', payload, size, assetIndexdec);
        if (payload.orderType == "tpsledit") {
            if (payload.tp) {
                orders.push({
                    a: assetIndex,
                    b: side, // true = long/buy, false = short/sell
                    p: side ? roundPriceToTickSize(Number(payload.tp.price) * 1.03) : roundPriceToTickSize(Number(payload.tp.price) / 1.03),
                    s: String(getNumberFixedDecimal(size, assetIndexdec)),
                    r: reduceOnly || false,
                    t: {
                        trigger: {
                            isMarket: true,
                            triggerPx: roundPriceToTickSize(payload.tp.price),
                            tpsl: "tp"
                        }
                    }
                });
            }
            if (payload.sl) {
                orders.push({
                    a: assetIndex,
                    b: side, // true = long/buy, false = short/sell
                    p: side ? roundPriceToTickSize(payload.sl.price * 1.03) : roundPriceToTickSize(payload.sl.price / 1.03),
                    s: String(getNumberFixedDecimal(size, assetIndexdec)),
                    r: reduceOnly || false,
                    t: {
                        trigger: {
                            isMarket: true,
                            triggerPx: roundPriceToTickSize(payload.sl.price),
                            tpsl: "sl"
                        }
                    }
                });
            }
        } else if (payload.orderType == "scale") {
            const scaleOrders = generateScaleOrders(payload.size, payload.startUSD, payload.endUSD, payload.totalOrders, payload.sizeSkew);
            for (let i = 0; i < scaleOrders.length; i++) {
                orders.push({
                    a: assetIndex,
                    b: side, // true = long/buy, false = short/sell
                    p: roundPriceToTickSize(scaleOrders[i].price),
                    s: String(getNumberFixedDecimal(scaleOrders[i].size, assetIndexdec)),
                    r: reduceOnly || false,
                    t: {
                        limit: {
                            tif: "Gtc"
                        }
                    }
                });
            }
        } else if ((payload.orderType == "takelimit") || (payload.orderType == "takemarket")) {
            orders.push({
                a: assetIndex,
                b: side, // true = long/buy, false = short/sell
                p: roundPriceToTickSize(price),
                s: String(getNumberFixedDecimal(size, assetIndexdec)),
                r: reduceOnly || false,
                t: {
                    trigger: {
                        isMarket: payload.orderType == 'takemarket' ? true : false,
                        triggerPx: roundPriceToTickSize(payload.triggerPrice),
                        tpsl: "tp"
                    }
                }
            });
        } else if ((payload.orderType == "stoplimit") || (payload.orderType == "stopmarket")) {
            orders.push({
                a: assetIndex,
                b: side, // true = long/buy, false = short/sell
                p: roundPriceToTickSize(price),
                s: String(getNumberFixedDecimal(size, assetIndexdec)),
                r: reduceOnly || false,
                t: {
                    trigger: {
                        isMarket: payload.orderType == 'stopmarket' ? true : false,
                        triggerPx: roundPriceToTickSize(payload.triggerPrice),
                        tpsl: "sl"
                    }
                }
            });
        } else {
            orders.push({
                a: assetIndex,  // Dynamic asset index
                b: side,        // true for long/buy
                p: roundPriceToTickSize(price),       // Price as string
                s: String(getNumberFixedDecimal(size, assetIndexdec)),        // Size as string
                r: reduceOnly,
                t: {
                    limit: {
                        tif: "Gtc"
                    }
                },
                c: cloid
            });
            if (payload.tp) {
                orders.push({
                    a: assetIndex,
                    b: !side, // true = long/buy, false = short/sell
                    p: side ? roundPriceToTickSize(payload.tp.price / 1.03) : roundPriceToTickSize(payload.tp.price * 1.03),
                    s: String(0),
                    r: !reduceOnly,
                    t: {
                        trigger: {
                            isMarket: true,
                            triggerPx: roundPriceToTickSize(payload.tp.price),
                            tpsl: "tp"
                        }
                    }
                });
            }
            if (payload.sl) {
                orders.push({
                    a: assetIndex,
                    b: !side, // true = long/buy, false = short/sell
                    p: side ? roundPriceToTickSize(payload.sl.price / 1.03) : roundPriceToTickSize(payload.sl.price * 1.03),
                    s: String(0),
                    r: !reduceOnly,
                    t: {
                        trigger: {
                            isMarket: true,
                            triggerPx: roundPriceToTickSize(payload.sl.price),
                            tpsl: "sl"
                        }
                    }
                });
            }
        }
        // console.log('orders', JSON.stringify(orders), orders);
        // return
        let action;
        if (payload.orderType == "twap") {
            action = {
                "type": "twapOrder",
                "twap": {
                    "a": assetIndex,
                    "b": side,
                    "s": String(getNumberFixedDecimal(size, assetIndexdec)),
                    "r": reduceOnly,
                    "m": payload.runtimeMinutes,
                    "t": payload.randomize
                }
            };
        } else if ((payload.orderType == "tpsledit")) {
            action = {
                type: "order",
                orders: orders,
                grouping: "positionTpsl",
                builder: {
                    b: middlemanAddress.toLowerCase(),
                    f: MAX_FEE_RATE
                }
            };
        } else if (payload.tp || payload.sl) {
            action = {
                type: "order",
                orders: orders,
                grouping: "normalTpsl",
                builder: {
                    b: middlemanAddress.toLowerCase(),
                    f: MAX_FEE_RATE
                }
            };
        } else {
            action = {
                type: "order",
                orders: orders,
                grouping: "na",
                builder: {
                    b: middlemanAddress.toLowerCase(),
                    f: MAX_FEE_RATE
                }
            };
        }

        const msgpackLib = await loadMsgpackFromCdn();
        const actionData = msgpackLib.encode(action);
        const nonceBytes = new Uint8Array(8);
        new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
        const combined = new Uint8Array([...actionData, ...nonceBytes, 0x00]); // 0x00 for no vault
        const connectionId = ethers.keccak256(combined);
        // 6. EIP-712 Signing (Headless via direct RPC)
        const domain = {
            name: "Exchange",
            version: "1",
            chainId: 1337, // Hyperliquid L1 Chain ID
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

        // Direct RPC call to bypass standard ethers confirmation flows
        if (!privyWallet) {
            toast.error("Privy Wallet not found.");
            throw new Error("Privy Wallet not found");
        }
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

        const orderpayload = {
            action,
            nonce,
            signature: { r: sig.r, s: sig.s, v: sig.v },
            vaultAddress: null
        };
        const response = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderpayload),
        });

        const result = await response.json();
        let _result = result.response.data.statuses.filter((status: any) => status.error);
        if (_result.length > 0) {
            toast.error(`Failed: ${_result[0].error}`);
            throw new Error(_result[0].error);
        } else if (result.status === "ok") {
            toast.success(`${coinName} order placed!`);
            return result;
        } else {
            toast.error(`Order Failed: ${result.response || JSON.stringify(result)}`);
            throw new Error(result.response || JSON.stringify(result));
        }

    } catch (error) {
        if (error instanceof Error)
            console.error('Order placement failed:', error);
        toast.error(`Order Failed: ${error}`);
        throw error;
    } finally {
        setEditObj(null);
        setLoading(false);
        setIsConfirm(false);
    }
};

const waitForConfirmation = ({ payload, pendingPayloadRef, marketData, isLoading, setIsConfirm, confirmResolver }: { payload: OrderPayload, pendingPayloadRef: any, marketData: any, isLoading: any, setIsConfirm: any, confirmResolver: any }) => {
    pendingPayloadRef.current = { ...payload, marketData, isLoading }; // store payload
    setIsConfirm(true);
    return new Promise<boolean>((resolve) => {
        confirmResolver.current = resolve;
    });
};