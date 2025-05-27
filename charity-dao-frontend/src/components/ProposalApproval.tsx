import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';

const ProposalApproval: React.FC = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [pendingProposals, setPendingProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const provider = await getProvider();
        const proposalContract = await getProposalManagementContract(provider);
        
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const ownerAddress = await proposalContract.owner();
            setIsOwner(accounts[0].toLowerCase() === ownerAddress.toLowerCase());
          }
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      }
    };

    const loadPendingProposals = async () => {
      try {
        setIsLoading(true);
        const provider = await getProvider();
        const proposalContract = await getProposalManagementContract(provider);
        
        // Get all proposals and filter for pending ones
        const allProposals = await proposalContract.getAllProposals();
        
        // Filter for proposals that need approval (this logic may need adjustment based on your contract)
        const pending = allProposals.filter((p: any) => 
          !p.approved && !p.executed && p.votesFor > 0
        );
        
        setPendingProposals(pending);
      } catch (error) {
        console.error('Error loading pending proposals:', error);
        toast.error('Failed to load pending proposals');
      } finally {
        setIsLoading(false);
      }
    };

    checkOwnership();
    loadPendingProposals();
  }, []);

  const handleApprove = async (proposalId: number) => {
    try {
      if (!window.ethereum) {
        toast.error('Wallet not connected');
        return;
      }

      toast.info('Approving proposal...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(provider);
      const contractWithSigner = proposalContract.connect(signer);
      
      const tx = await contractWithSigner.approveProposal(proposalId);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      await tx.wait();
      
      toast.success('Proposal approved successfully!');
      
      // Reload pending proposals
      const allProposals = await proposalContract.getAllProposals();
      const pending = allProposals.filter((p: any) => 
        !p.approved && !p.executed && p.votesFor > 0
      );
      setPendingProposals(pending);
      
    } catch (error: any) {
      console.error('Error approving proposal:', error);
      toast.error(error.message || 'Failed to approve proposal');
    }
  };

  if (!isOwner) {
    return null; // Don't render anything if not the owner
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Approve Proposals</h2>
      
      {isLoading ? (
        <div className="flex justify-center">
          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : pendingProposals.length === 0 ? (
        <p className="text-gray-500">No pending proposals require approval</p>
      ) : (
        <div className="space-y-4">
          {pendingProposals.map((proposal: any) => (
            <div key={proposal.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Proposal #{proposal.id.toString()}</h3>
                  <p className="text-sm text-gray-600">{proposal.description}</p>
                  <p className="text-sm text-gray-600">
                    Amount: {ethers.formatEther(proposal.amount)} ETH
                  </p>
                  <p className="text-sm text-gray-600">
                    Recipient: {proposal.recipient}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Votes: {proposal.votesFor.toString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleApprove(proposal.id)}
                  className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalApproval;
