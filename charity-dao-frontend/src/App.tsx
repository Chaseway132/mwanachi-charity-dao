import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getContractInstances } from './utils/contractHelpers';
import { getProvider } from './utils/web3';
import { ProposalProvider, useProposals } from './contexts/ProposalContext';
import DonationForm from './components/DonationForm';
import DonationList from './components/DonationList';
import ProposalList from './components/ProposalList';
import CreateProposalForm from './components/CreateProposalForm';
import TreasuryStatus from './components/TreasuryStatus';
import SignerManagement from './components/SignerManagement';
import { Donation, RawDonation } from './types';
import BeneficiaryList from './components/BeneficiaryList';

import ProposalApproval from './components/ProposalApproval';
import MetaMaskTest from './components/MetaMaskTest';
import TimeControl from './components/TimeControl';
import Help from './components/Help';
import Footer from './components/Footer';
import IPFSTestPanel from './components/IPFSTestPanel';
import FailedUploadsViewer from './components/FailedUploadsViewer';
// Import components but comment them out until they're needed
// import KYCForm from './components/KYCForm';
// import SettingsPanel from './components/SettingsPanel';
// import SignerList from './components/SignerList';
// import TransferDonation from './components/TransferDonation';
// import TransferList from './components/TransferList';
// import UserProfileButton from './components/UserProfileButton';
// import WalletCard from './components/WalletCard';

// Add a safe toast utility function to prevent runtime errors
const safeToast = {
  error: (message: string) => {
    try {
      // Make sure message is a string to prevent [object Object] errors
      const safeMessage = typeof message === 'string' ? message : JSON.stringify(message).substring(0, 100);
      toast.error(safeMessage);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', typeof message === 'string' ? message : 'Non-string error');
    }
  },
  success: (message: string) => {
    try {
      const safeMessage = typeof message === 'string' ? message : JSON.stringify(message).substring(0, 100);
      toast.success(safeMessage);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', typeof message === 'string' ? message : 'Non-string error');
    }
  },
  info: (message: string) => {
    try {
      const safeMessage = typeof message === 'string' ? message : JSON.stringify(message).substring(0, 100);
      toast.info(safeMessage);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', typeof message === 'string' ? message : 'Non-string error');
    }
  },
  warning: (message: string) => {
    try {
      const safeMessage = typeof message === 'string' ? message : JSON.stringify(message).substring(0, 100);
      toast.warning(safeMessage);
    } catch (e) {
      console.error('Toast error:', e);
      console.log('Toast message was:', typeof message === 'string' ? message : 'Non-string error');
    }
  }
};

// Define navigation tabs
type Tab = 'dashboard' | 'proposals' | 'donations' | 'beneficiaries' | 'signers' | 'help';

const AppContent: React.FC = () => {
  const { setConnectedAddress } = useProposals();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Check if the connected wallet is the contract owner
  useEffect(() => {
    const checkOwnerStatus = async () => {
      if (!walletAddress) {
        setIsOwner(false);
        return;
      }

      try {
        const provider = await getProvider();
        const { proposalContract } = await getContractInstances();
        const owner = await proposalContract.owner();
        setIsOwner(walletAddress.toLowerCase() === owner.toLowerCase());
      } catch (error) {
        console.error('Error checking owner status:', error);
        setIsOwner(false);
      }
    };

    checkOwnerStatus();
  }, [walletAddress]);

  // Handle wallet connection
  const connectWallet = async () => {
    try {
      setConnectionLoading(true);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        safeToast.error('MetaMask is not installed. Please install MetaMask to use this application.');
        window.open('https://metamask.io/download.html', '_blank');
        return;
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get provider and signer
      const provider = await getProvider(true);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setConnectedAddress(address);
      safeToast.success('Wallet connected successfully!');

      // Reload donations after connection
      loadDonations();

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      safeToast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnectionLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress('');
    setConnectedAddress('');
    safeToast.info('Wallet disconnected');
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Filter donations when search address changes
  useEffect(() => {
    if (!searchAddress.trim()) {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(donation =>
        donation.donor &&
        donation.donor.toLowerCase().includes(searchAddress.toLowerCase())
      );
      setFilteredDonations(filtered);
    }
  }, [searchAddress, donations]);

  const loadDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading donations...');
      const { platformContract } = await getContractInstances();

      const rawDonations = await platformContract.getAllDonations();
      console.log('Raw Donations:', rawDonations);

      // Format the donations
      const formattedDonations = rawDonations
        .filter((donation: RawDonation) =>
          donation &&
          donation.donor &&
          donation.donor !== '0x0000000000000000000000000000000000000000'
        )
        .map((donation: RawDonation, index: number) => {
          // Log the raw amount for debugging
          console.log("Raw amount for donation", donation.id.toString(), ":", donation.amount.toString());

          // Create a deterministic transaction hash if one isn't available from the blockchain
          // In a production app, we would store and retrieve the actual transaction hash
          const fakeTransactionHash = `donation-${donation.id.toString()}-${donation.timestamp.toString()}`;

          return {
            id: Number(donation.id),
            donor: donation.donor,
            amount: ethers.formatEther(donation.amount),
            timestamp: donation.timestamp.toString(),
            metadataHash: donation.metadataHash,
            transactionHash: fakeTransactionHash
          };
        });

      // Sort donations by timestamp (newest first)
      formattedDonations.sort((a: Donation, b: Donation) => {
        const timeA = new Date(Number(a.timestamp) * 1000).getTime();
        const timeB = new Date(Number(b.timestamp) * 1000).getTime();
        return timeB - timeA;
      });

      setDonations(formattedDonations);
    } catch (error) {
      console.error('Error loading donations:', error);
      safeToast.error('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  // Initialize filtered donations when donations are loaded
  useEffect(() => {
    setFilteredDonations(donations);
  }, [donations]);

  const handleDonationSuccess = useCallback(() => {
    loadDonations();
  }, [loadDonations]);

  const handleProposalCreated = useCallback(() => {
    // Reload proposals - this would be implemented in a production app
    console.log('Proposal created, would reload proposals in a production app');
  }, []);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
  return (
          <>
            <TreasuryStatus />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <h3 className="text-lg font-medium mb-3">Make a Donation</h3>
                  <DonationForm />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-3">Recent Donations</h3>
                  <DonationList
                    donations={filteredDonations}
                    searchAddress=""
                    setSearchAddress={() => {}}
                    compact={true}
                  />
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab('donations')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View All Donations →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Active Proposals</h2>
              <ProposalList compact={true} />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveTab('proposals')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View All Proposals →
                </button>
            </div>
          </div>
          </>
        );

      case 'proposals':
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Create Proposal</h2>
                <div className="bg-white rounded-lg shadow p-4">
                  <CreateProposalForm />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">All Proposals</h2>
                <div className="bg-white rounded-lg shadow p-4">
          <ProposalList />
        </div>
              </div>
            </div>

            {/* Only show admin functionality to owners */}
            {isOwner && (
              <div className="mt-6">
                <ProposalApproval />
              </div>
            )}
          </>
        );

      case 'donations':
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Make a Donation</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <DonationForm />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <DonationList
                    donations={filteredDonations}
                    searchAddress={searchAddress}
                    setSearchAddress={setSearchAddress}
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'beneficiaries':
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Fund Recipients</h2>
            <BeneficiaryList />
          </>
        );

      case 'signers':
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Signers Management</h2>
            <SignerManagement />
          </>
        );

      case 'help':
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Help & Documentation</h2>
            <Help />
            {isOwner && (
              <>
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">IPFS Testing Tools (Admin Only)</h2>
                  <IPFSTestPanel />
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Failed IPFS Uploads</h2>
                  <FailedUploadsViewer />
                </div>
              </>
            )}
          </>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ToastContainer position="top-right" />
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Charity DAO Platform</h1>

            <nav className="flex flex-wrap space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('proposals')}
                className={`px-3 py-2 rounded-md ${activeTab === 'proposals' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Proposals
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-3 py-2 rounded-md ${activeTab === 'donations' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Donations
              </button>
              <button
                onClick={() => setActiveTab('beneficiaries')}
                className={`px-3 py-2 rounded-md ${activeTab === 'beneficiaries' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Beneficiaries
              </button>
              <button
                onClick={() => setActiveTab('signers')}
                className={`px-3 py-2 rounded-md ${activeTab === 'signers' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Signers
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <span
                onClick={() => setActiveTab('help')}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Help
              </span>

              {walletAddress ? (
                <div className="relative group">
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span>{formatAddress(walletAddress)}</span>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div
                      onClick={disconnectWallet}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Disconnect Wallet
                    </div>
                    <div
                      onClick={() => navigator.clipboard.writeText(walletAddress)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Copy Address
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connectionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {connectionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>Connect Wallet</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {activeTab === 'dashboard' && 'Dashboard'}
          {activeTab === 'proposals' && 'Proposals'}
          {activeTab === 'donations' && 'Donations'}
          {activeTab === 'signers' && 'Signers & Governance'}
          {activeTab === 'help' && 'Help & Documentation'}
        </h2>

        {renderContent()}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ProposalProvider>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer position="top-right" autoClose={5000} />
        <AppContent />
      </div>
    </ProposalProvider>
  );
};

export default App;