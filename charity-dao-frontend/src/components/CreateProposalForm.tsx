import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract, getDonationTrackingContract } from '../utils/contracts';
import { uploadProposalToIPFS } from '../utils/ipfs';
import { handleProposalCreationError, ErrorType } from '../utils/errorHandler';

// Minimum proposal amount from contract (0.1 ETH)
const MIN_PROPOSAL_AMOUNT = "0.1";
// Minimum donation threshold to create proposals (1.5 ETH)
const MIN_DONATION_THRESHOLD = "1.5";

interface CreateProposalFormProps {
  onProposalCreated?: () => void;
}

const CreateProposalForm: React.FC<CreateProposalFormProps> = ({ onProposalCreated }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if a user has donated enough to create proposals
  const checkUserDonationThreshold = async (userAddress: string): Promise<boolean> => {
    try {
      const provider = await getProvider();
      const donationContract = await getDonationTrackingContract(provider);

      // Check if the contract has the getTotalDonation function
      if (typeof donationContract.getTotalDonation === 'function') {
        const totalDonation = await donationContract.getTotalDonation(userAddress);
        if (totalDonation) {
          const donationInEth = ethers.formatEther(totalDonation);
          console.log(`User total donation: ${donationInEth} ETH`);
          return parseFloat(donationInEth) >= parseFloat(MIN_DONATION_THRESHOLD);
        }
      } else {
        // If function doesn't exist, we need to manually calculate from donation events
        console.log("getTotalDonation function not found, using fallback method");
        const donations = await donationContract.getAllDonations();

        let totalAmount = ethers.parseEther("0");
        for (const donation of donations) {
          if (donation.donor.toLowerCase() === userAddress.toLowerCase()) {
            totalAmount += donation.amount;
          }
        }

        const donationInEth = ethers.formatEther(totalAmount);
        console.log(`User total donation (calculated): ${donationInEth} ETH`);
        return parseFloat(donationInEth) >= parseFloat(MIN_DONATION_THRESHOLD);
      }
    } catch (error) {
      console.error("Error checking user donation threshold:", error);
      return false;
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !recipientAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check that amount is positive
    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    // Check minimum proposal amount (0.1 ETH)
    if (parseFloat(amount) < parseFloat(MIN_PROPOSAL_AMOUNT)) {
      toast.error(`Proposal amount must be at least ${MIN_PROPOSAL_AMOUNT} ETH`);
      return;
    }

    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      setIsLoading(true);

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Check if user has donated enough to create proposals
      const hasDonatedEnough = await checkUserDonationThreshold(userAddress);
      if (!hasDonatedEnough) {
        toast.error(`You need to donate at least ${MIN_DONATION_THRESHOLD} ETH total to create proposals`);
        setIsLoading(false);
        return;
      }

      // Get contract instance
      const proposalContract = await getProposalManagementContract(provider);

      // Connect with signer
      const contractWithSigner = proposalContract.connect(signer);

      // Convert amount to wei (1 ETH = 10^18 wei)
      const amountInWei = ethers.parseEther(amount);

      // Normalize address to checksum format
      const checksumAddress = ethers.getAddress(recipientAddress);

      console.log('Creating proposal with parameters:', {
        description,
        amount: amountInWei.toString(),
        recipient: checksumAddress
      });

      // Generate metadata for IPFS
      const timestamp = new Date().toISOString();
      const proposalMetadata = {
        description,
        amountRequested: amount,
        amountRequestedWei: amountInWei.toString(),
        recipient: checksumAddress,
        creatorAddress: userAddress,
        timestamp,
        createdAt: timestamp
      };

      // Create proposal with the correct parameter order: description, amount, recipient
      const tx = await contractWithSigner.createProposal(
        description,
        amountInWei,
        checksumAddress
      );

      toast.info(`Transaction sent: ${tx.hash.substring(0, 10)}... (Check your wallet for status)`);
      const receipt = await tx.wait();

      // Upload proposal metadata to IPFS after successful transaction
      if (receipt && receipt.status === 1) {
        try {
          console.log("Starting IPFS upload process with uploadProposalToIPFS");

          // Update metadata with transaction details
          const enhancedMetadata = {
            ...proposalMetadata,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber.toString(),
            blockHash: receipt.blockHash,
            gasUsed: receipt.gasUsed.toString(),
            from: receipt.from
          };

          console.log("Enhanced metadata prepared:", JSON.stringify(enhancedMetadata).substring(0, 200) + "...");

          // Find the ProposalCreated event to get the actual proposal ID
          console.log("Parsing transaction logs to find ProposalCreated event...");
          console.log("Number of logs found:", receipt.logs.length);

          const proposalCreatedEvent = receipt.logs
            .map((log: any, index: number) => {
              try {
                console.log(`Parsing log ${index}:`, log.topics);
                const parsed = proposalContract.interface.parseLog({
                  topics: log.topics,
                  data: log.data
                });
                console.log(`Log ${index} parsed as:`, parsed?.name);
                return parsed;
              } catch (e: any) {
                console.log(`Failed to parse log ${index}:`, e.message);
                return null;
              }
            })
            .filter((event: any) => event && event.name === 'ProposalCreated')
            .pop();

          console.log("ProposalCreated event found:", proposalCreatedEvent ? "Yes" : "No");

          if (proposalCreatedEvent) {
            console.log("Event arguments:", proposalCreatedEvent.args);
          }

          const proposalId = proposalCreatedEvent ?
            proposalCreatedEvent.args[0].toString() :
            'unknown';

          console.log(`Identified proposal ID from event: ${proposalId}`);
          const finalMetadata = {
            ...enhancedMetadata,
            proposalId,
            creatorAddress: userAddress,
          };

          console.log("Preparing IPFS upload with parameters:");
          console.log("- ProposalId:", proposalId);
          console.log("- Amount:", amount);
          console.log("- Timestamp:", timestamp);
          console.log("- Recipient:", checksumAddress);
          console.log("- Metadata size:", JSON.stringify(finalMetadata).length, "bytes");

          // Upload to IPFS
          const ipfsHash = await uploadProposalToIPFS(
            proposalId,
            amount,
            timestamp,
            checksumAddress,
            JSON.stringify(finalMetadata)
          );

          console.log("Proposal metadata stored on IPFS with hash:", ipfsHash);
        } catch (ipfsError: any) {
          console.error("Failed to upload proposal metadata to IPFS:", ipfsError);
          console.error("Error details:", {
            message: ipfsError.message,
            stack: ipfsError.stack,
            name: ipfsError.name
          });
          // Don't block the UI flow if IPFS upload fails
        }
      }

      toast.success('Proposal created successfully!');
      setDescription('');
      setAmount('');
      setRecipientAddress('');

      // Force a page reload after successful proposal creation to ensure UI updates
      setTimeout(() => {
      // Call success callback if provided
      if (onProposalCreated) {
        onProposalCreated();
      }

        // Reload the page after a short delay to ensure blockchain state is updated
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, 1000);
    } catch (error: any) {
      console.error('Error creating proposal:', error);

      // Use the centralized error handler
      const { type, message } = handleProposalCreationError(error, {
        showToast: false // We'll handle the toast ourselves for proposal creation
      });

      // Custom error handling for proposal creation
      if (error.message && error.message.includes("Amount too small")) {
        toast.error(`Proposal amount must be at least ${MIN_PROPOSAL_AMOUNT} ETH`);
      } else if (error.message && error.message.includes("Not enough donations")) {
        toast.error(`You need to donate at least ${MIN_DONATION_THRESHOLD} ETH to create proposals`);
      } else if (type === ErrorType.USER_REJECTED) {
        toast.info('Proposal creation cancelled');
      } else if (type === ErrorType.INSUFFICIENT_FUNDS) {
        toast.error('Your account has insufficient ETH for gas fees');
      } else if (type === ErrorType.CONTRACT_ERROR) {
        toast.error(`Contract error: ${message}`);
      } else {
        toast.error(message || 'Failed to create proposal');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Describe your proposal"
          rows={4}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount (ETH) <span className="text-xs text-gray-500">Min: {MIN_PROPOSAL_AMOUNT} ETH</span>
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="0.0"
          step="0.01"
          min={MIN_PROPOSAL_AMOUNT}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Address
        </label>
        <input
          type="text"
          id="recipient"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="0x..."
          required
        />
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded text-sm">
        <p className="text-blue-700">
          <span className="font-bold">Note:</span> You must have donated at least {MIN_DONATION_THRESHOLD} ETH total to be eligible to create proposals.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          {isLoading ? 'Creating...' : 'Create Proposal'}
        </button>
      </div>
    </form>
  );
};

export default CreateProposalForm;