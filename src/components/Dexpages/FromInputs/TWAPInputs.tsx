import useNumberOnly from "../../../lib/hooks/useNUmberOnly";

type TWAPProps = {
    hours: string;
    minutes: string;
    setHours: (v: string) => void;
    setMinutes: (v: string) => void;
    errors: { [k: string]: string };
    touched: { [k: string]: boolean };
    setTouched: (t: { [k: string]: boolean }) => void;
};

export function TWAPInputs({ hours, minutes, setHours, setMinutes, errors, touched, setTouched }: TWAPProps) {
    const showError = (f: string) => touched[f] && !!errors[f];
    const numNoDecimalsOnly = useNumberOnly({ decimals: false })
    return (
        <div className="w-full max-w-md space-y-3">
            <p className="text-gray-400 m-0">Running Time (5m - 24h)</p>
            <div className="grid grid-cols-2 items-center gap-3">
                <div className="w-full">
                    <input {...numNoDecimalsOnly}
                        type="text"
                        placeholder="Hour(s)"
                        className={`flex-1 bg-[#27272A] w-full text-white text-sm px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none ${showError("twapHours") ? "ring-1 ring-red-500" : ""
                            }`}
                        value={hours}
                        onChange={(e) => { setHours(e.target.value); setTouched({ ...touched, twapHours: true }) }}
                        onBlur={() => setTouched({ ...touched, twapHours: true })}
                    />
                </div>

                <div className="w-full">
                    <input {...numNoDecimalsOnly}
                        type="text"
                        placeholder="Minutes"
                        className={`flex-1 bg-[#27272A] w-full text-white text-sm px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none ${showError("twapMinutes") ? "ring-1 ring-red-500" : ""
                            }`}
                        value={minutes}
                        onChange={(e) => { setMinutes(e.target.value); setTouched({ ...touched, twapMinutes: true }) }}
                        onBlur={() => setTouched({ ...touched, twapMinutes: true })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-3">
                <div className="w-full">
                    {touched.twapHours && errors.twapHours && <p className="text-red-500 relative -top-2 text-xs">{errors.twapHours}</p>}
                </div>

                <div className="w-full">
                    {touched.twapMinutes && errors.twapMinutes && <p className="text-red-500 relative -top-2 text-xs">{errors.twapMinutes}</p>}
                    {touched.twapHours && touched.twapMinutes && errors.twapRuntime && <p className="text-red-500 relative -top-2 text-xs">{errors.twapRuntime}</p>}
                </div>
            </div>






        </div>
    );
}
