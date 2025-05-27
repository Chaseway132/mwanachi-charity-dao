import { ethers, BrowserProvider } from 'ethers';
import type { Proposal, ProposalWithDetails, VotingGovernanceContractType, ProposalManagementContractType } from '../types/contracts';

export interface ContractError extends Error {
  code?: string;
  reason?: string;
  transaction?: any;
}

// Proposal related interactions
export function getProposals(): Promise<ProposalWithDetails[]>;

// Voting related interactions
export function castVote(
  proposalId: bigint,
  provider?: BrowserProvider
): Promise<ethers.TransactionReceipt | null>;

export function hasVoted(proposalId: number, address: string): Promise<boolean>;

// Stakeholder related interactions
export function checkStakeholderStatus(address: string): Promise<{
  donationAmount: string;
  isStakeholder: boolean;
}>;

// Error handling utility
export function handleContractError(error: ContractError): string;

// Contract utility functions
export function getVotingContract(provider: ethers.Provider): Promise<VotingGovernanceContractType>;
export function fetchProposals(): Promise<Proposal[]>;
export function fetchProposal(proposalId: bigint): Promise<Proposal>;
export function signProposal(proposalId: bigint): Promise<void>;
export function executeProposal(proposalId: bigint): Promise<void>;
export function canExecuteProposal(proposalId: bigint): Promise<boolean>;
export function getRemainingExecutionDelay(proposalId: bigint): Promise<bigint>;
