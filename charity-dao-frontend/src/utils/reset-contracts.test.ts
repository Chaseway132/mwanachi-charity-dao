import { resetAllContractState } from './reset-contracts';
import { resetContractInstances } from './contracts';
import { resetProvider } from './web3';
import { clearAllCache } from './clear-cache';

// Mock the imported functions
jest.mock('./contracts', () => ({
  resetContractInstances: jest.fn()
}));

jest.mock('./web3', () => ({
  resetProvider: jest.fn()
}));

jest.mock('./clear-cache', () => ({
  clearAllCache: jest.fn()
}));

// ... existing code ... 