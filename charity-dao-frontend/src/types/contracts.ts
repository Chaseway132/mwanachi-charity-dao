import { BaseContract, BigNumberish, ContractTransactionResponse } from 'ethers';
import { ethers } from 'ethers';

export interface Proposal {
  id: bigint;
  proposer: string;
  description: string;
  recipient: string;
  amount: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  executed: boolean;
  cancelled: boolean;
  creationTime: bigint;
  executionTime: bigint;
}

export interface ProposalWithDetails extends Omit<Proposal, 'amount' | 'votesFor' | 'votesAgainst' | 'creationTime'> {
  amount: string;
  votesFor: string;
  votesAgainst: string;
  creationTime: number;
  status?: string;
}

export interface VotingGovernanceContractType extends ethers.BaseContract {
  voteOnProposal(proposalId: bigint, overrides?: ethers.Overrides): Promise<ethers.ContractTransactionResponse>;
  approveProposal(proposalId: bigint): Promise<ethers.ContractTransactionResponse>;
  executeProposal(proposalId: bigint): Promise<ethers.ContractTransactionResponse>;
  getProposalById(proposalId: bigint): Promise<Proposal>;
  getProposals(): Promise<Proposal[]>;
  getProposal(proposalId: bigint): Promise<Proposal>;
  signProposal(proposalId: bigint): Promise<ethers.ContractTransactionResponse>;
  canExecute(proposalId: bigint): Promise<boolean>;
  getRemainingExecutionDelay(proposalId: bigint): Promise<bigint>;
  hasVoted(proposalId: bigint, voter: string): Promise<boolean>;
  owner(): Promise<string>;
  
  // Contract state variables
  proposalContract(): Promise<string>;
  donationContract(): Promise<string>;
  MIN_VOTES_FOR_APPROVAL(): Promise<bigint>;
  hasUserVoted(proposalId: bigint, voter: string): Promise<boolean>;
  getMinVotesForApproval(): Promise<bigint>;
}

export interface FundAllocationContractType extends BaseContract {
  allocateFunds(recipient: string, amount: bigint): Promise<ContractTransactionResponse>;
  getBalance(): Promise<bigint>;
}

export interface ProposalManagementContractType extends BaseContract {
  createProposal(description: string, amountRequested: bigint, recipient: string): Promise<ContractTransactionResponse>;
  getAllProposals(): Promise<Proposal[]>;
  getProposalById(proposalId: bigint): Promise<Proposal>;
  hasVoted(proposalId: bigint, voter: string): Promise<boolean>;
  incrementVoteCount(proposalId: bigint): Promise<ContractTransactionResponse>;
  signProposal(proposalId: bigint): Promise<ContractTransactionResponse>;
  hasSignedProposal(proposalId: bigint, signer: string): Promise<boolean>;
  isAuthorizedSigner(address: string): Promise<boolean>;
  canBeExecuted(proposalId: bigint): Promise<boolean>;
  getRemainingExecutionDelay(proposalId: bigint): Promise<bigint>;
  isApproved(proposalId: bigint): Promise<boolean>;
  hasRequiredSignatures(proposalId: bigint): Promise<boolean>;
  owner(): Promise<string>;
} 