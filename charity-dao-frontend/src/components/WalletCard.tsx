import React from 'react';

interface WalletCardProps {
  address: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ address }) => {
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Wallet</h2>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">Address:</span>
        <span className="text-sm text-gray-900">{formatAddress(address)}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <a 
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-900"
          >
            View on Etherscan
          </a>
          
          <button
            onClick={() => navigator.clipboard.writeText(address)}
            className="text-xs text-indigo-600 hover:text-indigo-900"
          >
            Copy Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
