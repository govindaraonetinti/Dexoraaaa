import React, { useEffect, useState } from 'react';
import type { ChainsData } from '../../lib/hooks/Lifi/useLifiChains';
import { getChain } from './TransferCard';

interface TransactionCompletedModalProps {
    chains: ChainsData[];
    isOpen: boolean;
    onClose: () => void;
    transactionData: {
        fromToken: {
            symbol: string;
            amount: string;
            chainId: number;
            logo?: string;
        };
        toToken: {
            symbol: string;
            amount: string;
            chainId: number;
            logo?: string;
        };
        txHash?: string;
        type: 'swap' | 'bridge';
        status: 'success' | 'failed'; // Add status
        errorMessage?: string; // Optional error message
    };
}

const TransactionCompletedModal: React.FC<TransactionCompletedModalProps> = ({
    chains,
    isOpen,
    onClose,
    transactionData,
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Small delay to trigger animation
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isSuccess = transactionData.status === 'success';

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    const getExplorerUrl = (chainId: number, txHash?: string): string => {
        const explorers: { [key: number]: string } = {
            1: 'https://etherscan.io/tx/',
            137: 'https://polygonscan.com/tx/',
            56: 'https://bscscan.com/tx/',
            42161: 'https://arbiscan.io/tx/',
            10: 'https://optimistic.etherscan.io/tx/',
            8453: 'https://basescan.org/tx/',
        };
        return txHash ? `${explorers[chainId] || ''}${txHash}` : '';
    };

    return (
        <div
            className={`absolute bottom-0 left-0 z-50 flex items-end justify-center transition-all h-full w-full duration-300 m-0 backdrop-blur-[1px] bg-[#23232385] ${isAnimating ? 'bg-opacity-50' : 'bg-transparent pointer-events-none'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-w-md w-full mx-auto transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 pt-4">
                    {/* Icon - Success or Failed */}
                    <div className="flex justify-center mb-2">
                        {isSuccess ? (
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className={`text-[20px] font-bold text-center mb-2 ${isSuccess ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {isSuccess
                            ? `${transactionData.type === 'swap' ? 'Swap' : 'Bridge'} successful`
                            : `${transactionData.type === 'swap' ? 'Swap' : 'Bridge'} failed`
                        }
                    </h2>

                    {/* Success: Received Card */}
                    {isSuccess && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl px-4.5 py-3 mb-2 border border-gray-200 dark:border-gray-600">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Received
                            </p>
                            <div className="flex items-center gap-3">
                                {/* Token Logo */}
                                <div className="relative">
                                    {transactionData.toToken.logo ? (
                                        <img
                                            src={transactionData.toToken.logo}
                                            alt={transactionData.toToken.symbol}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                                            {transactionData.toToken.symbol.charAt(0)}
                                        </div>
                                    )}
                                    {/* Chain badge */}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                        <img
                                            src={getChain(chains, transactionData.toToken.chainId)?.logoURI}
                                            alt=""
                                            className="w-6 rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Amount Details */}
                                <div className="flex-1">
                                    <p className="text-[20px] font-bold text-gray-900 dark:text-white">
                                        {transactionData.toToken.amount}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ≈${transactionData.toToken.amount} • {transactionData.toToken.symbol} on{' '}
                                        {getChain(chains, transactionData.toToken.chainId)?.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Failed: Error Card */}
                    {!isSuccess && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl px-4.5 py-3 mb-2 border border-red-200 dark:border-red-800">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                                Transaction Details
                            </p>
                            <div className="flex items-start gap-3">
                                {/* From Token Logo */}
                                <div className="relative shrink-0">
                                    {transactionData.fromToken.logo ? (
                                        <img
                                            src={transactionData.fromToken.logo}
                                            alt={transactionData.fromToken.symbol}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">
                                            {transactionData.fromToken.symbol.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-800 dark:bg-gray-200 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                        <img
                                            src={getChain(chains, transactionData.fromToken.chainId)?.logoURI}
                                            alt=""
                                            className="w-6 rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                        {transactionData.fromToken.amount} {transactionData.fromToken.symbol}
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {transactionData.errorMessage || 'Transaction failed. Please try again.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isSuccess && transactionData.txHash && (

                            <a href={getExplorerUrl(transactionData.toToken.chainId, transactionData.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 text-center"
                            >
                                See details
                            </a>
                        )}

                        {!isSuccess && transactionData.txHash && (

                            <a href={getExplorerUrl(transactionData.fromToken.chainId, transactionData.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 text-center"
                            >
                                View transaction
                            </a>
                        )}

                        <button
                            onClick={handleClose}
                            className={`flex-1 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${isSuccess
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {isSuccess ? 'Done' : 'Try Again'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionCompletedModal;