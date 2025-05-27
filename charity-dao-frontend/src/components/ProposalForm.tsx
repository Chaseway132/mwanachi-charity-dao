import React, { useState } from 'react';
import { useProposals } from '../contexts/ProposalContext';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';
import { safeToast } from '../utils/toast';

const ProposalForm: React.FC = () => {
  const { refreshProposals } = useProposals();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !recipient) {
      safeToast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(signer);

      const amountWei = ethers.parseEther(amount);
      const tx = await proposalContract.createProposal(
        description,
        amountWei,
        recipient
      );

      await tx.wait();
      safeToast.success('Proposal created successfully');
      refreshProposals();
      
      // Reset form
      setDescription('');
      setAmount('');
      setRecipient('');
    } catch (error) {
      console.error('Error creating proposal:', error);
      safeToast.error('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="proposal-form">
      <h2>Create New Proposal</h2>
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">Amount (ETH):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="recipient">Recipient Address:</label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Proposal'}
      </button>
    </form>
  );
};

export default ProposalForm; 