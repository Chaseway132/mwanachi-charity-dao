import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract } from '../utils/contracts';
import type { ProposalManagementContract } from '../utils/contracts';

const SignerManagement: React.FC = () => {
  const [signers, setSigners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSignerAddress, setNewSignerAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    loadSigners();
  }, []);

  const loadSigners = async () => {
    try {
      setLoading(true);
      setError('');

      const provider = await getProvider();
      // Force a new contract instance
      const proposalContract = await getProposalManagementContract(provider);

      // Check if user is owner
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);

      const owner = await proposalContract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());

      // Get list of authorized signers
      const result = await proposalContract.getAuthorizedSigners();
      console.log("Raw authorized signers result:", result);

      // Try to access the underlying array data
      let authorizedSigners: string[] = [];
      try {
        // First try to convert to array directly
        authorizedSigners = [...result].map((addr: any) => addr.toString());
        console.log("Converted using spread operator:", authorizedSigners);
      } catch (error) {
        console.error("Error using spread operator:", error);
        try {
          // Fallback: try to access as array-like object
          authorizedSigners = Array.from({ length: result.length }, (_, i) => result[i].toString());
          console.log("Converted using Array.from with length:", authorizedSigners);
        } catch (error) {
          console.error("Error using Array.from:", error);
          // Last resort: try to access toArray() if it exists
          if (typeof result.toArray === 'function') {
            authorizedSigners = result.toArray().map((addr: any) => addr.toString());
            console.log("Converted using toArray():", authorizedSigners);
          }
        }
      }

      console.log("Final authorized signers array:", authorizedSigners);

      // Filter out zero address
      let filteredSigners = authorizedSigners.filter(addr =>
        addr && addr !== '0x0000000000000000000000000000000000000000'
      );
      console.log("Filtered signers:", filteredSigners);

      // Check if owner is a signer (they should be by default)
      const isOwnerSigner = await proposalContract.isAuthorizedSigner(owner);

      // Check if owner is already in the list
      const ownerInList = filteredSigners.some(
        (addr: string) => addr.toLowerCase() === owner.toLowerCase()
      );

      // If owner is a signer but not in the list, add them
      if (isOwnerSigner && !ownerInList) {
        console.log('Owner is a signer but not in the list, adding them');
        filteredSigners = [owner, ...filteredSigners];
      }

      setSigners(filteredSigners);
    } catch (error) {
      console.error("Error loading signers:", error);
      setError("Failed to load signers. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const addSigner = async () => {
    if (!ethers.isAddress(newSignerAddress)) {
      setError("Invalid Ethereum address");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(provider);

      // Check if current user is the owner
      const currentAddress = await signer.getAddress();
      const ownerAddress = await proposalContract.owner();
      const isOwner = currentAddress.toLowerCase() === ownerAddress.toLowerCase();

      if (!isOwner) {
        setError("Only the contract owner can add signers");
        return;
      }

      const contractWithSigner = proposalContract.connect(signer) as unknown as ProposalManagementContract;
      if (typeof contractWithSigner.addSigner === 'function') {
        const tx = await contractWithSigner.addSigner(newSignerAddress);
        await tx.wait();

        setSuccess(`Signer ${newSignerAddress} added successfully!`);
        setNewSignerAddress('');

        // Reload signers
        loadSigners();
      } else {
        setError("addSigner function not available on contract");
      }
    } catch (error: any) {
      console.error("Error adding signer:", error);
      setError(error.reason || error.message || "Unknown error adding signer");
    } finally {
      setLoading(false);
    }
  };

  const removeSigner = async (address: string) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const proposalContract = await getProposalManagementContract(provider);
      const contractWithSigner = proposalContract.connect(signer);

      // Perform pre-transaction checks
      try {
        console.log("Checking conditions before removing signer:", address);

        // Check if current user is the owner
        const owner = await proposalContract.owner();
        const currentUser = await signer.getAddress();

        if (owner.toLowerCase() !== currentUser.toLowerCase()) {
          setError("Only the contract owner can remove signers");
          return;
        }

        // Check if address is actually a signer
        const isActuallySigner = await proposalContract.isAuthorizedSigner(address);
        if (!isActuallySigner) {
          setError("This address is not a signer");
          return;
        }

        // Check if we can remove signers (must have more than required)
        const signersList = await proposalContract.getAuthorizedSigners();
        if (signersList.length <= 2) { // Assuming REQUIRED_SIGNATURES is 2
          setError("Cannot remove signer - must have more than the required number of signers (2)");
          return;
        }

        // Check if trying to remove the owner
        if (address.toLowerCase() === owner.toLowerCase()) {
          setError("Cannot remove the contract owner from signers");
          return;
        }
      } catch (checkError) {
        console.error("Error during pre-transaction checks:", checkError);
      }

      if (typeof contractWithSigner.removeSigner === 'function') {
        // Remove the signer without gas limit options
        console.log("Removing signer:", address);

        const tx = await contractWithSigner.removeSigner(address);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();

        // Handle null receipt
        if (receipt !== null) {
          if (receipt.status === 1) {
            setSuccess(`Signer ${address} removed successfully!`);

            // Reload signers
            loadSigners();
          } else {
            setError("Transaction failed");
          }
        } else {
          setError("Transaction might have failed - please check your wallet");
        }
      } else {
        setError("removeSigner function not available on contract");
      }
    } catch (error: any) {
      console.error("Error removing signer:", error);

      let errorMessage = "Unknown error removing signer";

      if (typeof error === 'object' && error !== null && 'message' in error) {
        const msg = error.message as string;

        if (msg.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet";
        } else if (msg.includes("Cannot remove owner")) {
          errorMessage = "Cannot remove the contract owner from signers";
        } else if (msg.includes("Not a signer")) {
          errorMessage = "This address is not a signer";
        } else if (msg.includes("Cannot have fewer signers")) {
          errorMessage = "Cannot have fewer signers than required signatures";
        } else if (msg.includes("missing revert data") || msg.includes("CALL_EXCEPTION")) {
          errorMessage = "Transaction would fail - possible reasons:";
          errorMessage += "\n- Not enough signers";
          errorMessage += "\n- Trying to remove owner";
          errorMessage += "\n- Address is not a signer";
        } else {
          errorMessage = error.reason || error.message || "Unknown error removing signer";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-5">Signers Management</h2>

      {!isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 p-4 mb-5">
          <p>Only the contract owner can manage signers.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg text-red-700 p-4 mb-5">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg text-green-700 p-4 mb-5">
          <p>{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {isOwner && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Add New Signer</h3>
              <div className="flex">
                <input
                  type="text"
                  value={newSignerAddress}
                  onChange={(e) => setNewSignerAddress(e.target.value)}
                  placeholder="Enter Ethereum address (0x...)"
                  className="flex-1 px-5 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
                <button
                  onClick={addSigner}
                  className="bg-blue-600 text-white px-5 py-3 rounded-r-lg hover:bg-blue-700 transition font-medium"
                  disabled={loading || !newSignerAddress}
                >
                  Add Signer
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Current Signers</h3>
            {signers.length === 0 ? (
              <p className="text-gray-500">No authorized signers found.</p>
            ) : (
              <ul className="space-y-3">
                {signers.map((address, index) => (
                  <li key={index} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded-md break-all">
                      {address === userAddress ? (
                        <span className="font-bold">{address} <span className="text-blue-600">(You)</span></span>
                      ) : (
                        address
                      )}
                    </div>
                    {isOwner && address !== userAddress && (
                      <button
                        onClick={() => removeSigner(address)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition font-medium ml-3"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="mt-6 text-right">
        <button
          onClick={loadSigners}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default SignerManagement;