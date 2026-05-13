type TpSlProps = {
    leverage: any,
    entryPrice: any,
    side: any,
    tpPrice: string;
    setTpPrice: (tpPrice: string) => void;

    tpGain: string;
    setTpGain: (tpGain: string) => void;

    tpGainType: string;
    setTpGainType: (tpGainType: string) => void;

    slPrice: string;
    setSlPrice: (slPrice: string) => void;
    slLoss: string;
    setSlLoss: (slLoss: string) => void;
    slLossType: string;
    setSlLossType: (slLossType: string) => void;
    errors: { [k: string]: string };
    touched: { [k: string]: boolean };
    setTouched: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
    numberOnly: any
};


export function TpSlInputs({
    leverage,
    entryPrice,
    side,
    tpPrice,
    setTpPrice,
    tpGain,
    setTpGain,
    slPrice,
    setSlPrice,
    slLoss,
    setSlLoss,
    errors,
    touched,
    setTouched,
    numberOnly
}: TpSlProps) {
    const isLong = side.toLowerCase() == 'buy'
    const parse = (v: string): number | null => {
        if (v === "" || v === "." || v === "-" || v === "-.") return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    /* ---------------- CALCULATIONS ---------------- */
    const calcPnLPercent = (price: number) => {
        if (!entryPrice || !leverage) return "";
        const raw = isLong
            ? (price - entryPrice) / entryPrice
            : (entryPrice - price) / entryPrice;
        return (raw * 100 * leverage).toFixed(2);
    };

    const calcTpPriceFromPnL = (percent: number) => {
        const unlev = percent / leverage / 100;
        return isLong
            ? (entryPrice * (1 + unlev)).toFixed(2)
            : (entryPrice * (1 - unlev)).toFixed(2);
    };

    const calcSlPriceFromPnL = (percent: number) => {
        const unlev = percent / leverage / 100;
        return isLong
            ? (entryPrice * (1 - unlev)).toFixed(2)
            : (entryPrice * (1 + unlev)).toFixed(2);
    };

    /* ---------------- INPUT HANDLERS ---------------- */
    const onTpPriceChange = (v: string) => {
        setTpPrice(v);
        const price = parse(v);
        if (price === null) {
            setTpGain("");
            return;
        }
        setTpGain(calcPnLPercent(price));
    };

    const onTpGainChange = (v: string) => {
        setTpGain(v);
        const percent = parse(v);
        if (percent === null) {
            setTpPrice("");
            return;
        }
        setTpPrice(calcTpPriceFromPnL(percent));
    };

    const onSlPriceChange = (v: string) => {
        setSlPrice(v);
        const price = parse(v);
        if (price === null) {
            setSlLoss("");
            return;
        }
        setSlLoss(calcPnLPercent(price));
    };

    const onSlLossChange = (v: string) => {
        setSlLoss(v);
        const percent = parse(v);
        if (percent === null) {
            setSlPrice("");
            return;
        }
        setSlPrice(calcSlPriceFromPnL(percent));
    };
    const showError = (field: string) => touched[field] && !!errors[field];
    return (
        <div className="w-full max-w-md space-y-3">

            {/* TP */}

            <div className="grid grid-cols-2 gap-3 mb-3">
                <input {...numberOnly}
                    type="text"
                    placeholder="TP Price"
                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0"
                    value={tpPrice}
                    onChange={(e) => { onTpPriceChange(e.target.value); setTouched((p: any) => ({ ...p, tpPrice: true })) }}
                    onBlur={() =>
                        setTouched((p: any) => ({ ...p, tpPrice: true }))
                    }
                />

                <input {...numberOnly}
                    type="text"
                    placeholder="Gain %"
                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0"
                    value={tpGain}
                    onChange={(e) => { onTpGainChange(e.target.value); setTouched((p) => ({ ...p, tpGain: true })) }}
                    onBlur={() => { setTouched((p) => ({ ...p, tpGain: true })) }}
                />
            </div>
            {(touched.tpPrice || touched.tpGain) && errors.tp && (
                <p className="text-red-500">{errors.tp}</p>
            )}

            {showError('tpPrice') && <p className="text-red-500 m-0">{errors?.tpPrice}</p>}
            {showError('tpGain') && <p className="text-red-500 m-0">{errors?.tpGain}</p>}

            {/* SL */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <input {...numberOnly}
                    type="text"
                    placeholder="SL Price"
                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0"
                    value={slPrice}
                    onChange={(e) => { onSlPriceChange(e.target.value); setTouched((p) => ({ ...p, slPrice: true })) }}
                    onBlur={() => { setTouched((p) => ({ ...p, slPrice: true })) }}
                />
                <input {...numberOnly}
                    type="text"
                    placeholder="Loss %"
                    className="w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0"
                    value={slLoss}
                    onChange={(e) => { onSlLossChange(e.target.value); setTouched((p) => ({ ...p, slLoss: true })) }}
                    onBlur={() => { setTouched((p) => ({ ...p, slLoss: true })) }}
                />
            </div>
            {(touched.slPrice || touched.slLoss) && errors.sl && (
                <p className="text-red-500">{errors.sl}</p>
            )}

            {showError('slLoss') && <p className="text-red-500 m-0">{errors?.slLoss}</p>}
            {showError('slPrice') && <p className="text-red-500 m-0">{errors?.slPrice}</p>}
        </div>
    );
}