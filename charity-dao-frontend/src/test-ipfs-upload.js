// Direct test script for IPFS uploads
require('dotenv').config();
const axios = require('axios');

// Get the Pinata JWT from environment variables
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

// Test data for execution upload
const testData = {
  proposalId: '999',
  executor: '0x1234567890123456789012345678901234567890',
  recipient: '0x0987654321098765432109876543210987654321',
  amount: '1.0',
  timestamp: Date.now().toString(),
  txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  method: 'TEST_UPLOAD',
  testField: 'This is a test upload'
};

// Function to test connection to Pinata
async function testConnection() {
  console.log('Testing connection to Pinata...');
  console.log('JWT available:', !!PINATA_JWT);
  console.log('JWT length:', PINATA_JWT ? PINATA_JWT.length : 0);
  
  try {
    const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    
    console.log('Connection test successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Connection test failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Function to test uploading execution data to IPFS
async function testExecutionUpload() {
  console.log('Testing execution upload to IPFS...');
  
  try {
    // Prepare the data for Pinata
    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: `Proposal-${testData.proposalId}-Execution`,
        keyvalues: {
          proposalId: testData.proposalId,
          executorAddress: testData.executor,
          recipient: testData.recipient,
          amount: testData.amount,
          timestamp: testData.timestamp,
          txHash: testData.txHash,
          type: 'execution'
        }
      },
      pinataContent: testData
    };
    
    console.log('Sending data to Pinata:', JSON.stringify(data, null, 2));
    
    // Send the request to Pinata
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
    
    console.log('Upload successful!');
    console.log('Response status:', response.status);
    console.log('IPFS Hash:', response.data.IpfsHash);
    console.log('Timestamp:', response.data.Timestamp);
    console.log('IPFS URL:', `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Upload failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Function to test retrieving data from IPFS
async function testRetrieveFromIPFS(ipfsHash) {
  if (!ipfsHash) {
    console.error('No IPFS hash provided for retrieval test');
    return;
  }
  
  console.log(`Testing retrieval from IPFS for hash: ${ipfsHash}`);
  
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    console.log('Retrieval successful!');
    console.log('Retrieved data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Retrieval failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('=== IPFS UPLOAD TEST SCRIPT ===');
  
  // Test connection
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.error('Connection test failed. Aborting further tests.');
    return;
  }
  
  // Test execution upload
  const ipfsHash = await testExecutionUpload();
  if (!ipfsHash) {
    console.error('Upload test failed. Aborting further tests.');
    return;
  }
  
  // Test retrieval
  await testRetrieveFromIPFS(ipfsHash);
  
  console.log('=== TEST SCRIPT COMPLETE ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in test script:', error);
});
