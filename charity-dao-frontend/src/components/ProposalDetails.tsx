import React from 'react';
import { ethers } from 'ethers';
import { useProposals } from '../contexts/ProposalContext';

interface ProposalDetailsProps {
  proposalId: number;
}

const ProposalDetails: React.FC<ProposalDetailsProps> = ({ proposalId }) => {
  const { proposals } = useProposals();
  const proposal = proposals.find(p => p.id === proposalId);

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>
      <div className="space-y-4">
        <div>
          <span className="font-medium">Description:</span>
          <p>{proposal.description}</p>
        </div>
        <div>
          <span className="font-medium">Amount:</span>
          <p>{ethers.formatEther(proposal.amount)} ETH</p>
        </div>
        <div>
          <span className="font-medium">Votes:</span>
          <p>For: {proposal.votesFor} | Against: {proposal.votesAgainst}</p>
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <p>
            {proposal.executed ? 'Executed' : proposal.cancelled ? 'Cancelled' : 'Active'}
          </p>
        </div>
        <div>
          <span className="font-medium">Proposer:</span>
          <p className="font-mono text-sm">{proposal.proposer}</p>
        </div>
        <div>
          <span className="font-medium">Recipient:</span>
          <p className="font-mono text-sm">{proposal.recipient}</p>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails; 