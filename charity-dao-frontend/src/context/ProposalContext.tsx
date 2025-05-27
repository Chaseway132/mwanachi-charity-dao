import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getProposals, checkStakeholderStatus, hasVoted } from '../utils/contract-interactions';
import type { ProposalWithDetails } from '../types/contracts';

interface ProposalContextType {
  proposals: ProposalWithDetails[];
  loading: boolean;
  loadingProgress: number;
  error: string | null;
  isStakeholder: boolean;
  votedProposals: Set<number>;
  connectedAddress: string | null;
  refreshProposals: () => Promise<void>;
  checkVoteStatus: (proposalId: number) => Promise<boolean>;
  setConnectedAddress: (address: string | null) => void;
}

const ProposalContext = createContext<ProposalContextType>({
  proposals: [],
  loading: false,
  loadingProgress: 0,
  error: null,
  isStakeholder: false,
  votedProposals: new Set(),
  connectedAddress: null,
  refreshProposals: async () => {},
  checkVoteStatus: async () => false,
  setConnectedAddress: () => {}
});

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isStakeholder, setIsStakeholder] = useState(false);
  const [votedProposals, setVotedProposals] = useState<Set<number>>(new Set());
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const refreshProposals = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setError(null);
    try {
      const fetchedProposals = await getProposals();
      setProposals(fetchedProposals);
      setLoadingProgress(100);
    } catch (err) {
      setError('Failed to load proposals');
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async (proposalId: number): Promise<boolean> => {
    if (!connectedAddress) return false;
    try {
      return await hasVoted(proposalId, connectedAddress);
    } catch (err) {
      console.error('Error checking vote status:', err);
      return false;
    }
  };

  useEffect(() => {
    if (connectedAddress) {
      const checkStatus = async () => {
        try {
          const { isStakeholder: status } = await checkStakeholderStatus(connectedAddress);
          setIsStakeholder(status);
        } catch (err) {
          console.error('Error checking stakeholder status:', err);
          setIsStakeholder(false);
        }
      };
      checkStatus();
    }
  }, [connectedAddress]);

  useEffect(() => {
    refreshProposals();
  }, []);

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        loading,
        loadingProgress,
        error,
        isStakeholder,
        votedProposals,
        connectedAddress,
        refreshProposals,
        checkVoteStatus,
        setConnectedAddress,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposals = () => useContext(ProposalContext);