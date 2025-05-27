import { ethers } from 'ethers';

let provider: ethers.BrowserProvider | null = null;

export const getProvider = async (forceNew = false) => {
  if (!provider || forceNew) {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }
  }
  return provider;
};

export const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

export const getConnectedAddress = async () => {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return signer.getAddress();
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatAmount = (amount: bigint) => {
  return ethers.formatEther(amount);
};

export const parseAmount = (amount: string) => {
  return ethers.parseEther(amount);
};

export const resetProvider = () => {
  provider = null;
}; 