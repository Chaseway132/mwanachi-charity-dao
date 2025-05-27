import React, { useState } from 'react';

interface UserProfileButtonProps {
  address: string;
  onDisconnect?: () => void;
}

const UserProfileButton: React.FC<UserProfileButtonProps> = ({ address, onDisconnect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle disconnect click
  const handleDisconnect = () => {
    setIsOpen(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };
  
  // Copy address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setIsOpen(false);
    // You could add a toast notification here
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium"
      >
        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
        <span>{formatAddress(address)}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            onClick={copyToClipboard}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Copy Address
          </button>
          
          <button
            onClick={handleDisconnect}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Disconnect Wallet
          </button>
          
          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
};

export default UserProfileButton; 