import React, { useState } from 'react';
import { testIPFSConnection, testExecutionUpload } from '../utils/ipfs';

const IPFSTestPanel: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await testIPFSConnection();
      setTestResult(`Connection test result: ${result ? 'Success' : 'Failed'}`);
    } catch (err: any) {
      setError(`Error testing connection: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUpload = async () => {
    setIsLoading(true);
    setError('');
    try {
      const ipfsHash = await testExecutionUpload();
      setTestResult(`Test upload successful! IPFS Hash: ${ipfsHash}`);
    } catch (err: any) {
      setError(`Error testing upload: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px',
      margin: '16px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>IPFS Test Panel</h3>
      <p>Use these buttons to test IPFS functionality:</p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={handleTestConnection}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Test IPFS Connection
        </button>
        
        <button 
          onClick={handleTestUpload}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Execution Upload
        </button>
      </div>
      
      {isLoading && <p>Loading...</p>}
      
      {testResult && (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '8px', 
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          {testResult}
        </div>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '8px', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        Check the browser console for detailed logs.
      </p>
    </div>
  );
};

export default IPFSTestPanel;
