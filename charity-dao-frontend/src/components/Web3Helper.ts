import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';

export const connectWallet = async (): Promise<string> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = await getProvider(true);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  // Note: There's no standard way to disconnect in Web3
  // This is a placeholder for when the user wants to disconnect
  console.log('Wallet disconnected');
};

export const getBalance = async (address: string): Promise<string> => {
  try {
    const provider = await getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

export const getNetworkInfo = async (): Promise<{chainId: number, name: string}> => {
  try {
    const provider = await getProvider();
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return { chainId: 0, name: 'unknown' };
  }
}; 