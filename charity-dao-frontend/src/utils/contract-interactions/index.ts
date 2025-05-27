// Re-export all functions from contractInteractions
import { 
  getProposals,
  castVote,
  hasVoted,
  checkStakeholderStatus,
  handleContractError,
  getVotingContract,
  fetchProposals,
  fetchProposal,
  signProposal,
  executeProposal,
  canExecuteProposal,
  getRemainingExecutionDelay
} from '../contractInteractions';

export {
  getProposals,
  castVote,
  hasVoted,
  checkStakeholderStatus,
  handleContractError,
  getVotingContract,
  fetchProposals,
  fetchProposal,
  signProposal,
  executeProposal,
  canExecuteProposal,
  getRemainingExecutionDelay
};
