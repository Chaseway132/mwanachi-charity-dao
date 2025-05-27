/**
 * Utility to reset contract instances and clear any cached data
 */
import { resetContractInstances } from './contracts';
import { clearAllCache } from './clear-cache';
import { resetProvider } from './web3';

/**
 * Reset all contract-related state and cache
 */
export const resetAllContractState = (): void => {
  try {
    // Clear localStorage cache
    clearAllCache();
    
    // Reset contract instances
    resetContractInstances();
    
    // Reset provider
    resetProvider();
    
    console.log('All contract state has been reset');
  } catch (error) {
    console.error('Error resetting contract state:', error);
  }
};

// Automatically execute when this module is imported
resetAllContractState();
