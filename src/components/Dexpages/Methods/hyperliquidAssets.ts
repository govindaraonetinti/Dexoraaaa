
export interface AssetPosition {
  position: {
    notional: string;
  };
}

export interface MarginSummary {
  accountValue: string;
  unrealizedPnl: string;
  marginRatio: string;
  marginRequirement: string;
}

export interface HyperliquidAssetsResponse {
  assetPositions: AssetPosition[];
  marginSummary: MarginSummary;
}

export interface AssetsComputed {
  positions: AssetPosition[];
  accountValue: number;
  unrealizedPnl: number;
  crossMarginRatio: number;
  maintenanceMargin: number;
  crossAccountLeverage: number;
  calculatedLeverage: number;
  perpsEquity: number;
}

