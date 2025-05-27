import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract, initializeProposalManagement } from '../utils/contracts';
import { safeToast } from '../utils/toast';

export interface Proposal {
  id: number;
  description: string;
  amount: bigint;
  votesFor: number;
  votesAgainst: number;
  signatureCount?: number;
  approved?: boolean;
  executed: boolean;
  cancelled: boolean;
  creationTime: number;
  executionTime: number;
  proposer: string;
  recipient: string;
}

interface ProposalContextType {
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  loading: boolean;
  error: string | null;
  fetchProposals: () => Promise<void>;
  setConnectedAddress: (address: string) => void;
  refreshProposals: () => Promise<void>;
}

export const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  const initializeContract = useCallback(async () => {
    try {
      const provider = await getProvider();

      // Try to get a signer, but proceed even if we can't
      try {
        const signer = await provider.getSigner();
        await initializeProposalManagement(signer);
      } catch (signerError) {
        console.warn('Could not get signer, proceeding in read-only mode:', signerError);
      }

      // Mark as initialized regardless of signer availability
      setInitialized(true);
      console.log('Contract initialized successfully');
    } catch (err: any) {
      console.error('Error initializing contract:', err);

      // Even if initialization fails, we'll still try to proceed
      // This allows read-only functionality to work
      setInitialized(true);

      // Log the error but don't show it to the user unless it's critical
      if (err.message.includes('contract not deployed') ||
          err.message.includes('invalid address')) {
        let errorMessage = 'Failed to initialize contract';
        setError(errorMessage);
        safeToast.error(errorMessage);
      } else {
        console.warn('Non-critical initialization error:', err);
      }
    }
  }, []);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  const fetchProposals = useCallback(async () => {
    if (!initialized) {
      console.log('Contract not initialized yet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get provider and check connection
      const provider = await getProvider();
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      // Get signer info if available
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log('Connected address:', address);
      } catch (err) {
        console.log('No signer available, proceeding in read-only mode');
      }

      // Get contract and check connection
      try {
        const proposalContract = await getProposalManagementContract(provider);
        console.log('Contract address:', proposalContract.target);

        // Try to get owner info
        try {
          const owner = await proposalContract.owner();
          console.log('Contract owner:', owner);
        } catch (err) {
          console.log('Could not get contract owner:', err);
        }

        // Optional: check votingGovernanceContract accessor if present
        if ('votingGovernanceContract' in (proposalContract as any)) {
          try {
            const vgAddr = await (proposalContract as any).votingGovernanceContract();
            console.log('VotingGovernance contract:', vgAddr);
            if (vgAddr === '0x0000000000000000000000000000000000000000') {
              console.warn('VotingGovernance contract address is zero');
            }
          } catch (vgErr) {
            console.warn('Could not query votingGovernanceContract', vgErr);
          }
        }

        // Fetch all proposals in one call
        let rawProposals: any[] = [];
        try {
          rawProposals = await proposalContract.getAllProposals();

          const fetchedProposals: Proposal[] = rawProposals.map((p: any) => ({
            id: Number(p.id),
            description: p.description,
            amount: p.amountRequested ?? p.amount, // handle naming diff
            votesFor: Number(p.voteCount ?? p.votesFor ?? 0),
            votesAgainst: Number(p.votesAgainst ?? 0),
            signatureCount: Number(p.signatureCount ?? 0),
            approved: p.approved ?? false,
            executed: p.executed,
            cancelled: p.cancelled ?? false,
            creationTime: Number(p.creationTime ?? 0),
            executionTime: Number(p.executionTime ?? 0),
            proposer: p.creator ?? p.proposer,
            recipient: p.recipient
          }));

          setProposals(fetchedProposals);
        } catch (err) {
          console.error('getAllProposals failed:', err);
          setError('Failed to fetch proposals');
        }
      } catch (contractError) {
        console.error('Error getting contract:', contractError);
        setError('Failed to initialize contract');
      }
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      const errorMessage = err.message || 'Unknown error';
      setError(`Failed to fetch proposals: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      fetchProposals();
    }
  }, [initialized, fetchProposals]);

  const refreshProposals = useCallback(async () => {
    await fetchProposals();
  }, [fetchProposals]);

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        setProposals,
        loading,
        error,
        fetchProposals,
        setConnectedAddress,
        refreshProposals
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposals = () => {
  const context = useContext(ProposalContext);
  if (context === undefined) {
    throw new Error('useProposals must be used within a ProposalProvider');
  }
  return context;
};