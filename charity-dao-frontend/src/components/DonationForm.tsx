import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getProvider } from '../utils/web3';
import { parseEther } from 'ethers';
import { getCharityDAOPlatformContract } from '../utils/contracts';
import { uploadDonationToIPFS } from '../utils/ipfs';
import { handleDonationError, ErrorType } from '../utils/errorHandler';
import MPesaPaymentForm from './MPesaPaymentForm';

// Constants for localStorage
const DONATION_METADATA_KEY = 'donation_ipfs_mapping';

// Helper function to save donation metadata
const saveDonationMetadata = (txHash: string, ipfsHash: string) => {
  try {
    // Get existing metadata or initialize new object
    const existingData = localStorage.getItem(DONATION_METADATA_KEY);
    const metadataMap = existingData ? JSON.parse(existingData) : {};

    // Add new entry
    metadataMap[txHash] = ipfsHash;

    // Save back to localStorage
    localStorage.setItem(DONATION_METADATA_KEY, JSON.stringify(metadataMap));
    console.log('Donation metadata saved to localStorage:', { txHash, ipfsHash });
  } catch (error) {
    console.error('Failed to save donation metadata to localStorage:', error);
  }
};

interface DonationFormProps {
  onDonationSuccess?: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ onDonationSuccess }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'mpesa'>('crypto');

  const handleDonation = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);

      // Get provider and ensure network connection
      const provider = await getProvider(true); // Force new provider instance

      // Get signer with error handling
      let signer;
      try {
        signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        console.log('Connected with address:', userAddress);
      } catch (signerError) {
        console.error('Error getting signer:', signerError);
        toast.error('Failed to connect wallet. Please check MetaMask connection.');
        return;
      }

      // Get contract instance
      const charityDAOPlatform = await getCharityDAOPlatformContract(provider);

      // Connect with signer
      const platformWithSigner = charityDAOPlatform.connect(signer);

      // Convert amount to wei
      const amountInWei = parseEther(amount);

      // Make the donation
      console.log('Sending donation transaction...');
      const tx = await platformWithSigner.donate({ value: amountInWei });

      toast.info(`Transaction sent: ${tx.hash.substring(0, 10)}... (Check your wallet for status)`);
      const receipt = await tx.wait();

      // After successful donation, upload metadata to IPFS
      if (receipt && receipt.status === 1) {
        try {
          const timestamp = new Date().toISOString();
          const userAddress = await signer.getAddress();

          // Create metadata for the donation
          const donationMetadata = {
            amount,
            amountWei: amountInWei.toString(),
            donor: userAddress,
            description: description || "No description provided",
            timestamp,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber.toString(),
            blockHash: receipt.blockHash,
            gasUsed: receipt.gasUsed.toString()
          };

          // Find the DonationReceived event to get the donation ID
          const donationEvent = receipt.logs
            .map((log: any) => {
              try {
                if (!charityDAOPlatform.interface) {
                  console.warn('Contract interface is undefined');
                  return null;
                }
                return charityDAOPlatform.interface.parseLog({
                  topics: log.topics,
                  data: log.data
                });
              } catch (e) {
                return null;
              }
            })
            .filter((event: any) => event && event.name === 'DonationReceived')
            .pop();

          const donationId = donationEvent ?
            donationEvent.args[0].toString() :
            Date.now().toString();

          console.log(`Identified donation ID from event: ${donationId}`);

          // Upload to IPFS
          const ipfsHash = await uploadDonationToIPFS(
            donationId,
            amount,
            timestamp,
            userAddress,
            JSON.stringify(donationMetadata)
          );

          console.log("Donation metadata stored on IPFS with hash:", ipfsHash);

          // Save metadata to local storage
          saveDonationMetadata(tx.hash, ipfsHash);
        } catch (ipfsError) {
          console.error("Failed to upload donation metadata to IPFS:", ipfsError);
          // Don't block the UI flow if IPFS upload fails
        }
      }

      // Clear form and show success
      setAmount('');
      setDescription('');
      toast.success('Thank you for your donation!');

      // Add stakeholder notification
      toast.success('You are now a stakeholder!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Call success callback if provided
      if (onDonationSuccess) {
        onDonationSuccess();
      }

    } catch (error: any) {
      // Use the centralized error handler
      const { type } = handleDonationError(error);

      // Only clear form if it wasn't a user rejection
      if (type !== ErrorType.USER_REJECTED) {
        setAmount('');
        setDescription('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Payment Method Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setPaymentMethod('crypto')}
          className={`px-4 py-2 font-medium transition-colors ${
            paymentMethod === 'crypto'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          💳 Crypto (ETH)
        </button>
        <button
          onClick={() => setPaymentMethod('mpesa')}
          className={`px-4 py-2 font-medium transition-colors ${
            paymentMethod === 'mpesa'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📱 M-Pesa
        </button>
      </div>

      {/* Crypto Payment Form */}
      {paymentMethod === 'crypto' && (
        <form onSubmit={handleDonation}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="0.0"
              step="0.01"
              min="0"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder=""
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              {isLoading ? 'Processing...' : 'Donate'}
            </button>
          </div>
        </form>
      )}

      {/* M-Pesa Payment Form */}
      {paymentMethod === 'mpesa' && (
        <MPesaPaymentForm
          onPaymentInitiated={(data) => {
            console.log('M-Pesa payment initiated:', data);
          }}
          onPaymentSuccess={(data) => {
            console.log('M-Pesa payment successful:', data);
            if (onDonationSuccess) {
              onDonationSuccess();
            }
          }}
          onPaymentError={(error) => {
            console.error('M-Pesa payment error:', error);
          }}
        />
      )}
    </div>
  );
};

export default DonationForm;