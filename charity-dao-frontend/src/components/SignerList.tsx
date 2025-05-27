import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';

const SignerList: React.FC = () => {
  const [signers, setSigners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [newSignerAddress, setNewSignerAddress] = useState('');

  useEffect(() => {
    loadSigners();
  }, []);

  const loadSigners = async () => {
    try {
      setIsLoading(true);
      const provider = await getProvider();
      const proposalContract = await getProposalManagementContract(provider);

      // Get owner address
      const ownerAddress = await proposalContract.owner();

      // Get actual signers from contract
      const signerList = await proposalContract.getAuthorizedSigners();

      // Filter out zero address
      let filteredSigners = signerList.filter((addr: string) =>
        addr && addr !== '0x0000000000000000000000000000000000000000'
      );

      // Check if owner is a signer (they should be by default)
      const isOwnerSigner = await proposalContract.isAuthorizedSigner(ownerAddress);

      // Check if owner is already in the list
      const ownerInList = filteredSigners.some(
        (addr: string) => addr.toLowerCase() === ownerAddress.toLowerCase()
      );

      // If owner is a signer but not in the list, add them
      if (isOwnerSigner && !ownerInList) {
        console.log('Owner is a signer but not in the list, adding them');
        filteredSigners = [ownerAddress, ...filteredSigners];
      }

      setSigners(filteredSigners);

      // Check if current user is owner
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsOwner(accounts[0].toLowerCase() === ownerAddress.toLowerCase());
        }
      }
    } catch (error) {
      console.error('Failed to load signers:', error);
      toast.error('Failed to load signers');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const addSigner = async () => {
    if (!ethers.isAddress(newSignerAddress)) {
      toast.error('Invalid address format');
      return;
    }

    try {
      if (!window.ethereum) {
        toast.error('Wallet not connected');
        return;
      }

      toast.info('Adding new signer...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(provider);
      const contractWithSigner = proposalContract.connect(signer);

      const tx = await contractWithSigner.addSigner(newSignerAddress);
      await tx.wait();

      setNewSignerAddress('');
      await loadSigners();
      toast.success('Signer added successfully');
    } catch (error: any) {
      console.error('Error adding signer:', error);
      toast.error(error.message || 'Failed to add signer');
    }
  };

  const removeSigner = async (address: string) => {
    try {
      if (!window.ethereum) {
        toast.error('Wallet not connected');
        return;
      }

      toast.info('Removing signer...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(provider);
      const contractWithSigner = proposalContract.connect(signer);

      const tx = await contractWithSigner.removeSigner(address);
      await tx.wait();

      await loadSigners();
      toast.success('Signer removed successfully');
    } catch (error: any) {
      console.error('Error removing signer:', error);
      toast.error(error.message || 'Failed to remove signer');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Authorized Signers</h2>
        {isOwner && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSignerAddress}
              onChange={(e) => setNewSignerAddress(e.target.value)}
              placeholder="Enter signer address"
              className="px-3 py-1 text-sm border rounded-md"
            />
            <button
              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              onClick={addSigner}
            >
              Add Signer
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : signers.length === 0 ? (
        <p className="text-gray-500 py-4">No signers found</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {signers.map((address, index) => (
            <li key={address} className="py-3 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-900">Signer #{index + 1}</span>
                <p className="text-sm text-gray-500">{formatAddress(address)}</p>
              </div>
              {isOwner && address.toLowerCase() !== (window.ethereum?.selectedAddress || '').toLowerCase() && (
                <button
                  onClick={() => removeSigner(address)}
                  className="ml-4 text-sm text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>Signers are responsible for approving proposals once they have received sufficient votes.</p>
      </div>
    </div>
  );
};

export default SignerList;