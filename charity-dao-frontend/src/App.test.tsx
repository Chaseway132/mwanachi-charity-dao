import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the web3 utilities
jest.mock('./utils/web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getBalance: jest.fn().mockResolvedValue(BigInt(1000000000000000000)), // 1 ETH
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })
}));

// Mock the contract helpers
jest.mock('./utils/contractHelpers', () => ({
  getContractInstances: jest.fn().mockResolvedValue({
    charityDAOPlatform: {
      target: '0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E',
      getAllProposals: jest.fn().mockResolvedValue([
        {
          id: BigInt(1),
          description: 'Test Proposal 1',
          amountRequested: BigInt(1000000000000000000), // 1 ETH
          votesFor: BigInt(2),
          votesAgainst: BigInt(1),
          executed: false,
          cancelled: false,
          creationTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
          executionTime: BigInt(0)
        }
      ]),
      getBalance: jest.fn().mockResolvedValue(BigInt(1000000000000000000)) // 1 ETH
    },
    fundAllocation: {
      target: '0x2E31459CB46CEEBd6815c715e7e07D77fc21c58D',
      getBalance: jest.fn().mockResolvedValue(BigInt(2000000000000000000)) // 2 ETH
    }
  }),
  getContractAddresses: jest.fn().mockResolvedValue({
    charityDAOPlatform: '0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E',
    fundAllocation: '0x2E31459CB46CEEBd6815c715e7e07D77fc21c58D'
  })
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders app title', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Charity DAO/i)).toBeInTheDocument();
  });

  test('loads contract balances', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/1\.0 ETH/)).toBeInTheDocument(); // Platform balance
      expect(screen.getByText(/2\.0 ETH/)).toBeInTheDocument(); // Fund balance
    });
  });

  test('displays correct contract addresses', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E/i)).toBeInTheDocument();
      expect(screen.getByText(/0x2E31459CB46CEEBd6815c715e7e07D77fc21c58D/i)).toBeInTheDocument();
    });
  });
}); 