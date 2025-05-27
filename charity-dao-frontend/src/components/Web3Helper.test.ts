import { 
  connectWallet, 
  disconnectWallet, 
  getBalance, 
  getNetworkInfo 
} from './Web3Helper';
import { getProvider } from '../utils/web3';

// Mock the web3 utilities
jest.mock('../utils/web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    }),
    getNetwork: jest.fn().mockResolvedValue({ chainId: 11155111 }),
    getBalance: jest.fn().mockResolvedValue(BigInt(1000000000000000000)) // 1 ETH
  })
}));

// ... existing code ... 