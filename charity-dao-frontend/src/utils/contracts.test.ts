import { 
  getDonationTrackingContract, 
  getVotingGovernanceContract, 
  getProposalManagementContract,
  resetContractInstances
} from './contracts';

// Mock the web3 utilities
jest.mock('./web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })
})); 