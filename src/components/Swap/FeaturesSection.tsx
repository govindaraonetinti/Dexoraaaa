import { CheckCircle } from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="max-w-270 mx-auto mt-12 text-white space-y-18">

      {/* What It Does */}
      <div className="">
        <h2 className="text-2xl font-bold mb-4">What It Does</h2>

        <ul className="space-y-3">
          <FeatureItem text="Aggregates liquidity across multiple chains and protocols for seamless swaps and bridges." />
          <FeatureItem text="Intelligent routing finds the best paths to minimize slippage and maximize efficiency." />
          <FeatureItem text="Instant, wallet-native execution—no deposits, withdrawals, or waiting periods required." />
        </ul>
      </div>

      {/* What Makes It Different */}
      <div className="">
        <h2 className="text-2xl font-bold mb-4">What Makes It Different</h2>

        <ul className="space-y-3">
          <FeatureItem text="Cross-Chain Convenience: Easily move assets across different blockchains with minimal steps." />
          <FeatureItem text="Best-Price Execution: Swap or bridge assets at the most competitive rates automatically." />
          <FeatureItem text="Instant Settlement: Transfers and swaps complete without leaving your wallet." />
          <FeatureItem text="Unified Platform: Manage, swap, and bridge your assets in one intuitive interface." />
        </ul>
      </div>

    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-white-500 mt-1" />
      <span className="text-gray-300 leading-relaxed">{text}</span>
    </li>
  );
}