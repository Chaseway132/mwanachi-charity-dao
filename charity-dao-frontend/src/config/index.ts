import { ethers } from 'ethers';

// Network configuration
export const NETWORK_CONFIG = {
  chainId: '0x539', // Localhost
  chainName: 'Localhost 8545',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['http://127.0.0.1:8545/'],
};

// Contract configuration
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

// Provider configuration
export const getProvider = async () => {
  if (typeof window.ethereum !== 'undefined') {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No ethereum provider found');
}; 