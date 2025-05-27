import {
  createProposalTransaction,
  executeProposalTransaction,
  getProposalDetails
} from './ProposalHelper';
import { getProvider } from '../utils/web3';
import {
  getProposalManagementContract,
  getVotingGovernanceContract
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
const mockGetProposalManagementContract = getProposalManagementContract as jest.MockedFunction<typeof getProposalManagementContract>;
const mockGetVotingGovernanceContract = getVotingGovernanceContract as jest.MockedFunction<typeof getVotingGovernanceContract>;

describe('ProposalHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProposalTransaction', () => {
    it('should create a proposal transaction successfully', async () => {
      // Mock the contract function
      const mockCreateProposal = jest.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      });

      // Setup the mock implementation
      mockGetProposalManagementContract.mockResolvedValue({
        createProposal: mockCreateProposal
      } as any);

      // Call the function
      const result = await createProposalTransaction(
        'Test Proposal',
        '0.5',
        '0x0987654321098765432109876543210987654321'
      );

      // Assertions
      expect(getProposalManagementContract).toHaveBeenCalled();
      expect(mockCreateProposal).toHaveBeenCalledWith(
        'Test Proposal',
        expect.any(BigInt),
        '0x0987654321098765432109876543210987654321'
      );
      expect(result.success).toBe(true);
      expect(result.hash).toBe('0xabcdef1234567890');
    });

    it('should handle errors when creating a proposal', async () => {
      // Mock the contract function to throw an error
      mockGetProposalManagementContract.mockResolvedValue({
        createProposal: jest.fn().mockRejectedValue(new Error('Transaction failed'))
      } as any);

      // Call the function
      const result = await createProposalTransaction(
        'Test Proposal',
        '0.5',
        '0x0987654321098765432109876543210987654321'
      );

      // Assertions
      expect(result.success).toBe(false);
      // The error property might not be in the type definition, but it exists at runtime
      expect((result as any).error).toBe('Transaction failed');
    });
  });
});