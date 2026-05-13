import { Row } from "../AccountSummaryCard";

interface SummaryCard {
    proSelection: string;
    scaleStart: string;
    scaleEnd: string;
    marketData: any;
    constPrice: number | null;
    orderValue: string | null;
    marginRequired: string | null;
    activeTab: string;
    twapHours: string;
    twapMinutes: string;
    selectedCoin: string | null;
    toCurrency: string

}
export const SummaryCard = ({ proSelection,
    scaleStart,
    scaleEnd,
    marketData,
    constPrice,
    orderValue,
    marginRequired,
    activeTab,
    twapHours,
    twapMinutes,
    selectedCoin }: SummaryCard) => {
    return (
        <div className="space-y-1 mt-5 border-t pt-2 border-[#2A2A32]">
            {proSelection.toLowerCase() === "scale" &&
                <Row label="Start" value={scaleStart || "N/A"} />
            }
            {proSelection.toLowerCase() === "scale" &&
                <Row label="End" value={scaleEnd || "N/A"} />
            }
            {(proSelection.toLowerCase() !== "scale" && proSelection.toLowerCase() !== "twap") &&
                <Row label="Liquidation Price" value="N/A" />
            }
            {proSelection.toLowerCase() !== "twap" && marketData && constPrice && (
                <Row label="Order Value" value={orderValue ?? 'N/A'} />
            )}
            {proSelection.toLowerCase() !== "twap" &&
                <Row label="Margin Required" value={marginRequired ?? 'N/A'} />
            }
            {activeTab === "market" &&
                <Row label="Slippage" value="Est: 0% / Max: 8.00%" hiddenClass="hidden" />
            }

            {proSelection.toLowerCase() === "twap" &&
                <Row label="Frequency" value="30 seconds" />
            }
            {proSelection.toLowerCase() === "twap" &&
                <Row label="Runtime" value={`${twapHours || "0"}h ${twapMinutes || "0"}m`} />
            }
            {proSelection.toLowerCase() === "twap" &&
                <Row label="Number of Orders" value={`${Number(twapHours) * 120 + Number(twapMinutes) * 2 + 1}`} />
            }
            {proSelection.toLowerCase() === "twap" &&
                <Row label="Size per Suborder" value={`0.00000 ${selectedCoin || ""}`} />
            }
            {/* <Row label="Fees" value="0.0450% / 0.0150%" /> */}
        </div>
    )
}