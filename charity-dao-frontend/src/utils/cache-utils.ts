/**
 * Cache utilities for the Charity DAO frontend
 * This file contains utilities for managing the application cache
 */

/**
 * Clears all application cache from localStorage
 * This is useful when debugging issues with proposals, voting, etc.
 */
export const clearAllCache = (): void => {
  try {
    // Clear voting end times
    localStorage.removeItem('proposal_voting_end_times');
    localStorage.removeItem('proposal_blockchain_loaded');
    
    // Clear voting status
    localStorage.removeItem('user_votes');
    
    // Clear stakeholder status
    localStorage.removeItem('isStakeholder');
    localStorage.removeItem('allow_all_votes');
    
    // Clear proposal data
    localStorage.removeItem('proposals');
    
    // Clear donation metadata
    localStorage.removeItem('donation_metadata');
    localStorage.removeItem('vote_metadata');
    
    console.log('Cleared all application cache from localStorage');
  } catch (error) {
    console.error('Error clearing application cache:', error);
  }
}; 