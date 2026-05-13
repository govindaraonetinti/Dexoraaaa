// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { ArrowRight, Wallet, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Info, DollarSign } from 'lucide-react';

// Types
interface LiFiQuote {
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    approvalAddress: string;
    executionDuration: number;
    feeCosts: Array<{
      name: string;
      amount: string;
      token: any;
    }>;
    gasCosts: Array<{
      amount: string;
      token: any;
    }>;
  };
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    from: string;
    chainId: number;
    gasLimit: string;
  };
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: any;
    toToken: any;
  };
  toolDetails: {
    name: string;
    logoURI: string;
  };
}

interface SwapState {
  status: 'idle' | 'approving' | 'swapping' | 'bridging' | 'depositing' | 'success' | 'error';
  message: string;
  txHash?: string;
  bridgeTxHash?: string;
}

const CHAINS = {
  btc: { id: 0, name: 'Bitcoin', symbol: 'BTC', rpc: '', nativeCurrency: 'BTC' },
  eth: { id: 1, name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth.llamarpc.com', nativeCurrency: 'ETH' },
  bsc: { id: 56, name: 'BSC', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org', nativeCurrency: 'BNB' },
  arbitrum: { id: 42161, name: 'Arbitrum', symbol: 'ARB', rpc: 'https://arb1.arbitrum.io/rpc', nativeCurrency: 'ETH' }
};

// Token addresses for each chain
const TOKENS = {
  // Ethereum
  eth: {
    native: { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
    usdc: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 }
  },
  // BSC
  bsc: {
    native: { address: '0x0000000000000000000000000000000000000000', symbol: 'BNB', decimals: 18 },
    usdc: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18 }
  },
  // Arbitrum - Destination (always USDC)
  arbitrum: {
    usdc: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', decimals: 6 }
  }
};

const LIFI_API = 'https://li.quest/v1';
const HYPERLIQUID_REFERRAL = 'https://app.hyperliquid.xyz/referrals';
const HYPERLIQUID_DEPOSIT_CONTRACT = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7'; // Arbitrum
// @ts-ignore
export default function CrossChainSwapAPI() {
  const [sourceChain, setSourceChain] = useState<'eth' | 'bsc'>('eth');
  const [sourceToken, setSourceToken] = useState<'native' | 'usdc'>('native');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [quote, setQuote] = useState<LiFiQuote | null>(null);
  const [swapState, setSwapState] = useState<SwapState>({ status: 'idle', message: '' });
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState('stargate');

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        alert('Please install MetaMask to use this application');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  // Switch Network
  const switchNetwork = async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        const chain = Object.values(CHAINS).find(c => c.id === chainId);
        if (chain && chain.rpc) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpc],
              nativeCurrency: {
                name: chain.symbol,
                symbol: chain.symbol,
                decimals: 18
              }
            }],
          });
        }
      } else {
        throw error;
      }
    }
  };

  // Get LiFi Routes to USDC on Arbitrum
  const getLiFiRoutes = async (fromChain: string, fromToken: string, amount: string) => {
    const fromChainId = CHAINS[fromChain].id;
    const toChainId = CHAINS.arbitrum.id;

    const fromTokenData = fromToken === 'native'
      ? TOKENS[fromChain].native
      : TOKENS[fromChain].usdc;

    const toTokenData = TOKENS.arbitrum.usdc;

    const amountInWei = fromToken === 'usdc' && fromChain === 'bsc'
      ? (parseFloat(amount) * 1e18).toString() // BSC USDC has 18 decimals
      : (parseFloat(amount) * Math.pow(10, fromTokenData.decimals)).toString();

    const requestBody = {
      fromChainId: fromChainId,
      toChainId: toChainId,
      fromTokenAddress: fromTokenData.address,
      toTokenAddress: toTokenData.address,
      fromAmount: amountInWei,
      fromAddress: walletAddress,
      toAddress: walletAddress,
      options: {
        slippage: 0.03,
        allowBridges: [selectedBridge],
        integrator: 'hyperliquid-swap'
      }
    };

    const response = await fetch(`${LIFI_API}/advanced/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get routes');
    }
    // console.log('LiFi Routes:', response);
    const data = await response.json();
    return data.routes[0];
  };
  const processSwap = async (fromChain: string, fromToken: string, amount: string) => {
    const fromChainId = CHAINS[fromChain].id;
    const toChainId = CHAINS.arbitrum.id;
    const fromTokenData = fromToken === 'native'
      ? TOKENS[fromChain].native
      : TOKENS[fromChain].usdc;

    const toTokenData = TOKENS.arbitrum.usdc;

    const amountInWei = fromToken === 'usdc' && fromChain === 'bsc'
      ? (parseFloat(amount) * 1e18).toString() // BSC USDC has 18 decimals
      : (parseFloat(amount) * Math.pow(10, fromTokenData.decimals)).toString();
    /*
        const requestBody = {
          fromChainId: fromChainId,
          toChainId: toChainId,
          fromTokenAddress: fromTokenData.address,
          toTokenAddress: toTokenData.address,
          fromAmount: amountInWei,
          fromAddress: walletAddress,
          toAddress: walletAddress,
          options: {
            slippage: 0.03,
            allowBridges: [selectedBridge],
            integrator: 'hyperliquid-swap'
          }
        };
    
        const response = await fetch(`${LIFI_API}/advanced/routes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        */

    const params = new URLSearchParams({
      fromChain: fromChainId,
      toChain: toChainId,
      fromToken: fromTokenData.address,
      toToken: toTokenData.address,
      fromAddress: walletAddress,
      toAddress: walletAddress,
      toAmount: "10020220000",
      slippage: '0.03',
      order: 'CHEAPEST',
      // referrer: 'ABCDEX'
    });
    // console.log(`${LIFI_API}/quote/toAmount?${params}`);
    const response = await fetch(`${LIFI_API}/quote/toAmount?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get routes');
    }

    const data = await response.json();
    // console.log('LiFi Routes:', data);
    return data.estimate;
  };
  // Approve ERC20 Token
  const approveToken = async (tokenAddress: string, spenderAddress: string, amount: string) => {
    const ERC20_ABI = [
      {
        constant: false,
        inputs: [
          { name: '_spender', type: 'address' },
          { name: '_value', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function'
      }
    ];

    const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const data = window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: walletAddress,
        to: tokenAddress,
        data: `0x095ea7b3${spenderAddress.slice(2).padStart(64, '0')}${maxUint256.slice(2)}`
      }]
    });

    return data;
  };

  // Execute Swap with LiFi
  const executeSwap = async () => {
    if (!walletAddress || !amount || !quote) return;

    try {
      let quote1 = await processSwap(sourceChain, sourceToken, amount);
      // Step 1: Switch to source chain
      setSwapState({ status: 'approving', message: 'Switching to source chain...' });
      await switchNetwork(CHAINS[sourceChain].id);
      // Step 2: Approve token if needed (for USDC)
      if (sourceToken === 'usdc' && quote1.approvalAddress) {
        setSwapState({ status: 'approving', message: 'Please approve USDC spending in your wallet...' });
        const tokenAddress = TOKENS[sourceChain].usdc.address;
        await approveToken(tokenAddress, quote1.approvalAddress, amount);
        // Wait for approval confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      // Step 3: Execute transaction
      setSwapState({ status: 'swapping', message: 'Confirm transaction in your wallet...' });
      if (!quote.transactionRequest) {
        throw new Error('No transaction request available');
      }

      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: quote1.transactionRequest.to,
          data: quote1.transactionRequest.data,
          value: quote1.transactionRequest.value,
          chainId: `0x${quote1.transactionRequest.chainId.toString(16)}`
        }]
      });

      setSwapState({
        status: 'bridging',
        message: 'Transaction submitted! Bridging to Arbitrum USDC...',
        txHash: tx
      });

      // Step 4: Monitor transaction status
      await monitorLiFiTransaction(tx);

      // Step 5: Deposit USDC to Hyperliquid
      setSwapState({ status: 'depositing', message: 'Depositing USDC to Hyperliquid...' });
      await depositToDex(walletAddress, quote1.toAmount);

      setSwapState({
        status: 'success',
        message: 'Successfully bridged to USDC and deposited to Hyperliquid!',
        txHash: tx
      });

    } catch (error) {
      console.error('Swap error:', error);
      setSwapState({
        status: 'error',
        message: error.message || 'Transaction failed. Please try again.'
      });
    }
  };

  // Monitor LiFi Transaction
  const monitorLiFiTransaction = async (txHash: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      const maxAttempts = 120;
      let attempts = 0;

      const checkStatus = async () => {
        try {
          const response = await fetch(`${LIFI_API}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              txHash: txHash,
              bridge: selectedBridge,
              fromChain: CHAINS[sourceChain].id.toString(),
              toChain: CHAINS.arbitrum.id.toString()
            })
          });

          const data = await response.json();

          if (data.status === 'DONE') {
            setSwapState(prev => ({
              ...prev,
              bridgeTxHash: data.receiving?.txHash
            }));
            resolve();
          } else if (data.status === 'FAILED') {
            reject(new Error('Bridge transaction failed'));
          } else if (attempts >= maxAttempts) {
            reject(new Error('Transaction monitoring timeout'));
          } else {
            attempts++;
            setSwapState(prev => ({
              ...prev,
              message: `Bridging to Arbitrum USDC... (${data.status})`
            }));
            setTimeout(checkStatus, 5000);
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            attempts++;
            setTimeout(checkStatus, 5000);
          }
        }
      };

      checkStatus();
    });
  };

  // Deposit USDC to Hyperliquid
  const depositToDex = async (address: string, usdcAmount: string) => {
    try {
      // Switch to Arbitrum
      await switchNetwork(CHAINS.arbitrum.id);

      // Approve USDC for Hyperliquid deposit contract
      setSwapState(prev => ({
        ...prev,
        message: 'Approving USDC for Hyperliquid deposit...'
      }));

      const usdcAddress = TOKENS.arbitrum.usdc.address;
      await approveToken(usdcAddress, HYPERLIQUID_DEPOSIT_CONTRACT, usdcAmount);

      // Wait for approval
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Call Hyperliquid deposit function
      setSwapState(prev => ({
        ...prev,
        message: 'Depositing USDC to Hyperliquid...'
      }));

      // Hyperliquid deposit ABI (simplified)
      const depositData = `0xb6b55f25${address.slice(2).padStart(64, '0')}${parseInt(usdcAmount).toString(16).padStart(64, '0')}`;

      const depositTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: HYPERLIQUID_DEPOSIT_CONTRACT,
          data: depositData,
          value: '0x0'
        }]
      });

      // console.log('Hyperliquid deposit tx:', depositTx);

    } catch (error) {
      console.error('Hyperliquid deposit error:', error);
      throw new Error('Failed to deposit to Hyperliquid: ' + error.message);
    }
  };

  // Fetch quote when amount changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0 || !walletAddress) {
        setQuote(null);
        return;
      }

      setIsLoadingQuote(true);
      try {
        const quoteData = await getLiFiRoutes(sourceChain, sourceToken, amount);
        setQuote(quoteData);
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        setQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 800);
    return () => clearTimeout(debounce);
  }, [amount, sourceChain, sourceToken, walletAddress, selectedBridge]);

  const formatAmount = (wei: string, decimals: number = 6) => {
    return (parseInt(wei) / Math.pow(10, decimals)).toFixed(2);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `~${seconds}s`;
    return `~${Math.ceil(seconds / 60)}m`;
  };

  const getSourceTokenSymbol = () => {
    return sourceToken === 'native' ? CHAINS[sourceChain].nativeCurrency : 'USDC';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="text-green-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Bridge to USDC</h1>
          </div>
          <p className="text-purple-300">Convert any asset to USDC on Arbitrum • Auto-deposit to Hyperliquid</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          {/* Wallet Connection */}
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={20} />
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg mb-6 flex items-center gap-2">
                <CheckCircle size={16} />
                <span className="text-sm">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>

              {/* Bridge Selection */}
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2 block">Bridge Protocol</label>
                <select
                  value={selectedBridge}
                  onChange={(e) => setSelectedBridge(e.target.value)}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none"
                >
                  <option value="stargate">Stargate Finance (LayerZero)</option>
                  <option value="across">Across Protocol (Fastest)</option>
                  <option value="hop">Hop Exchange</option>
                  <option value="orbiter">Orbiter Finance (Best UX)</option>
                  <option value="connext">Connext</option>
                </select>
              </div>

              {/* Source Chain Selection */}
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2 block">From Chain</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['eth', 'bsc'] as const).map((chain) => (
                    <button
                      key={chain}
                      onClick={() => setSourceChain(chain)}
                      className={`py-3 rounded-xl font-medium transition-all ${sourceChain === chain
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                    >
                      {CHAINS[chain].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Token Selection */}
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2 block">From Token</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSourceToken('native')}
                    className={`py-3 rounded-xl font-medium transition-all ${sourceToken === 'native'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                  >
                    {CHAINS[sourceChain].nativeCurrency}
                  </button>
                  <button
                    onClick={() => setSourceToken('usdc')}
                    className={`py-3 rounded-xl font-medium transition-all ${sourceToken === 'usdc'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                  >
                    USDC
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2 block">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-white/5 text-white text-2xl px-4 py-4 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">
                    {getSourceTokenSymbol()}
                  </span>
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center mb-6">
                <div className="bg-green-600 p-2 rounded-full">
                  <ArrowRight className="text-white" size={24} />
                </div>
              </div>

              {/* Destination - Always USDC on Arbitrum */}
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2 block">To Token (Arbitrum)</label>
                <div className="bg-linear-to-r from-green-500/20 to-blue-500/20 px-4 py-4 rounded-xl border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-400" size={24} />
                      <span className="text-white font-medium">USDC</span>
                    </div>
                    {isLoadingQuote ? (
                      <RefreshCw className="text-green-400 animate-spin" size={20} />
                    ) : quote ? (
                      <span className="text-2xl text-white">
                        ${formatAmount(quote?.toAmount)}
                      </span>
                    ) : (
                      <span className="text-white/40">--</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              {quote && (
                <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span className="flex items-center gap-1">
                      <Info size={14} />
                      Bridge
                    </span>
                    <span className="font-medium">{quote.toolDetails?.name || selectedBridge}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Minimum USDC Received</span>
                    <span className="text-green-400">${formatAmount(quote?.toAmountMin)}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Estimated Time</span>
                    <span>{formatTime(quote.executionDuration)}</span>
                  </div>
                  {quote.gasCosts?.[0] && (
                    <div className="flex justify-between text-white/80">
                      <span>Gas Cost</span>
                      <span>{formatAmount(quote.gasCosts[0].amount, 18)} {CHAINS[sourceChain].nativeCurrency}</span>
                    </div>
                  )}
                  {quote.feeCosts?.[0] && (
                    <div className="flex justify-between text-white/80">
                      <span>Bridge Fee</span>
                      <span>{formatAmount(quote.feeCosts[0].amount, sourceToken === 'usdc' ? 6 : 18)} {getSourceTokenSymbol()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={executeSwap}
                disabled={!amount || !quote || swapState.status !== 'idle'}
                className="w-full bg-linear-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {swapState.status !== 'idle' && swapState.status !== 'success' && swapState.status !== 'error' ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    {swapState.message}
                  </>
                ) : (
                  <>
                    <DollarSign size={20} />
                    Convert to USDC & Deposit to Hyperliquid
                  </>
                )}
              </button>

              {/* Status Messages */}
              {swapState.status === 'success' && (
                <div className="mt-4 bg-green-500/20 text-green-300 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{swapState.message}</p>
                    </div>
                  </div>
                  {swapState.txHash && (
                    <a
                      href={`https://${sourceChain === 'eth' ? 'etherscan.io' : 'bscscan.com'}/tx/${swapState.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline flex items-center gap-1"
                    >
                      View Source Tx <ExternalLink size={12} />
                    </a>
                  )}
                  {swapState.bridgeTxHash && (
                    <a
                      href={`https://arbiscan.io/tx/${swapState.bridgeTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline flex items-center gap-1 mt-1"
                    >
                      View Arbitrum USDC Tx <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              {swapState.status === 'error' && (
                <div className="mt-4 bg-red-500/20 text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p>{swapState.message}</p>
                </div>
              )}

              {/* Hyperliquid Link */}
              <a
                href={HYPERLIQUID_REFERRAL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center text-purple-300 hover:text-purple-200 text-sm underline"
              >
                Open Hyperliquid Dashboard →
              </a>
            </>
          )}
        </div>

        {/* Technical Info */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 " style={{ display: "none" }}>
          <h2 className="text-xl font-bold text-white mb-4">💰 USDC Flow</h2>
          <div className="space-y-3 text-sm text-white/80">
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="font-semibold text-green-300 mb-2">✅ Complete USDC Pipeline:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Convert {getSourceTokenSymbol()} on {CHAINS[sourceChain].name} to USDC</li>
                <li>Bridge USDC to Arbitrum via LI.FI ({selectedBridge})</li>
                <li>Auto-deposit USDC to Hyperliquid contract</li>
                <li>USDC ready for trading on Hyperliquid</li>
              </ol>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="font-semibold text-green-300 mb-1">🎯 Destination:</p>
              <p>• Always receives USDC on Arbitrum</p>
              <p>• Contract: <code className="text-xs">{HYPERLIQUID_DEPOSIT_CONTRACT}</code></p>
              <p>• USDC Address: <code className="text-xs">{TOKENS.arbitrum.usdc.address}</code></p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="font-semibold text-purple-300 mb-1">🔄 Supported Sources:</p>
              <p>• ETH, USDC on Ethereum</p>
              <p>• BNB, USDC on BSC</p>
              <p>• All routes convert to USDC on Arbitrum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}