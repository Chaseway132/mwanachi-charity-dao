import { getProvider, formatAddress, formatAmount } from './web3';

// Mock ethers
jest.mock('ethers', () => ({
  BrowserProvider: jest.fn().mockImplementation(() => ({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })),
  formatEther: jest.fn().mockImplementation((wei) => {
    // Simple mock implementation of formatEther
    const weiValue = Number(wei);
    return String(weiValue / 1e18);
  })
}));

// Mock window.ethereum
global.window = Object.create(window);
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    on: jest.fn(),
    removeListener: jest.fn()
  },
  writable: true
});

describe('Web3 Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return a provider when ethereum is available', async () => {
      const provider = await getProvider();
      expect(provider).toBeDefined();
    });
  });

  describe('formatAddress', () => {
    it('should format an address correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const formatted = formatAddress(address);
      expect(formatted).toBe('0x1234...7890');
    });

    it('should return empty string for undefined address', () => {
      // TypeScript won't allow null directly, so we need to use a variable
      const address = undefined as unknown as string;
      const formatted = formatAddress(address);
      expect(formatted).toBe('');
    });
  });

  describe('formatAmount', () => {
    it('should convert wei to ether correctly', () => {
      const wei = BigInt('1000000000000000000'); // 1 ETH in wei
      const ether = formatAmount(wei);
      expect(ether).toBe('1.0');
    });

    it('should handle zero wei correctly', () => {
      const wei = BigInt(0);
      const ether = formatAmount(wei);
      expect(ether).toBe('0.0');
    });
  });
});