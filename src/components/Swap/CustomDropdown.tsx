import { ChevronDown, DollarSign } from "lucide-react";
import Modal from "../../lib/Modal";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChainsData } from "../../lib/hooks/Lifi/useLifiChains";
import type { TokenData } from "../../lib/hooks/Lifi/useLifiTokens";
import { getChain } from "./TransferCard";
import type { TokenBalance } from "../../lib/hooks/Lifi/getLifiBalances";
import { getNumberTransformed } from "../../utils";

interface Props {
  chains: ChainsData[];
  tokens: TokenData[];
  currency: TokenData | null;
  fromCurrency: TokenData | null;
  toCurrency: TokenData | null;
  onChange: (value: TokenData) => void;
  balances?: TokenBalance[] | null
}

export const CustomDropdown: React.FC<Props> = ({
  chains,
  tokens,
  currency,
  fromCurrency,
  toCurrency,
  onChange,
  balances
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeNetwork, setActiveNetwork] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filteredTokens = useMemo(() => {
    let list = tokens.map((token) => {
      const matched = balances?.find(balance => balance.chainId == Number(token.chainId) && token.address == balance.address)
      const balance = matched ? (Number(matched.amount) / 10 ** matched.decimals) : 0
      return { ...token, balance: Number(balance) }
    }).sort((a, b) => ((b.balance * Number(b.priceUSD)) - (a.balance * Number(a.priceUSD))));

    if (activeNetwork !== null) {
      list = list.filter(t => Number(t.chainId) === activeNetwork);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        t => t.symbol?.toLowerCase().includes(q) ||
          t.name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [tokens, activeNetwork, search]);


  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center justify-between w-full gap-3 pt-2" onClick={() => setOpen(!open)}>
        <button
          className=" text-white w-full px-0 rounded-full flex items-center gap-3 min-h-10.25 "
        >
          {currency ?
            <div className="w-8 relative">
              <img src={currency?.logoURI} alt={currency?.symbol} className="w-8 rounded-full" />
              <img src={getChain(chains, Number(currency?.chainId))?.logoURI} className="w-4 inline rounded-full absolute -bottom-1 -right-1" />
            </div> :
            <div className="bg-white/15 w-8 h-8 rounded-full flex items-center justify-center">
              <DollarSign className="text-xl w-4" />
            </div>
          }
          <div className="text-start">
            <p>{currency?.symbol || "Select"}</p>
            <p className="text-sm">{currency?.network}</p>
          </div>

        </button>
        <ChevronDown
          className={`w-6 h-6 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="pb-4 text-2xl font-bold">Select Currency</h3>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search token..."
          className="w-full mb-4 px-3 py-2.5 focus:ring-0 focus:outline-0 rounded-lg bg-[#232323] text-white"
        />

        {/* 🌐 Network Filter */}
        <NetworkDropdown chains={chains} activeNetwork={activeNetwork} setActiveNetwork={setActiveNetwork} />

        {/* 🪙 Token List */}
        <div className="h-72 overflow-y-auto">
          {filteredTokens.map((token, id) => {
            const isFrom =
              Number(fromCurrency?.chainId) === Number(token.chainId) &&
              fromCurrency?.address === token.address;

            const isTo =
              Number(toCurrency?.chainId) === Number(token.chainId) &&
              toCurrency?.address === token.address;
            return (
              <div
                key={`${id}-${token.address}`} // you had {id} object inside string
                className={`px-3 py-2 flex justify-between items-center hover:bg-[#232323] rounded-lg cursor-pointer 
                ${(isFrom || isTo) ? "hidden" : ""}
                `}
                onClick={() => {
                  onChange(token);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <div className="flex gap-2 items-center">
                  <div className="w-9 relative">
                    <img src={token.logoURI} className="w-9 rounded-full" />
                    <img src={getChain(chains, Number(token.chainId))?.logoURI} className="w-4 inline rounded-full absolute -bottom-1 -right-1" />

                  </div>
                  <div>
                    <p className="text-sm">{token.name}</p>
                    <p className="text-xs">{token.symbol}</p>
                  </div>
                </div>

                {Number(token.balance) > 0 && <div className="text-right text-xs ">
                  <div>{getNumberTransformed(token.balance)}</div>
                  <div>${getNumberTransformed(Number(token.balance) * Number(token.priceUSD))}</div>
                  {/* <div>{token.network}</div> */}
                  {/* <div>{token.network}</div> */}
                </div>}
              </div>
            )
          })}

          {!filteredTokens?.length && (
            <p className="text-center text-sm opacity-50 py-6">
              No tokens found
            </p>
          )}
        </div>
      </Modal >
    </div >
  );
};



export const NetworkDropdown = ({ chains, activeNetwork, setActiveNetwork }: any) => {
  const [open, setOpen] = useState(false);

  const selectedChain =
    activeNetwork === null
      ? "All Chains"
      : chains.find((c: ChainsData) => Number(c?.chainId) === Number(activeNetwork));


  return (
    <div className="relative w-full mb-2">
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-[#232323] text-white min-h-12"
      >
        <div className="flex items-center gap-2">
          {selectedChain != 'All Chains' && <img src={selectedChain?.logoURI} alt={selectedChain?.name} className="w-8 rounded-full" />}
          <span>{selectedChain?.name || selectedChain}</span></div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-50 mt-2 w-full rounded-lg bg-[#232323] shadow-lg max-h-64 py-2 overflow-auto">
          {/* All */}
          <li
            className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-zinc-800 ${activeNetwork === null && "text-emerald-400"
              }`}
            onClick={() => {
              setActiveNetwork(null);
              setOpen(false);
            }}
          >
            <div className="grid grid-cols-2 gap-1 w-8">
              {chains?.slice(0, 4).map((chain: ChainsData) => (
                <img
                  src={chain?.logoURI}
                  className="w-3 rounded-full"
                  alt={chain?.name}
                />))}

            </div>  All Chains
          </li>

          {chains?.map((chain: ChainsData) => (
            <li
              key={chain?.chainId}
              className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-zinc-800 ${activeNetwork === String(chain?.chainId) && "text-emerald-400"
                }`}
              onClick={() => {
                setActiveNetwork(Number(chain?.chainId)); // ALWAYS number
                setOpen(false);
              }}
            >
              <img
                src={chain?.logoURI}
                className="w-8 rounded-full"
                alt={chain?.name}
              />
              {chain?.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


