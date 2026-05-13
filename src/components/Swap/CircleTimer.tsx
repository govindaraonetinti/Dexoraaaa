import { useEffect, useState } from "react";
import { TOTAL_TIME } from "../../lib/hooks/useSwapLogic";

const SIZE = 24;
const STROKE_WIDTH = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;


export default function CircleTimer() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isHover, setIshover] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const progress =
    CIRCUMFERENCE - (timeLeft / TOTAL_TIME) * CIRCUMFERENCE;

  return (
    <div className="relative">
      <div className="relative" onMouseLeave={() => setIshover(false)} onMouseOver={() => setIshover(true)}>
        <svg width={SIZE} height={SIZE} >
          {/* Background circle */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#7a7a7a"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Progress circle */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#f3f3f3"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px]">{timeLeft}</span>
      </div>

      {isHover &&
        <div className="text-sm absolute -top-12 -translate-x-1/2 left-1/2 bg-white text-[#232323] whitespace-nowrap leading-4 px-2 py-1 rounded-md">
          <p>Quotes will update in {timeLeft === 0 ? "" : timeLeft} seconds</p>
          <p>Click here to update now</p>
        </div>}
    </div>
  );
}

