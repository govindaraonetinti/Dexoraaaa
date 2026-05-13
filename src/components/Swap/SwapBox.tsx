import React from "react";
import { CustomDropdown } from "./CustomDropdown";
import type { ChainsData } from "../../lib/hooks/Lifi/useLifiChains";
import type { TokenData } from "../../lib/hooks/Lifi/useLifiTokens";
import type { TokenBalance } from "../../lib/hooks/Lifi/getLifiBalances";

interface Props {
  chains: ChainsData[],
  label: string;
  amount?: string;
  currency: TokenData | null;
  fromCurrency: TokenData | null;
  toCurrency: TokenData | null;
  tokens: TokenData[];
  // onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrencyChange: (token: TokenData) => void;
  balances: TokenBalance[] | null
}

export const SwapAmountBox: React.FC<Props> = ({
  chains,
  label,
  currency,
  fromCurrency,
  toCurrency,
  tokens,
  onCurrencyChange,
  balances
}) => {
  return (
    <div className="mb-4">
      <div className="border-2 border-[#2a2a32] rounded-lg px-5 py-4">

        <div className="">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-white/75 font-semibold mb-2">{label}</label>
            </div>
            <div className="max-w-full">
              <CustomDropdown
                chains={chains}
                tokens={tokens} // you can pass currencies here or from parent
                currency={currency ?? null}
                fromCurrency={fromCurrency ?? null}
                toCurrency={toCurrency ?? null}
                onChange={onCurrencyChange}
                balances={balances}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
