// VotingHelper.ts - Utility functions for voting functionality
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getProvider } from '../utils/web3';
import { 
  getVotingGovernanceContract, 
  getProposalManagementContract, 
  getDonationTrackingContract 
} from '../utils/contracts';
import type { 
  VotingGovernanceContractType,
  ProposalManagementContractType
} from '../types/contracts';

/**
 * Check if a user is a stakeholder by calling the DonationTracking contract
 */
export const checkStakeholderStatus = async (userAddress: string): Promise<boolean> => {
  try {
    const provider = await getProvider();
    const donationContract = await getDonationTrackingContract(provider);
    
    console.log(`Checking if address ${userAddress} is a stakeholder...`);
    const isStakeholder = await donationContract.isStakeholder(userAddress);
    console.log(`Stakeholder check result: ${isStakeholder}`);
    
    return isStakeholder;
  } catch (error) {
    console.error('Error checking stakeholder status:', error);
    return false;
  }
};

/**
 * Check if a user has already voted on a proposal
 */
export const checkIfUserHasVoted = async (proposalId: number, userAddress: string): Promise<boolean> => {
  try {
    const provider = await getProvider();
    const proposalContract = await getProposalManagementContract(provider);
    
    const hasVoted = await proposalContract.hasVoted(BigInt(proposalId), userAddress);
    console.log(`Checking if address ${userAddress} has voted on proposal ${proposalId}: ${hasVoted}`);
    
    return hasVoted;
  } catch (error) {
    console.error(`Error checking if user has voted on proposal ${proposalId}:`, error);
    return false;
  }
};

/**
 * Submit a vote transaction with multiple fallback methods
 */
export const submitVoteTransaction = async (
  proposalId: number, 
  userAddress: string,
  support: boolean,
  pendingToastId: React.ReactText
): Promise<{success: boolean, hash?: string, receipt?: any}> => {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    
    // Get contract instances
    const votingContract = await getVotingGovernanceContract(provider);
    const donationContract = await getDonationTrackingContract(provider);
    const proposalContract = await getProposalManagementContract(provider);
    
    // Verify stakeholder status first
    const isStakeholder = await donationContract.isStakeholder(userAddress);
    if (!isStakeholder) {
      toast.error("You must be a stakeholder to vote on proposals");
      return { success: false };
    }
    
    // Check if already voted
    const hasVoted = await proposalContract.hasVoted(BigInt(proposalId), userAddress);
    if (hasVoted) {
      toast.error("You have already voted on this proposal");
      return { success: false };
    }
    
    // Get proposal details
    const proposal = await proposalContract.getProposalById(BigInt(proposalId));
    if (proposal.approved) {
      toast.error("This proposal has already been approved");
      return { success: false };
    }
    if (proposal.executed) {
      toast.error("This proposal has already been executed");
      return { success: false };
    }
    
    // Update toast
    toast.update(pendingToastId, { 
      render: "Submitting vote to blockchain...", 
      type: "info" 
    });
    
    // Connect contract with signer
    const votingContractWithSigner = (votingContract.connect(signer) as unknown) as VotingGovernanceContractType;
    
    console.log(`Calling voteOnProposal with proposalId: ${proposalId}`);
    const tx = await votingContractWithSigner.voteOnProposal(BigInt(proposalId), {
      gasLimit: 500000 // Explicitly set gas limit
    });
    
    toast.update(pendingToastId, { 
      render: "Vote submitted, waiting for confirmation...", 
      type: "info" 
    });
    
    const receipt = await tx.wait();
    
    if (receipt?.status === 1) {
      return { success: true, hash: tx.hash, receipt };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error: any) {
    console.error("Voting failed:", error);
    // Provide more specific error messages
    if (error.message?.includes("Only stakeholders can vote")) {
      toast.error("You must be a stakeholder to vote on proposals");
    } else if (error.message?.includes("Already voted")) {
      toast.error("You have already voted on this proposal");
    } else if (error.message?.includes("execution reverted")) {
      toast.error("Transaction reverted. Please check if you meet all requirements to vote.");
    } else {
      toast.error(`Voting failed: ${error.message || "Unknown error"}`);
    }
    return { success: false };
  }
};
