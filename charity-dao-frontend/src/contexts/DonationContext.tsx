import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProvider } from '../utils/web3';
import { getDonationTrackingContract } from '../utils/contracts';

interface Donation {
  id: number;
  donor: string;
  amount: bigint;
  timestamp: number;
}

interface DonationContextType {
  donations: Donation[];
  loading: boolean;
  error: string | null;
  fetchDonations: () => Promise<void>;
  refreshDonations: () => Promise<void>;
}

export const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = await getProvider();
      const contract = await getDonationTrackingContract(provider);
      const donationCount = await contract.getDonationCount();
      
      const fetchedDonations: Donation[] = [];
      for (let i = 0; i < donationCount; i++) {
        const donation = await contract.getDonation(i);
        fetchedDonations.push({
          id: i,
          donor: donation.donor,
          amount: donation.amount,
          timestamp: Number(donation.timestamp)
        });
      }
      
      setDonations(fetchedDonations);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDonations = useCallback(async () => {
    await fetchDonations();
  }, [fetchDonations]);

  return (
    <DonationContext.Provider
      value={{
        donations,
        loading,
        error,
        fetchDonations,
        refreshDonations
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}; 