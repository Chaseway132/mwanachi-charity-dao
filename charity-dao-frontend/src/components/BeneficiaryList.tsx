import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';

interface Beneficiary {
  proposalId: number;
  description: string;
  recipient: string;
  amount: string;
  executionTime: string;
  transactionHash?: string;
  rawProposal?: any; // Store the raw proposal data for sorting
}

const BeneficiaryList: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  // Filter beneficiaries based on search address and sort by execution date
  const filteredBeneficiaries = useMemo(() => {
    // Filter by search address if provided
    const filtered = searchAddress.trim()
      ? beneficiaries.filter(beneficiary =>
          beneficiary.recipient.toLowerCase().includes(searchAddress.toLowerCase())
        )
      : [...beneficiaries];

    // Sort by proposal.executionTime (newest first)
    // We're relying on the actual blockchain data here
    return filtered.sort((a, b) => {
      // First try to sort by the raw executionTime from the blockchain
      // This is more reliable than parsing the formatted date string
      const rawProposalA = a.rawProposal?.executionTime ? Number(a.rawProposal.executionTime) : 0;
      const rawProposalB = b.rawProposal?.executionTime ? Number(b.rawProposal.executionTime) : 0;

      if (rawProposalA && rawProposalB) {
        return rawProposalB - rawProposalA;
      }

      // Fallback to proposal ID if execution times aren't available
      return b.proposalId - a.proposalId;
    });
  }, [beneficiaries, searchAddress]);

  // Determine which beneficiaries to display (all or just the first 4)
  const displayedBeneficiaries = showAll
    ? filteredBeneficiaries
    : filteredBeneficiaries.slice(0, 4);

  // Format a timestamp into a readable date string
  const formatExecutionDate = (timestamp: number): string => {
    try {
      // Convert seconds to milliseconds if needed
      const ms = timestamp > 1000000000000 ? timestamp : timestamp * 1000;
      const date = new Date(ms);

      // Format as "May 13, 2025" style date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting execution date:', error);
      return 'Unknown date';
    }
  };

  const loadBeneficiaries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = await getProvider();
      const proposalContract = await getProposalManagementContract(provider);

      // Get all proposals from the contract
      const rawProposals = await proposalContract.getAllProposals();

      if (rawProposals && Array.isArray(rawProposals)) {
        // Create an array to collect promises for fetching execution times
        const beneficiaryPromises = [];

        // Filter only executed proposals and create promises for each
        for (let index = 0; index < rawProposals.length; index++) {
          const proposal = rawProposals[index];

          // Skip non-executed proposals
          if (!proposal.executed) continue;

          const proposalId = index + 1; // 1-based indexing to match contract

          // Create a promise to process this executed proposal
          beneficiaryPromises.push(
            (async () => {
              let amountStr = "0";
              if (proposal.amountRequested) {
                try {
                  const amountBigInt = typeof proposal.amountRequested === 'bigint'
                    ? proposal.amountRequested
                    : BigInt(proposal.amountRequested.toString());

                  if (amountBigInt > BigInt(0)) {
                    amountStr = ethers.formatEther(amountBigInt);
                  }
                } catch (error) {
                  console.error('Error formatting amount:', error);
                }
              }

              // Use actual execution time from the blockchain if available
              let executionTimeStr = 'Unknown';
              try {
                if (proposal.executionTime) {
                  // The execution time should be stored on the proposal object
                  const executionTimestamp = Number(proposal.executionTime);
                  executionTimeStr = formatExecutionDate(executionTimestamp);
                  console.log(`Using actual execution time from blockchain for proposal ${proposalId}: ${executionTimeStr}`);
                } else {
                  // If no execution time is available, use the current date
                  const now = Date.now();
                  executionTimeStr = formatExecutionDate(now);
                  console.log(`No execution time available for proposal ${proposalId}, using current date`);
                }
              } catch (timeError) {
                console.error('Error getting execution time:', timeError);
                // Use current date as fallback
                executionTimeStr = formatExecutionDate(Date.now());
              }

              return {
                proposalId,
                description: proposal.description || 'Unnamed proposal',
                recipient: proposal.recipient || 'Unknown recipient',
                amount: amountStr,
                executionTime: executionTimeStr,
                transactionHash: proposal.executionTxHash,
                rawProposal: proposal // Store the raw proposal data for sorting
              };
            })()
          );
        }

        // Wait for all promises to resolve
        const beneficiaries = await Promise.all(beneficiaryPromises);

        // We'll sort in the filteredBeneficiaries useMemo
        setBeneficiaries(beneficiaries);
      } else {
        setError('Failed to retrieve proposals data');
        setBeneficiaries([]);
      }
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
      setError('Failed to load beneficiaries');
      setBeneficiaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-2"><p className="text-gray-500">Loading beneficiaries...</p></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded my-4">
        <h2 className="text-lg font-medium mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={loadBeneficiaries}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="bg-white rounded shadow-sm p-6 my-4">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No Beneficiaries Yet</h3>
          <p className="text-gray-500 mb-4">When proposals are executed, the recipients will appear here.</p>
          <button
            onClick={loadBeneficiaries}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm my-4">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Beneficiaries by Latest Execution</h2>
          <button
            onClick={loadBeneficiaries}
            className="text-blue-500 text-sm flex items-center"
          >
            Refresh
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-1">Funds that have been distributed through executed proposals, ranked by most recent execution</p>
      </div>

      {/* Add search input for filtering beneficiaries by address */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Search beneficiaries by address"
            className="w-full p-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchAddress && (
            <button
              onClick={() => setSearchAddress('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {filteredBeneficiaries.length === 0 && searchAddress && (
          <p className="text-gray-500 text-sm mt-2">No beneficiaries found with this address.</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                Rank
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Proposal
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Recipient
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Execution Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedBeneficiaries.map((beneficiary, index) => (
              <tr key={beneficiary.proposalId} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {beneficiary.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {beneficiary.proposalId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono break-all">
                    {beneficiary.recipient}
                  </div>
                  <div className="text-xs text-gray-500">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        navigator.clipboard.writeText(beneficiary.recipient);
                        toast.success('Address copied to clipboard!');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-600 font-medium">
                    {beneficiary.amount} ETH
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {beneficiary.executionTime}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More/Less button */}
      {filteredBeneficiaries.length > 4 && (
        <div className="p-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showAll ? (
              <>
                Show Less
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                Show All ({filteredBeneficiaries.length})
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryList;