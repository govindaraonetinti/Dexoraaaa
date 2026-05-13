interface CheckboxProps {
    spotMode?: string,
    activeTab: string;
    setHover: (hover: string) => void;
    hover: string;
    tpsl?: boolean;
    setTpsl?: (tpsl: boolean) => void;
    reduceOnly: boolean;
    setReduceOnly: (reduce: boolean) => void;
    proSelection: string;
    twap: boolean;
    setTwap: (twap: boolean) => void;
    tif: string;
    setTIF: (tif: string) => void;
}


export const Checkboxes = (props: CheckboxProps) => {
    return (
        <>
            <div className="flex items-center gap-3 text-xs text-gray-300 justify-between">
                <div className="space-y-2">

                    {(props.activeTab === "market" || props.activeTab === "limit") && props.spotMode != 'spot' && (
                        <div className="relative">
                            <label className="flex items-center gap-1 cursor-pointer" onMouseOver={() => props.setHover('tpsl')} onMouseLeave={() => props.setHover('')}>
                                <input
                                    type="checkbox"
                                    checked={props.tpsl}
                                    onChange={() => {
                                        if (props.setTpsl) {
                                            props.setTpsl(!props.tpsl);
                                        }
                                        props.setReduceOnly(false);
                                    }}
                                    className="accent-[#2BC287]"
                                />
                                Take Profit / Stop Loss
                            </label>

                            {props.hover == 'tpsl' &&
                                <span className="transition absolute left-0 bottom-5 bg-[#27272A] text-white text-xs p-2 rounded w-62.5 shadow-2xl z-10">
                                    Places simple market TP/SL orders. For advanced features such as limit
                                    prices or partial TP/SL, set TP/SL on an open position instead.
                                </span>}
                        </div>
                    )}

                    {props.spotMode != 'spot' &&
                        <div className="relative">
                            <label className="flex items-center gap-1 cursor-pointer" onMouseOver={() => props.setHover('reduce')} onMouseLeave={() => props.setHover('')}>
                                <input
                                    type="checkbox"
                                    checked={props.reduceOnly}
                                    onChange={() => {
                                        if (props.setTpsl) {
                                            props.setTpsl(false);
                                        }
                                        props.setReduceOnly(!props.reduceOnly);
                                    }}
                                    className="accent-[#2BC287]"
                                />
                                Reduce-Only
                            </label>

                            {props.hover == 'reduce' &&
                                <span className="transition absolute left-0 bottom-5 bg-[#27272A] text-white text-xs p-2 rounded w-62.5 shadow-2xl z-10">
                                    This order will not open a new position regardless of size. It will only
                                    reduce the existing position at the time of execution.
                                </span>}
                        </div>}

                    {(props.proSelection.toLowerCase() === "twap") && (
                        <div className="relative">
                            <label className="flex items-center gap-1 cursor-pointer" onMouseOver={() => props.setHover('randomize')} onMouseLeave={() => props.setHover('')}>
                                <input
                                    type="checkbox"
                                    checked={props.twap}
                                    onChange={(e) => props.setTwap(e.target.checked)}
                                    className="accent-[#2BC287]"
                                />
                                Randomize
                            </label>

                            {props.hover == 'randomize' &&
                                <span className="transition absolute left-0 bottom-5 bg-[#27272A] text-white text-xs p-2 rounded w-62.5 shadow-2xl z-10">
                                    If enabled, each TWAP sub-trade size is automatically adjusted within a
                                    certain range, typically up to ±20%. Other constraints, such as max
                                    single-trade size, will still be honored.
                                </span>}
                        </div>
                    )}

                </div>

                {(props.proSelection.toLowerCase() === "scale" || props.activeTab === "limit") && (
                    <label className="flex items-center gap-1">
                        TIF
                        <select name="" id="" className="bg-[#27272A] ml-2 px-2 py-1 text-sm" value={props.tif} onChange={(e) => { props.setTIF(e.target.value) }}>
                            <option value="GTC">GTC</option>
                            <option value="IOC">IOC</option>
                            <option value="ALO">ALO</option>
                        </select>
                    </label>
                )}
            </div>
        </>
    )
}