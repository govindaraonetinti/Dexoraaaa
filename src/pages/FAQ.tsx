"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="py-16 text-white">
            <div className="site-width-sm mx-auto px-6">

                <h1 className="h2-tag font-bold mb-6">Frequently Asked Questions</h1>
                <p className="p-tag mb-12 max-w-4xl">
                    Welcome to the ABCDEX Help Center. Find answers to the most common questions about our platform, features, and security. 
                </p>

                <div className="space-y-4">
                    {faqs.map((item, index) => (
                        <FAQItem
                            key={index}
                            index={index}
                            openIndex={openIndex}
                            setOpenIndex={setOpenIndex}
                            question={item.question}
                            answer={item.answer}
                            answer1={item.answer1}
                            list={item.list}
                            answer2={item.answer2}
                        />
                    ))}
                </div>
                <p className="p-tag mt-16">Still have questions? Join our community Discord server for real-time support.  </p>
            </div>
        </div>
    );
}

const FAQItem = ({
    question,
    answer,
    answer1,
    list,
    answer2,
    index,
    openIndex,
    setOpenIndex
}: {
    question: string;
    answer: string;
    answer1?: string,
    list?: String[],
    answer2?: string,
    index: number;
    openIndex: number | null;
    setOpenIndex: (i: number | null) => void;
}) => {

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-5 text-left"
            >
                <span className="text-lg font-medium">{question}</span>

                <motion.span
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-6 h-6" />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {openIndex === index && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -10 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                            {answer}
                        </div>
                        {answer1 &&
                            <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                                {answer1}
                            </div>}
                        {list &&
                            <ul className="px-5 pb-5 text-gray-300 leading-relaxed list-disc pl-10">
                                {list?.map((list) => {
                                    return (<li>{list}</li>)
                                })}
                            </ul>}
                        {answer2 &&
                            <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                                {answer2}
                            </div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const faqs = [
    {
        question: "What is ABCDEX?",
        answer:
            "ABCDEX is a high-performance decentralized exchange (DEX) specializing in perpetual futures trading. We combine the speed, deep liquidity, and low fees of traditional centralized exchanges with the security and self-custody of decentralized finance (DeFi). We operate on a high-speed Layer-2 network to ensure instant trade execution. ",
    },
    {
        question: "Do I need to create an account or pass KYC?",
        answer:
            " No. ABCDEX is a permissionless, non-custodial platform. You do not need to provide an email, create a password, or submit personal identification documents (KYC). To start trading, simply connect a compatible non-custodial crypto wallet (like MetaMask or Rabby).",
    },
    {
        question: "Which wallets are supported?",
        answer:
            "We support most major EVM-compatible Web3 wallets via WalletConnect, including MetaMask, Rabby, Coinbase Wallet, and Trust Wallet.",
    },
    {
        question: " Is ABCDEX available in my country?",
        answer:
            "ABCDEX is decentralized, but access to the interface may be restricted in certain jurisdictions due to local regulations (e.g., North Korea and Iran). Please review our Terms of Service to ensure you are eligible to trade.",
        answer1: " B. Trading: Perpetual Futures "
    },
    {
        question: " What are Perpetual Futures (Perps)? ",
        answer:
            "Perpetual futures are derivative contracts that allow you to speculate on the future price of an asset (like BTC or ETH) without actually owning the asset. Unlike traditional futures, they have no expiry date, so you can hold your position as long as you maintain a sufficient margin",
    },
    {
        question: "How does liquidation work? ",
        answer:
            "Trading fees include maker/taker fees and blockchain gas fees. Funding payments apply to perpetual positions depending on market conditions.",
    },
    {
        question: "Do I need to create an account?",
        answer:
            "Liquidation occurs when your margin balance falls below the required “Maintenance Margin” level due to market movements against your position. To prevent bad debt to the protocol, our smart contracts will automatically close your position.  ",
        answer1: "Tip: Always monitor your “Health Score” or “Margin Ratio” in the Positions dashboard to avoid liquidation.  "
    },
    {
        question: "What are Funding Rates?",
        answer:
            "- Funding rates are periodic payments exchanged between long and short traders. Their purpose is to keep the price of the perpetual contract close to the actual spot price of the asset.  ",
        list: [
            "If the funding rate is positive, longs pay shorts.",
            "If the funding rate is negative, shorts pay longs."
        ],
        answer2: "Funding is typically settled every hour or every 8 hours directly from your margin balance.  "
    },
    {
        question: "What collateral can I use to trade? ",
        answer:
            "- Currently, ABCDEX uses USDC (or specify your base asset) as the primary collateral for all trading pairs. You need to bridge USDC to your trading account to open positions.",

        answer1: "C. Swap, Staking & Earn "
    },
    {
        question: "How does the ‘Swap’ feature work?",
        answer:
            "- Our built-in Swap is a spot aggregator. It allows you to instantly exchange assets held in your wallet (e.g., swapping ETH for USDC) at the best available market rates. This is primarily useful for acquiring the necessary collateral to start trading futures without leaving the platform.  ",
    },
    {
        question: "What are Liquidity Vaults? ",
        answer:
            "Liquidity Vaults allow users to deposit assets (like USDC) to provide liquidity to the ABCDEX matching engine. The vault essentially acts as the counterparty to traders on the platform.  ",
        list: [
            "Benefit: Vault depositors earn a share of the trading fees generated by the platform. ",
            "Risk: Vaults carry market risk. If traders on the platform are highly profitable overall, the vault may experience temporary drawdowns (impermanent loss).  "
        ]
    },
    {
        question: "What are the benefits of Staking ABCDEX tokens? ",
        answer:
            "By staking the protocol’s native token, you become part of ecosystem governance. Stakers typically receive:",
        list: [
            "A share of the protocol revenue (Real Yield) distributed in stablecoins. ",
            "Voting rights on DAO proposals. ",
            "Potential boosts trading rewards. "
        ],
        answer2: "D. Funding & Security "
    },
    {
        question: "How do I withdraw my funds? ",

        answer: "You can withdraw your funds at any time by bridging them back from the ABCDEX L2 network to your Ethereum L1 wallet via the “Withdraw” tab in your Portfolio. Withdrawals typically take a short period to process through the secure bridge.  "
    },
    {
        question: "Is ABCDEX safe? ",

        answer: "Security is our top priority. Our smart contracts are audited by reputable third-party security firms. Furthermore, because we are non-custodial, we never hold your private keys or directly control your funds. Your assets are secured by underlying blockchain technology.  "
    },
    {
        question: "What happens if I lose my wallet or private keys? ",

        answer: "Because ABCDEX is non-custodial, we have absolutely no access to your wallet or private keys. If you lose access to your wallet, seed phrase, or private keys, your funds are lost forever. We cannot recover them for you. Please ensure you back up your seed phrase securely offline.  "
    }];


