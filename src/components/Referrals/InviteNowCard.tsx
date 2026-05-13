import { CardRow } from "../portfolio/CardRow";
import { useState } from "react";

export const InviteNowCard = () => {
  const referralCode = "ABC123";
  const referralLink = "https://yourapp.com/ref/ABC123";

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="bg-[#FFFFFF]/8 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#2A2A32] px-6 py-5">
        <div className="font-medium text-[20px]">Invite now</div>

        <button className="text-[16px] text-white border px-4 py-2 rounded-xl border-[#37373C] flex items-center gap-1">
          Connect wallet
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-4">

        {/* 1. Rewards */}
        <CardRow label="You receive - Your invitee receive -" value="--" />

        {/* 2. Referral Code */}
        <div className="flex items-center justify-between text-sm ">
          <div className="text-gray-300">Referral code</div>

          <div className="flex items-center gap-2">
            <span className="text-white">{referralCode}</span>
            <button
              onClick={() => handleCopy(referralCode, "code")}
              className="text-xs px-3 py-1 border border-[#37373C] rounded-md hover:bg-white/10"
            >
              {copied === "code" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* 3. Referral Link */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-300">Referral link</div>

          <div className="flex items-center gap-2 max-w-[60%]">
            <span className="text-white truncate">{referralLink}</span>
            <button
              onClick={() => handleCopy(referralLink, "link")}
              className="text-xs px-3 py-1 border border-[#37373C] rounded-md hover:bg-white/10"
            >
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
