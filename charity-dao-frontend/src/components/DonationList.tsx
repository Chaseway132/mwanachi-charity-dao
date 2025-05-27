import React, { useState, useEffect } from 'react';
import { Donation } from '../types';

// Constants for localStorage
const DONATION_METADATA_KEY = 'donation_ipfs_mapping';
const METADATA_CACHE_PREFIX = 'donation_metadata_';

// Helper function to get donation metadata
const getDonationMetadata = (txHash: string): string | null => {
  try {
    const stored = localStorage.getItem(DONATION_METADATA_KEY);
    if (!stored) return null;

    const metadataMap = JSON.parse(stored);
    return metadataMap[txHash] || null;
  } catch (error) {
    console.error('Failed to get donation metadata:', error);
    return null;
  }
};

interface DonationListProps {
  donations: Donation[];
  searchAddress: string;
  setSearchAddress: (address: string) => void;
  compact?: boolean;
}

const DonationList: React.FC<DonationListProps> = ({
  donations,
  searchAddress,
  setSearchAddress,
  compact = false
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [metadataMap, setMetadataMap] = useState<Record<string, string>>({});

  // Example descriptions for demonstration
  const exampleDescriptions = [
    "Supporting flood victims in Southeast Asia",
    "Donation for educational supplies",
    "Contributing to the community fund",
    "Supporting healthcare initiatives",
    "Helping with disaster relief",
  ];

  // Load metadata for donations when component mounts or donations change
  useEffect(() => {
    const loadMetadata = async () => {
      const newMetadataMap: Record<string, string> = {};

      // Debug logging to find descriptions
      console.log('Current donations:', donations);

      // Log all localStorage keys to find where descriptions are stored
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allKeys.push(key);
      }
      console.log('All localStorage keys:', allKeys);

      for (const donation of donations) {
        if (donation.transactionHash) {
          const ipfsHash = getDonationMetadata(donation.transactionHash);
          if (ipfsHash) {
            newMetadataMap[donation.id] = ipfsHash;
          }
        }
      }

      setMetadataMap(newMetadataMap);
    };

    loadMetadata();
  }, [donations]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'Unknown';
    // Always return the full address without truncation
    return address;
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: compact ? undefined : '2-digit',
      minute: compact ? undefined : '2-digit',
      second: compact ? undefined : '2-digit',
      hour12: !compact
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Get short version of IPFS hash for display
  const formatIpfsHash = (hash: string) => {
    if (!hash) return '';
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No donations found.</p>
      </div>
    );
  }

  // Determine which donations to display
  const displayedDonations = showAll ? donations : donations.slice(0, compact ? 2 : 2);

  return (
    <div className={`bg-white rounded-lg ${compact ? '' : 'shadow'}`}>
      {!compact && (
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">Recent Donations</h2>
        </div>
      )}

      <div className="p-5">
        {/* Search input - only show in full mode */}
        {!compact && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Search by wallet address"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchAddress && (
                <button
                  onClick={() => setSearchAddress('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            {donations.length === 0 && searchAddress && (
              <p className="text-gray-500 text-sm mt-2">No donations found for this address.</p>
            )}
          </div>
        )}

        {/* Donations list */}
        {donations.length === 0 ? (
          <p className="text-gray-500 text-center">No donations yet.</p>
        ) : (
          <div className="space-y-6">
            {displayedDonations.map((donation, index) => (
              <div key={index} className={`bg-white rounded-lg shadow mb-4 overflow-hidden relative border border-gray-100 hover:shadow-md transition-shadow ${compact ? 'p-4' : 'p-5'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 mb-1`}>From</p>
                    <p className={`font-mono ${compact ? 'text-xs' : 'text-sm'} bg-gray-50 p-2 rounded-md break-all`}>{formatAddress(donation.donor)}</p>

                    {/* Only show description if it actually exists */}
                    {donation.description && (
                      <p className={`mt-3 ${compact ? 'text-xs' : 'text-sm'} text-gray-600 italic`}>
                        "{donation.description}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-blue-600`}>{donation.amount} ETH</p>
                    <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>
                      {formatDate(donation.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Show more/less button - only show in non-compact (full) mode */}
            {!compact && donations.length > 2 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {showAll ? 'Show Less' : `Show All Donations (${donations.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationList;