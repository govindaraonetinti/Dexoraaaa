import axios from 'axios';
import type { MetaMaskProvider } from '../DepositForm';
import { createWalletClient, custom } from 'viem';
import { arbitrum } from 'viem/chains';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { baseUrl, infoUrl, MAX_FEE_RATE, middlemanAddress, toastinfo } from '../../../utils';
export const handleApprove = async () => {

    const provider = new ethers.BrowserProvider(window.ethereum as MetaMaskProvider);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    if (!window.ethereum || !userAddress) {
        // console.log('Please connect your wallet.');
        return false;
    }
    try {
        const response = await axios.post(infoUrl, { "type": "maxBuilderFee", "user": userAddress, "builder": middlemanAddress });
        // console.log('Builder fee:', response.data);
        if (response.data < MAX_FEE_RATE) {
            // console.log(`Requesting approval for a max fee of ${MAX_FEE_RATE / 100}%...`);
            const { ExchangeClient, HttpTransport } = await import('@nktkas/hyperliquid');
            // 1. Create a proper viem wallet client
            const walletClient = createWalletClient({
                account: userAddress as `0x${string}`,
                chain: arbitrum,
                transport: custom(window.ethereum as MetaMaskProvider),
            });
            // 2. Create Hyperliquid client with the wallet client
            const client = new ExchangeClient({
                transport: new HttpTransport({
                    apiUrl: baseUrl
                }),
                wallet: walletClient
            });
            const approvalAction = { type: 'ApproveBuilderFee', builder: middlemanAddress, maxFeeRate: (MAX_FEE_RATE / 100) + "%" };
            const response = await client.approveBuilderFee(approvalAction);
            if (response && response.response) {
                // console.log('✅ Success! Tx Hash: ', response.response);
                return true;
            } else {
                toast.error('Approval failed: ' + response);
                // console.log(`Approval failed: ${response || 'Check console.'}`);
                return false;
            }
        } else {
            return true;
        }
    } catch (error) {
        toastinfo(`Error: ${error}`);
        console.error('Error getting Builder fee :', error);
        return false;
    }
};

export const getUserAgents = async (address: string, agentAddress: string) => {
    try {
        const response = await axios.post(infoUrl, { type: 'extraAgents', user: address });
        const data = response.data.filter((item: any) => item.address.toLowerCase() === agentAddress.toLowerCase());
        // console.log(data);
        return data;
    } catch (err) {
        if (err instanceof Error)
            console.error('Error fetching user trades:', err.message);
        throw err;
    }
};