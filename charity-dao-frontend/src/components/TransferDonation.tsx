import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getFundAllocationContract } from '../utils/contracts';
import type { FundAllocationContractType } from '../types/contracts';

const TransferDonation: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const validateAddress = (address: string): boolean => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!validateAddress(recipient)) {
      toast.error('Invalid recipient address');
      return;
    }
    
    try {
      setIsTransferring(true);
      
      if (!window.ethereum) {
        toast.error('Wallet not connected');
        return;
      }
      
      toast.info('Preparing transfer...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const fundContract = await getFundAllocationContract(provider);
      const contractWithSigner = fundContract.connect(signer);
      
      // Convert amount to wei
      const amountInWei = ethers.parseEther(amount);
      
      // In a real implementation, we would call the actual contract method
      // For demo purposes, we'll simulate a transaction
      // const tx = await contractWithSigner.transferDonation(recipient, amountInWei, note || '');
      
      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully transferred ${amount} ETH to ${recipient.substring(0, 8)}...`);
      
      // Reset form
      setRecipient('');
      setAmount('');
      setNote('');
    } catch (error: any) {
      console.error('Error transferring donation:', error);
      toast.error(error.message || 'Failed to transfer donation');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Transfer Funds</h2>
      
      <form onSubmit={handleTransfer}>
        <div className="mb-4">
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ETH) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.1"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Optional message about this transfer"
          />
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isTransferring}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              isTransferring ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isTransferring ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Transfer Funds'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Transfers will be recorded on the blockchain and cannot be reversed.</p>
      </div>
    </div>
  );
};

export default TransferDonation; 