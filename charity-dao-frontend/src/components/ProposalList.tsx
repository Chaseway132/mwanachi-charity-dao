import React, { useEffect, useState } from 'react';
import { useProposals } from '../contexts/ProposalContext';
import ProposalCard from './ProposalCard';
import { getProvider } from '../utils/web3';
import { castVote, hasVoted, signProposal, canExecuteProposal } from '../utils/contract-interactions';
import { getProposalManagementContract, getFundAllocationContract, getCharityDAOPlatformContract } from '../utils/contracts';
import { toast } from 'react-toastify';
import { getDonationTrackingContract } from '../utils/contracts';
import { ethers } from 'ethers';
import { uploadExecutionToIPFS, verifyExecutionMetadata, testExecutionUpload } from '../utils/ipfs';
import { handleExecutionError, handleVotingError, handleSigningError, ErrorType } from '../utils/errorHandler';

interface ProposalListProps {
  compact?: boolean;
}

const ProposalList: React.FC<ProposalListProps> = ({ compact = false }) => {
  const { proposals, loading, error, refreshProposals } = useProposals();
  const [searchRecipient, setSearchRecipient] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [signedMap, setSignedMap] = useState<Record<number, boolean>>({});
  const [authorizedSigner, setAuthorizedSigner] = useState<boolean>(false);
  const [isStakeholder, setIsStakeholder] = useState<boolean>(false);
  const [canExecuteMap, setCanExecuteMap] = useState<Record<number, boolean>>({});
  const [isTestingIpfs, setIsTestingIpfs] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const provider = await getProvider();
      try {
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setUserAddress(addr);
        const pm = await getProposalManagementContract(provider);
        setOwnerAddress(await pm.owner());
        const isAuth = await pm.isAuthorizedSigner(addr);
        setAuthorizedSigner(isAuth);

        // Determine stakeholder status via donation contract
        try {
          const donationContract = await getDonationTrackingContract(provider);
          const stake = await donationContract.isStakeholder(addr);
          setIsStakeholder(stake);
        } catch {}
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!userAddress || proposals.length === 0) return;
    (async () => {
      const map: Record<number, boolean> = {};
      const sMap: Record<number, boolean> = {};
      const cMap: Record<number, boolean> = {};
      const provider = await getProvider();
      const pm = await getProposalManagementContract(provider);

      // Check for any failed IPFS uploads for executed proposals
      const executedProposals = proposals.filter(p => p.executed);
      if (executedProposals.length > 0 && userAddress.toLowerCase() === ownerAddress.toLowerCase()) {
        console.log('Checking for failed IPFS uploads for executed proposals...');

        for (const p of executedProposals) {
          try {
            // Try to recover any failed IPFS uploads
            const recovered = await verifyExecutionMetadata(p.id.toString());
            if (recovered) {
              console.log(`Recovered execution metadata for proposal ${p.id}`);
              toast.success(`Recovered execution data for proposal #${p.id}`);
            }
          } catch (error) {
            console.error(`Error checking execution metadata for proposal ${p.id}:`, error);
          }
        }
      }

      for (const p of proposals) {
        try {
          map[p.id] = await hasVoted(p.id, userAddress);
        } catch {
          map[p.id] = false;
        }
        try {
          sMap[p.id] = await pm.hasSignedProposal(BigInt(p.id), userAddress);
        } catch {
          sMap[p.id] = false;
        }
        if (userAddress.toLowerCase() === ownerAddress.toLowerCase()) {
          try {
            cMap[p.id] = await canExecuteProposal(BigInt(p.id));
          } catch {
            cMap[p.id] = false;
          }
        }
      }
      setVotedMap(map);
      setSignedMap(sMap);
      setCanExecuteMap(cMap);
    })();
  }, [proposals, userAddress, ownerAddress]);

  // Poll canExecute more frequently (every 2 seconds) for owner/admin
  useEffect(() => {
    if (!userAddress || userAddress.toLowerCase() !== ownerAddress.toLowerCase()) return;

    // Initial check immediately when component mounts or dependencies change
    const checkExecutable = async () => {
      const provider = await getProvider();
      const updates: Record<number, boolean> = {};

      for (const p of proposals) {
        try {
          // Skip already executed proposals
          if (p.executed) {
            updates[p.id] = false;
            continue;
          }

          // For approved proposals, check if time lock has passed
          if (p.approved) {
            // Get current block timestamp
            const blockNumber = await provider.getBlockNumber();
            const block = await provider.getBlock(blockNumber);
            const blockTimestamp = block?.timestamp || Math.floor(Date.now() / 1000);

            // If time lock has passed, mark as executable
            if (blockTimestamp >= p.executionTime) {
              // Proposal is now executable
              updates[p.id] = true;
              continue;
            }
          }

          // Fallback to contract check
          updates[p.id] = await canExecuteProposal(BigInt(p.id));
        } catch (error) {
          console.error(`Error checking if proposal ${p.id} can be executed:`, error);
          updates[p.id] = false;
        }
      }

      setCanExecuteMap(prev => ({ ...prev, ...updates }));
    };

    // Run immediately
    checkExecutable();

    // Then poll every 2 seconds
    const poll = setInterval(checkExecutable, 2000);

    return () => clearInterval(poll);
  }, [proposals, userAddress, ownerAddress]);

  const handleVote = async (pid: bigint) => {
    try {
      await castVote(pid);
      await refreshProposals();
      setVotedMap(prev => ({ ...prev, [Number(pid)]: true }));
      toast.success('Vote cast successfully!');
    } catch (error: any) {
      handleVotingError(error);
    }
  };

  const handleSign = async (pid: bigint) => {
    try {
      await signProposal(pid);
      await refreshProposals();
      setSignedMap(prev => ({ ...prev, [Number(pid)]: true }));
      toast.success('Proposal signed successfully!');
    } catch (error: any) {
      handleSigningError(error);
    }
  };

  // Function to test IPFS upload
  const handleTestIpfsUpload = async () => {
    try {
      setIsTestingIpfs(true);
      const testToastId = toast.loading('Testing IPFS connection and upload...');

      const ipfsHash = await testExecutionUpload();

      toast.update(testToastId, {
        render: `IPFS test successful! Hash: ${ipfsHash.substring(0, 10)}...`,
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });

      // Open the IPFS gateway URL in a new tab
      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, '_blank');
    } catch (error: any) {
      console.error('IPFS test failed:', error);
      toast.error(`IPFS test failed: ${error.message}`);
    } finally {
      setIsTestingIpfs(false);
    }
  };

  const handleExecute = async (pid: bigint) => {
    try {
      // Show a loading toast that we'll update
      const loadingToastId = toast.loading('Preparing to execute proposal...');

      // Get provider and contracts
      const provider = await getProvider();
      const proposalContract = await getProposalManagementContract(provider);
      const fundContract = await getFundAllocationContract(provider);

      // Get proposal details
      const proposal = await proposalContract.getProposalById(pid);

      toast.update(loadingToastId, {
        render: 'Checking proposal state...',
        type: 'info',
        isLoading: true
      });

      // Check if proposal is approved
      if (!proposal.approved) {
        toast.update(loadingToastId, {
          render: 'Proposal is not approved yet',
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Check if proposal is already executed
      if (proposal.executed) {
        toast.update(loadingToastId, {
          render: 'Proposal has already been executed',
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Check if user is owner
      const owner = await proposalContract.owner();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        toast.update(loadingToastId, {
          render: 'Only the owner can execute proposals',
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Check contract balance
      const contractAddress = (fundContract as any).target || (fundContract as any).address;
      const balanceBefore = await provider.getBalance(contractAddress);

      // Get proposal amount
      const requiredAmount = proposal.amountRequested || proposal.amount;

      // Check if contract has enough funds
      if (balanceBefore < requiredAmount) {
        toast.update(loadingToastId, {
          render: `Insufficient funds in contract. Available: ${ethers.formatEther(balanceBefore)} ETH, Required: ${ethers.formatEther(requiredAmount)} ETH`,
          type: 'error',
          isLoading: false
        });

        toast.info('You can add ETH to the contract from the dashboard page.');
        return;
      }

      // Execute proposal
      toast.update(loadingToastId, {
        render: 'Executing proposal...',
        type: 'info',
        isLoading: true
      });

      // Use the CharityDAOPlatform contract for execution
      const platformContract = await getCharityDAOPlatformContract(provider);
      const platformContractWithSigner = platformContract.connect(signer);

      toast.update(loadingToastId, {
        render: 'Sending transaction to execute proposal...',
        type: 'info',
        isLoading: true
      });

      // Execute with fixed gas limit to avoid estimation issues
      const tx = await (platformContractWithSigner as any).executeProposal(pid, {
        gasLimit: 500000 // Fixed gas limit for reliability
      });

      toast.update(loadingToastId, {
        render: `Transaction sent: ${tx.hash.substring(0, 10)}... (waiting for confirmation)`,
        type: 'info',
        isLoading: true
      });

      // Wait for transaction confirmation
      await tx.wait(); // Wait for confirmation but we don't need the receipt

      // Verify the execution by checking contract balance
      const balanceAfter = await provider.getBalance(contractAddress);
      const difference = balanceBefore - balanceAfter;

      // Verify the difference matches the required amount (approximately)
      const tolerance = ethers.parseEther("0.01"); // Allow for small differences due to gas costs

      if (difference < requiredAmount - tolerance) {
        console.warn(`Warning: The transferred amount (${ethers.formatEther(difference)} ETH) is less than expected (${ethers.formatEther(requiredAmount)} ETH)`);

        toast.update(loadingToastId, {
          render: 'Transaction completed, but funds may not have transferred correctly. Please check balances.',
          type: 'warning',
          isLoading: false
        });
      } else {
        console.log(`Funds successfully transferred! Amount: ${ethers.formatEther(difference)} ETH`);

        toast.update(loadingToastId, {
          render: 'Proposal executed successfully!',
          type: 'success',
          isLoading: false
        });
      }

      // Upload execution metadata to IPFS
      try {
        // Get executor address
        const executor = await signer.getAddress();

        // Use current timestamp for IPFS upload to ensure compatibility
        const timestamp = Date.now().toString();

        console.log('Preparing to upload execution metadata to IPFS with timestamp:', new Date(Number(timestamp)).toLocaleString());

        // Create metadata with balance verification
        const metadata = JSON.stringify({
          proposalId: pid.toString(),
          executor,
          recipient: proposal.recipient,
          amount: requiredAmount.toString(),
          txHash: tx.hash,
          timestamp,
          method: 'CharityDAOPlatform',
          balanceBefore: balanceBefore.toString(),
          balanceAfter: balanceAfter.toString(),
          transferredAmount: difference.toString(),
          fundsTransferred: difference >= (requiredAmount - tolerance),
          executionDate: new Date().toISOString()
        });

        // Show a toast for IPFS upload
        const ipfsToastId = toast.loading('Uploading execution data to IPFS...');

        // Upload to IPFS
        const ipfsHash = await uploadExecutionToIPFS(
          pid.toString(),
          executor,
          proposal.recipient,
          ethers.formatEther(requiredAmount),
          timestamp,
          tx.hash,
          metadata
        );

        console.log('Successfully uploaded execution to IPFS with hash:', ipfsHash);
        toast.update(ipfsToastId, {
          render: 'Execution data stored on IPFS successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } catch (error) {
        const uploadErr = error as any; // Type assertion to handle the error properly
        console.error('Execution IPFS upload process failed with error:', uploadErr);

        // The data will be saved to localStorage by the uploadExecutionToIPFS function
        toast.warning('Execution was successful, but metadata could not be stored on IPFS. Will retry automatically next time.');
      }

      await refreshProposals();
      setCanExecuteMap(prev => ({ ...prev, [Number(pid)]: false }));
    } catch (error: any) {
      console.error('Execute failed:', error);

      // Use the centralized error handler
      const { type, message } = handleExecutionError(error, {
        showToast: false // We'll handle the toast ourselves for execution
      });

      // Custom error handling for execution
      if (type === ErrorType.USER_REJECTED) {
        toast.error('Transaction was cancelled in your wallet');
      } else if (type === ErrorType.INSUFFICIENT_FUNDS) {
        toast.error('Your account has insufficient ETH for gas fees');
      } else if (type === ErrorType.CONTRACT_ERROR) {
        toast.error(`Contract error: ${message}`);
        toast.info('This could be due to insufficient funds, authorization issues, or the proposal not being in the correct state.');
      } else {
        toast.error(message || 'Failed to execute proposal');
      }
    }
  };

  if (loading) return <div className="text-center py-4">Loading proposals...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Filter and sort proposals for display
  const sorted = [...proposals]
    .filter(p => {
      if (!searchRecipient.trim()) return true;
      return p.recipient.toLowerCase().includes(searchRecipient.trim().toLowerCase());
    })
    .sort((a, b) => b.id - a.id); // latest first

  const displayProposals = showAll ? sorted : sorted.slice(0, 2);

  // We'll use the compact prop to determine if we're on the dashboard
  // If compact=true, we're on the dashboard and shouldn't show the "Show All" button

  return (
    <div className="space-y-4">
      {/* Banner for stakeholder / admin status */}
      {userAddress && (
        <div
          className={`px-5 py-3 rounded-md text-sm font-medium mb-4 ${
            userAddress.toLowerCase() === ownerAddress.toLowerCase()
              ? 'bg-green-100 text-green-800'
              : isStakeholder
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {userAddress.toLowerCase() === ownerAddress.toLowerCase() ? (
            <div className="flex justify-between items-center">
              <div>
                {isStakeholder
                  ? 'You are the admin and a stakeholder — you can add signers, sign and execute.'
                  : 'You are the admin!'}
              </div>
              <button
                onClick={handleTestIpfsUpload}
                disabled={isTestingIpfs}
                className="ml-4 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
              >
                {isTestingIpfs ? 'Testing...' : 'Test IPFS'}
              </button>
            </div>
          ) : (
            isStakeholder ? 'You are a stakeholder ✓ You can vote on proposals' : 'Donate to become a stakeholder to vote on proposals'
          )}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by recipient address"
        value={searchRecipient}
        onChange={e => setSearchRecipient(e.target.value)}
        className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
      />

      {proposals.length === 0 ? (
        <p className="text-gray-500">No proposals found.</p>
      ) : (
        displayProposals.map(p => {
          const voted = votedMap[p.id] || false;
          const reachedVotes = p.votesFor >= 3;
          const signed = signedMap[p.id] || false;
          // Get the actual signature count from the contract
          const sigCount = Number(p.signatureCount ?? 0);
          const canExec = canExecuteMap[p.id] || false;
          return (
            <ProposalCard
              key={p.id}
              proposal={{
                id: BigInt(p.id),
                description: p.description,
                amount: p.amount,
                recipient: p.recipient,
                proposer: p.proposer,
                votesFor: BigInt(p.votesFor),
                votesAgainst: BigInt(p.votesAgainst),
                signatureCount: sigCount,
                hasVoted: voted,
                canVote: isStakeholder && !reachedVotes && !voted && userAddress.toLowerCase() !== ownerAddress.toLowerCase(),
                isAdmin: userAddress.toLowerCase() === ownerAddress.toLowerCase(),
                isStakeholder: isStakeholder,
                executed: p.executed,
                canExecute: canExec,
                isApproved: p.approved ?? false,
                needsSigning: reachedVotes && !p.approved,
                canSign: reachedVotes && authorizedSigner && !signed && !p.approved,
                isSigned: signed,
                executionTime: p.executionTime,
              }}
              onVote={handleVote}
              onSign={handleSign}
              onExecute={handleExecute}
            />
          );
        })
      )}
      {/* Show more / less - only show on the proposals page, not on dashboard */}
      {!compact && sorted.length > 2 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(prev => !prev)}
            className="px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {showAll ? `Show Less` : `Show All Proposals (${sorted.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalList;