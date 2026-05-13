import { ethers } from "ethers";
import type { MetaMaskProvider } from "../Dexpages/DepositForm";
import { exchangeUrl } from "../../utils";
import { spotcurrencies } from "../../lib/Currencies";

// ─────────────────────────────────────────────────────────────────────────────
// HOW NATIVE CHAIN WITHDRAWAL WORKS (BTC → Bitcoin, SOL → Solana, ETH → Ethereum)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Hyperliquid's sendAsset ONLY accepts 42-char EVM addresses as destination.
//  To withdraw to a native chain address (Solana base58, Bitcoin bech32, etc.),
//  you must go through Hyperunit (Unit Protocol) — the official bridge layer.
//
//  THE TWO-STEP FLOW:
//
//  STEP 1 — Ask Hyperunit for a relay address
//  ┌──────────────────────────────────────────────────────────────────────┐
//  │  GET https://api.hyperunit.xyz/gen/hyperliquid/{dstChain}/{asset}/{nativeAddr} │
//  │  e.g. /gen/hyperliquid/solana/sol/FB8n9u4oDC4BReXVzjFA5JAWyETwhbXq5LW31jnSTUnh │
//  │  → returns { address: "0xRelayAddress..." }                          │
//  │    This is a special HL EVM address tied to your native destination  │
//  └──────────────────────────────────────────────────────────────────────┘
//
//  STEP 2 — sendAsset to that relay address on Hyperliquid
//  ┌──────────────────────────────────────────────────────────────────────┐
//  │  destination = "0xRelayAddress"  (NOT the Solana address directly!)  │
//  │  Hyperunit detects the incoming transfer and releases the native     │
//  │  asset to the real destination on the native chain automatically.    │
//  └──────────────────────────────────────────────────────────────────────┘
//
//  FLOW DIAGRAM:
//
//    Your HL Spot Balance (SOL/BTC/ETH)
//            │
//            │  sendAsset → destination = 0xRelayAddr (Hyperunit relay)
//            ▼
//    Hyperunit Relay Address  (EVM address on Hyperliquid L1)
//            │
//            │  Guardians detect transfer → build + sign native chain tx
//            ▼
//    FB8n9u4oDC4BReXVzjFA5JAWyETwhbXq5LW31jnSTUnh  ✅  (your Solana wallet)
//    or  1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf  ✅  (your Bitcoin wallet)
//    or  0xYourEthAddress  ✅  (your Ethereum wallet)
//
// ─────────────────────────────────────────────────────────────────────────────


// ─── Constants ────────────────────────────────────────────────────────────────

const ARBITRUM_CHAIN_ID     = 42161;
const ARBITRUM_CHAIN_ID_HEX = "0xa4b1"; // MUST be hex string — Hyperliquid rejects integers

// Hyperunit API base URL
const HYPERUNIT_API = "https://api.hyperunit.xyz";

// Minimum withdrawal amounts enforced by Hyperunit
// Transactions below these amounts cannot be processed
export const HYPERUNIT_MINIMUMS: Record<string, { amount: number; display: string }> = {
  BTC:      { amount: 0.0003,       display: "0.0003 BTC"        },
  ETH:      { amount: 0.007,        display: "0.007 ETH"         },
  SOL:      { amount: 0.12,         display: "0.12 SOL"          },
  PUMP:     { amount: 5500,         display: "5500 PUMP"         },
  FARTCOIN: { amount: 55,           display: "55 FART"           },
  BONK:     { amount: 1_800_000,    display: "1,800,000 BONK"    },
  SPX:      { amount: 32,           display: "32 SPX6900"        },
  XPL:      { amount: 60,           display: "60 XPL"            },
  ENA:      { amount: 120,          display: "120 ENA"           },
  ZZ:       { amount: 150,          display: "150 2Z"            },
  MON:      { amount: 450,          display: "450 MON"           },
  ZEC:      { amount: 0.07,         display: "0.07 ZEC"          },
};

// Maps ticker → destination chain name used by Hyperunit API
// e.g. SOL lives on "solana", BTC on "bitcoin", ETH on "ethereum"
export const TICKER_TO_DST_CHAIN: Record<string, string> = {
  BTC:      "bitcoin",
  ETH:      "ethereum",
  SOL:      "solana",
  FARTCOIN: "solana",
  BONK:     "solana",
  PUMP:     "solana",
  SPX:      "solana",
  ZZ:       "solana",
  XPL:      "plasma",
  ENA:      "ethereum",
  MON:      "monad",
  ZEC:      "zcash",
};

// Maps ticker → Hyperunit asset symbol (usually lowercase ticker)
export const TICKER_TO_UNIT_ASSET: Record<string, string> = {
  BTC:      "btc",
  ETH:      "eth",
  SOL:      "sol",
  FARTCOIN: "fart",
  BONK:     "bonk",
  PUMP:     "pump",
  SPX:      "spx",
  ZZ:       "2z",
  XPL:      "xpl",
  ENA:      "ena",
  MON:      "mon",
  ZEC:      "zec",
};


// ─── Types ────────────────────────────────────────────────────────────────────

interface WithdrawValidationResult {
  valid: boolean;
  error?: string;
  currency?: typeof spotcurrencies[number];
}

interface HyperunitAddressResponse {
  address: string;   // 42-char EVM relay address on Hyperliquid
  signatures: Record<string, string>;
  status: string;
}


// ─── Address validators ───────────────────────────────────────────────────────

function isValidSolanaAddress(addr: string)  { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr); }
function isValidBitcoinAddress(addr: string) { return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr); }
function isValidEthAddress(addr: string)     { return ethers.isAddress(addr); }

/**
 * Validates the native-chain destination address format for a given ticker.
 * Returns an error string, or null if valid.
 */
function validateNativeDestination(ticker: string, destination: string): string | null {
  if (["SOL", "FARTCOIN", "BONK", "PUMP", "SPX", "ZZ"].includes(ticker)) {
    if (!isValidSolanaAddress(destination))
      return `Invalid Solana address for ${ticker}: "${destination}" — expected base58, 32–44 chars`;
    return null;
  }
  if (ticker === "BTC" || ticker === "ZEC") {
    if (!isValidBitcoinAddress(destination))
      return `Invalid Bitcoin address for ${ticker}: "${destination}" — expected bech32 or legacy format`;
    return null;
  }
  if (["ETH", "ENA", "MON"].includes(ticker)) {
    if (!isValidEthAddress(destination))
      return `Invalid Ethereum address for ${ticker}: "${destination}" — expected 0x + 40 hex chars`;
    return null;
  }
  if (ticker === "XPL") {
    // Plasma addresses — basic check
    if (destination.length < 10)
      return `Invalid Plasma address for XPL: "${destination}"`;
    return null;
  }
  return null;
}


// ─── Currency registry helpers ────────────────────────────────────────────────

function validateCurrencyEntry(currency: typeof spotcurrencies[number]): string | null {
  const id = `[${currency.vendors_vendorshortcode}/${currency.vendors_id}]`;
  if (!currency.vendors_vendorshortcode?.trim()) return `${id} Missing vendors_vendorshortcode`;
  if (!currency.vendors_pairmapid?.trim())       return `${id} Missing vendors_pairmapid`;
  if (currency.vendors_decimals == null)          return `${id} Missing vendors_decimals`;
  if (!["ACTIVE", "INACTIVE"].includes(currency.vendors_status))
    return `${id} Unknown vendors_status: "${currency.vendors_status}"`;
  if (currency.vendors_chainid && !currency.vendors_contractaddress)
    return `${id} Has vendors_chainid but no vendors_contractaddress`;
  return null;
}

function resolveCurrency(ticker: string): WithdrawValidationResult {
  const matches = spotcurrencies.filter(c => c.vendors_vendorshortcode === ticker);
  if (matches.length === 0)
    return { valid: false, error: `No currency found for ticker "${ticker}"` };
  const active = matches.find(c => c.vendors_status === "ACTIVE");
  if (!active)
    return { valid: false, error: `No ACTIVE entry found for ticker "${ticker}"` };
  const fieldError = validateCurrencyEntry(active);
  if (fieldError) return { valid: false, error: fieldError };
  return { valid: true, currency: active };
}

/**
 * Builds the token identifier for Hyperliquid's sendAsset action:
 *   ERC-20  → "SYMBOL:0xContractAddress"  e.g. "PURR:0xc4bf3f870c0e9465323c0b6ed28096c2"
 *   Native  → pairmapid as-is             e.g. "@142"
 */
function resolveTokenIdentifier(currency: typeof spotcurrencies[number]): string {
  if (currency.vendors_contractaddress)
    return `${currency.vendors_contractaddress}`;
  return currency.vendors_pairmapid;
}


// ─── Hyperunit API helpers ────────────────────────────────────────────────────

/**
 * STEP 1: Ask Hyperunit to generate a relay address for this withdrawal.
 *
 * The relay address is a unique Hyperliquid EVM address that Hyperunit
 * associates with your native destination address.
 * Any funds you send to it get automatically forwarded to the native chain.
 *
 * API: GET https://api.hyperunit.xyz/gen/hyperliquid/{dstChain}/{asset}/{nativeAddr}
 *
 * @param ticker      e.g. "SOL", "BTC", "ETH"
 * @param nativeAddr  the real destination address on the native chain
 *                    e.g. "FB8n9u4oDC4BReXVzjFA5JAWyETwhbXq5LW31jnSTUnh" for Solana
 * @returns           the Hyperunit relay address (42-char EVM 0x address on HL)
 */
async function fetchHyperunitRelayAddress(
  ticker: string,
  nativeAddr: string
): Promise<string> {
  const dstChain  = TICKER_TO_DST_CHAIN[ticker];
  const asset     = TICKER_TO_UNIT_ASSET[ticker];

  if (!dstChain || !asset)
    throw new Error(
      `Ticker "${ticker}" is not supported for native chain withdrawal via Hyperunit. ` +
      `Supported: ${Object.keys(TICKER_TO_DST_CHAIN).join(", ")}`
    );

  // e.g. https://api.hyperunit.xyz/gen/hyperliquid/solana/sol/FB8n9u4o...
  const url = `${HYPERUNIT_API}/gen/hyperliquid/${dstChain}/${asset}/${nativeAddr}`;
  console.log("[withdraw] Fetching Hyperunit relay address from:", url);

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hyperunit API error [${response.status}]: ${body}`);
  }

  const data: HyperunitAddressResponse = await response.json();

  if (!data.address || !ethers.isAddress(data.address))
    throw new Error(`Hyperunit returned an invalid relay address: "${data.address}"`);

  console.log("[withdraw] Hyperunit relay address:", data.address);
  return data.address;
}


// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * Withdraws a spot asset from Hyperliquid to a native chain address.
 *
 * Supported routes (via Hyperunit):
 *   BTC  → Bitcoin address  e.g. "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf..."
 *   SOL  → Solana address   e.g. "FB8n9u4oDC4BReXVzjFA5JAWyETwhbXq5LW31jnSTUnh"
 *   ETH  → Ethereum address e.g. "0xYourEthWallet"
 *   FARTCOIN/BONK/PUMP → Solana address
 *
 * @param withdrawAmount   Amount to withdraw e.g. 0.001 or "0.001"
 * @param nativeDestination  Your real wallet address on the native chain
 * @param ticker           Token symbol e.g. "SOL", "BTC", "ETH"
 */
export const handleWithdraw_spot = async (
  withdrawAmount: number | string,
  nativeDestination: string | null,
  ticker: string
): Promise<any> => {

  // ── Step 1: Basic input guards ────────────────────────────────────────────
  if (!ticker?.trim())
    throw new Error("ticker is required");

  if (!nativeDestination?.trim())
    throw new Error("nativeDestination address is required");

  const amountStr = String(withdrawAmount).trim();
  if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0)
    throw new Error(`Invalid withdraw amount: "${withdrawAmount}"`);

  // ── Step 2: Validate native destination address format ────────────────────
  const addressError = validateNativeDestination(ticker, nativeDestination);
  if (addressError) throw new Error(addressError);

  // ── Step 3: Check Hyperunit minimum withdrawal amount ─────────────────────
  const minimum = HYPERUNIT_MINIMUMS[ticker];
  if (minimum && Number(amountStr) < minimum.amount)
    throw new Error(
      `Amount ${amountStr} ${ticker} is below minimum of ${minimum.display}. ` +
      `Transactions below the minimum cannot be processed and will be lost.`
    );

  // ── Step 4: Resolve and validate currency ────────────────────────────────
  const { valid, error, currency } = resolveCurrency(ticker);
  if (!valid || !currency) throw new Error(error);

  const tokenIdentifier = resolveTokenIdentifier(currency);

  console.log("[withdraw] ticker           :", ticker);
  console.log("[withdraw] nativeDestination:", nativeDestination);
  console.log("[withdraw] amount           :", amountStr);
  console.log("[withdraw] tokenIdentifier  :", tokenIdentifier);

  // ── Step 5: Connect MetaMask ──────────────────────────────────────────────
  if (!window.ethereum)
    throw new Error("MetaMask not detected. Please install MetaMask.");

  const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
  const signer   = await provider.getSigner();
  console.log("[withdraw] signer:", await signer.getAddress());

  // ── Step 6: Fetch Hyperunit relay address ─────────────────────────────────
  //
  //  This is the KEY step for native chain withdrawals.
  //  We ask Hyperunit: "Give me a Hyperliquid address that will forward
  //  funds to my [SOL/BTC/ETH] address: nativeDestination"
  //
  //  Example: nativeDestination = "FB8n9u4oDC4BReXVzjFA5JAWyETwhbXq5LW31jnSTUnh" (Solana)
  //  Hyperunit returns:           "0xAbCd..."  (Hyperliquid relay EVM address)
  //

  const relayAddress = await fetchHyperunitRelayAddress(ticker, nativeDestination);

  console.log("[withdraw] Hyperunit relay address:", relayAddress);
  const nonce = Date.now();

  // ── Step 7: EIP-712 domain ────────────────────────────────────────────────
  const domain = {
    name:              "HyperliquidSignTransaction",
    version:           "1",
    chainId:           ARBITRUM_CHAIN_ID,
    verifyingContract: "0x0000000000000000000000000000000000000000",
  };

  // ── Step 8: EIP-712 types (mandatory field order from Hyperliquid spec) ───
  //  "type" and "signatureChainId" are excluded — API metadata only, NOT signed
  const types = {
    "HyperliquidTransaction:SendAsset": [
      { name: "hyperliquidChain", type: "string" },
      { name: "destination",      type: "string" },
      { name: "sourceDex",        type: "string" },
      { name: "destinationDex",   type: "string" },
      { name: "token",            type: "string" },
      { name: "amount",           type: "string" },
      { name: "fromSubAccount",   type: "string" },
      { name: "nonce",            type: "uint64" },
    ],
  };

  // ── Step 9: Signed struct ─────────────────────────────────────────────────
  //
  //  destination = relayAddress (0x EVM address from Hyperunit)
  //  NOT the native Solana/Bitcoin address — that was used to look up relayAddress
  //
  const signedStruct = {
    hyperliquidChain: "Mainnet",
    destination:      relayAddress,    // ← 0x Hyperunit relay address (EVM)
    sourceDex:        "spot",
    destinationDex:   "spot",
    token:            tokenIdentifier, // "@142" for SOL  |  "USDC:0x..." for USDC
    amount:           amountStr,       // "0.001"
    fromSubAccount:   "",
    nonce:            nonce,
  };

  console.log("[withdraw] signedStruct:", signedStruct);
  console.log("[withdraw] note: destination is the Hyperunit relay address, NOT the native address");
  console.log("[withdraw] Hyperunit will forward to:", nativeDestination);

  // ── Step 10: Sign with MetaMask ───────────────────────────────────────────
  const signature = await signer.signTypedData(domain, types, signedStruct);
  const sig = ethers.Signature.from(signature);

  // ── Step 11: Build API payload ────────────────────────────────────────────
  //  Mandatory field order per spec: type → hyperliquidChain → signatureChainId
  //  → destination → sourceDex → destinationDex → token → amount → fromSubAccount → nonce
  const action = {
    type:             "sendAsset",
    hyperliquidChain:  signedStruct.hyperliquidChain,
    signatureChainId:  ARBITRUM_CHAIN_ID_HEX,   // "0xa4b1"  — hex string, NOT integer
    destination:       signedStruct.destination,
    sourceDex:         signedStruct.sourceDex,
    destinationDex:    signedStruct.destinationDex,
    token:             signedStruct.token,
    amount:            signedStruct.amount,
    fromSubAccount:    signedStruct.fromSubAccount,
    nonce:             signedStruct.nonce,       // must match top-level nonce
  };

  const payload = {
    action,
    nonce,
    signature: { r: sig.r, s: sig.s, v: sig.v },
    vaultAddress: null,
  };

  console.log("[withdraw] full payload:", payload);

  // ── Step 12: Submit to Hyperliquid ────────────────────────────────────────
  //  ⚠️  response.ok BEFORE response.json() — HTTP errors return HTML not JSON
  const response = await fetch(exchangeUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Hyperliquid API error [${response.status}]: ${errorBody}`);
  }

  const result = await response.json();
  console.log("[withdraw] API response:", result);

  // After this returns OK, Hyperunit will detect the transfer and
  // broadcast the native chain transaction automatically.
  // You can track it at: https://app.hyperunit.xyz/ or using the Operations API:
  // GET https://api.hyperunit.xyz/operations/{yourHLAddress}

  return result;
};


// ─── Usage examples ───────────────────────────────────────────────────────────
//
//  Withdraw 0.5 SOL to a Solana wallet:
//  await handleWithdraw_spot("0.5", "FB8n9u4oDC4BReXVzjFA5JAWyETwhbXq5LW31jnSTUnh", "SOL");
//
//  Withdraw 0.001 BTC to a Bitcoin wallet:
//  await handleWithdraw_spot("0.001", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "BTC");
//
//  Withdraw 0.01 ETH to an Ethereum wallet:
//  await handleWithdraw_spot("0.01", "0xYourEthereumAddress", "ETH");
