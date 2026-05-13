import { useState } from "react";
import DepositPopupForm from "./DepositForm";
import TransferModal from "../../lib/popups/TransferPopup";
import WithdrawPopupForm from "./WithdrawForm";
import { getNumberTransformed } from "../../utils";

type TabType = "deposit" | "withdraw" | "transfer";

interface RowProps {
  label: string;
  value: string;
  valueClass?: string;
  hiddenClass?: string;
}
export interface AcccountProps {
  spotEquity: number
  perpsEquity: number
  accountValue: number
  unrealizedPnl: number
  crossMarginRatio: number
  maintenanceMargin: number
  crossAccountLeverage: number,
  withdraw: (withdrawAmount: string | number, address: string|null, currency: any) => void,
  transferFunds: (payload: any) => void;
  transferPopup: boolean;
  setTransferPopup: (transferPopup: boolean) => void;
  usdcSpot: number
}
export const AccountSummaryCard = ({ props, userPositions, spotMode }: { props: AcccountProps, userPositions: any[], spotMode: string }) => {
  const [tab, setTab] = useState<TabType>("deposit");
  const [open, setOpen] = useState<boolean>(false);
  const [openWithdraw, setWithdraw] = useState<boolean>(false);


  const tabs: TabType[] = ["deposit", "withdraw", "transfer"];

  return (
    <div className=" text-white p-4 space-y-5 border border-[#232332] h-134">

      {/* Tabs */}
      <div className="flex items-center justify-between">
        {tabs?.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "deposit") {
                setOpen(!open);
              } if (t === "transfer") {
                props.setTransferPopup(!props.transferPopup);
              } if (t === "withdraw") {
                setWithdraw(!openWithdraw);
              }
            }}
            className={`cursor-pointer px-4 py-1 rounded-lg text-sm capitalize
              ${tab === t ? "border border-[#2A2A32]" : "border border-[#2A2A32]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <DepositPopupForm depositPopup={open} setDepositPopup={setOpen} />
      <WithdrawPopupForm withdrawPopup={openWithdraw} setWithdrawPopup={setWithdraw} withdraw={props.withdraw} perpsEquity={getNumberTransformed(props.accountValue - userPositions?.map((p) => p?.position?.marginUsed).reduce((a, b) => Number(a) + Number(b), 0))} />
      <TransferModal spotMode={spotMode} setTransferPopup={props.setTransferPopup} transferPopup={props.transferPopup} transferFunds={props.transferFunds} perpsEquity={getNumberTransformed(props.accountValue - userPositions?.map((p) => p?.position?.marginUsed).reduce((a, b) => Number(a) + Number(b), 0))} spotEquity={getNumberTransformed(props.usdcSpot)} />
      {/* Account Equity */}
      <div className="space-y-2">
        <div className="font-semibold">Account Equity</div>

        <Row label="Spot" value={`${getNumberTransformed(props.spotEquity)}`} />
        <Row label="Perp" value={`${getNumberTransformed(props.perpsEquity)}`} />
      </div>

      {/* Margin */}
      <div className="space-y-2">
        <div className="font-semibold">Perps Overview</div>

        <Row label="Balace" value={`${props.accountValue}`} />
        <Row label="Unrealized PNL" value={`${props.unrealizedPnl}`} />
        <Row label="Cross Margin Ratio" value={`${props.crossMarginRatio}`} />
        <Row label="Maintenance Margin" value={`${props.maintenanceMargin}`} />
        <Row label="Cross Account Leverage" value={`${props.crossAccountLeverage}`} />
      </div>
    </div>
  );
}

export function Row({ label, value, valueClass, hiddenClass }: RowProps) {
  return (
    <div className={`flex items-center justify-between text-[13px] text-[#a5a5a8] ${hiddenClass}`}>
      <span>{label}</span>
      <span className={valueClass ? valueClass : "text-white/75"}>{value}</span>
    </div>
  );
}
