
import { useEffect, useMemo, useRef, useState } from "react";
import CrossTrading from "../../lib/popups/CrossPopup";
import LeveragePopup from "../../lib/popups/LeveragePopup";
import PositionPopup from "../../lib/popups/PositionPopup";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { type AcccountProps } from "./AccountSummaryCard";
import { getNumberTransformed, getSpotBalance, toTitleCase } from "../../utils";
import useNumberOnly from "../../lib/hooks/useNUmberOnly";
import { TradeCurrencies } from "./FromInputs/TradeCurrencies";
import { Slider } from "./FromInputs/Slider";
import { TWAPInputs } from "./FromInputs/TWAPInputs";
import { Checkboxes } from "./FromInputs/Checkboxes";
import { TpSlInputs } from "./FromInputs/TpSlInputs";
import { validateFormFields } from "./FromInputs/validateFormFields";
import { ProScaleSelection } from "./FromInputs/ProScaleSelection";
import { SummaryCard } from "./FromInputs/SummaryCard";
import { useAuthAddress } from "../../lib/hooks/useAuthAddress";


export function getOrderType(activeTab: string, proSelection: string) {
    if (activeTab !== "pro") return activeTab;
    return proSelection.toLowerCase();
}

export default function TradingForm({
    spotMode,
    address,
    isLoading,
    inputCurrency, setInputCurrency,
    perpinfo,
    userbalances,
    updateTradeMode,
    tradeMode, setTradeMode,
    changeLeverage,
    userPositions,
    selectedCoin,
    marketData,
    marketCoin,
    leverage, setLeverage,
    connectWallet,
    placeLongOrder,
    balances,
    options
}: OrderFormProps) {
    const { isAuthenticated, isWalletLoading } = useAuthAddress();
    const toCurrency = options[1];
    const [val, setVal] = useState<number | null>(null);
    const numberOnly = useNumberOnly({ decimals: true });
    const [activeTab, setActiveTab] = useState<"market" | "limit" | "pro">("market");
    const [tif, setTIF] = useState('gtf')
    const [tradeType, setTradeType] = useState<string | null>(null);
    const [hover, setHover] = useState('')

    const [proSelection, setProSelection] = useState<string>("pro");
    const [showProMenu, setShowProMenu] = useState<boolean>(false);
    const [isManual, setIsManual] = useState<boolean>(true);
    // Buy/Sell
    const [side, setSide] = useState<"Buy" | "Sell">("Buy");

    // Core inputs
    const [price, setPrice] = useState<string>(""); // limit price
    const [constPrice, setConstPrice] = useState<number | null>(null); // limit price
    const [triggerPrice, setTriggerPrice] = useState<string>(""); // trigger price for stop/take
    const [size, setSize] = useState<string>(""); // size / total size
    const [tpsl, setTpsl] = useState<boolean>(false); // TP/SL toggle
    const [reduceOnly, setReduceOnly] = useState<boolean>(false);
    const [twap, setTwap] = useState<boolean>(false);

    // Scale specific fields (we will validate all 4)
    const [scaleStart, setScaleStart] = useState<string>("");
    const [scaleEnd, setScaleEnd] = useState<string>("");
    const [scaleOrders, setScaleOrders] = useState<string>("");
    const [scaleSkew, setScaleSkew] = useState<string>("1");

    // TWAP fields
    const [twapHours, setTwapHours] = useState<string>("0");
    const [twapMinutes, setTwapMinutes] = useState<string>("");

    // Validation & touched
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
    const [tpPrice, setTpPrice] = useState("");
    const [tpGain, setTpGain] = useState("");
    const [tpGainType, setTpGainType] = useState("%");

    const [slPrice, setSlPrice] = useState("");
    const [slLoss, setSlLoss] = useState("");
    const [slLossType, setSlLossType] = useState("%");


    const isSpot = spotMode === "spot";
    const isTradePosition = !isSpot ?
        (balances ? getNumberTransformed(balances.accountValue - userPositions.map((p) => p.position.marginUsed).reduce((a, b) => Number(a) + Number(b), 0)) : 0) :
        (side == "Sell" ? getSpotBalance(userbalances, options[0]) : getSpotBalance(userbalances, options[1]))
    const availablePerpBalance = balances
        ? balances.accountValue -
        userPositions.reduce(
            (sum, p) => sum + Number(p.position.marginUsed || 0),
            0
        )
        : 0;

    const currentPositionSize = Math.abs(
        userPositions?.find((p: any) => p.position.coin === selectedCoin)
            ?.position.szi || 0
    );

    /* ===== SPOT ===== */

    const spotAvailableBalance =
        side === "Sell"
            ? getSpotBalance(userbalances, options[0])
            : getSpotBalance(userbalances, options[1]);

    useEffect(() => {
        setErrors({});
        setPrice("");
        setTriggerPrice("");
        setSize("");
        setScaleStart("");
        setScaleEnd("");
        setScaleOrders("");
        setScaleSkew("1");
        setTwapHours("0");
        setTwapMinutes("");
        setTouched({});
        setConstPrice(null);
        if (activeTab !== "pro") {
            setProSelection("pro");
            setShowProMenu(false);
        }
    }, [activeTab]);
    useEffect(() => {
        setErrors({});
        setPrice("");
        setTriggerPrice("");
        setSize("");
        setScaleStart("");
        setScaleEnd("");
        setScaleOrders("");
        setScaleSkew("1");
        setTwapHours("0");
        setTwapMinutes("");
        setTouched({});
        setConstPrice(null);
    }, [proSelection]);
    useEffect(() => {
        setTpsl(false);
        setReduceOnly(false)
    }, [activeTab, proSelection])
    useEffect(() => {
        setTouched({});
        setConstPrice(null)
        if (selectedCoin)
            setInputCurrency(selectedCoin)
    }, [selectedCoin])
    const proOptions = [
        { name: "Scale", value: "scale" },
        { name: "Stop Limit", value: "stoplimit" },
        { name: "Stop Market", value: "stopmarket" },
        { name: "Take Limit", value: "takelimit" },
        { name: "Take Market", value: "takemarket" },
        { name: "TWAP", value: "twap" },
    ];

    const restrictedInSpot = ["stoplimit", "stopmarket", "takelimit", "takemarket"];
    const filteredProOptions =
        spotMode == "spot"
            ? proOptions.filter(
                option => !restrictedInSpot.includes(option.value)
            )
            : proOptions;
    useEffect(() => {
        if (!balances || !marketData || !userbalances) return;

        // --- Spot balances ---
        const baseCoin = options[0];
        const quoteCoin = options[1];

        const baseBal = getSpotBalance(userbalances, baseCoin);
        const quoteBal = getSpotBalance(userbalances, quoteCoin);
        const spotBal = side === "Sell"
            ? getNumberTransformed(baseBal)
            : getNumberTransformed(quoteBal);

        // --- Available balance ---
        const usedMargin = userPositions
            .map((p: any) => Number(p.position.marginUsed ?? 0))
            .reduce((a, b) => a + b, 0);

        const availbal = !isSpot
            ? getNumberTransformed(
                Number(balances.accountValue ?? 0) - usedMargin
            )
            : spotBal;

        // --- Position balance (Pro orders) ---
        const position = userPositions.find(
            (p: any) => p.position.coin === selectedCoin
        );

        const probal = Math.abs(Number(position?.position?.szi ?? 0));

        // --- Pro logic ---
        const isPro = ["stoplimit", "stopmarket", "takelimit", "takemarket"]
            .includes(proSelection.toLowerCase());

        const probalance =
            inputCurrency === toCurrency
                ? probal * marketData.price
                : probal;

        const accountValue = isPro ? probalance : availbal;
        const lev = isPro ? 1 : Number(leverage);

        if (accountValue <= 0 || lev <= 0) return;


        setConstPrice(marketData.price);

        // -------- Slider → Size --------
        if (!isManual) {
            if (val == null) return;

            let newSize: number;
            if (spotMode != 'spot') {
                if (inputCurrency === toCurrency) {
                    newSize = getNumberTransformed(accountValue * lev * (val / 100));
                    // console.log('newSizeUSdc', newSize)
                } else {
                    newSize = getNumberTransformed((accountValue * lev * (val / 100)) / (isPro ? 1 : marketData.price))
                }
            }
            else {
                if (inputCurrency === toCurrency) {
                    if (side === 'Buy')
                        newSize = getNumberTransformed(accountValue * lev * (val / 100));
                    else
                        newSize = getNumberTransformed(accountValue * lev * (val / 100) * (isPro ? 1 : marketData.price));
                    // console.log('newSizeUSdc', newSize)
                } else {
                    if (side === 'Buy')
                        newSize = getNumberTransformed((accountValue * lev * (val / 100)) / (isPro ? 1 : marketData.price))
                    else
                        newSize = getNumberTransformed((accountValue * lev * (val / 100)))
                }
            }

            if (!Number.isNaN(newSize)) {
                setSize(newSize.toString());
            }
            return;
        }

        // -------- Size → Slider --------
        const parsedSize = Number(size);

        // 👇 THIS FIXES "0."
        if (Number.isNaN(parsedSize)) return;

        let newPercentage: number;

        if (inputCurrency === toCurrency) {
            newPercentage = (parsedSize / (accountValue * lev)) * 100;
        } else {
            newPercentage = (parsedSize * marketData.price) / (accountValue * lev) * 100;
        }

        if (!Number.isNaN(newPercentage)) {
            setVal(Math.round(newPercentage));
        }

    }, [val, size, isManual, inputCurrency, leverage, balances, marketData, userbalances]);




    /* --------------------------
       Validation logic (returns errors object, does NOT mutate state)
       - For SCALE we validate all 4 fields (start, end, orders, skew optional? per user: validate all 4)
       - For TWAP we apply both individual & combined validation (option C)
       -------------------------- */


    /* --------------------------
       Real-time validation effect:
       - compute errors whenever relevant state changes
       - we will display them only when touched[field] === true
       -------------------------- */
    useEffect(() => {
        const newErrors = validateFormFields({
            spotMode: spotMode,
            activeTab: activeTab,
            proSelection: proSelection,
            triggerPrice: triggerPrice,
            price: price,
            size: size,
            balances: balances,
            inputCurrency: inputCurrency,
            leverage: leverage,
            scaleStart: scaleStart,
            scaleEnd: scaleEnd,
            scaleSkew: scaleSkew,
            scaleOrders: scaleOrders,
            twapHours: twapHours,
            twapMinutes: twapMinutes,
            tpsl: tpsl,
            side: side,
            tpPrice: tpPrice,
            tpGain: tpGain,
            slPrice: slPrice,
            slLoss: slLoss,
            marketData: marketData,
            userbalances: userbalances,
            options: options
        });
        setErrors(newErrors);
        // DO NOT set touched here — touched only updated onBlur or programmatically on submit
    }, [
        activeTab,
        proSelection,
        price,
        triggerPrice,
        size,
        scaleStart,
        scaleEnd,
        scaleOrders,
        scaleSkew,
        twapHours,
        twapMinutes,
        tpsl,
        reduceOnly,
        twap,
        tpPrice, tpGain, slPrice, slLoss
    ]);

    /* --------------------------
       Build payload for API
       -------------------------- */
    const buildOrderPayload = () => {
        const orderType = getOrderType(activeTab, proSelection);

        const base: any = {
            side,
            size: inputCurrency == toCurrency ? Number(size) / marketData?.price : size,
            market: selectedCoin,
            mode: tradeMode,
            leverage: Number(leverage),
            reduceOnly,
            tpsl,
        };

        // PREPARE payload based on order type
        let payload: any;

        switch (orderType) {
            case "market":
                payload = { ...base, orderType: "market" };
                break;

            case "limit":
                payload = { ...base, orderType: "limit", price: Number(price) };
                break;

            case "stoplimit":
                payload = {
                    ...base,
                    orderType: "stoplimit",
                    triggerPrice: Number(triggerPrice),
                    price: Number(price),
                };
                break;

            case "stopmarket":
                payload = {
                    ...base,
                    orderType: "stopmarket",
                    triggerPrice: Number(triggerPrice),
                };
                break;

            case "takelimit":
                payload = {
                    ...base,
                    orderType: "takelimit",
                    triggerPrice: Number(triggerPrice),
                    price: Number(price),
                };
                break;

            case "takemarket":
                payload = {
                    ...base,
                    orderType: "takemarket",
                    triggerPrice: Number(triggerPrice),
                };
                break;

            case "scale":
                payload = {
                    ...base,
                    orderType: "scale",
                    startUSD: Number(scaleStart),
                    endUSD: Number(scaleEnd),
                    totalOrders: Number(scaleOrders),
                    sizeSkew: Number(scaleSkew),
                    tif: tif,
                };
                break;

            case "twap":
                payload = {
                    ...base,
                    orderType: "twap",
                    runtimeMinutes: (Number(twapHours || 0) * 60) + Number(twapMinutes || 0),
                    randomize: twap,
                };
                break;

            default:
                payload = base;
        }

        /* -------------------------------------------
           ADD TP / SL ONLY IF tpsl === true
        -------------------------------------------- */
        if (tpsl) {
            payload.tp = {
                price: tpPrice ? Number(tpPrice) : null,
                gain: tpGain ? Number(tpGain) : null,
                type: tpGainType,
            };

            payload.sl = {
                price: slPrice ? Number(slPrice) : null,
                loss: slLoss ? Number(slLoss) : null,
                type: slLossType,
            };
        }

        return payload;
    };

    const proname = useMemo(() => {
        if (proSelection == 'pro') return 'Pro'
        return filteredProOptions.find((o: any) => o.value === proSelection)?.name ?? "Pro";

    }, [proSelection, filteredProOptions])
    /* --------------------------
       Handle submit:
       - mark all relevant fields touched
       - set errors (already computed in effect) and stop if any
       -------------------------- */
    const handleSubmit = () => {
        // const orderType = getOrderType(activeTab, proSelection);
        const newErrors = validateFormFields({
            spotMode: spotMode,
            activeTab: activeTab,
            proSelection: proSelection,
            triggerPrice: triggerPrice,
            price: price,
            size: inputCurrency == toCurrency ? Number(size) / marketData?.price : size,
            balances: balances,
            inputCurrency: inputCurrency,
            leverage: leverage,
            scaleStart: scaleStart,
            scaleEnd: scaleEnd,
            scaleSkew: scaleSkew,
            scaleOrders: scaleOrders,
            twapHours: twapHours,
            twapMinutes: twapMinutes,
            tpsl: tpsl,
            side: side,
            tpPrice: tpPrice,
            tpGain: tpGain,
            slPrice: slPrice,
            slLoss: slLoss,
            marketData: marketData,
            userbalances: userbalances,
            options: options
        });
        // console.log(orderType)
        // Mark touched for all relevant fields so errors show up
        const touchedFields: { [k: string]: boolean } = {
            price: true,
            triggerPrice: true,
            size: true,
            scaleStart: true,
            scaleEnd: true,
            scaleOrders: true,
            scaleSkew: true,
            twapHours: true,
            twapMinutes: true,
            tpPrice: true,
            tpGain: true,
            slPrice: true,
            slLoss: true,
        };


        setTouched(touchedFields);
        setErrors(newErrors);
        // console.log('Object.keys(newErrors)', Object.keys(newErrors))
        if (Object.keys(newErrors).length > 0) {
            // early return — errors present
            return;
        }

        const payload = buildOrderPayload();
        // console.log("ORDER PAYLOAD:", payload);

        if (placeLongOrder) {
            placeLongOrder(payload);
            setErrors({});
            setTouched({})
        } else {
            alert(`Order sent: ${payload.orderType}`);
        }
    };

    const marginRequired = useMemo(() => {
        if (!size || !leverage) return null;
        return inputCurrency === toCurrency ? `${Number(size) / Number(leverage)}` : `${getNumberTransformed((Number(constPrice) * Number(size)) / Number(leverage))}`

    }, [size, leverage]);
    const orderValue = useMemo(() => {
        if (!size || !leverage) return null;
        return inputCurrency === toCurrency ? `${size} ${toCurrency}` : `${getNumberTransformed(Number(constPrice) * Number(size))} ${toCurrency}`

    }, [size, leverage]);

    useEffect(() => {
        setTpPrice("")
        setTpGain("")
        setSlPrice("")
        setSlLoss("")
    }, [tpsl])


    const handleDecimals = (currency: string, value: any) => {
        // console.log(currency, value)
        let _decimalcount = currency == toCurrency ? 2 : (currency == '' ? 0 : perpinfo?.find(c => c.name == currency).szDecimals);
        let fixedValue = value;
        if (value?.includes('.')) {
            const parts = value.split('.');
            if (parts.length >= 2) {
                // Take only the specified number of decimal places
                fixedValue = _decimalcount == 0 ? parts[0] : parts[0] + '.' + parts[1].slice(0, _decimalcount);
            }
        }
        fixedValue = fixedValue.replace(/[^\d.]/g, '');
        if ((fixedValue.match(/\./g) || []).length > 1) {
            const parts = fixedValue.split('.');
            fixedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        return fixedValue
    }
    useEffect(() => {
        if (selectedCoin)
            setSize('');
        setVal(null);
        setErrors({});
        setTouched({})
    }, [selectedCoin])
    useEffect(() => {
        if (size)
            if (inputCurrency == toCurrency) {
                setSize(handleDecimals(inputCurrency, String(Number(size) * Number(marketData?.price))))
            } else {
                setSize(handleDecimals(inputCurrency, String(Number(size) / Number(marketData?.price))))
            }
    }, [inputCurrency])
    const proButtonRef = useRef<HTMLButtonElement>(null);
    const proMenuRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                !proButtonRef.current?.contains(e.target as Node) &&
                !proMenuRef.current?.contains(e.target as Node)
            ) {
                setShowProMenu(false);
            }
        };

        if (showProMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showProMenu]);


    /* --------------------------
       Helper to show error if touched
       -------------------------- */
    const showError = (field: string) => touched[field] && !!errors[field];

    /* --------------------------
       Render
       -------------------------- */

    return (
        <div className="text-white p-3 space-y-3 flex flex-col justify-between h-full">
            {/* Top Buttons */}
            <div className="space-y-3">
                {spotMode != 'spot' &&
                    <div className="flex gap-2 mb-3 text-[13px] ">
                        {tradeMode &&
                            <button
                                className="flex-1 py-1.5 rounded-md border border-[#37373c] cursor-pointer"
                                onClick={() => setTradeType("cross-isolated")}
                            >
                                {tradeMode[0]?.toUpperCase()}{tradeMode?.slice(1)}
                            </button>}
                        <button
                            className="flex-1 py-1.5 rounded-md border border-[#37373c] cursor-pointer"
                            onClick={() => setTradeType("leverage")}
                        >
                            {leverage}X
                        </button>
                        {/* <button
                        className="flex-1 py-1.5 rounded-md border border-[#37373c] cursor-pointer"
                        onClick={() => setTradeType("position")}
                    >
                        M
                    </button> */}
                    </div>}

                {/* Popups */}
                <CrossTrading marketCoin={marketCoin} vendorCoin={toCurrency} tradeType={tradeType} setTradeType={setTradeType} setTradeMode={setTradeMode} tradeMode={tradeMode ?? ''} updateTradeMode={updateTradeMode} AcccountProps={balances} />
                <LeveragePopup tradeType={tradeType} setTradeType={setTradeType} setLeverage={setLeverage} leverage={leverage} changeLeverage={changeLeverage} perpinfo={perpinfo ?? []} marketCoin={marketCoin} AcccountProps={balances} />
                <PositionPopup tradeType={tradeType} setTradeType={setTradeType} selectedCoin={selectedCoin ?? ''} />

                {/* Tabs */}
                <div className="flex space-x-6 text-[13px] font-medium border-b-2 border-[#2a2a32] pb-2 relative">
                    {Tabs.map((t) => (
                        <>
                            <button
                                key={`tab-${t}`}
                                ref={t === "pro" ? proButtonRef : null}
                                onClick={() => {
                                    setActiveTab(t as any);
                                    if (t === "pro") setShowProMenu((s) => !s);
                                    else setShowProMenu(false);
                                }}
                                className={`cursor-pointer flex items-center gap-1 ${activeTab === t ? "text-white" : "text-white/75"}`}
                            >
                                {t === "pro" ? proname : toTitleCase(t)}
                                {t === "pro" && <MdOutlineKeyboardArrowDown className="text-lg" />}
                            </button>
                        </>
                    ))}

                    {/* PRO DROPDOWN */}
                    {activeTab === "pro" && showProMenu && (
                        <ul ref={proMenuRef} className={`absolute left-0 top-full mt-2 bg-black border border-[#2a2a32] rounded-lg p-3  w-40 flex flex-col gap-2 z-50`}>
                            {filteredProOptions.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => {
                                        setProSelection(option.value);
                                        setShowProMenu(false);
                                    }}
                                    className="cursor-pointer hover:text-white text-gray-300"
                                >
                                    {option.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Buy / Sell */}
                <div className="relative flex bg-[#232323] text-white rounded-md overflow-hidden">
                    <div
                        className={`absolute inset-y-0 w-1/2 transition-transform duration-300 ${side === "Buy" ? "translate-x-0 bg-[#2BC287]" : "translate-x-full bg-[#F74B60]"
                            }`}
                    />
                    {["Buy", "Sell"].map((s) => (
                        <button key={s} onClick={() => setSide(s as any)} className="w-1/2 py-2 text-sm z-10 cursor-pointer">
                            {s == "Buy" ? `${spotMode != 'spot' ? 'Buy/Long' : 'Buy'}` : `${spotMode != 'spot' ? 'Sell/Short' : 'Sell'}`}
                        </button>
                    ))}
                </div>

                {/* Available / Position */}
                {!isSpot ? (
                    <>
                        <div className="text-white/75 flex items-center justify-between text-[13px]">
                            Available to trade :
                            <span>
                                {getNumberTransformed(availablePerpBalance)} {options[1]}
                            </span>
                        </div>

                        <div className="text-white/75 flex items-center justify-between text-[13px]">
                            Current Position :
                            <span>
                                {currentPositionSize} {selectedCoin}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-gray-400 flex items-center justify-between text-[13px]">
                        Available to trade :
                        <span>
                            {getNumberTransformed(spotAvailableBalance)}{" "}
                            {side === "Sell" ? options[0] : options[1]}
                        </span>
                    </div>
                )}


                {/* Form Inputs */}
                <div className="space-y-3">
                    {/* Trigger Price */}
                    {["stoplimit", "stopmarket", "takelimit", "takemarket"].includes(proSelection.toLowerCase()) && (
                        <>
                            <div className="relative">
                                <input {...numberOnly}
                                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0"
                                    placeholder={`Trigger Price (${toCurrency})`}
                                    value={triggerPrice ?? null}
                                    onChange={(e) => {
                                        setTriggerPrice(handleDecimals(toCurrency, e.target.value));
                                        setConstPrice(marketData?.price);
                                        setTouched((p) => ({ ...p, size: true }));
                                    }}

                                    onBlur={() => { setTouched((p) => ({ ...p, size: true })) }}
                                />

                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300">{toCurrency}</span>

                            </div>
                            {showError("triggerPrice") && <p className="text-red-500 relative -top-2.5 text-xs ">{errors.triggerPrice}</p>}
                        </>
                    )}

                    {/* Limit Price */}
                    {(activeTab === "limit" || ["stoplimit", "takelimit"].includes(proSelection.toLowerCase())) && (
                        <div className="relative">
                            <div className="relative">
                                <input {...numberOnly}
                                    className={`w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ${showError("price") ? "ring-1 ring-red-500" : ""}`}
                                    placeholder={"Enter Price"}
                                    value={price}
                                    onChange={(e) => { setPrice(handleDecimals(toCurrency, e.target.value)); setTouched((p) => ({ ...p, price: true })) }}
                                    onBlur={() => setTouched((p) => ({ ...p, price: true }))}
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300">{toCurrency}</span>
                            </div>
                            {showError("price") && <p className="text-red-500 relative -top-0.5 text-xs mt-1">{errors.price}</p>}
                        </div>
                    )}

                    {/* Size / Total Size for TWAP */}
                    {proSelection.toLowerCase() !== "twap" ? (
                        <div className={`flex bg-[#27272A] rounded-lg ${showError("size") ? "ring-1 ring-red-500" : ""}`}>
                            <input {...numberOnly}
                                className={`flex-1 px-3 py-2 text-sm focus:outline-0 bg-transparent`}
                                placeholder="Size"
                                value={size}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setIsManual(true);
                                    setSize(handleDecimals(inputCurrency, value));
                                    setVal(null); // reset slider here
                                    setConstPrice(marketData?.price)
                                    setTouched((p) => ({ ...p, size: true }))
                                }}
                                onBlur={() => { setTouched((p) => ({ ...p, size: true })) }}
                            />
                            <TradeCurrencies inputCurrency={inputCurrency} setInputCurrency={setInputCurrency} options={options} />
                        </div>
                    ) : (
                        <div className={`flex bg-[#27272A] rounded-lg ${showError("size") ? "ring-1 ring-red-500" : ""}`}>
                            <input {...numberOnly}
                                className={`flex-1 px-3 py-2 text-sm focus:outline-0 bg-transparent `}
                                placeholder="Total Size"
                                value={size}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setIsManual(true);
                                    setSize(handleDecimals(inputCurrency, value));
                                    setVal(null); // reset slider here
                                    setConstPrice(marketData?.price);
                                    setTouched((p) => ({ ...p, size: true }))
                                }}

                                onBlur={() => { setTouched((p) => ({ ...p, size: true })) }}
                            />
                            <TradeCurrencies inputCurrency={inputCurrency} setInputCurrency={setInputCurrency} options={options} />
                        </div>
                    )}
                    {showError("size") && <p className="text-red-500 relative -top-3 text-xs">{errors.size}</p>}

                    {/* Step Range Selector */}
                    <Slider
                        value={val ?? 0}
                        onChange={(v) => {
                            setIsManual(false);
                            setVal(v);
                            setConstPrice(marketData?.price)
                        }}
                    />



                    {/* Scale Inputs */}
                    {proSelection.toLowerCase() === "scale" &&
                        < ProScaleSelection
                            scaleStart={scaleStart}
                            setScaleStart={setScaleStart}
                            scaleEnd={scaleEnd}
                            setScaleEnd={setScaleEnd}
                            scaleOrders={scaleOrders}
                            setScaleOrders={setScaleOrders}
                            scaleSkew={scaleSkew}
                            setScaleSkew={setScaleSkew}
                            errors={errors}
                            touched={touched}
                            setTouched={setTouched}
                        />
                    }

                    {/* TWAP Inputs */}
                    {proSelection.toLowerCase() === "twap" && (
                        <TWAPInputs
                            hours={twapHours}
                            minutes={twapMinutes}
                            setHours={(v) => setTwapHours(v)}
                            setMinutes={(v) => setTwapMinutes(v)}
                            errors={errors}
                            touched={touched}
                            setTouched={setTouched}
                        />
                    )}

                    {/* Checkboxes / TIF */}

                    <Checkboxes
                        spotMode={spotMode}
                        activeTab={activeTab}
                        setHover={setHover}
                        hover={hover}
                        tpsl={tpsl}
                        setTpsl={setTpsl}
                        reduceOnly={reduceOnly}
                        setReduceOnly={setReduceOnly}
                        proSelection={proSelection}
                        twap={twap}
                        setTwap={setTwap}
                        tif={tif}
                        setTIF={setTIF}
                    />

                    {/* TP/SL inputs */}
                    {tpsl && <TpSlInputs errors={errors} setTouched={setTouched} touched={touched} numberOnly={numberOnly}
                        leverage={leverage}
                        entryPrice={marketData?.price}
                        side={side}
                        tpPrice={tpPrice}
                        setTpPrice={setTpPrice}
                        tpGain={tpGain}
                        setTpGain={setTpGain}
                        tpGainType={tpGainType}
                        setTpGainType={setTpGainType}
                        slPrice={slPrice}
                        setSlPrice={setSlPrice}
                        slLoss={slLoss}
                        setSlLoss={setSlLoss}
                        slLossType={slLossType}
                        setSlLossType={setSlLossType}

                    />
                    }
                    {/* Submit */}
                    {address ? (
                        <button disabled={isLoading || isTradePosition <= 0}
                            onClick={handleSubmit}
                            className={`w-full py-2 rounded-md text-sm text-center ${side === "Buy" ? "bg-[#2BC287]" : "bg-[#F74B60]"} text-black`}
                        >
                            {isLoading ? 'Loading...' : (isTradePosition > 0 ? 'Place Order' : 'No Balance to trade')}
                        </button>
                    ) : (
                        <button
                            className="w-full text-black text-[15px] gap-2 bg-linear-to-r cursor-pointer from-[#f3f3f3] to-[#f3f3f3] px-4 py-2 rounded-lg font-medium transition-all"
                            onClick={connectWallet}
                        >
                            {isWalletLoading && !address && !isAuthenticated ? 'Loading...' : 'Connect Wallet'}
                        </button>
                    )}
                </div>
            </div>
            {/* Summary */}
            <SummaryCard proSelection={proSelection} toCurrency={toCurrency}
                scaleStart={scaleStart}
                scaleEnd={scaleEnd}
                marketData={marketData}
                constPrice={constPrice}
                orderValue={orderValue}
                marginRequired={marginRequired}
                activeTab={activeTab}
                twapHours={twapHours}
                twapMinutes={twapMinutes}
                selectedCoin={selectedCoin}
            />
        </div>
    );
}




const Tabs: string[] = ["market", "limit", "pro"];
/* --------------------------
   StepRangeSelector
   (kept visually the same)
   -------------------------- */


export type OrderFormProps = {
    spotMode?: string,
    address: string,
    isLoading: boolean;
    perpinfo?: any[];
    marketCoin: string;
    selectedCoin: string;
    options: string[];
    marketData: { price: number; type: string, change24h: string, coin: string };
    leverage: string;
    setLeverage: (leverage: string) => void;
    connectWallet: () => void;
    placeLongOrder?: (payload: any) => void;
    changeLeverage?: (payload: any) => void;
    updateTradeMode?: (payload: any) => void;
    tradeMode?: string;
    setTradeMode?: (tradeMode: string) => void;
    inputCurrency: string, setInputCurrency: (inputCurrency: string) => void,
    balances: AcccountProps,
    userPositions: any[],
    spotinfo?: any[],
    userbalances?: any[],

};

export interface OrderPayload {
    // Always required
    orderType: string;
    side: string;
    size: number;
    market: string;
    mode: string;
    leverage: number;
    reduceOnly: boolean;
    tpsl: boolean;

    // Optional fields (only used by certain order types)
    price?: number;         // limit, stoplimit, takelimit
    triggerPrice: number;  // stoplimit, stopmarket, take types
    startUSD?: number;      // scale orders
    endUSD?: number;        // scale orders
    totalOrders?: number;   // scale orders
    sizeSkew?: number;      // scale orders
    tif?: string;           // limit, scale
    runtimeMinutes?: number; // TWAP
    randomize?: boolean;     // TWAP
    tp: any;
    sl: any;
    position: any;
    editedMarketprice: any;
    type: any;
    editedSize: any;
    marketData?: any;
    isLoading?: boolean
}


