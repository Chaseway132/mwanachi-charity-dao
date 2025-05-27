// Constants for voting periods - MUST match contract values exactly
export const VOTING_PERIOD = 240; // 4 minutes in seconds (synced with contract)
export const BUFFER_TIME = 0; // No buffer time - strictly enforce contract rules

// Storage keys for localStorage
const VOTING_END_TIMES_KEY = 'proposal_voting_end_times';
const BLOCKCHAIN_LOADED_KEY = 'proposal_blockchain_loaded';

/**
 * Get stored voting end times from localStorage
 * @returns Record of proposal IDs to voting end times, or empty object if none found
 */
export const getStoredVotingEndTimes = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(VOTING_END_TIMES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error getting stored voting end times:', error);
  }
  return {};
};

/**
 * Get proposals that have been loaded from blockchain
 * @returns Set of proposal IDs that have been loaded from blockchain
 */
export const getBlockchainLoadedProposals = (): Set<string> => {
  try {
    const stored = localStorage.getItem(BLOCKCHAIN_LOADED_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Error getting blockchain loaded proposals:', error);
  }
  return new Set();
};

/**
 * Mark a proposal as loaded from blockchain
 * @param proposalId The proposal ID
 */
export const markProposalLoadedFromBlockchain = (proposalId: number): void => {
  try {
    const loadedProposals = Array.from(getBlockchainLoadedProposals());
    if (!loadedProposals.includes(proposalId.toString())) {
      loadedProposals.push(proposalId.toString());
      localStorage.setItem(BLOCKCHAIN_LOADED_KEY, JSON.stringify(loadedProposals));
    }
  } catch (error) {
    console.error('Error marking proposal as loaded from blockchain:', error);
  }
};

/**
 * Store a voting end time for a proposal
 * @param proposalId The proposal ID
 * @param endTime The voting end time (seconds since epoch)
 * @param fromBlockchain Whether this time is derived from blockchain data
 */
export const storeVotingEndTime = (
  proposalId: number, 
  endTime: number, 
  fromBlockchain: boolean = false
): void => {
  try {
    // If this is from blockchain, mark it as loaded from blockchain
    if (fromBlockchain) {
      markProposalLoadedFromBlockchain(proposalId);
    }
    
    // Only update if not already loaded from blockchain or if this is from blockchain
    const loadedProposals = getBlockchainLoadedProposals();
    const proposalIdStr = proposalId.toString();
    
    if (fromBlockchain || !loadedProposals.has(proposalIdStr)) {
      const endTimes = getStoredVotingEndTimes();
      endTimes[proposalIdStr] = endTime;
      localStorage.setItem(VOTING_END_TIMES_KEY, JSON.stringify(endTimes));
      console.log(`Stored voting end time for proposal ${proposalId}: ${endTime} (${new Date(endTime * 1000).toLocaleString()})`);
    } else {
      console.log(`Not updating voting end time for proposal ${proposalId} as it was already loaded from blockchain`);
    }
  } catch (error) {
    console.error('Error storing voting end time:', error);
  }
};

/**
 * Calculate the voting end time based on blockchain creation time
 * @param proposalId The proposal ID
 * @param creationTime The proposal creation time from the blockchain
 * @returns The calculated voting end time in seconds since epoch
 */
export const calculateVotingEndTime = (proposalId: number, creationTime: number): number => {
  // Always use blockchain time as the source of truth
  const votingEndTime = creationTime + VOTING_PERIOD;
  
  // Store with blockchain flag to indicate this is the source of truth
  storeVotingEndTime(proposalId, votingEndTime, true);
  
  console.log(`Calculated voting end time for proposal ${proposalId}: ${votingEndTime} (${new Date(votingEndTime * 1000).toLocaleString()})`);
  return votingEndTime;
};

/**
 * Get the voting end time for a proposal
 * @param proposalId The proposal ID
 * @returns The voting end time in seconds since epoch, or null if not found
 */
export const getVotingEndTime = (proposalId: number): number | null => {
  const endTimes = getStoredVotingEndTimes();
  const endTimeStr = endTimes[proposalId.toString()];
  
  if (endTimeStr !== undefined) {
    return Number(endTimeStr);
  }
  
  return null;
};

/**
 * Clear all stored voting end times
 * This is useful when you want to reset all timers
 */
export const clearAllVotingEndTimes = (): void => {
  try {
    localStorage.removeItem(VOTING_END_TIMES_KEY);
    localStorage.removeItem(BLOCKCHAIN_LOADED_KEY);
    console.log('Cleared all stored voting end times and blockchain loaded flags');
  } catch (error) {
    console.error('Error clearing voting end times:', error);
  }
};

/**
 * Initialize voting end time from blockchain data
 * @param proposalId The proposal ID
 * @param creationTime The proposal creation time from the blockchain
 * @returns The initialized voting end time in seconds since epoch
 */
export const initializeVotingEndTime = (proposalId: number, creationTime: number): number => {
  // Always calculate from blockchain data
  if (creationTime && creationTime > 0) {
    const endTime = calculateVotingEndTime(proposalId, creationTime);
    console.log(`Initialized voting end time from blockchain data for proposal ${proposalId}: ${endTime}`);
    return endTime;
  }
  
  // Fallback: Use existing time if available
  const existingEndTime = getVotingEndTime(proposalId);
  if (existingEndTime !== null) {
    console.log(`Using existing voting end time for proposal ${proposalId}: ${existingEndTime}`);
    return existingEndTime;
  }
  
  // Last resort: Set a temporary timer starting now (will be replaced when blockchain data is available)
  const now = Math.floor(Date.now() / 1000);
  const tempEndTime = now + VOTING_PERIOD;
  storeVotingEndTime(proposalId, tempEndTime, false);
  console.log(`Created temporary voting end time for proposal ${proposalId}: ${tempEndTime}`);
  return tempEndTime;
};

// For backward compatibility
export const forceResetVotingEndTime = initializeVotingEndTime;
export const lockVotingTimer = (proposalId: number): void => {
  // This function is kept for backward compatibility but does nothing in the new implementation
  console.log(`Voting timer locking is deprecated - using blockchain time for proposal ${proposalId}`);
};

/**
 * Debug utility to display all voting end times in console
 * This is more efficient than displaying in UI
 */
export const debugVotingEndTimes = (): void => {
  const endTimes = getStoredVotingEndTimes();
  const now = Math.floor(Date.now() / 1000);
  
  console.group('🕒 Current Voting End Times');
  console.log('Current time:', new Date().toLocaleString());
  
  if (Object.keys(endTimes).length === 0) {
    console.log('No voting end times stored');
  } else {
    Object.entries(endTimes).forEach(([proposalId, endTime]) => {
      const timeRemaining = endTime - now;
      const status = timeRemaining > 0 
        ? `${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s remaining` 
        : 'ENDED';
      
      console.log(
        `Proposal #${proposalId}: ${new Date(endTime * 1000).toLocaleString()} (${status})`
      );
    });
  }
  console.groupEnd();
};
