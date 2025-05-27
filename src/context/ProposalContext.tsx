import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getProposals, checkStakeholderStatus, hasVoted } from '../utils/contractInteractions';
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

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isStakeholder, setIsStakeholder] = useState(false);
  const [votedProposals, setVotedProposals] = useState<Set<number>>(new Set());
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  // Fetch proposals when component mounts or address changes
  useEffect(() => {
    if (connectedAddress) {
      refreshProposals();
      checkStakeholderStatus(connectedAddress)
        .then(({ isStakeholder: status }) => {
          setIsStakeholder(status);
        })
        .catch(err => {
          console.error('Error checking stakeholder status:', err);
        });
    }
  }, [connectedAddress]);

  const refreshProposals = async () => {
    if (!connectedAddress) return;
    
    setLoading(true);
    setLoadingProgress(0);
    setError(null);
    
    try {
      // Fetch proposals
      const fetchedProposals = await getProposals();
      setProposals(fetchedProposals);
      setLoadingProgress(50);
      
      // Check which proposals the user has voted on
      const voted = new Set<number>();
      for (const proposal of fetchedProposals) {
        setLoadingProgress(50 + Math.floor((fetchedProposals.indexOf(proposal) / fetchedProposals.length) * 50));
        try {
          const hasUserVoted = await hasVoted(proposal.id, connectedAddress);
          if (hasUserVoted) {
            voted.add(proposal.id);
          }
        } catch (err) {
          console.error(`Error checking vote status for proposal ${proposal.id}:`, err);
        }
      }
      
      setVotedProposals(voted);
      setLoadingProgress(100);
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      setError(err.message || 'Failed to fetch proposals');
      toast.error(`Error: ${err.message || 'Failed to fetch proposals'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async (proposalId: number): Promise<boolean> => {
    if (!connectedAddress) return false;
    
    try {
      const hasUserVoted = await hasVoted(proposalId, connectedAddress);
      if (hasUserVoted) {
        setVotedProposals(prev => new Set([...prev, proposalId]));
      }
      return hasUserVoted;
    } catch (err) {
      console.error(`Error checking vote status for proposal ${proposalId}:`, err);
      return false;
    }
  };

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
        setConnectedAddress
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

export default ProposalContext;
