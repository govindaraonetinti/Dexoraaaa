import { useEffect, useRef, useState } from "react";

type SliderProps = {
    value: number;
    onChange: (value: number) => void;
};

export function Slider({ value, onChange }: SliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const clamp = (v: number) => Math.max(0, Math.min(100, v));

    const updateValueFromPointer = (clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = ((clientX - rect.left) / rect.width) * 100;
        onChange(Math.round(clamp(percent)));
    };

    const onPointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        trackRef.current?.setPointerCapture(e.pointerId);
        setDragging(true);
        updateValueFromPointer(e.clientX);
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        updateValueFromPointer(e.clientX);
    };

    const onPointerUp = (e: PointerEvent) => {
        setDragging(false);
        trackRef.current?.releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        if (!dragging) return;

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [dragging]);

    const clampedValue = clamp(value);

    const transitionClass = dragging
        ? "transition-none"
        : "transition-[width,left] duration-200 ease-out";

    return (
        <div className="w-full select-none">
            {/* Value */}
            <div className="mb-1 text-xs text-end text-gray-400">
                {clampedValue}%
            </div>

            {/* Track */}
            <div
                ref={trackRef}
                className="relative h-2 rounded-full bg-[#2b2b2b] cursor-pointer touch-none"
                onPointerDown={onPointerDown}
            >
                {/* Fill */}
                <div
                    className={`absolute h-full bg-white rounded-full ${transitionClass}`}
                    style={{ width: `${clampedValue}%` }}
                />

                {/* Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#2bc287a1] shadow cursor-pointer flex items-center justify-center
               hover:scale-112 active:scale-112 active:shadow-[0_0_1px_1px_#2BC287] hover:shadow-[0_0_1px_1px_#2BC287] focus:ring-8 focus:ring-blue-500 transition"
                    style={{
                        left: `min(100%, max(0%, ${clampedValue - 5}%))`
                    }}

                >
                    <span className="w-3 h-3 block bg-white relative z-99 rounded-full"></span>
                </div>

            </div>

            {/* Presets */}
            <ul className="mt-2 flex justify-between text-xs">
                {[0, 25, 50, 75, 100].map((p) => (
                    <li
                        key={p}
                        onClick={() => onChange(p)}
                        className={`cursor-pointer ${clampedValue >= p ? "text-white" : "text-gray-400"
                            }`}
                    >
                        {p}%
                    </li>
                ))}
            </ul>
        </div>
    );
}


