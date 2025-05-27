import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getFundAllocationContract } from '../utils/contracts';

interface Transfer {
  id: number;
  sender: string;
  recipient: string;
  amount: string;
  timestamp: number;
  note: string;
  transactionHash: string;
}

const TransferList: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        setIsLoading(true);
        const provider = await getProvider();
        const fundAllocationContract = await getFundAllocationContract(provider);
        
        // In a real implementation, we would call a contract method to get transfers
        // For demo purposes, we'll create a mock list
        const mockTransfers: Transfer[] = [
          {
            id: 1,
            sender: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            recipient: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            amount: '0.5',
            timestamp: Date.now() - 86400000, // 1 day ago
            note: 'First aid supplies for disaster relief',
            transactionHash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
          },
          {
            id: 2,
            sender: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            recipient: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
            amount: '1.2',
            timestamp: Date.now() - 172800000, // 2 days ago
            note: 'Educational materials for community school',
            transactionHash: '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcd'
          },
          {
            id: 3,
            sender: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            recipient: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
            amount: '0.8',
            timestamp: Date.now() - 259200000, // 3 days ago
            note: 'Medical supplies for clinic',
            transactionHash: '0x56789abcdef123456789abcdef123456789abcdef123456789abcdef12345678'
          }
        ];
        
        setTransfers(mockTransfers);
      } catch (error) {
        console.error('Failed to load transfers:', error);
        toast.error('Failed to load transfers');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransfers();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Fund Transfers</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          History of fund transfers to recipient organizations
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-6">
          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No transfers found</p>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {transfers.map((transfer) => (
              <li 
                key={transfer.id} 
                className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${expandedId === transfer.id ? 'bg-gray-50' : ''}`}
                onClick={() => toggleExpand(transfer.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatAddress(transfer.recipient)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ethers.parseUnits(transfer.amount, "ether").toString()} ETH
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(transfer.timestamp)}
                    </p>
                  </div>
                </div>
                
                {expandedId === transfer.id && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">From:</p>
                        <p className="text-gray-900">{transfer.sender}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">To:</p>
                        <p className="text-gray-900">{transfer.recipient}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Note:</p>
                        <p className="text-gray-900">{transfer.note || 'No note provided'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Transaction:</p>
                        <a 
                          href={`https://etherscan.io/tx/${transfer.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Etherscan
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TransferList; 