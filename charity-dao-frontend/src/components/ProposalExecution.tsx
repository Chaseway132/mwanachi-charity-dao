import React, { useState } from 'react';
import { useProposals } from '../contexts/ProposalContext';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';
import { safeToast } from '../utils/toast';

interface ProposalExecutionProps {
  proposalId: number;
}

const ProposalExecution: React.FC<ProposalExecutionProps> = ({ proposalId }) => {
  const { refreshProposals } = useProposals();
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    try {
      setLoading(true);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(signer);

      const tx = await proposalContract.executeProposal(proposalId);
      await tx.wait();
      
      safeToast.success('Proposal executed successfully');
      refreshProposals();
    } catch (error) {
      console.error('Error executing proposal:', error);
      safeToast.error('Failed to execute proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proposal-execution">
      <button
        onClick={handleExecute}
        disabled={loading}
        className="execute-button"
      >
        {loading ? 'Executing...' : 'Execute Proposal'}
      </button>
    </div>
  );
};

export default ProposalExecution; 