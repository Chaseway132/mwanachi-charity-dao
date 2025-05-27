import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the contract helpers
jest.mock('./utils/contractHelpers', () => ({
  getContractInstances: jest.fn().mockResolvedValue({
    charityDAOPlatform: {
      target: '0x9612eFAFc54D35C370E8A694a7f0995A7e4A45b8',
      getBalance: jest.fn().mockResolvedValue(BigInt(1000000000000000000)), // 1 ETH
    },
    fundAllocation: {
      target: '0xEf9A8ce5b36Eb8b1d48152B59BAeCD32eaE3E9B9',
      getBalance: jest.fn().mockResolvedValue(BigInt(2000000000000000000)), // 2 ETH
    }
  })
}));

// Mock the web3 utilities
jest.mock('./utils/web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })
}));

test('renders Charity DAO title', async () => {
  render(<App />);
  const titleElement = screen.getByText(/Charity DAO/i);
  expect(titleElement).toBeInTheDocument();
});
