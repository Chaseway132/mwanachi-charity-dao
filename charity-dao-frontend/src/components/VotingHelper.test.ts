import { checkStakeholderStatus, checkIfUserHasVoted, submitVoteTransaction } from './VotingHelper';
import { getProvider } from '../utils/web3';
import {
  getDonationTrackingContract,
  getVotingGovernanceContract,
  getProposalManagementContract
} from '../utils/contracts';

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

// Setup the mock implementation for contract functions
const mockGetDonationTrackingContract = getDonationTrackingContract as jest.MockedFunction<typeof getDonationTrackingContract>;
const mockGetVotingGovernanceContract = getVotingGovernanceContract as jest.MockedFunction<typeof getVotingGovernanceContract>;
const mockGetProposalManagementContract = getProposalManagementContract as jest.MockedFunction<typeof getProposalManagementContract>;

describe('VotingHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkStakeholderStatus', () => {
    it('should return true for stakeholders', async () => {
      // Mock the contract function
      mockGetDonationTrackingContract.mockResolvedValue({
        isStakeholder: jest.fn().mockResolvedValue(true)
      } as any);

      // Call the function
      const result = await checkStakeholderStatus('0x1234567890123456789012345678901234567890');

      // Assertions
      expect(getDonationTrackingContract).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false for non-stakeholders', async () => {
      // Mock the contract function
      mockGetDonationTrackingContract.mockResolvedValue({
        isStakeholder: jest.fn().mockResolvedValue(false)
      } as any);

      // Call the function
      const result = await checkStakeholderStatus('0x1234567890123456789012345678901234567890');

      // Assertions
      expect(getDonationTrackingContract).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('submitVoteTransaction', () => {
    it('should submit a vote transaction successfully', async () => {
      // Mock the contract function
      const mockVote = jest.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      });

      // Setup the mock implementation
      mockGetVotingGovernanceContract.mockResolvedValue({
        vote: mockVote
      } as any);

      // Call the function with correct parameter order
      // Parameters: proposalId, userAddress, support, pendingToastId
      const result = await submitVoteTransaction(1, '0x1234567890123456789012345678901234567890', true, 'toast-id');

      // Assertions
      expect(getVotingGovernanceContract).toHaveBeenCalled();
      expect(mockVote).toHaveBeenCalledWith(1, true);
      expect(result.success).toBe(true);
      expect(result.hash).toBe('0xabcdef1234567890');
    });

    it('should handle errors when submitting a vote', async () => {
      // Mock the contract function to throw an error
      mockGetVotingGovernanceContract.mockResolvedValue({
        vote: jest.fn().mockRejectedValue(new Error('Transaction failed'))
      } as any);

      // Call the function with correct parameter order
      // Parameters: proposalId, userAddress, support, pendingToastId
      const result = await submitVoteTransaction(1, '0x1234567890123456789012345678901234567890', true, 'toast-id');

      // Assertions
      expect(result.success).toBe(false);
      // The error property might not be in the type definition, but it exists at runtime
      expect((result as any).error).toBe('Transaction failed');
    });
  });
});