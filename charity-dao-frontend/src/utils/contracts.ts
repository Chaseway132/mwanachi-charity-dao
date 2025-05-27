import { ethers, Provider } from 'ethers';
import {
  PROPOSAL_MANAGEMENT,
  DONATION_TRACKING,
  VOTING_GOVERNANCE,
  FUND_ALLOCATION,
  CHARITY_DAO_PLATFORM,
  VOTING_GOVERNANCE_ABI
} from '../config/contracts';
import { toast } from 'react-toastify';
import type {
  Proposal,
  VotingGovernanceContractType,
  FundAllocationContractType,
  ProposalManagementContractType
} from '../types/contracts';

// Contract ABIs
import ProposalManagementABI from '../config/ProposalManagement.json';
import DonationTrackingABI from '../config/DonationTracking.json';
import VotingGovernanceABI from '../config/VotingGovernance.json';
import FundAllocationABI from '../config/FundAllocation.json';
import CharityDAOPlatformABI from '../config/CharityDAOPlatform.json';

// Export contract addresses
export {
  PROPOSAL_MANAGEMENT,
  DONATION_TRACKING,
  VOTING_GOVERNANCE,
  FUND_ALLOCATION,
  CHARITY_DAO_PLATFORM
};

// Export contract ABIs
export {
  ProposalManagementABI,
  DonationTrackingABI,
  VotingGovernanceABI,
  FundAllocationABI,
  CharityDAOPlatformABI
};

// Define contract interfaces
export interface CharityDAOPlatformContract {
  donate: (options: { value: bigint }) => Promise<ethers.ContractTransactionResponse>;
  getAllProposals: () => Promise<any[]>;
  getAllDonations: () => Promise<any[]>;
  createProposal: (description: string, amount: bigint, recipient: string) => Promise<ethers.ContractTransactionResponse>;
  voteOnProposal: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  approveProposal: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  executeProposal: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  owner: () => Promise<string>;
  connect: (signer: any) => CharityDAOPlatformContract;
  target: string;
  interface?: ethers.Interface;
}

export interface ProposalManagementContract {
  createProposal: (description: string, amount: bigint, recipient: string) => Promise<ethers.ContractTransactionResponse>;
  getAllProposals: () => Promise<any[]>;
  markProposalApproved: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  markProposalExecuted: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  incrementVoteCount: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  owner: () => Promise<string>;
  connect: (signer: any) => ProposalManagementContract & ethers.Contract;
  interface?: ethers.Interface;

  // Core functions
  hasVoted: (proposalId: bigint, voterAddress: string) => Promise<boolean>;
  getProposalById: (proposalId: bigint) => Promise<any>;
  getProposalCount: () => Promise<bigint>;

  // Additional required functions
  setVotingGovernanceContract: (address: string) => Promise<ethers.ContractTransactionResponse>;
  addSigner: (address: string) => Promise<ethers.ContractTransactionResponse>;
  signerCount: () => Promise<bigint>;
  votingGovernanceContract: () => Promise<string>;
  getProposal: (index: number) => Promise<any>;
}

export interface DonationTrackingContract {
  donate: (options: { value: bigint }) => Promise<ethers.ContractTransactionResponse>;
  getAllDonations: () => Promise<any[]>;
  isStakeholder: (address: string) => Promise<boolean>;
  donations: (address: string) => Promise<bigint>;
  donationCount: () => Promise<bigint>;
}

export interface VotingGovernanceContract {
  voteOnProposal: (proposalId: bigint, overrides?: ethers.Overrides) => Promise<ethers.ContractTransactionResponse>;
  approveProposal: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  hasVoted: (proposalId: bigint, voterAddress: string) => Promise<boolean>;
  connect: (signer: any) => VotingGovernanceContract & ethers.Contract;
  interface?: ethers.Interface;
  target: string;
}

export interface FundAllocationContract {
  executeProposal: (proposalId: bigint) => Promise<ethers.ContractTransactionResponse>;
  allocateFunds: (recipient: string, amount: bigint) => Promise<ethers.ContractTransactionResponse>;
  getFundBalance: () => Promise<bigint>;
  getBalance: () => Promise<bigint>;
  owner: () => Promise<string>;
  platformContract: () => Promise<string>;
  setPlatformContract: (platformAddress: string) => Promise<ethers.ContractTransactionResponse>;
  connect: (signer: any) => FundAllocationContract & ethers.Contract;
  interface?: ethers.Interface;
}

// Reset all contract instances
interface ContractCache {
  [key: string]: ethers.Contract;
}

let cachedContractInstances: ContractCache = {};

export const resetContractInstances = () => {
  cachedContractInstances = {};
  console.log("Reset all cached contract instances");
};

// Get fresh provider to use with contracts
const getFreshProvider = async () => {
  try {
    console.log("Getting fresh provider connection");
    // Try to use window.ethereum directly if available
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }

    // Fallback to default provider
    return ethers.getDefaultProvider();
  } catch (error) {
    console.error("Error getting fresh provider:", error);
    // Return null to indicate failure
    return null;
  }
};

// Get contract with caching prevention option
export const getProposalManagementContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
  const cacheKey = 'proposalManagement';

  if (!cachedContractInstances[cacheKey]) {
    const { PROPOSAL_MANAGEMENT } = await import('../config/contracts');
    const ProposalManagementABI = await import('../config/ProposalManagement.json');

    // Try to get a fresh provider
    const freshProvider = await getFreshProvider() || signerOrProvider;

    cachedContractInstances[cacheKey] = new ethers.Contract(
      PROPOSAL_MANAGEMENT,
      ProposalManagementABI.abi,
      freshProvider
    );

    console.log("Created fresh ProposalManagement contract instance");
  }

  return cachedContractInstances[cacheKey] as ethers.Contract & ProposalManagementContract;
};

// Apply similar pattern to other contract getter functions

// Helper functions to get contract instances
export const getCharityDAOPlatformContract = async (provider: ethers.Provider) => {
  const { CHARITY_DAO_PLATFORM } = await import('../config/contracts');
  const { default: CharityDAOPlatformABI } = await import('../config/CharityDAOPlatform.json');

  return new ethers.Contract(
    CHARITY_DAO_PLATFORM,
    CharityDAOPlatformABI.abi,
    provider
  ) as unknown as CharityDAOPlatformContract;
};

export const getDonationTrackingContract = async (provider: ethers.Provider, forceNew = false) => {
  // Always force a new instance for donation contract to avoid stale data
  forceNew = true;
  const cacheKey = 'donationTracking';

  if (forceNew || !cachedContractInstances[cacheKey]) {
    const { DONATION_TRACKING } = await import('../config/contracts');
    const DonationTrackingABI = await import('../config/DonationTracking.json');

    console.log("Creating new DonationTracking contract instance");
    console.log("Contract address:", DONATION_TRACKING);

    // Clear existing contract instance if any
    if (cachedContractInstances[cacheKey]) {
      console.log("Clearing existing cached contract instance");
      delete cachedContractInstances[cacheKey];
    }

    // Try to get a fresh provider for most up-to-date data
    const freshProvider = await getFreshProvider() || provider;

    // Create fresh instance
    cachedContractInstances[cacheKey] = new ethers.Contract(
      DONATION_TRACKING,
      DonationTrackingABI.abi,
      freshProvider
    );

    console.log("New contract instance created successfully");
  }

  return cachedContractInstances[cacheKey] as ethers.Contract & DonationTrackingContract;
};

export const getVotingGovernanceContract = async (provider: ethers.Provider) => {
  const { VOTING_GOVERNANCE } = await import('../config/contracts');
  const { default: VotingGovernanceABI } = await import('../config/VotingGovernance.json');

  return new ethers.Contract(
    VOTING_GOVERNANCE,
    VotingGovernanceABI.abi,
    provider
  ) as unknown as VotingGovernanceContractType;
};

export const getFundAllocationContract = async (provider: ethers.Provider) => {
  const { FUND_ALLOCATION } = await import('../config/contracts');
  const { default: FundAllocationABI } = await import('../config/FundAllocation.json');

  return new ethers.Contract(
    FUND_ALLOCATION,
    FundAllocationABI.abi,
    provider
  ) as unknown as FundAllocationContract;
};

export const getContracts = async (provider: ethers.Provider) => {
  const proposalManagement = new ethers.Contract(
    PROPOSAL_MANAGEMENT,
    ProposalManagementABI.abi,
    provider
  ) as ethers.Contract & ProposalManagementContract;

  const donationTracking = new ethers.Contract(
    DONATION_TRACKING,
    DonationTrackingABI.abi,
    provider
  ) as ethers.Contract & DonationTrackingContract;

  const votingGovernance = new ethers.Contract(
    VOTING_GOVERNANCE,
    VotingGovernanceABI.abi,
    provider
  ) as ethers.Contract & VotingGovernanceContract;

  const fundAllocation = new ethers.Contract(
    FUND_ALLOCATION,
    FundAllocationABI.abi,
    provider
  ) as ethers.Contract & FundAllocationContract;

  const charityDAOPlatform = new ethers.Contract(
    CHARITY_DAO_PLATFORM,
    CharityDAOPlatformABI.abi,
    provider
  ) as ethers.Contract & CharityDAOPlatformContract;

  return {
    proposalManagement,
    donationTracking,
    votingGovernance,
    fundAllocation,
    charityDAOPlatform
  };
};

export async function voteOnProposal(
  proposalId: bigint,
  signer: ethers.Signer
): Promise<ethers.TransactionReceipt | null> {
  try {
    const provider = signer.provider!;
    const votingContract = await getVotingGovernanceContract(provider);
    const proposalContract = await getProposalManagementContract(provider);
    const donationContract = await getDonationTrackingContract(provider);

    // Get the voter's address
    const voterAddress = await signer.getAddress();
    console.log('Attempting to vote with address:', voterAddress);

    // Check stakeholder status directly
    const isStakeholder = await donationContract.isStakeholder(voterAddress);
    console.log('Is stakeholder status:', isStakeholder);

    if (!isStakeholder) {
      throw new Error('You must be a stakeholder to vote');
    }

    // Check if user has already voted using ProposalManagement contract
    const hasVoted = await proposalContract.hasVoted(proposalId, voterAddress);
    console.log('Has already voted:', hasVoted);

    if (hasVoted) {
      throw new Error('You have already voted on this proposal');
    }

    // Get proposal details to verify it exists and is active
    const proposal = await proposalContract.getProposalById(proposalId);
    console.log('Proposal details:', proposal);

    if (proposal.approved) {
      throw new Error('Proposal is already approved');
    }

    if (proposal.executed) {
      throw new Error('Proposal is already executed');
    }

    // Connect contract with signer and properly type it
    const contractWithSigner = votingContract.connect(signer) as unknown as VotingGovernanceContractType;

    // Call voteOnProposal with a fixed gas limit
    console.log('Calling voteOnProposal with proposalId:', proposalId);
    const tx = await contractWithSigner.voteOnProposal(proposalId, {
      gasLimit: 300000 // Set a reasonable fixed gas limit
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    console.error('Error in voteOnProposal:', error);
    throw error;
  }
}

export async function executeProposal(
  proposalId: bigint,
  signer: ethers.Signer
): Promise<boolean> {
  try {
    // Get the CharityDAOPlatform contract instance
    const contract = new ethers.Contract(
      CHARITY_DAO_PLATFORM,
      CharityDAOPlatformABI.abi,
      signer
    );

    // Check if the caller is the owner
    const owner = await contract.owner();
    const signerAddress = await signer.getAddress();
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error('Only owner can execute proposals');
    }

    // Execute the proposal through the platform contract
    const tx = await contract.executeProposal(proposalId);
    await tx.wait();

    toast.success('Proposal executed successfully!');
    return true;
  } catch (error: any) {
    console.error('Error executing proposal:', error);

    // Handle specific error cases
    if (error.message.includes('execution reverted')) {
      if (error.message.includes('time lock period not completed')) {
        toast.error('Time lock period has not completed yet');
      } else if (error.message.includes('not approved')) {
        toast.error('Proposal must be approved before execution');
      } else if (error.message.includes('already executed')) {
        toast.error('Proposal has already been executed');
      } else if (error.message.includes('Insufficient contract balance')) {
        toast.error('Insufficient funds in the contract to execute the proposal');
      } else {
        toast.error('Execution failed: Make sure all conditions are met');
      }
    } else {
      toast.error(error.message || 'Failed to execute proposal');
    }

    return false;
  }
}

export async function getProposals(proposalManagementContract: ProposalManagementContract): Promise<Proposal[]> {
  try {
    const proposals = await proposalManagementContract.getAllProposals();
    return proposals.map((proposal: any) => ({
      id: proposal.id,
      proposer: proposal.proposer,
      description: proposal.description,
      recipient: proposal.recipient,
      amount: proposal.amount,
      votesFor: proposal.votesFor || BigInt(0),
      votesAgainst: proposal.votesAgainst || BigInt(0),
      executed: proposal.executed || false,
      cancelled: proposal.cancelled || false,
      creationTime: proposal.creationTime || BigInt(0),
      executionTime: proposal.executionTime || BigInt(0)
    }));
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }
}

/**
 * Advances the blockchain time by a specified number of seconds
 * @param provider The ethers provider
 * @param seconds Number of seconds to advance
 */
export const advanceTime = async (provider: ethers.BrowserProvider, seconds: number) => {
  try {
    // Increase time
    await provider.send("evm_increaseTime", [seconds]);
    // Mine a new block to apply the time change
    await provider.send("evm_mine", []);

    // Get the updated block
    const block = await provider.getBlock('latest');
    console.log(`Time advanced by ${seconds} seconds. New time:`, new Date(block!.timestamp * 1000).toLocaleString());

    return block!.timestamp;
  } catch (error) {
    console.error('Error advancing time:', error);
    throw error;
  }
};

/**
 * Sets the blockchain time to a specific timestamp
 * @param provider The ethers provider
 * @param timestamp Unix timestamp in seconds
 */
export const setTime = async (provider: ethers.BrowserProvider, timestamp: number) => {
  try {
    // Get current block
    const currentBlock = await provider.getBlock('latest');
    const currentTime = currentBlock!.timestamp;

    // Calculate the difference
    const diff = timestamp - currentTime;

    if (diff !== 0) {
      // Increase or decrease time as needed
      await provider.send("evm_increaseTime", [diff]);
      // Mine a new block to apply the time change
      await provider.send("evm_mine", []);
    }

    // Get the updated block
    const block = await provider.getBlock('latest');
    console.log(`Time set to:`, new Date(block!.timestamp * 1000).toLocaleString());

    return block!.timestamp;
  } catch (error) {
    console.error('Error setting time:', error);
    throw error;
  }
};

const PROPOSAL_MANAGEMENT_ADDRESS = process.env.REACT_APP_PROPOSAL_MANAGEMENT_ADDRESS || '';

export const formatProposal = (proposal: any) => {
  return {
    id: Number(proposal.id),
    proposer: proposal.proposer,
    description: proposal.description,
    amount: proposal.amount,
    recipient: proposal.recipient,
    votesFor: Number(proposal.votesFor),
    votesAgainst: Number(proposal.votesAgainst),
    executed: proposal.executed,
    cancelled: proposal.cancelled,
    creationTime: Number(proposal.creationTime),
    executionTime: Number(proposal.executionTime)
  };
};

export const initializeProposalManagement = async (signer: ethers.Signer) => {
  try {
    const contract = await getProposalManagementContract(signer);
    const contractWithSigner = contract.connect(signer) as unknown as ProposalManagementContract;

    // Check if already initialized – handle case where ABI lacks accessor
    let needsSet = false;
    try {
      if ('votingGovernanceContract' in contractWithSigner) {
        const votingGovernanceAddress = await (contractWithSigner as any).votingGovernanceContract();
        needsSet = votingGovernanceAddress === '0x0000000000000000000000000000000000000000';
      } else {
        console.warn('votingGovernanceContract accessor missing in ABI – skipping check');
      }
    } catch (err) {
      console.warn('Could not query votingGovernanceContract – skipping', err);
    }

    if (needsSet) {
      console.log('Setting VotingGovernance contract...');
      const tx = await contractWithSigner.setVotingGovernanceContract(VOTING_GOVERNANCE);
      await tx.wait();
      console.log('VotingGovernance contract set successfully');
    }

    // Skip adding signers since we've already deployed the contracts with the necessary signers
    console.log('Skipping signer setup - using deployed contract configuration');

    return true;
  } catch (error) {
    console.error('Error initializing ProposalManagement contract:', error);
    throw error; // Throw the error to handle it in the UI
  }
};