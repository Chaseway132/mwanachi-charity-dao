import { ethers } from 'ethers';

let provider: ethers.BrowserProvider | null = null;

// Fallback RPC endpoints for Polygon Amoy
const FALLBACK_RPC_URLS = [
  'https://rpc-amoy.polygon.technology/',
  'https://polygon-amoy.blockpi.network/v1/rpc/public',
  'https://amoy.drpc.org',
  'https://amoy-rpc.c.multiversx.com/'
];

export const getProvider = async (forceNew = false) => {
  if (!provider || forceNew) {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      // Fallback to public RPC if MetaMask not available
      console.warn('MetaMask not found, using fallback RPC endpoint');
      provider = new ethers.JsonRpcProvider(FALLBACK_RPC_URLS[0]);
    }
  }
  return provider;
};

// Get a fallback provider if MetaMask fails
export const getFallbackProvider = () => {
  return new ethers.JsonRpcProvider(FALLBACK_RPC_URLS[0]);
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