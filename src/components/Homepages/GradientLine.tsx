import { useId } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

export function GradientSparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  const uid = useId();
  const id = `${positive ? "pos" : "neg"}-${uid}`;

  // Placeholder while data loads
  if (!data || data.length < 2) {
    return (
      <div className="w-32 h-10 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-32">
      <svg width="0" height="0">
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="100%" stopColor={positive ? "#2BC287" : "#F74B60"} />
            <stop offset="0%" stopColor={positive ? "#000" : "#000"} />
          </linearGradient>
        </defs>
      </svg>

      <Sparklines data={data} margin={6}>
        <SparklinesLine
          style={{
            stroke: `url(#${id})`,
            strokeWidth: 3,
            fill: "none",
          }}
        />
      </Sparklines>
    </div>
  );
}