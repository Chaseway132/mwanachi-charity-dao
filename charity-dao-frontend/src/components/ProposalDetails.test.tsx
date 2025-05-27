import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProposalDetails from './ProposalDetails';
import { ProposalContext } from '../contexts/ProposalContext';

// Mock the web3 utilities
jest.mock('../utils/web3', () => ({
  getProvider: jest.fn().mockResolvedValue({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    })
  })
}));

// ... existing code ... 