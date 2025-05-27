/**
 * Utilities for clearing and debugging localStorage cache
 */

// Storage keys used in the application
const VOTING_END_TIMES_KEY = 'proposal_voting_end_times';
const EXECUTION_TIMES_KEY = 'proposal_execution_times';
const BENEFICIARY_EXECUTION_TIMES_KEY = 'beneficiary_execution_times';
const DONATION_METADATA_KEY = 'donation_ipfs_mapping';
const VOTE_METADATA_KEY = 'vote_ipfs_mapping';

/**
 * Clear all voting end times from localStorage
 */
export const clearVotingEndTimes = (): void => {
  try {
    localStorage.removeItem(VOTING_END_TIMES_KEY);
    console.log('Cleared all voting end times from localStorage');
  } catch (error) {
    console.error('Error clearing voting end times:', error);
  }
};

/**
 * Reset a specific proposal's voting end time
 * Sets it to 5 minutes from now
 */
export const resetProposalVotingTime = (proposalId: number): void => {
  try {
    // Get current stored times
    const stored = localStorage.getItem(VOTING_END_TIMES_KEY);
    const endTimes = stored ? JSON.parse(stored) : {};
    
    // Set new end time (5 minutes from now)
    const now = Math.floor(Date.now() / 1000);
    endTimes[proposalId.toString()] = now + 300; // 5 minutes
    
    // Save back
    localStorage.setItem(VOTING_END_TIMES_KEY, JSON.stringify(endTimes));
    console.log(`Reset voting time for proposal ${proposalId} to 5 minutes from now`);
  } catch (error) {
    console.error('Error resetting proposal voting time:', error);
  }
};

/**
 * Display current voting end times in the console
 */
export const debugVotingEndTimes = (): void => {
  try {
    const stored = localStorage.getItem(VOTING_END_TIMES_KEY);
    const endTimes = stored ? JSON.parse(stored) : {};
    
    console.log('Current voting end times:');
    console.table(endTimes);
    
    // Also show human-readable times
    const now = Math.floor(Date.now() / 1000);
    Object.entries(endTimes).forEach(([proposalId, endTime]) => {
      const timeRemaining = Number(endTime) - now;
      const status = timeRemaining > 0 
        ? `${timeRemaining} seconds remaining` 
        : 'Ended';
      console.log(`Proposal ${proposalId}: ${status}`);
    });
  } catch (error) {
    console.error('Error debugging voting end times:', error);
  }
};

/**
 * Clear all application cache
 */
export const clearAllCache = (): void => {
  try {
    localStorage.removeItem(VOTING_END_TIMES_KEY);
    localStorage.removeItem(EXECUTION_TIMES_KEY);
    localStorage.removeItem(BENEFICIARY_EXECUTION_TIMES_KEY);
    localStorage.removeItem(DONATION_METADATA_KEY);
    localStorage.removeItem(VOTE_METADATA_KEY);
    console.log('Cleared all application cache from localStorage');
  } catch (error) {
    console.error('Error clearing application cache:', error);
  }
}; 