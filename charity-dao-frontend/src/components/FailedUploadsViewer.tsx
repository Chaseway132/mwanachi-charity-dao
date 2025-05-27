import React, { useState, useEffect } from 'react';

interface FailedUpload {
  type: string;
  proposalId: string;
  executorAddress: string;
  recipient: string;
  amount: string;
  timestamp: string;
  txHash: string;
  metadata: any;
  error: string;
  failedAt: string;
}

const FailedUploadsViewer: React.FC = () => {
  const [failedUploads, setFailedUploads] = useState<Record<string, FailedUpload>>({});
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null);

  useEffect(() => {
    // Find all failed uploads in localStorage
    const uploads: Record<string, FailedUpload> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('failed-ipfs-execution-')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            uploads[key] = JSON.parse(value);
          }
        } catch (error) {
          console.error('Error parsing failed upload:', error);
        }
      }
    }
    setFailedUploads(uploads);
  }, []);

  const handleRetry = async (key: string, upload: FailedUpload) => {
    // This is a placeholder for a retry function
    // In a real implementation, you would call the IPFS upload function again
    alert('Retry functionality not implemented yet');
  };

  const handleClear = (key: string) => {
    localStorage.removeItem(key);
    setFailedUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[key];
      return newUploads;
    });
    if (selectedUpload === key) {
      setSelectedUpload(null);
    }
  };

  const handleClearAll = () => {
    Object.keys(failedUploads).forEach(key => {
      localStorage.removeItem(key);
    });
    setFailedUploads({});
    setSelectedUpload(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Failed IPFS Uploads</h2>
        {Object.keys(failedUploads).length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Clear All
          </button>
        )}
      </div>

      {Object.keys(failedUploads).length === 0 ? (
        <p className="text-gray-500">No failed uploads found.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            Found {Object.keys(failedUploads).length} failed uploads in localStorage.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Failed Uploads</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(failedUploads).map(([key, upload]) => (
                  <li key={key} className="text-sm">
                    <button
                      onClick={() => setSelectedUpload(key)}
                      className={`w-full text-left p-2 rounded-md ${
                        selectedUpload === key ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">Proposal #{upload.proposalId}</div>
                      <div className="text-xs text-gray-500">
                        Failed at: {new Date(upload.failedAt).toLocaleString()}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Details</h3>
              {selectedUpload ? (
                <div className="text-sm">
                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                    <pre className="whitespace-pre-wrap break-all text-xs">
                      {JSON.stringify(failedUploads[selectedUpload], null, 2)}
                    </pre>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRetry(selectedUpload, failedUploads[selectedUpload])}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Retry Upload
                    </button>
                    <button
                      onClick={() => handleClear(selectedUpload)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a failed upload to view details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FailedUploadsViewer;
