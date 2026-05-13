// @ts-nocheck
import { CardRow } from "../portfolio/CardRow";
import { useState } from "react";

export const SummaryInvitations = () => {
  const referralCode = "ABC123";
  const referralLink = "https://yourapp.com/ref/ABC123";

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="border-2 border-[#2A2A32] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#2A2A32] px-6 py-5">
        <div className="font-medium text-[20px]">Summary of invitations</div>

      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-4">

        <CardRow label="Total Volume" value="--" />
        <CardRow label="Referral rewards" value="--" />
        <CardRow label="Referred friends" value="--" />
        <CardRow label="Friends who traded" value="--" />
      </div>
    </div>
  );
};
