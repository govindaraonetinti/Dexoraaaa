import React from "react";
import axios from "axios";
import { spotcurrencies } from "../../../lib/Currencies";
import { cleanTokenName, infoUrl } from "../../../utils";

type HLMetaResponse = {
    universe: {
        name: string;
        szDecimals: number;
    }[];
    tokens: {
        name: string;
        szDecimals: number
        weiDecimals: number
        index: number
        tokenId: string;
        isCanonical: boolean;
        evmContract: string | null;
        fullName: string
        deployerTradingFeeShare: string
    }[];
};
let universemeta: HLMetaResponse = { universe: [], tokens: [] };
let universemeta_spot: HLMetaResponse = { universe: [], tokens: [] };
type AssetInfo = {
    index: number;
    name: string;
    szDecimals: number;
};
type AssetMap = Record<string, AssetInfo>;
export const fetchAvailableAssets = async (): Promise<AssetMap | null> => {
    try {
        if (universemeta && universemeta.universe && universemeta.universe.length > 0) {
            const assetMap: AssetMap = {};

            universemeta.universe.forEach((asset, index) => {
                assetMap[asset.name] = {
                    index,
                    name: asset.name,
                    szDecimals: asset.szDecimals,
                };
            });
            return assetMap;
        } else {
            const response = await fetch(infoUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: "meta" }),
            });
            universemeta = await response.json();

            const assetMap: AssetMap = {};

            universemeta.universe.forEach((asset, index) => {
                assetMap[asset.name] = {
                    index,
                    name: asset.name,
                    szDecimals: asset.szDecimals,
                };
            });
            return assetMap;
        }
    } catch (error) {
        console.error('Failed to fetch assets:', error);
        return null;
    }
};

export const fetchAvailableAssets_spot = async (): Promise<AssetMap | null> => {
    try {
        if (universemeta_spot && universemeta_spot.tokens && universemeta_spot.tokens.length > 0) {
            const assetMap: AssetMap = {};

            universemeta_spot.tokens.forEach((asset, index) => {
                assetMap[asset.name] = {
                    index,
                    name: asset.name,
                    szDecimals: asset.szDecimals,
                };
            });
            return assetMap;
        } else {
            const response = await fetch(infoUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: "spotMeta" }),
            });
            universemeta_spot = await response.json();

            const assetMap: AssetMap = {};

            universemeta_spot.tokens.forEach((asset, index) => {
                assetMap[asset.name] = {
                    index,
                    name: asset.name,
                    szDecimals: asset.szDecimals,
                };
            });
            return assetMap;
        }
    } catch (error) {
        console.error('Failed to fetch assets:', error);
        return null;
    }
};
export const getAssetIndex = async (coinName: string): Promise<number> => {
    const assets = await fetchAvailableAssets();
    if (!assets) {
        throw new Error(`Failed to fetch assets`);
    }

    const s = coinName.substring(1);
    const patterns = [
        coinName, s,
        `flx:${coinName}`, `flx:${s}`,
        `hyna:${coinName}`, `hyna:${s}`,
        `k${coinName}`, `k${s}`,
        `km:${coinName}`, `km:${s}`,
        `vntl:${coinName}`, `vntl:${s}`,
        `xyz:${coinName}`, `xyz:${s}`, `${coinName}0`, `H${coinName}`, `U${coinName}`
    ];

    for (const key of patterns) {
        console.log(key, coinName);
        if (assets[key] !== undefined) {
            return assets[key].index;
        }
    }

    throw new Error(`Asset ${coinName} not found`);
};
export const getAssetDecimals = async (coinName: string): Promise<number> => {
    const assets = await fetchAvailableAssets();
    if (!assets) {
        throw new Error(`Failed to fetch assets`);
    }
    const s = coinName.substring(1);
    const patterns = [
        coinName, s,
        `flx:${coinName}`, `flx:${s}`,
        `hyna:${coinName}`, `hyna:${s}`,
        `k${coinName}`, `k${s}`,
        `km:${coinName}`, `km:${s}`,
        `vntl:${coinName}`, `vntl:${s}`,
        `xyz:${coinName}`, `xyz:${s}`, `${coinName}0`, `H${coinName}`, `U${coinName}`
    ];

    for (const key of patterns) {
        if (assets[key] !== undefined) {
            return assets[key].szDecimals;
        }
    }

    throw new Error(`Asset ${coinName} not found`);

};

export const getAssetDecimals_spot = async (coinName: string): Promise<number> => {
    const assets = await fetchAvailableAssets_spot();
    if (!assets) {
        throw new Error(`Failed to fetch assets`);
    }
    const s = coinName.substring(1);
    const patterns = [
        coinName, s,
        `flx:${coinName}`, `flx:${s}`,
        `hyna:${coinName}`, `hyna:${s}`,
        `k${coinName}`, `k${s}`,
        `km:${coinName}`, `km:${s}`,
        `vntl:${coinName}`, `vntl:${s}`,
        `xyz:${coinName}`, `xyz:${s}`, `${coinName}0`, `H${coinName}`, `U${coinName}`
    ];

    for (const key of patterns) {
        if (assets[key] !== undefined) {
            return assets[key].szDecimals;
        }
    }

    throw new Error(`Asset ${coinName} not found`);

};

export const getAllPerpMetas = async (currencies: any[], setPerpInfo: any) => {
    try {
        const response = await axios.post(infoUrl, {
            type: 'allPerpMetas'
        });
        const data = response.data;
        // console.log('getAllPerpMetas response.data', response.data)
        let _finaldata: any = [];
        data.forEach((item: any) => {
            item.universe.forEach((universeItem: any) => {
                // Check if this universeItem's name matches any vendor shortcode
                const matchingCurrency = currencies.find((currency: any) => {
                    return currency && currency.vendors_vendorshortcode === universeItem.name;
                });
                if (matchingCurrency) {
                    _finaldata.push({
                        ...universeItem,
                        logo: `/images/coins/${universeItem.name.toLowerCase()}.png`,
                        decimal: matchingCurrency.vendors_decimals
                    });
                }
            });
        });
        setPerpInfo(_finaldata);
        return data;

    } catch (err) {
        if (err instanceof Error)
            console.error('Error fetching getAllPerpMetas:', err.message);
        throw err;
    }
};

export const getAllSpotMetas = async (setSpotInfo: any, setPairMappingId: any, vendor: any, market: any) => {
    try {
        const response = await axios.post(infoUrl, {
            type: 'spotMeta'
        });
        const data = response.data;
        const tokenMap: any = {};
        const symbolMap: any = {};
        // Map token indices to cleaned names
        data.tokens?.forEach(({ index, name }: { index: any, name: any }) => {
            tokenMap[index] = cleanTokenName(name.toUpperCase());
        });

        // Map universe indices to pair objects
        data.universe?.forEach(({ index, tokens }: { index: any, tokens: any }) => {
            if (tokens?.length === 2) {
                const [base, quote] = [tokenMap[tokens[0]], tokenMap[tokens[1]]];
                symbolMap[index] = { base, quote, pair: `${base}/${quote}` };
            }
        });

        const finalData = spotcurrencies.map(curr => {
            const info = symbolMap[curr.vendors_pairmapid.replace('@', '')];
            return {
                logo: `/images/coins/${cleanTokenName(info.base).toLowerCase()}.png`,
                decimal: curr.vendors_decimals,
                vendor: cleanTokenName(info.base),
                market: cleanTokenName(info.quote),
                pairmappingid: curr.vendors_pairmapid,
            };
        });

        setSpotInfo(finalData);
        const selected = finalData.find(c => c.market === vendor && c.vendor === market);
        if (selected) setPairMappingId(selected.pairmappingid);
        return symbolMap;
    } catch (error) {
        console.error('Error fetching symbols:', error);
        return {};
    }
};

type CoinMapping = Record<string, string>;
type PriceMap = Record<string, number>;

interface MarketData {
    price: number;
    type: string;
    change24h: string;
    coin: string;
}

interface FetchPricesParams {
    coinMapping: CoinMapping;
    selectedCoin: string;
    basePrices: PriceMap;
    fallbackPrices: PriceMap;
    setMarketData: React.Dispatch<React.SetStateAction<MarketData>>;
}

export async function fetchPrices({
    coinMapping,
    selectedCoin,
    basePrices,
    fallbackPrices,
    setMarketData
}: FetchPricesParams): Promise<PriceMap> {
    try {
        const coinIds = Object.values(coinMapping).join(",");

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Record<string, { usd?: number }> = await response.json();

        Object.entries(coinMapping).forEach(([symbol, coinId]) => {
            const price = data[coinId]?.usd;
            if (price !== undefined) {
                basePrices[symbol] = price;
            }
        });

        setMarketData(prev => ({
            ...prev,
            price: basePrices[selectedCoin]
        }));

        return { ...basePrices };
    } catch (error) {
        console.error("Error fetching prices, using fallback values:", error);

        Object.entries(fallbackPrices).forEach(([symbol, price]) => {
            basePrices[symbol] = price;
        });

        setMarketData(prev => ({
            ...prev,
            price: fallbackPrices[selectedCoin]
        }));

        return { ...fallbackPrices };
    }
}


export const fetchOpenOrders = async (address: string) => {
    try {
        const response = await axios.post(infoUrl, {
            type: 'openOrders',
            user: address
        });
        const data = response.data;
        //cancelOrder
        return data;
    } catch (err) {
        if (err instanceof Error)
            console.error('Error fetching open orders:', err.message);
        throw err;
    }
};



export function generateScaleOrders(size: any, start: any, end: any, totalOrders: any, sizeSkew = 0, minNotional = 10) {
    const priceStep = (end - start) / (totalOrders - 1);
    // First pass: calculate minimum size needed for each order to meet notional requirement
    const minSizes = [];
    let totalMinSize = 0;
    for (let i = 0; i < totalOrders; i++) {
        const price = start + (priceStep * i);
        const minSize = minNotional / price;
        minSizes.push(minSize);
        totalMinSize += minSize;
    }
    // Check if we have enough total size to satisfy all minimums
    if (totalMinSize > size) {
        // Not enough size to create all orders with minimum notional
        // Remove orders starting from the lowest price until we can satisfy the rest
        const orders = [];
        let remainingSize = size;
        for (let i = totalOrders - 1; i >= 0; i--) {
            const price = start + (priceStep * i);
            const minSize = minNotional / price;
            if (remainingSize >= minSize) {
                orders.unshift({
                    price: parseFloat(price.toFixed(6)),
                    size: parseFloat(minSize.toFixed(6))
                });
                remainingSize -= minSize;
            }
        }
        // Distribute remaining size proportionally
        if (remainingSize > 0 && orders.length > 0) {
            const totalCurrentSize = orders.reduce((sum, o) => sum + o.size, 0);
            orders.forEach(order => {
                const proportion = order.size / totalCurrentSize;
                order.size = parseFloat((order.size + remainingSize * proportion).toFixed(6));
            });
        }
        return orders;
    }
    const remainingSize = size - totalMinSize;
    const multipliers = [];
    for (let i = 0; i < totalOrders; i++) {
        const position = i / (totalOrders - 1);
        let sizeMultiplier;
        if (sizeSkew === 0) {
            sizeMultiplier = 1;
        } else if (sizeSkew > 0) {
            sizeMultiplier = Math.pow(position, sizeSkew) * (Math.E - 1) + 1;
        } else {
            sizeMultiplier = Math.pow(1 - position, Math.abs(sizeSkew)) * (Math.E - 1) + 1;
        }
        multipliers.push(sizeMultiplier);
    }
    // Normalize multipliers
    const sumMultipliers = multipliers.reduce((sum, m) => sum + m, 0);
    const normalizedMultipliers = multipliers.map(m => m * totalOrders / sumMultipliers);
    // Generate final orders: minimum + proportional share of remaining
    const orders = [];
    for (let i = 0; i < totalOrders; i++) {
        const price = start + (priceStep * i);
        const orderSize = minSizes[i] + (remainingSize * normalizedMultipliers[i] / totalOrders);
        orders.push({
            price: parseFloat(price.toFixed(6)),
            size: parseFloat(orderSize.toFixed(6))
        });
    }
    return orders;
}