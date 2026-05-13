import toast from "react-hot-toast";
import { integrationKey, Lifi_APIKey, toastinfo } from "../../../utils";
import { getTokenBalance } from "./getLifiBalances";

export const executeRoute = async ({
    address,
    isUserAuthenticated,
    quote,
    wallets,
    setIsSwapLoading,
    setRoutesData,
    setFromAmount, setAvlBalance, setFromCurrency, setToCurrency, navigate, setApproveStatus, setSwapStatus, setShowCompletedModal, setCompletedTxData
}: any) => {
    if (!address || !isUserAuthenticated) {
        toast.error("Please connect your wallet");
        return;
    }

    setIsSwapLoading(true);

    try {
        const injectedWallet = wallets.find(
            (w: any) => w.walletClientType !== "privy"
        );
        if (!injectedWallet) throw new Error("No injected wallet found");

        const provider = await injectedWallet.getEthereumProvider();

        // 🔁 LOOP THROUGH STEPS
        for (let i = 0; i < quote.steps.length; i++) {
            const step = quote.steps[i];

            // 1️⃣ Fetch executable tx for THIS step
            const res = await fetch("https://li.quest/v1/advanced/stepTransaction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-lifi-api-key": Lifi_APIKey
                },
                body: JSON.stringify({
                    id: step.id,
                    type: step.type,
                    route: quote,
                    stepIndex: i,
                    tool: step.tool,
                    toolDetails: step.toolDetails,
                    action: step.action,
                    estimate: step.estimate,
                    fromAddress: address,
                    integrator: integrationKey,
                    toAddress: address,
                    includedSteps: step.includedSteps
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('❌ LiFi API Error:', errorData);
                throw new Error(
                    errorData.message || `Failed to fetch tx for step ${step.id}`
                );
            }

            const data = await res.json();
            const { transactionRequest } = data;
            if (!transactionRequest) {
                throw new Error('No transaction request returned from LiFi');
            }
            // 2️⃣ Switch chain (if needed)
            const currentChainId = await provider.request({ method: 'eth_chainId' });
            const targetChainId = `0x${Number(step.action.fromChainId).toString(16)}`;

            if (currentChainId !== targetChainId) {
                console.log(`Switching from chain ${currentChainId} to ${targetChainId}...`);
                try {
                    await provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: targetChainId }],
                    });
                    console.log('✅ Chain switched successfully');
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        throw new Error(`Please add chain ${step.action.fromChainId} to your wallet`);
                    }
                    throw switchError;
                }
            }
            // 3️⃣ **CHECK NATIVE TOKEN BALANCE FOR GAS**
            console.log('🔍 Checking native token balance for gas fees...');
            const nativeBalanceHex = await provider.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            });
            const nativeBalance = BigInt(nativeBalanceHex);
            console.log('Native token balance:', nativeBalance.toString());
            // Estimate gas for the transaction
            let estimatedGas = BigInt(0);
            try {
                const gasEstimate = await provider.request({
                    method: 'eth_estimateGas',
                    params: [{
                        from: address,
                        to: transactionRequest.to,
                        data: transactionRequest.data,
                        value: transactionRequest.value || '0x0'
                    }]
                });
                estimatedGas = BigInt(gasEstimate);
                console.log('Estimated gas:', estimatedGas.toString());
            } catch (gasEstimateError) {
                console.warn('Could not estimate gas, using fallback');
                estimatedGas = BigInt(300000); // Fallback gas estimate
            }
            // Get current gas price
            const gasPriceHex = await provider.request({
                method: 'eth_gasPrice',
                params: []
            });
            const gasPrice = BigInt(gasPriceHex);
            console.log('Gas price:', gasPrice.toString());
            // Calculate total gas cost
            const estimatedGasCost = estimatedGas * gasPrice;
            console.log('Estimated gas cost:', estimatedGasCost.toString());
            // 4️⃣ **CHECK IF TOKEN IS NATIVE OR ERC20**
            const isNativeToken =
                !step.action.fromToken.address ||
                step.action.fromToken.address === '0x0000000000000000000000000000000000000000' ||
                step.action.fromToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
            console.log('Token type:', isNativeToken ? 'NATIVE' : 'ERC20');
            // 5️⃣ **VALIDATE BALANCES**
            if (isNativeToken) {
                // For native tokens: need balance for BOTH amount + gas
                const requiredAmount = BigInt(step.action.fromAmount);
                const totalRequired = requiredAmount + estimatedGasCost;
                console.log('Required amount:', requiredAmount.toString());
                console.log('Total required (amount + gas):', totalRequired.toString());
                if (nativeBalance < totalRequired) {
                    const shortfall = totalRequired - nativeBalance;
                    const shortfallInEth = Number(shortfall) / 1e18;

                    toast.error(
                        `Insufficient ${step.action.fromToken.symbol} balance. ` +
                        `You need ${shortfallInEth.toFixed(6)} more ${step.action.fromToken.symbol} for this transaction.`
                    );
                    throw new Error(
                        `Insufficient ${step.action.fromToken.symbol}. ` +
                        `Have: ${(Number(nativeBalance) / 1e18).toFixed(6)}, ` +
                        `Need: ${(Number(totalRequired) / 1e18).toFixed(6)} ` +
                        `(including gas)`
                    );
                }

                console.log('✅ Sufficient native token balance for amount + gas');
            } else {
                // For ERC20 tokens: need native balance for gas only
                if (nativeBalance < estimatedGasCost) {
                    const shortfall = estimatedGasCost - nativeBalance;
                    const shortfallInEth = Number(shortfall) / 1e18;
                    // Get chain name for better UX
                    const chainNames: { [key: string]: string } = {
                        '1': 'ETH',
                        '137': 'MATIC',
                        '56': 'BNB',
                        '42161': 'ETH',
                        '10': 'ETH',
                        '8453': 'ETH',
                    };
                    const gasTokenName = chainNames[step.action.fromChainId] || 'native token';
                    toast.error(
                        `Insufficient ${gasTokenName} for gas fees. ` +
                        `You need ${shortfallInEth.toFixed(6)} more ${gasTokenName}.`
                    );
                    throw new Error(
                        `Insufficient gas funds. ` +
                        `Have: ${(Number(nativeBalance) / 1e18).toFixed(6)} ${gasTokenName}, ` +
                        `Need: ${(Number(estimatedGasCost) / 1e18).toFixed(6)} ${gasTokenName} for gas`
                    );
                }

                // Also check ERC20 token balance
                const balanceData = `0x70a08231${address.slice(2).padStart(64, '0')}`;
                const tokenBalanceHex = await provider.request({
                    method: 'eth_call',
                    params: [{
                        to: step.action.fromToken.address,
                        data: balanceData
                    }, 'latest']
                });

                const tokenBalance = BigInt(tokenBalanceHex || '0x0');
                const requiredAmount = BigInt(step.action.fromAmount);

                console.log(`${step.action.fromToken.symbol} balance:`, tokenBalance.toString());
                console.log('Required amount:', requiredAmount.toString());

                if (tokenBalance < requiredAmount) {
                    const decimals = step.action.fromToken.decimals || 18;
                    const shortfall = requiredAmount - tokenBalance;
                    const shortfallInToken = Number(shortfall) / (10 ** decimals);

                    toast.error(
                        `Insufficient ${step.action.fromToken.symbol} balance. ` +
                        `You need ${shortfallInToken.toFixed(6)} more ${step.action.fromToken.symbol}.`
                    );
                    throw new Error(
                        `Insufficient ${step.action.fromToken.symbol}. ` +
                        `Have: ${(Number(tokenBalance) / (10 ** decimals)).toFixed(6)}, ` +
                        `Need: ${(Number(requiredAmount) / (10 ** decimals)).toFixed(6)}`
                    );
                }

                console.log('✅ Sufficient gas balance and token balance');
            }

            // 6️⃣ **HANDLE TOKEN APPROVAL (ONLY FOR ERC20 TOKENS)**
            if (!isNativeToken && step.estimate.approvalAddress) {
                console.log('🔍 Checking ERC20 token allowance...');

                const tokenAddress = step.action.fromToken.address;
                const spenderAddress = step.estimate.approvalAddress;
                const requiredAmount = BigInt(step.action.fromAmount);

                console.log('Token address:', tokenAddress);
                console.log('Spender address:', spenderAddress);
                console.log('Required amount:', requiredAmount.toString());

                try {
                    // Check current allowance first
                    const allowanceData =
                        '0xdd62ed3e' +
                        address.slice(2).padStart(64, '0') +
                        spenderAddress.slice(2).padStart(64, '0');

                    const allowanceHex = await provider.request({
                        method: 'eth_call',
                        params: [{
                            to: tokenAddress,
                            data: allowanceData
                        }, 'latest']
                    });

                    const currentAllowance = BigInt(allowanceHex || '0x0');

                    console.log('Current allowance:', currentAllowance.toString());
                    console.log('Required amount:', requiredAmount.toString());

                    // Check if approval is needed
                    if (currentAllowance < requiredAmount) {
                        console.log('⚠️ INSUFFICIENT ALLOWANCE - Approval needed!');
                        setApproveStatus('pending');
                        toastinfo(`Approving ${step.action.fromToken.symbol}... Please confirm in MetaMask.`);

                        // Request approval with exact required amount
                        const approvalAmount = requiredAmount.toString(16).padStart(64, '0');
                        const approvalData =
                            '0x095ea7b3' +
                            spenderAddress.slice(2).padStart(64, '0') +
                            approvalAmount;

                        let approvalTxHash;

                        try {
                            approvalTxHash = await provider.request({
                                method: "eth_sendTransaction",
                                params: [{
                                    from: address,
                                    to: tokenAddress,
                                    data: approvalData,
                                    value: '0x0'
                                }],
                            });

                            console.log('✅ Approval transaction sent:', approvalTxHash);
                            toastinfo('Waiting for approval confirmation...');

                            // Wait for approval to be mined
                            await waitForTransaction(provider, approvalTxHash);

                            console.log('✅ Approval confirmed!');
                            toast.success(`${step.action.fromToken.symbol} approved!`);
                            setApproveStatus('completed');
                            // Small delay to ensure blockchain state is updated
                            await new Promise(resolve => setTimeout(resolve, 2000));

                        } catch (approvalError: any) {
                            // Handle approval rejection or failure
                            console.error('Approval transaction error:', approvalError);
                            setApproveStatus('failed');
                            if (approvalError.code === 4001) {
                                // User rejected the approval
                                toast.error("Approval rejected. Cannot proceed with swap.");
                                throw new Error("Token approval rejected by user");
                            } else if (approvalError.code === -32603) {
                                // Transaction would fail
                                toast.error("Approval transaction failed. Please check your balance.");
                                throw new Error("Approval transaction failed");
                            } else {
                                // Other approval errors
                                toast.error("Failed to approve token. Cannot proceed with swap.");
                                throw approvalError;
                            }
                        }
                    } else {
                        console.log('✅ Sufficient allowance already exists');
                    }
                } catch (allowanceError: any) {
                    setApproveStatus('failed');
                    // If this is already a thrown error from approval rejection, re-throw it
                    if (allowanceError.message?.includes('rejected') ||
                        allowanceError.message?.includes('failed')) {
                        throw allowanceError;
                    }

                    console.error('Error in allowance check:', allowanceError);
                    toast.error('Failed to check token allowance. Please try again.');
                    throw new Error('Allowance check failed');
                }
            } else {
                console.log('⏭️ Skipping approval (native token or no approval needed)');
            }

            // 7️⃣ Prepare and send swap transaction
            setSwapStatus('pending');
            const txParams: any = {
                from: address,
                to: transactionRequest.to,
                data: transactionRequest.data,
                value: transactionRequest.value
                    ? toHex(transactionRequest.value)
                    : "0x0",
            };

            console.log('📤 Sending swap transaction...');
            console.log('Transaction params:', {
                to: txParams.to,
                value: txParams.value,
                dataLength: txParams.data?.length
            });

            // Simulate transaction before sending
            try {

                await provider.request({
                    method: "eth_call",
                    params: [txParams, "latest"],
                });
                console.log('✅ Simulation successful');
            } catch (simulateError: any) {
                console.error('❌ Simulation failed:', simulateError);
                setSwapStatus('failed');
                // Try to decode the revert reason
                if (simulateError.data) {
                    const reason = decodeRevertReason(simulateError.data);
                    toast.error(`Transaction would fail: ${reason}`);
                    throw new Error(`Transaction would fail: ${reason}`);
                }
                toast.error('Transaction simulation failed. Check token balance and allowance.');
                throw new Error('Transaction simulation failed. Check token balance and allowance.');
            }

            try {
                const txHash = await provider.request({
                    method: "eth_sendTransaction",
                    params: [txParams],
                });

                console.log(`✅ Step ${i + 1} transaction sent:`, txHash);
                toastinfo(`Transaction ${i + 1}/${quote.steps.length} submitted`);

                // 8️⃣ Wait for confirmation before next step
                if (i < quote.steps.length - 1) {
                    console.log('⏳ Waiting for transaction confirmation...');
                    await waitForTransaction(provider, txHash);
                    console.log('✅ Transaction confirmed, proceeding to next step');

                    // Small delay between steps
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (txError: any) {
                console.error('❌ Transaction failed:', txError);
                setSwapStatus('failed'); // ✅ SET FAILED STATUS
                throw txError;
            }
        }

        toast.success("Swap executed successfully! 🎉");

        setSwapStatus('completed');
        const txData = {
            fromToken: {
                symbol: quote.fromToken.symbol,
                amount: (Number(quote.fromAmount) / (10 ** quote.fromToken.decimals)).toFixed(6),
                chainId: Number(quote.fromChainId),
                logo: quote.fromToken.logoURI,
            },
            toToken: {
                symbol: quote.toToken.symbol,
                amount: (Number(quote.toAmount) / (10 ** quote.toToken.decimals)).toFixed(6),
                chainId: Number(quote.toChainId),
                logo: quote.toToken.logoURI,
            },
            type: quote.fromChainId === quote.toChainId ? 'swap' : 'bridge',
            status: 'success' as const,
        };
        setCompletedTxData(txData);
        setShowCompletedModal(true);
        navigate('/swap')
        setRoutesData(null);
        setFromCurrency(null);
        setToCurrency(null);
        setFromAmount('');
        getTokenBalance(
            Number(quote.fromChainId),
            setAvlBalance,
            quote.fromToken.address,
            address ?? ""
        );
    } catch (err: any) {
        console.error("❌ Route execution failed:", err);

        // Better error messages
        if (err.code === 4001) {
            toast.error("Transaction rejected by user");
        } else if (err.message?.includes('rejected')) {
            toast.error("Approval rejected by user");
        } else if (err.message?.includes('Insufficient')) {
            // Already handled with specific error message
        } else if (err.message?.includes('insufficient funds')) {
            toast.error("Insufficient funds for gas");
        } else if (err.message?.includes('exceeds allowance')) {
            toast.error("Token approval failed. Please try again.");
        } else if (err.message?.includes('execution reverted')) {
            toast.error("Transaction would fail. Check balance and try again.");
        } else {
            toast.error(err.message || "Swap failed");
        }
        throw err;
    } finally {
        setIsSwapLoading(false);
    }
};

// Helper function to wait for transaction confirmation
async function waitForTransaction(provider: any, txHash: string, maxAttempts = 90) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const receipt = await provider.request({
                method: "eth_getTransactionReceipt",
                params: [txHash],
            });

            if (receipt) {
                if (receipt.status === "0x0" || receipt.status === 0) {
                    throw new Error(`Transaction failed: ${txHash}`);
                }
                console.log('Transaction confirmed in block:', receipt.blockNumber);
                return receipt;
            }
        } catch (error: any) {
            if (error.message?.includes('Transaction failed')) {
                throw error;
            }
            // Ignore other errors and continue polling
        }

        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error("Transaction confirmation timeout");
}

// Helper function to decode revert reason
function decodeRevertReason(data: string): string {
    try {
        // Remove '0x' and 'Error(string)' selector (first 4 bytes)
        if (data.startsWith('0x08c379a0')) {
            const reason = data.slice(138); // Skip selector + offset + length
            return Buffer.from(reason, 'hex').toString('utf8').replace(/\0/g, '');
        }
        return 'Unknown error';
    } catch {
        return 'Could not decode error';
    }
}

// Helper function to convert number to hex
function toHex(value: string | number | bigint): string {
    if (typeof value === 'string' && value.startsWith('0x')) {
        return value;
    }
    return '0x' + BigInt(value).toString(16);
}