import { ethers } from 'ethers';

export const getContractInstances = jest.fn().mockResolvedValue({
  charityDAOPlatform: {
    target: '0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E',
    getAllProposals: jest.fn().mockResolvedValue([
      {
        id: BigInt(1),
        description: 'Test Proposal 1',
        amountRequested: BigInt(1000000000000000000), // 1 ETH
        votesFor: BigInt(2),
        votesAgainst: BigInt(0),
        executed: false,
        cancelled: false,
        creationTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
        executionTime: BigInt(0)
      },
      {
        id: BigInt(2),
        description: 'Test Proposal 2',
        amountRequested: BigInt(2000000000000000000), // 2 ETH
        votesFor: BigInt(3),
        votesAgainst: BigInt(0),
        executed: false,
        cancelled: false,
        creationTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
        executionTime: BigInt(0)
      }
    ]),
    hasVoted: jest.fn().mockResolvedValue(false),
    isStakeholder: jest.fn().mockResolvedValue(true),
    isSigned: jest.fn().mockResolvedValue(false),
    canSign: jest.fn().mockResolvedValue(true),
    isApproved: jest.fn().mockResolvedValue(false),
    executionDelay: jest.fn().mockResolvedValue(BigInt(0)),
    owner: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
  },
  fundAllocation: {
    target: '0x2E31459CB46CEEBd6815c715e7e07D77fc21c58D',
    getDonations: jest.fn().mockResolvedValue([
      {
        donor: '0x1234567890123456789012345678901234567890',
        amount: BigInt(1000000000000000000), // 1 ETH
        timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400) // 24 hours ago
      }
    ])
  }
});

export const getContractAddresses = jest.fn().mockResolvedValue({
  charityDAOPlatform: '0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E',
  fundAllocation: '0x2E31459CB46CEEBd6815c715e7e07D77fc21c58D'
}); 