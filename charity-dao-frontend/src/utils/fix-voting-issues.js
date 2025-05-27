// This script fixes voting issues in the Charity DAO frontend
// Run this script to apply the fixes

// 1. Fix for "VOTING_PERIOD is not defined" error
// Add this at the beginning of ProposalList.tsx (after imports):
const VOTING_PERIOD_FIX = `
// Import VOTING_PERIOD from timelock.ts
import { 
  getVotingEndTime, 
  storeVotingEndTime, 
  calculateVotingEndTime, 
  clearAllVotingEndTimes,
  forceResetVotingEndTime,
  lockVotingTimer,
  VOTING_PERIOD  // Add this import
} from '../utils/timelock';
`;

// 2. Fix for stakeholder checking issue
// Replace the stakeholder bypass code with proper checking
const STAKEHOLDER_CHECK_FIX = `
      // Properly check if user is a stakeholder by calling the contract
      try {
        const donationContract = await getDonationTrackingContract(provider);
        const userAddress = await signer.getAddress();
        
        console.log(\`Checking if address \${userAddress} is a stakeholder...\`);
        const isUserStakeholder = await donationContract.isStakeholder(userAddress);
        
        setIsStakeholder(isUserStakeholder);
        localStorage.setItem('isStakeholder', isUserStakeholder ? 'true' : 'false');
        
        if (!isUserStakeholder) {
          toast.error("You must donate to become a stakeholder before voting");
          setVotingProposal(null);
          return;
        }
        
        console.log(\`Address \${userAddress} stakeholder status: \${isUserStakeholder}\`);
      } catch (error) {
        console.error("Error checking stakeholder status:", error);
        toast.error("Failed to verify stakeholder status");
        setVotingProposal(null);
        return;
      }
`;

console.log("Fixes prepared. Apply these changes to your ProposalList.tsx file:");
console.log("\n1. VOTING_PERIOD Fix:");
console.log(VOTING_PERIOD_FIX);
console.log("\n2. Stakeholder Check Fix:");
console.log(STAKEHOLDER_CHECK_FIX);
console.log("\nReplace the corresponding sections in your code with these fixes.");

/**
 * Utility functions to fix voting period issues
 */

import { 
  storeVotingEndTime, 
  forceResetVotingEndTime, 
  getVotingEndTime, 
  debugVotingEndTimes 
} from './timelock';

/**
 * Extends the voting period for a proposal by 5 minutes from now
 * @param {number} proposalId - The ID of the proposal
 * @returns {number} - The new voting end time
 */
export function extendVotingPeriod(proposalId) {
  const now = Math.floor(Date.now() / 1000);
  const newEndTime = now + 300; // 5 minutes
  
  // Store new end time
  storeVotingEndTime(proposalId, newEndTime);
  forceResetVotingEndTime(proposalId, now); // Use current time as creation time
  
  return newEndTime;
}

/**
 * Check if a proposal's voting period has ended
 * @param {number} proposalId - The ID of the proposal
 * @returns {boolean} - True if voting period has ended
 */
export function hasVotingPeriodEnded(proposalId) {
  const endTime = getVotingEndTime(proposalId);
  if (!endTime) return false; // If no end time, assume voting is active
  
  const now = Math.floor(Date.now() / 1000);
  return now > endTime;
}

/**
 * Debug function to print all voting times to console
 */
export function debugAllVotingTimes() {
  debugVotingEndTimes();
}
