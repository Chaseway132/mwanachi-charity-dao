import {
  donateTransaction,
  getDonationHistory,
  getStakeholderStatus
} from './DonationHelper';
import { getProvider } from '../utils/web3';
import { getDonationTrackingContract } from '../utils/contracts';

// Mock the web3 utilities
jest.mock('../utils/web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })
}));

// Mock the contract utilities
jest.mock('../utils/contracts');

// Setup the mock implementation for getDonationTrackingContract
const mockGetDonationTrackingContract = getDonationTrackingContract as jest.MockedFunction<typeof getDonationTrackingContract>;

describe('DonationHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('donateTransaction', () => {
    it('should process a donation transaction successfully', async () => {
      // Mock the contract function
      const mockDonate = jest.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      });

      // Setup the mock implementation
      mockGetDonationTrackingContract.mockResolvedValue({
        donate: mockDonate,
        value: jest.fn().mockReturnThis()
      } as any);

      // Call the function
      const result = await donateTransaction('0.5');

      // Assertions
      expect(getDonationTrackingContract).toHaveBeenCalled();
      expect(mockDonate).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.hash).toBe('0xabcdef1234567890');
    });

    it('should handle errors when making a donation', async () => {
      // Mock the contract function to throw an error
      const mockDonate = jest.fn().mockRejectedValue(new Error('Transaction failed'));

      mockGetDonationTrackingContract.mockResolvedValue({
        donate: mockDonate,
        value: jest.fn().mockReturnThis()
      } as any);

      // Call the function
      const result = await donateTransaction('0.5');

      // Assertions
      expect(result.success).toBe(false);
      // The error property might not be in the type definition, but it exists at runtime
      expect((result as any).error).toBe('Transaction failed');
    });
  });

  describe('getStakeholderStatus', () => {
    it('should return stakeholder status correctly', async () => {
      // Mock the contract function
      mockGetDonationTrackingContract.mockResolvedValue({
        isStakeholder: jest.fn().mockResolvedValue(true)
      } as any);

      // Call the function
      const result = await getStakeholderStatus('0x1234567890123456789012345678901234567890');

      // Assertions
      expect(getDonationTrackingContract).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});