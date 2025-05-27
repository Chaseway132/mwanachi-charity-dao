import React, { useState } from 'react';
import { useProposals } from '../contexts/ProposalContext';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';
import { safeToast } from '../utils/toast';

interface ProposalVotingProps {
  proposalId: number;
}

const ProposalVoting: React.FC<ProposalVotingProps> = ({ proposalId }) => {
  const { refreshProposals } = useProposals();
  const [loading, setLoading] = useState(false);

  const handleVote = async (support: boolean) => {
    try {
      setLoading(true);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(signer);

      const tx = await proposalContract.castVote(proposalId, support);
      await tx.wait();
      
      safeToast.success(`Vote ${support ? 'for' : 'against'} cast successfully`);
      refreshProposals();
    } catch (error) {
      console.error('Error casting vote:', error);
      safeToast.error('Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proposal-voting">
      <h3>Cast Your Vote</h3>
      <div className="voting-buttons">
        <button
          onClick={() => handleVote(true)}
          disabled={loading}
          className="vote-for"
        >
          {loading ? 'Voting...' : 'Vote For'}
        </button>
        <button
          onClick={() => handleVote(false)}
          disabled={loading}
          className="vote-against"
        >
          {loading ? 'Voting...' : 'Vote Against'}
        </button>
      </div>
    </div>
  );
};

export default ProposalVoting; 