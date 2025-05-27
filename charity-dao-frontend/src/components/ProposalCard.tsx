import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getFundAllocationContract, getProposalManagementContract, getCharityDAOPlatformContract } from '../utils/contracts';

interface ProposalCardProps {
  proposal: {
    id: bigint;
    description: string;
    amount: bigint;
    recipient: string;
    proposer?: string;
    votesFor: bigint;
    votesAgainst: bigint;
    hasVoted: boolean;
    canVote: boolean;
    isStakeholder: boolean;
    isAdmin: boolean;
    executed: boolean;
    canExecute: boolean;
    isApproved: boolean;
    needsSigning: boolean;
    canSign: boolean;
    isSigned: boolean;
    signatureCount?: number;
    executionTime?: number;
  };
  onVote: (proposalId: bigint) => Promise<void>;
  onSign: (proposalId: bigint) => Promise<void>;
  onExecute: (proposalId: bigint) => Promise<void>;
}

// Helper function to format time remaining in a human-readable format
const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "0s";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
};

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVote, onSign }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [userSigned, setUserSigned] = useState<boolean>(proposal.isSigned);

  // Timelock implementation
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get execution time from proposal
  const executionTime = proposal.executionTime ? Number(proposal.executionTime) : 0;

  // Calculate time remaining until execution is allowed
  const timeRemaining = Math.max(0, executionTime - currentTime);

  // Determine if the proposal is ready to execute
  // A proposal is ready when:
  // 1. It is approved
  // 2. It has not been executed yet
  // 3. The timelock period has passed (current time >= execution time)
  const readyToExecute = proposal.isApproved &&
                         !proposal.executed &&
                         (currentTime >= executionTime);

  // No debug panel in production

  // After any action, reload proposal data (parent should handle this via props)
  const handleVote = async () => {
    if (proposal.hasVoted) {
      toast.error('You have already voted on this proposal');
      return;
    }
    setIsVoting(true);
    try {
      await onVote(proposal.id);
      toast.success('Vote cast successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
      toast.error(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSign = async () => {
    if (proposal.isSigned) {
      toast.error('You have already signed this proposal');
      return;
    }
    setIsSigning(true);
    try {
      await onSign(proposal.id);
      setUserSigned(true);

      // Update the UI immediately to show the signature
      // This ensures the counter updates right away
      if (sigCount < 1) {
        // Force a re-render with the updated signature count
        setIsSigning(false);
        setIsSigning(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign';
      toast.error(errorMessage);
    } finally {
      setIsSigning(false);
    }
  };

  // Execute handler - uses the CharityDAOPlatform contract to execute the proposal
  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      // Show a loading toast that we'll update with progress
      const toastId = toast.loading('Preparing to execute proposal...');

      // Get provider and signer
      const provider = await getProvider();
      const signer = await provider.getSigner();

      // Get the CharityDAOPlatform contract - this is the main contract that has permission to execute
      const platformContract = await getCharityDAOPlatformContract(provider);
      const platformContractWithSigner = platformContract.connect(signer);

      // Get the FundAllocation contract for balance check
      const fundContract = await getFundAllocationContract(provider);

      // Get contract address for balance check
      const contractAddress = (fundContract as any).target || (fundContract as any).address;

      // Check contract balance before execution
      toast.update(toastId, {
        render: 'Checking contract balance...',
        isLoading: true
      });

      const balanceBefore = await provider.getBalance(contractAddress);
      console.log(`Contract balance before execution: ${ethers.formatEther(balanceBefore)} ETH`);

      // Check if contract has enough funds
      if (balanceBefore < proposal.amount) {
        toast.update(toastId, {
          render: `Insufficient funds in contract. Available: ${ethers.formatEther(balanceBefore)} ETH, Required: ${ethers.formatEther(proposal.amount)} ETH`,
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Check if the proposal can be executed
      toast.update(toastId, {
        render: 'Checking if proposal can be executed...',
        isLoading: true
      });

      // Get the proposal management contract to check execution status
      const proposalContract = await getProposalManagementContract(provider);

      // Check if the proposal is approved
      const proposalDetails = await proposalContract.getProposalById(proposal.id);
      if (!proposalDetails.approved) {
        toast.update(toastId, {
          render: 'Proposal is not approved yet',
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Check if the proposal is already executed
      if (proposalDetails.executed) {
        toast.update(toastId, {
          render: 'Proposal has already been executed',
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Check if the user is the owner
      const owner = await proposalContract.owner();
      const userAddress = await signer.getAddress();
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        toast.update(toastId, {
          render: 'Only the owner can execute proposals',
          type: 'error',
          isLoading: false
        });
        return;
      }

      // Execute the proposal using the CharityDAOPlatform contract
      toast.update(toastId, {
        render: 'Waiting for wallet confirmation...',
        isLoading: true
      });

      console.log('Executing proposal through CharityDAOPlatform contract...');
      console.log('Proposal ID:', proposal.id.toString());

      // Execute with fixed gas limit to avoid estimation issues
      const tx = await (platformContractWithSigner as any).executeProposal(proposal.id, {
        gasLimit: 500000 // Fixed gas limit for reliability
      });

      toast.update(toastId, {
        render: `Transaction sent: ${tx.hash.substring(0, 10)}... (waiting for confirmation)`,
        isLoading: true
      });

      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Check contract balance after execution
      const balanceAfter = await provider.getBalance(contractAddress);
      console.log(`Contract balance after execution: ${ethers.formatEther(balanceAfter)} ETH`);

      // Calculate the difference
      const difference = balanceBefore - balanceAfter;
      console.log(`Balance difference: ${ethers.formatEther(difference)} ETH`);

      // Verify the difference matches the required amount (approximately)
      const tolerance = ethers.parseEther("0.01"); // Allow for small differences due to gas costs

      if (difference < proposal.amount - tolerance) {
        console.warn(`Warning: The transferred amount (${ethers.formatEther(difference)} ETH) is less than expected (${ethers.formatEther(proposal.amount)} ETH)`);

        toast.update(toastId, {
          render: 'Transaction completed, but funds may not have transferred correctly. Please check balances.',
          type: 'warning',
          isLoading: false
        });
      } else {
        console.log(`Funds successfully transferred! Amount: ${ethers.formatEther(difference)} ETH`);

        // Show success message
        toast.update(toastId, {
          render: 'Proposal executed successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 5000
        });

        // Show a second toast with details about the transfer
        toast.success(
          <div>
            <p>Funds have been transferred to the recipient!</p>
            <p className="mt-1 text-sm">Recipient: {proposal.recipient.substring(0, 8)}...{proposal.recipient.substring(proposal.recipient.length - 6)}</p>
            <p className="text-sm">Amount: {ethers.formatEther(proposal.amount)} ETH</p>
            <p className="text-sm text-green-600">Transaction: {tx.hash.substring(0, 10)}...</p>
          </div>,
          { autoClose: 8000 }
        );
      }

      // Refresh the page after successful execution
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute';
      console.error('Execution error:', error);

      // Show a more detailed error message
      if (errorMessage.includes('Insufficient funds')) {
        toast.error(
          <div>
            <p>Insufficient funds in contract to execute proposal.</p>
            <p className="mt-1 text-sm">Please add more ETH to the contract and try again.</p>
          </div>
        );
      } else if (errorMessage.includes('user rejected')) {
        toast.error('Transaction was rejected in your wallet');
      } else if (errorMessage.includes('Internal JSON-RPC error')) {
        toast.error(
          <div>
            <p>MetaMask RPC error occurred.</p>
            <p className="mt-1 text-sm">This may be due to a gas estimation issue. Please try again.</p>
          </div>
        );
      } else if (errorMessage.includes('unpermitted intrinsics')) {
        toast.error(
          <div>
            <p>Browser security restriction prevented execution.</p>
            <p className="mt-1 text-sm">This is a browser security feature. Please try again.</p>
          </div>
        );
      } else if (errorMessage.includes('Not authorized') || errorMessage.includes('Only owner or platform')) {
        toast.error(
          <div>
            <p>Authorization error: Contract permissions issue detected.</p>
            <p className="mt-1 text-sm">This requires the administrator to run the authorization fix script:</p>
            <code className="block bg-gray-100 p-2 mt-1 text-xs rounded">
              npx hardhat run scripts/fix-authorization-issues.js --network ganache
            </code>
            <p className="mt-1 text-sm">After running the script, try again.</p>
          </div>
        );
      } else {
        toast.error(
          <div>
            <p>Execution failed: {errorMessage}</p>
            <p className="mt-1 text-sm">Please check the console for more details and try again.</p>
          </div>
        );
      }


    } finally {
      setIsExecuting(false);
    }
  };

  // Force execution logic is now integrated into the handleExecute function

  // Signature progress handling -------------------------------------------
  // Get the raw signature count from the contract (0-2)
  let sigCount = Number(proposal.signatureCount ?? 0);

  // Ensure the count is between 0 and 2
  sigCount = Math.max(0, Math.min(sigCount, 2));

  // If the user has signed, make sure their signature is counted in the UI
  // This ensures the counter updates immediately after signing
  if (proposal.isSigned && sigCount < 1) {
    sigCount = 1;
  }

  // After approval or execution always show full 2/2
  if (proposal.isApproved || proposal.executed) {
    sigCount = 2;
  }

  // No timelock-related effects needed

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-3 overflow-hidden relative border border-gray-100 hover:shadow-md transition-shadow">
        <div
          className="p-5 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-gray-800">{proposal.description}</h3>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex items-baseline mb-3">
            <span className="text-gray-600 mr-2">Amount:</span>
            <span className="text-lg font-medium text-blue-600">{ethers.formatEther(proposal.amount)} ETH</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(Number(proposal.votesFor) / 3) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {proposal.votesFor.toString()}/3
              </span>
            </div>

            {/* Signature progress - shown after votes threshold reached */}
            {(proposal.needsSigning || proposal.isApproved || proposal.executed) && (
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(sigCount / 2) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {sigCount}/2
                </span>
              </div>
            )}

            <div className="flex items-center">
              {proposal.executed ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Executed
                </span>
              ) : proposal.isApproved ? (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Approved
                </span>
              ) : proposal.needsSigning ? (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Needs Signing
                </span>
              ) : proposal.hasVoted ? (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  Voted
                </span>
              ) : proposal.canVote ? (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Can Vote
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-5 pt-2 space-y-5 border-t border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Description</h4>
              <p className="text-gray-800">{proposal.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Recipient</h4>
              <p className="font-mono text-sm bg-gray-50 p-3 rounded-md break-all">{proposal.recipient}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Amount Requested</h4>
              <p className="text-blue-600 text-xl font-semibold">{ethers.formatEther(proposal.amount)} ETH</p>
            </div>

            {/* Proposer address display */}
            {proposal.proposer && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Proposer</h4>
                <p className="font-mono text-sm bg-gray-50 p-3 rounded-md break-all">{proposal.proposer}</p>
              </div>
            )}

            {/* Signature count display */}
            {(proposal.needsSigning || proposal.isApproved || proposal.executed) && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Signatures Collected</h4>
                <p className="text-green-600 text-lg font-semibold">{sigCount}/2</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Status</h4>
              <div className="flex flex-wrap gap-3">
                {/* Proposal Status Badge */}
                {proposal.executed ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Executed
                  </span>
                ) : proposal.isApproved ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Approved
                  </span>
                ) : proposal.needsSigning ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Needs Signing
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Voting in Progress
                  </span>
                )}

                {/* User's Voting Status Badge */}
                {proposal.hasVoted && !proposal.executed && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Your Vote Recorded
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5">
              {proposal.executed ? (
                <div className="bg-green-50 p-4 rounded-lg text-green-700 text-center font-medium">
                  <div>This proposal has been executed</div>
                  {proposal.executionTime && (
                    <div className="mt-1 text-xs text-gray-600">
                      Executed at: {new Date(Number(proposal.executionTime) * 1000).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : readyToExecute ? (
                <div className="space-y-3">
                  <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isExecuting ? 'Executing... (Check Console)' : 'Execute Proposal'}
                  </button>

                  {/* Execution instructions */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                    <p className="font-medium mb-1">Execution Instructions:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Click "Execute Proposal" above</li>
                      <li>Open browser console (F12 or Ctrl+Shift+J) to see detailed logs</li>
                      <li>Confirm the transaction in MetaMask when prompted</li>
                      <li>Wait for confirmation (this may take 15-30 seconds)</li>
                    </ol>
                  </div>
                </div>
              ) : proposal.needsSigning && !proposal.executed ? (
                proposal.isSigned ? (
                  <div className="bg-green-50 p-4 rounded-lg flex items-center justify-center space-x-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">You have already signed this proposal</span>
                  </div>
                ) : proposal.canSign ? (
                  <button
                    onClick={handleSign}
                    disabled={isSigning || userSigned}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isSigning ? 'Signing...' : 'Sign Proposal'}
                  </button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center">
                    You cannot sign this proposal
                  </div>
                )
              ) : proposal.canVote || proposal.hasVoted ? (
                proposal.hasVoted ? (
                  <div className="bg-green-50 p-4 rounded-lg flex items-center justify-center space-x-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">You have already voted on this proposal</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVote}
                    disabled={isVoting || !proposal.canVote}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isVoting ? 'Voting...' : 'Vote on Proposal'}
                  </button>
                )
              ) : (
                <div className={`p-4 rounded-lg text-center ${
                  proposal.isAdmin
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-50 text-gray-500'
                }`}>
                  {proposal.isAdmin
                    ? 'Admin'
                    : 'You cannot vote on this proposal'}
                </div>
              )}
            </div>

            {/* Show timelock status */}
            {proposal.isApproved && !proposal.executed && (
              <div className="mt-4">
                {timeRemaining > 0 ? (
                  <div className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Timelock active: {formatTimeRemaining(timeRemaining)} remaining
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Timelock completed - Ready to execute!
                    </div>
                  </div>
                )}
              </div>
            )}


          </div>
        )}
      </div>
    </>
  );
};

export default ProposalCard;