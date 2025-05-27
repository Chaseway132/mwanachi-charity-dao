import axios from 'axios';
import { Buffer } from 'buffer';

// Pinata configuration
// In React client, environment variables must be prefixed with REACT_APP_
// Access directly from window to debug any issues
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT || '';
console.log('IPFS Module - Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PINATA_JWT available:', PINATA_JWT ? 'Yes' : 'No');
console.log('PINATA_JWT length:', PINATA_JWT ? PINATA_JWT.length : 0);

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Multiple IPFS gateways for redundancy
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.ipfs.io/ipfs/'
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const uploadWithRetry = async (data: any): Promise<any> => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${MAX_RETRIES} to upload to Pinata...`);

      const response = await axios({
        method: 'post',
        url: PINATA_API_URL,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        timeout: 30000 // 30 second timeout
      });

      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt < MAX_RETRIES) {
        console.log(`Waiting ${RETRY_DELAY/1000} seconds before retry...`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  throw lastError;
};

export const testIPFSConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing IPFS connection with JWT:', PINATA_JWT ? 'Present' : 'Missing');

    if (!PINATA_JWT) {
      console.error('PINATA_JWT is missing or undefined');
      return false;
    }

    console.log('JWT length:', PINATA_JWT.length);
    console.log('JWT first 20 chars:', PINATA_JWT.substring(0, 20) + '...');

    // Test Pinata connection by getting pin list
    console.log('Attempting to connect to Pinata API...');
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status < 500 // Don't reject if status < 500
    });

    console.log('Pinata API response status:', response.status);

    if (response.status === 401) {
      console.error('Pinata authentication failed - invalid JWT token');
      return false;
    }

    if (response.status !== 200) {
      console.error('Pinata API returned unexpected status:', response.status);
      return false;
    }

    console.log('Successfully connected to Pinata', response.data);
    return true;
  } catch (error: any) {
    console.error('Pinata connection test failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      isTimeout: error.code === 'ECONNABORTED'
    });

    // More specific error messages
    if (error.code === 'ECONNABORTED') {
      console.error('Connection to Pinata timed out. Please check your internet connection or try again later.');
    } else if (error.response?.status === 401) {
      console.error('Invalid Pinata JWT token. Please check your configuration.');
    } else if (!PINATA_JWT) {
      console.error('Pinata JWT token is missing. Please check your environment variables.');
    }

    return false;
  }
};

export const uploadDonationToIPFS = async (
  id: string,
  amount: string,
  timestamp: string,
  recipient: string,
  metadata: string
): Promise<string> => {
  try {
    console.log('PINATA_JWT status:', PINATA_JWT ? 'Present' : 'Missing');

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured');
    }

    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: `Donation-${id}`,
        keyvalues: {
          donationId: id,
          timestamp: timestamp
        }
      },
      pinataContent: JSON.parse(metadata)
    };

    const response = await uploadWithRetry(data);

    console.log('Successfully uploaded to Pinata:', {
      status: response.status,
      ipfsHash: response.data.IpfsHash,
      timestamp: response.data.Timestamp
    });

    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('Error uploading to Pinata after all retries:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const uploadProposalToIPFS = async (
  proposalId: string,
  amountRequested: string,
  timestamp: string,
  recipient: string,
  metadata: string
): Promise<string> => {
  try {
    console.log('Uploading proposal metadata to IPFS - Start');
    console.log('Parameters:', { proposalId, amountRequested, timestamp, recipient });
    console.log('Metadata size:', metadata.length, 'bytes');

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured');
    }

    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: `Proposal-${proposalId}-Create`,
        keyvalues: {
          proposalId,
          amountRequested,
          timestamp,
          recipient,
          type: 'proposal'
        }
      },
      pinataContent: JSON.parse(metadata)
    };

    console.log('Using uploadWithRetry for proposal data');
    const response = await uploadWithRetry(data);

    console.log('Successfully uploaded proposal to Pinata:', {
      status: response.status,
      ipfsHash: response.data.IpfsHash,
      timestamp: response.data.Timestamp
    });

    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('Error uploading proposal to IPFS:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const uploadVoteToIPFS = async (
  proposalId: string,
  voterAddress: string,
  timestamp: string,
  metadata: string
): Promise<string> => {
  try {
    console.log('Uploading vote metadata to IPFS:', metadata);

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured');
    }

    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: `Proposal-${proposalId}-Vote-${voterAddress.substring(0, 8)}`,
        keyvalues: {
          proposalId,
          voterAddress,
          timestamp,
          type: 'vote'
        }
      },
      pinataContent: JSON.parse(metadata)
    };

    const response = await uploadWithRetry(data);

    console.log('Successfully uploaded vote to Pinata:', {
      status: response.status,
      ipfsHash: response.data.IpfsHash,
      timestamp: response.data.Timestamp
    });

    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('Error uploading vote to IPFS:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const uploadExecutionToIPFS = async (
  proposalId: string,
  executorAddress: string,
  recipient: string,
  amount: string,
  timestamp: string,
  txHash: string,
  metadata: string
): Promise<string> => {
  try {
    console.log('=== EXECUTION IPFS UPLOAD START ===');
    console.log('Proposal ID:', proposalId);
    console.log('Executor Address:', executorAddress);
    console.log('Recipient:', recipient);
    console.log('Amount:', amount);
    console.log('Timestamp:', timestamp, '(', new Date(Number(timestamp)).toLocaleString(), ')');
    console.log('Transaction Hash:', txHash);
    console.log('Metadata length:', metadata.length);
    console.log('PINATA_JWT status:', PINATA_JWT ? `Present (length: ${PINATA_JWT.length})` : 'Missing');

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured');
    }

    // Parse the metadata to ensure it's valid JSON
    const parsedMetadata = JSON.parse(metadata);

    // Create a unique name for the execution record
    const uniqueName = `Proposal-${proposalId}-Execution-${Date.now()}`;
    console.log('Using unique name for IPFS record:', uniqueName);

    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: uniqueName,
        keyvalues: {
          proposalId,
          executorAddress,
          recipient,
          amount,
          timestamp,
          txHash,
          type: 'execution',
          uploadTime: Date.now().toString()
        }
      },
      pinataContent: parsedMetadata
    };

    // Use the same uploadWithRetry function that works for other uploads
    const response = await uploadWithRetry(data);

    console.log('Successfully uploaded execution to Pinata:', {
      status: response.status,
      ipfsHash: response.data.IpfsHash,
      timestamp: response.data.Timestamp
    });
    console.log('=== EXECUTION IPFS UPLOAD COMPLETE ===');

    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('=== EXECUTION IPFS UPLOAD FAILED ===');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });

    // Log more specific error information
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }

    // Create a fallback record in localStorage if IPFS upload fails
    try {
      const fallbackRecord = {
        type: 'execution',
        proposalId,
        executorAddress,
        recipient,
        amount,
        timestamp,
        txHash,
        metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
        error: error.message,
        failedAt: new Date().toISOString()
      };

      const storageKey = `failed-ipfs-execution-${proposalId}-${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(fallbackRecord));
      console.log('Created fallback record in localStorage with key:', storageKey);
    } catch (storageError) {
      console.error('Failed to create fallback record:', storageError);
    }

    throw error;
  }
};

export const uploadApprovalToIPFS = async (
  proposalId: string,
  approverAddress: string,
  timestamp: string,
  metadata: string
): Promise<string> => {
  try {
    console.log('Uploading approval metadata to IPFS:', metadata);

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured');
    }

    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: `Proposal-${proposalId}-Sign-${approverAddress.substring(0, 8)}`,
        keyvalues: {
          proposalId,
          approverAddress,
          timestamp,
          type: 'approval'
        }
      },
      pinataContent: JSON.parse(metadata)
    };

    const response = await uploadWithRetry(data);

    console.log('Successfully uploaded approval to Pinata:', {
      status: response.status,
      ipfsHash: response.data.IpfsHash,
      timestamp: response.data.Timestamp
    });

    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('Error uploading approval to IPFS:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Test function to directly test IPFS uploads
export const testExecutionUpload = async (): Promise<string> => {
  try {
    console.log('=== TESTING EXECUTION IPFS UPLOAD ===');

    const testProposalId = '999';
    const testExecutor = '0x1234567890123456789012345678901234567890';
    const testRecipient = '0x0987654321098765432109876543210987654321';
    const testAmount = '1.0';
    const testTimestamp = Date.now().toString();
    const testTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    // Create test metadata
    const testMetadata = JSON.stringify({
      proposalId: testProposalId,
      executor: testExecutor,
      recipient: testRecipient,
      amount: testAmount,
      txHash: testTxHash,
      timestamp: testTimestamp,
      method: 'TEST_UPLOAD',
      testField: 'This is a test upload'
    });

    // Log the JWT token status
    console.log('PINATA_JWT status:', PINATA_JWT ? `Present (length: ${PINATA_JWT.length})` : 'Missing');
    console.log('First 20 chars of JWT:', PINATA_JWT.substring(0, 20) + '...');

    // Try a direct API call first to test the JWT
    try {
      console.log('Testing JWT with direct API call...');
      const testResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      });
      console.log('JWT test successful:', testResponse.data);
    } catch (jwtError: any) {
      console.error('JWT test failed:', jwtError.message);
      if (jwtError.response) {
        console.error('Response status:', jwtError.response.status);
        console.error('Response data:', jwtError.response.data);
      }
    }

    // Attempt the upload
    console.log('Attempting execution upload...');
    const ipfsHash = await uploadExecutionToIPFS(
      testProposalId,
      testExecutor,
      testRecipient,
      testAmount,
      testTimestamp,
      testTxHash,
      testMetadata
    );

    console.log('Test upload successful! IPFS Hash:', ipfsHash);
    console.log('IPFS URL:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    console.log('=== TEST COMPLETE ===');

    return ipfsHash;
  } catch (error: any) {
    console.error('Test upload failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Function to verify if execution metadata exists for a proposal
export const verifyExecutionMetadata = async (proposalId: string): Promise<boolean> => {
  try {
    console.log(`Verifying execution metadata for proposal ${proposalId}...`);

    // Check local storage first for any failed uploads
    const failedUploads = Object.keys(localStorage)
      .filter(key => key.startsWith(`failed-ipfs-execution-${proposalId}`))
      .map(key => JSON.parse(localStorage.getItem(key) || '{}'));

    if (failedUploads.length > 0) {
      console.log(`Found ${failedUploads.length} failed uploads in localStorage for proposal ${proposalId}`);

      // Try to re-upload the failed metadata
      for (const failedUpload of failedUploads) {
        try {
          console.log('Attempting to re-upload failed execution metadata:', failedUpload);

          const ipfsHash = await uploadExecutionToIPFS(
            failedUpload.proposalId,
            failedUpload.executorAddress,
            failedUpload.recipient,
            failedUpload.amount,
            failedUpload.timestamp,
            failedUpload.txHash,
            typeof failedUpload.metadata === 'string'
              ? failedUpload.metadata
              : JSON.stringify(failedUpload.metadata)
          );

          console.log('Successfully re-uploaded execution metadata to IPFS with hash:', ipfsHash);

          // Remove the failed upload from localStorage
          localStorage.removeItem(`failed-ipfs-execution-${proposalId}-${failedUpload.failedAt}`);

          return true;
        } catch (reuploadError) {
          console.error('Failed to re-upload execution metadata:', reuploadError);
        }
      }
    }

    // If we couldn't find or re-upload any failed uploads, return false
    return false;
  } catch (error) {
    console.error('Error verifying execution metadata:', error);
    return false;
  }
};

export const getFromIPFS = async (cid: string): Promise<any> => {
  if (!cid) return null;

  let lastError = null;

  // Try each gateway in sequence
  for (const gateway of IPFS_GATEWAYS) {
    try {
      console.log(`Trying IPFS gateway: ${gateway}`);
      const response = await axios.get(`${gateway}${cid}`, {
        timeout: 5000 // 5 second timeout per gateway
      });
      console.log(`Successfully retrieved from ${gateway}`);
      return response.data;
    } catch (error: any) {
      console.log(`Gateway ${gateway} failed:`, error.message);
      lastError = error;
      continue; // Try next gateway
    }
  }

  // If we have Pinata credentials, try as last resort with authentication
  if (PINATA_JWT) {
    try {
      const response = await axios.get(`${PINATA_GATEWAY}${cid}`, {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        timeout: 5000
      });
      return response.data;
    } catch (error: any) {
      lastError = error;
    }
  }

  console.error('All IPFS gateways failed:', lastError);
  throw new Error('Failed to retrieve IPFS content from all available gateways');
};