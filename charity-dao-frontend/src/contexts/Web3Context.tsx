import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProvider } from '../utils/web3';

interface Web3ContextType {
  address: string;
  balance: string;
  chainId: number;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(0);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = await getProvider(true);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      
      setAddress(address);
      setBalance(balance.toString());
      setChainId(Number(network.chainId));
      setConnected(true);
    } catch (error) {
      console.error('Error connecting to Web3:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress('');
    setBalance('0');
    setChainId(0);
    setConnected(false);
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address,
        balance,
        chainId,
        connected,
        connecting,
        connect,
        disconnect
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 