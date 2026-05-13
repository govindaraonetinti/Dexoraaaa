export const MAX_FEE_RATE = 15;
export const middlemanAddress = '0x0Ac0920459Ae9c1ABB3D866C1f772e7f0697B069';
export const socketUrl = "wss://api.hyperliquid.xyz/ws";
export const baseUrl = 'https://api.hyperliquid.xyz';
export const infoUrl = `${baseUrl}/info`;
export const exchangeUrl = `${baseUrl}/exchange`;
export const integrationKey = 'ABCDEx';
export const Lifi_APIKey = 'a56f0773-fe37-4260-92a9-aa03d95e24c5.ef3b7956-9667-46f5-98a8-d7658f9c0d58';

export const swapOptions = {
    integrator: 'ABCDEx',
    order: 'RECOMMENDED',
    // fee: 0.01,
    maxPriceImpact: 0.05,
    executionType: 'all',
}

// utils/helper.ts
import { keccak256, toUtf8Bytes, Wallet } from "ethers";
import toast from "react-hot-toast";
import { spotcurrencies_decimals } from "./lib/Currencies";

export function getDecimalCount(lastprice: number | string): number {
    let decimalindex = 2;
    const _tmp = (removeExponentials(lastprice) + "").split(".");
    if (Number(_tmp[0]) == 0) {
        decimalindex = decimalindex + 2;
        const indexpricearray = (removeExponentials(lastprice) + "").split(".")[1];
        if (indexpricearray != null) {
            for (let loopvar = 0; loopvar < indexpricearray.length; loopvar++) {
                if (Number(indexpricearray[loopvar]) == 0) {
                    decimalindex = decimalindex + 1;
                } else {
                    break;
                }
            }
        }
    } else if (Number(_tmp[0]) < 50) {
        decimalindex = 5;
    } else if (Number(_tmp[0]) < 100) {
        decimalindex = 4;
    } else if (Number(_tmp[0]) < 500) {
        decimalindex = 3;
    } else if (Number(_tmp[0]) < 2000) {
        decimalindex = 2;
    } else {
        decimalindex = 1;
    }
    return decimalindex;
}

export function removeExponentials(n: any): any {
    const sign = +n < 0 ? "-" : "";
    const toStr = n.toString();
    if (!/e/i.test(toStr)) {
        return n;
    }
    const [lead, decimal, pow] = n
        .toString()
        .replace(/^-/, "")
        .replace(/^([0-9]+)(e.*)/, "$1.$2")
        .split(/e|\./);
    return +pow < 0
        ? sign +
        "0." +
        "0".repeat(Math.max(Math.abs(+pow) - 1 || 0, 0)) +
        lead +
        decimal
        : sign +
        lead +
        (+pow >= decimal.length
            ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
            : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
}

export function getNumberTransformed(number: any, nodots = false): any {
    if (!isNumber(number)) {
        return 0;
    } else {
        const decimals = getDecimalCount(Number(number));
        if (decimals < 11) {
            return removeExponentials(truncateToDecimals(Number(number), decimals));
        } else if (nodots) {
            return removeExponentials(truncateToDecimals(Number(number), decimals));
        } else {
            number = removeExponentials(Number(number));
            return (
                (number + "").substring(0, 4) +
                "..." +
                (number + "").substring((number + "").length - 3)
            );
        }
    }
}

export function getNumberFixedDecimal(
    number: any,
    decimals: number,
    nodots = false
): any {
    if (isNaN(Number(number))) {
        return number;
    } else if (decimals < 16) {
        return removeTrailingZeros(removeExponentials(truncateToDecimals(Number(number), decimals)));
    } else if (nodots) {
        return removeTrailingZeros(removeExponentials(truncateToDecimals(Number(number), decimals)));
    } else {
        number = removeExponentials(number);
        return removeTrailingZeros(
            (number + "").substring(0, 4) +
            "..." +
            (number + "").substring((number + "").length - 3)
        );
    }
}
export function removeTrailingZeros(value: string | number): string {
    let strValue = value.toString();

    // Only process if it contains a decimal point
    if (strValue.includes('.')) {
        // Remove trailing zeros
        strValue = strValue.replace(/(\.\d*?)0+$/, '$1');
        // Remove trailing decimal point if all zeros were removed
        strValue = strValue.replace(/\.$/, '');
    }

    return strValue;
}
/**
 * Rounds a price to Hyperliquid's tick size requirement.
 * Hyperliquid requires prices to have at most 5 significant figures.
 * Formula: decimals = max(0, 5 - floor(log10(price)) - 1)
 * Examples:
 *   BTC  $95000  → 0 decimals  (95000, 95001)
 *   ETH  $3400   → 1 decimal   (3400.1, 3400.2)
 *   SOL  $175    → 2 decimals  (175.00, 175.01)
 *   DOGE $0.38   → 6 decimals  (0.380000, 0.380001)
 */
export function roundPriceToTickSize(price: number | string): string {
    const p = Number(price);
    if (!p || p <= 0 || isNaN(p)) return String(price);
    const magnitude = Math.floor(Math.log10(Math.abs(p)));
    const decimals = Math.max(0, 5 - magnitude - 1);
    return p.toFixed(decimals);
}

export function randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function isNumber(value: any): boolean {
    return (
        (typeof value === "number" && !isNaN(value)) ||
        (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value)))
    );
}

export function truncateToDecimals(num: any, fixed = 0): any {
    try {
        if (num == Infinity) {
            return num;
        } else if (!isNumber(num)) {
            return num;
        } else if (num == null) return num;
        else {
            num = removeExponentials(num);
            const re = new RegExp("^-?\\d+(?:\\.\\d{0," + (fixed || -1) + "})?");
            return num.toString().match(re)?.[0];
        }
    } catch (e) {
        console.error(e);
        return num;
    }
}

export function countDecimals(value: number): number {
    if (Math.floor(value) === value) return 0;
    else if (value.toString().split(".").length == 1) return 0;
    else return value.toString().split(".")[1].length || 0;
}

export function reformatText(text: string, length = 24): string {
    if (text.length > length) return text.substring(0, length) + "...";
    else return text;
}

export function toTrunc(
    value: any,
    finalsize: number,
    digitstoshow: number,
    vendorinfo?: { needfulldecimal?: string },
    convertFn?: (val: number) => number
): string | number {
    if (value === "" || value == null || isNaN(value)) {
        return 0;
    }
    if (vendorinfo?.needfulldecimal === "TRUE") {
        value = Number.parseFloat(value);
        if (convertFn) {
            value = convertFn(value);
        }
        const _length = (value + "").length;
        if (_length > digitstoshow) {
            return (value + "").substring(0, 4) + "..." + (value + "").substring((value + "").length - 3);
        } else {
            value = Number.parseFloat(value as any);
            value = (value.toFixed(digitstoshow) + "").substring(0, finalsize);
            let _t = value.indexOf(".");
            if (_t < 0) _t = finalsize - 1;
            const n = finalsize - _t - 1;
            const res = Number(value);
            return res.toFixed(n);
        }
    } else {
        value = Number.parseFloat(value);
        value = (value.toFixed(digitstoshow) + "").substring(0, finalsize);
        let _t = value.indexOf(".");
        if (_t < 0) _t = finalsize - 1;
        const n = finalsize - _t - 1;
        const res = Number(value);
        return res
            .toFixed(n)
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
    }
}
export function getFormattedDateTime(ts: number | string) {
    const date = new Date(Number(ts));
    if (isNaN(date.getTime())) {
        return { date: "-", time24: "-", timeAMPM: "-" };
    }
    // --- Date ---
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    // --- Time 24h ---
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    const time24 = `${hh}:${mm}:${ss}`;
    // --- Time AM/PM ---
    let ampmHours = date.getHours();
    const ampm = ampmHours >= 12 ? "PM" : "AM";
    ampmHours = ampmHours % 12 || 12; // 0->12, 13->1 etc.
    const timeAMPM = `${ampmHours}:${mm} ${ampm}`;
    return { date: dateStr, time24, timeAMPM };
}

export async function loadMsgpackFromCdn() {
    const lib = await (window as any).eval(`import("https://cdn.jsdelivr.net/npm/@msgpack/msgpack@3.0.0-beta2/+esm")`);
    return lib;
}


export async function loadnktkasFromCdn() {
    const hl = await (window as any).eval(`import("https://esm.sh/@nktkas/hyperliquid@latest")`);;
    return hl;
}

export function deriveKeyFromAddress(address: string, secret: string) {
    const input = `${address.toLowerCase()}|${secret}`;
    const hash = keccak256(toUtf8Bytes(input));
    return new Wallet(hash);
}

export function toastinfo(message: string) {
    toast(message,
        {
            icon: '⚠️',
            style: {
                borderRadius: '10px',
                background: '#c6ac5c',
                color: '#fff',
            },
        }
    );
}

export async function copyToClipboard(text: string) {
    try {
        // Modern API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            toast.success("Address copied");
            return true;
        }

        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (success) {
            toast.success("Address copied");
            return true;
        }
        toastinfo("Copy failed");
        throw new Error("Fallback copy failed");
    } catch (err) {
        console.error("Copy failed:", err);
        toast.error("Copy failed");
        return false;
    }
}
export function toTitleCase(str: string) {
    str = str.toLowerCase();
    const words = str.split(' ');
    const titleCaseWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return titleCaseWords.join(' ');
}
export function cleanTokenName(name: string) {
    if (!name) return name;
    let _name = name.replace(/[0-9]/g, "");
    // List of tokens that should keep the 'u' prefix
    const keepUPrefix = ['HYPE', 'USDC', 'USDT', 'USD', 'USDE', 'USDH', 'USDHL', 'HFUN', 'HOOD', 'HFUN'];
    // If it's in the keep list, return as is
    if (keepUPrefix.includes(_name.toUpperCase())) {
        return _name;
    }
    // Remove 'U' prefix if it exists (e.g., uBTC -> BTC, uETH -> ETH)
    if (_name.startsWith('U') && _name.length > 1) {
        return _name.substring(1).toUpperCase();
    }
    if (_name.startsWith('H') && _name.length > 1) {
        return _name.substring(1).toUpperCase();
    }
    return _name.toUpperCase();
};

export function getSpotBalance(userbalances: any, coin: string) {
    const bal = userbalances?.find((b: any) => b.coin === coin) || userbalances?.find((b: any) => b.coin === "U" + coin) || userbalances?.find((b: any) => b.coin === "H" + coin) || userbalances?.find((b: any) => b.coin === coin + "0");
    return getNumberFixedDecimal(
        (bal?.total || 0) - (bal?.hold || 0),
        Number(spotcurrencies_decimals.find((c: any) => c.vendors_vendorshortcode === coin)?.vendors_decimals || 0));
};

export function getAssetInfo(mids: any, a: string) {
    if (!mids && !a) return { price: 0, name: a };
    if (a === "USDC") return { price: 1, name: "USDC" };
    const s = a.substring(1);
    const patterns = [
        a, s,
        `flx:${a}`, `flx:${s}`,
        `hyna:${a}`, `hyna:${s}`,
        `k${a}`, `k${s}`,
        `km:${a}`, `km:${s}`,
        `vntl:${a}`, `vntl:${s}`,
        `xyz:${a}`, `xyz:${s}`, `${a}0`, `H${a}`, `U${a}`
    ];

    for (const key of patterns) {
        if (mids[key] !== undefined) {
            return { price: mids[key], name: key };
        }
    }
    return { price: 0, name: null };
}


// Format wallet address for display
export const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
const subscriptMap: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
};

const toSubscript = (num: number) =>
    String(num)
        .split("")
        .map((n) => subscriptMap[n])
        .join("");

// Expand scientific notation safely
const expandExponential = (value: string) => {
    if (!value.toLowerCase().includes("e")) return value;

    const [base, exponent] = value.toLowerCase().split("e");
    const exp = Number(exponent);

    let [int, dec = ""] = base.split(".");
    const digits = int + dec;
    const decimalIndex = int.length;

    const newIndex = decimalIndex + exp;

    if (newIndex <= 0) {
        return `0.${"0".repeat(Math.abs(newIndex))}${digits}`;
    }

    if (newIndex >= digits.length) {
        return `${digits}${"0".repeat(newIndex - digits.length)}`;
    }

    return `${digits.slice(0, newIndex)}.${digits.slice(newIndex)}`;
};

export const formatSmallNumber = (value: string | number) => {
    const str =
        typeof value === "number"
            ? expandExponential(value.toString())
            : expandExponential(value);

    if (!str.includes(".")) return str;

    const [, decimals] = str.split(".");
    const match = decimals.match(/^0+(.*)$/);

    if (!match) return str;

    const zeroCount = decimals.length - match[1].length;
    const significant = match[1].slice(0, 2);

    return `0.0${toSubscript(zeroCount)}${significant}`;
};


export const getDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);

    return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
    };
};
