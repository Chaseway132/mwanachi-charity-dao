import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProposalList from './ProposalList';
import { ProposalContext } from '../contexts/ProposalContext';

// Mock the web3 utilities
jest.mock('../utils/web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })
}));

// Mock the contract helpers
jest.mock('../utils/contractHelpers', () => ({
  getContractInstances: jest.fn().mockResolvedValue({
    charityDAOPlatform: {
      getAllProposals: jest.fn().mockResolvedValue([
        {
          id: BigInt(1),
          description: 'Test Proposal 1',
          amount: BigInt(1000000000000000000), // 1 ETH
          votesFor: BigInt(2),
          votesAgainst: BigInt(1),
          executed: false,
          cancelled: false,
          creationTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
          executionTime: BigInt(0),
          proposer: '0x1234567890123456789012345678901234567890',
          recipient: '0x0987654321098765432109876543210987654321'
        },
        {
          id: BigInt(2),
          description: 'Test Proposal 2',
          amount: BigInt(2000000000000000000), // 2 ETH
          votesFor: BigInt(3),
          votesAgainst: BigInt(0),
          executed: false,
          cancelled: false,
          creationTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
          executionTime: BigInt(0),
          proposer: '0x1234567890123456789012345678901234567890',
          recipient: '0x0987654321098765432109876543210987654321'
        }
      ]),
      hasVoted: jest.fn().mockResolvedValue(false),
      isStakeholder: jest.fn().mockResolvedValue(true),
      isSigned: jest.fn().mockResolvedValue(false),
      canSign: jest.fn().mockResolvedValue(true),
      isApproved: jest.fn().mockResolvedValue(false),
      target: '0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E'
    }
  })
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('ProposalList Component', () => {
  const mockProposals = [
    {
      id: 1,
      description: 'Test Proposal 1',
      amount: BigInt(1000000000000000000), // 1 ETH
      votesFor: 2,
      votesAgainst: 1,
      executed: false,
      cancelled: false,
      creationTime: Math.floor(Date.now() / 1000) - 86400,
      executionTime: 0,
      proposer: '0x1234567890123456789012345678901234567890',
      recipient: '0x0987654321098765432109876543210987654321'
    },
    {
      id: 2,
      description: 'Test Proposal 2',
      amount: BigInt(2000000000000000000), // 2 ETH
      votesFor: 3,
      votesAgainst: 0,
      executed: false,
      cancelled: false,
      creationTime: Math.floor(Date.now() / 1000) - 86400,
      executionTime: 0,
      proposer: '0x1234567890123456789012345678901234567890',
      recipient: '0x0987654321098765432109876543210987654321'
    }
  ];

  const mockContextValue = {
    proposals: mockProposals,
    setProposals: jest.fn(),
    loading: false,
    error: null,
    fetchProposals: jest.fn(),
    setConnectedAddress: jest.fn(),
    refreshProposals: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders proposal list', async () => {
    await act(async () => {
      render(
        <ProposalContext.Provider value={mockContextValue}>
          <ProposalList />
        </ProposalContext.Provider>
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal 2')).toBeInTheDocument();
    });
  });

  test('displays correct vote counts', async () => {
    await act(async () => {
      render(
        <ProposalContext.Provider value={mockContextValue}>
          <ProposalList />
        </ProposalContext.Provider>
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // votesFor of first proposal
      expect(screen.getByText('3')).toBeInTheDocument(); // votesFor of second proposal
    });
  });

  test('shows correct proposal status', async () => {
    const mockProposalsWithStatus = [
      { ...mockProposals[0], executed: false },
      { ...mockProposals[1], executed: true }
    ];

    await act(async () => {
      render(
        <ProposalContext.Provider value={{ ...mockContextValue, proposals: mockProposalsWithStatus }}>
          <ProposalList />
        </ProposalContext.Provider>
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Executed')).toBeInTheDocument();
    });
  });
}); 