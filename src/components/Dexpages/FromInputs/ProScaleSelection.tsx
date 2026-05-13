import useNumberOnly from "../../../lib/hooks/useNUmberOnly";

interface ScaleProps {
    setScaleStart: (scaleStart: string) => void,
    scaleStart: string,
    errors: { [k: string]: string },
    touched: { [k: string]: boolean },
    setTouched: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>
    scaleEnd: string,
    setScaleEnd: (scaleEnd: string) => void,
    scaleOrders: string,
    setScaleOrders: (scaleOrders: string) => void,
    scaleSkew: string,
    setScaleSkew: (scaleSkew: string) => void,
}

export const ProScaleSelection = ({ setScaleStart, scaleStart, errors, touched, setTouched, scaleEnd, setScaleEnd, scaleOrders, scaleSkew, setScaleSkew, setScaleOrders }: ScaleProps) => {
    const showError = (f: string) => touched[f] && !!errors[f];
    const numberOnly = useNumberOnly({ decimals: true });
    const numberOnlyDec = useNumberOnly({ decimals: false }); 
    return (
        <>

            <div className="relative space-y-3">
                <input {...numberOnly}
                    className={`w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ${showError("scaleStart") ? "ring-1 ring-red-500" : ""}`}
                    placeholder={"Start USD"}
                    value={scaleStart}
                    onChange={(e) => setScaleStart(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, scaleSkew: true }))}
                />
                {showError("scaleStart") && <p className="text-red-500 relative -top-3 text-xs mt-1">{errors.scaleStart}</p>}

                <input {...numberOnly}
                    className={`w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ${showError("scaleEnd") ? "ring-1 ring-red-500" : ""}`}
                    placeholder={"End USD"}
                    value={scaleEnd}
                    onChange={(e) => setScaleEnd(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, scaleEnd: true }))}
                />
                {showError("scaleEnd") && <p className="text-red-500 relative -top-3 text-xs mt-1">{errors.scaleEnd}</p>}

                <div className="relative flex gap-2">
                    <input  {...numberOnlyDec}
                        className={`w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ${showError("scaleOrders") ? "ring-1 ring-red-500" : ""}`}
                        placeholder={"Total Orders"}
                        value={scaleOrders}
                        onChange={(e) => setScaleOrders(e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, scaleOrders: true }))}
                    />
                    <input {...numberOnlyDec}
                        className={`w-full bg-[#27272A] px-3 py-2 rounded-lg text-sm focus:outline-0 ${showError("scaleSkew") ? "ring-1 ring-red-500" : ""}`}
                        placeholder={"Size Skew"}
                        value={scaleSkew}
                        onChange={(e) => setScaleSkew(e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, scaleSkew: true }))}
                    />
                </div>
                {showError("scaleOrders") && <p className="text-red-500 relative -top-3 text-xs mt-1">{errors.scaleOrders}</p>}
                {showError("scaleSkew") && <p className="text-red-500 relative -top-3 text-xs mt-1">{errors.scaleSkew}</p>}
            </div>

        </>
    )
}