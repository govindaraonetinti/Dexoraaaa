import { getNumberTransformed, getSpotBalance } from "../../../utils";
import { getOrderType } from "../TradeForms";

interface validationProps {
    spotMode?: any;
    activeTab: any; proSelection: any; triggerPrice: any; price: any; size: any; balances: any; inputCurrency: any; leverage: any;
    scaleStart: any; scaleEnd: any; scaleSkew: any; scaleOrders: any; twapHours: any; twapMinutes: any; tpsl?: any; side: any; tpPrice?: any; tpGain?: any; marketData: any; slPrice?: any; slLoss?: any;
    userbalances: any; options: any;
}

export const validateFormFields = (props: validationProps) => {
    // console.log("validateFormFields",props);
    const orderType = getOrderType(props.activeTab, props.proSelection);
    const err: { [k: string]: string } = {};

    const requiresTrigger = ["stoplimit", "stopmarket", "takelimit", "takemarket"].includes(orderType);
    const requiresLimit = ["limit", "stoplimit", "takelimit"].includes(orderType);

    // Trigger price validation
    if (requiresTrigger) {
        if (!props.triggerPrice) err.triggerPrice = "Trigger price is required";
        else if (isNaN(Number(props.triggerPrice)) || Number(props.triggerPrice) <= 0) err.triggerPrice = "Enter valid trigger price";
    }

    // Limit price validation
    if (requiresLimit) {
        if (!props.price) err.price = "Price is required";
        else if (isNaN(Number(props.price)) || Number(props.price) <= 0) err.price = "Enter valid price";
    }

    // Size validation
    if (!props.size) err.size = "Size is required";
    else if (isNaN(Number(props.size)) || Number(props.size) <= 0) err.size = "Enter valid size";
    if (props.spotMode != 'spot') {
        if (props.balances?.accountValue != null && props.size != null) {
            const numericSize = Number(props.size);

            if (props.inputCurrency === "USDC") {
                if (numericSize > Number(props.balances.accountValue * Number(props.leverage))) {
                    // err.size = "Insufficient Balance";
                    err.size = " you have "+Number(props.balances.accountValue * Number(props.leverage))+" but you entered "+numericSize+" ";
                }
            } else {
                // Convert size to USDC equivalent
                const sizeInUSDC = numericSize * Number(props.marketData.price || 0);
                if (sizeInUSDC > Number(props.balances.accountValue * Number(props.leverage))) {
                    // err.size = "Insufficient Balance";
                    err.size = " you have "+Number(props.balances.accountValue * Number(props.leverage))+" but you entered "+sizeInUSDC+" ";
                }
            }
        }
    } else {
        const isBuy = props.side === "Buy";
        const baseCoin = props.options[0];
        const quoteCoin = props.options[1];
        const price = Number(props.marketData.price || 0);
        const numericSize = Number(props.size);

        let requiredBase = 0;
        let requiredQuote = 0;

        if (props.inputCurrency === baseCoin) {
            requiredBase = numericSize;
            requiredQuote = numericSize * price;
        } else {
            requiredQuote = numericSize;
            requiredBase = price > 0 ? numericSize / price : 0;
        }

        if (isBuy) {
            let Avlbalance = getNumberTransformed(getSpotBalance(props.userbalances, quoteCoin));
            if (Avlbalance < requiredQuote) {
                err.size = ` you have ${Avlbalance} ${quoteCoin} but you need ${getNumberTransformed(requiredQuote)} ${quoteCoin} `;
            }
        } else {
            let Avlbalance = getNumberTransformed(getSpotBalance(props.userbalances, baseCoin));
            if (Avlbalance < requiredBase) {
                err.size = ` you have ${Avlbalance} ${baseCoin} but you need ${getNumberTransformed(requiredBase)} ${baseCoin} `;
            }
        }
    }

    // Scale validations - user confirmed validate all 4 (Start, End, Orders, SizeSkew)
    if (orderType === "scale") {
        if (!props.scaleStart) err.scaleStart = "Start USD required";
        else if (isNaN(Number(props.scaleStart)) || Number(props.scaleStart) <= 0) err.scaleStart = "Enter valid start USD";

        if (!props.scaleEnd) err.scaleEnd = "End USD required";
        else if (isNaN(Number(props.scaleEnd)) || Number(props.scaleEnd) <= 0) err.scaleEnd = "Enter valid end USD";

        if (!props.scaleOrders) err.scaleOrders = "Total orders required";
        else if (!Number.isFinite(Number(props.scaleOrders)) || Number(props.scaleOrders) <= 0) err.scaleOrders = "Enter valid number of orders";

        if (!props.scaleSkew && props.scaleSkew !== "0") err.scaleSkew = "Size skew required";
        else if (isNaN(Number(props.scaleSkew))) err.scaleSkew = "Enter valid size skew";
    }

    // TWAP validations - both individual + combined (option C)
    if (orderType === "twap") {
        // individual fields (must be numbers and >= 0)
        if (props.twapHours === "") err.twapHours = "Hours required (0 allowed)";
        else if (!/^\d+$/.test(props.twapHours) || Number(props.twapHours) < 0) err.twapHours = "Enter valid hours";

        if (props.twapMinutes === "") err.twapMinutes = "Minutes required (0 allowed)";
        else if (!/^\d+$/.test(props.twapMinutes) || Number(props.twapMinutes) < 0 || Number(props.twapMinutes) >= 60) err.twapMinutes = "0-59 minutes";

        // combined runtime check (>= 5 minutes)
        const totalMinutes = (Number(props.twapHours || 0) * 60) + Number(props.twapMinutes || 0);
        if (Number.isFinite(totalMinutes) && totalMinutes < 5) err.twapRuntime = "TWAP runtime must be >= 5 minutes";
    }
    // TP/SL validation
    if (props.tpsl) {
        const isBuy = props.side.toLowerCase() === "buy";

        // ---- TP validation ----
        if (!props.tpPrice) {
            err.tpPrice = "TP Price is required";
        }
        if (!props.tpGain) {
            err.tpPrice = "TP Gain is required";
        } else {
            if (props.tpPrice) {
                const tp = Number(props.tpPrice);
                if (isNaN(tp) || tp <= 0) {
                    err.tpPrice = "Enter valid TP price";
                } else {

                    if (isBuy && tp <= props.marketData.price) {
                        err.tpPrice = "TP must be above entry price for BUY";
                    }
                    if (!isBuy && tp >= props.marketData.price) {
                        err.tpPrice = "TP must be below entry price for SELL";
                    }
                }
            }
            if (props.tpGain && (isNaN(Number(props.tpGain)) || Number(props.tpGain) <= 0)) {
                err.tpGain = "Enter valid gain";
            }
        }
        // ---- SL validation ----
        if (!props.slPrice) {
            err.slPrice = "SL Price is required";
        }
        if (!props.slLoss) {
            err.slPrice = "SL Loss is required";
        } else {
            if (props.slPrice) {
                const sl = Number(props.slPrice);
                if (isNaN(sl) || sl <= 0) {
                    err.slPrice = "Enter valid SL price";
                } else {
                    if (isBuy && sl >= props.marketData.price) {
                        err.slPrice = "SL must be below entry price for BUY";
                    }
                    if (!isBuy && sl <= props.marketData.price) {
                        err.slPrice = "SL must be above entry price for SELL";
                    }
                }
            }
            if (props.slLoss && (isNaN(Number(props.slLoss)) || Number(props.slLoss) >= 0)) {
                err.slLoss = "Enter valid loss";
            }
        }
    }
    return err;
};