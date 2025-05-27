import React, { useState } from 'react';
import { toast } from 'react-toastify';

const MetaMaskTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const testMetaMask = async () => {
    setIsLoading(true);
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error("MetaMask not detected. Please install MetaMask.");
        setIsLoading(false);
        return;
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      toast.info(`Connected to account: ${accounts[0]}`);
      
      // Create a simple transaction
      const transactionParameters = {
        from: accounts[0],
        to: accounts[0], // Send to self
        value: '0x0', // 0 ETH
        data: '0x', // Empty data
        gas: '0x5208', // 21000 gas
      };
      
      toast.info("Requesting transaction approval...");
      
      // Send the transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      
      toast.success(`Transaction sent: ${txHash}`);
    } catch (error) {
      console.error("MetaMask test failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`MetaMask test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">MetaMask Test</h2>
      <p className="mb-4">Click the button below to test MetaMask integration.</p>
      <button
        onClick={testMetaMask}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isLoading ? 'Testing...' : 'Test MetaMask'}
      </button>
    </div>
  );
};

export default MetaMaskTest;
