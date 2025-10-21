import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, ExternalLink } from 'lucide-react';

interface Donation {
  id: number;
  campaignId: number;
  amount: number;
  method: 'mpesa' | 'crypto';
  mpesaReceiptNumber?: string;
  timestamp: number;
  donor?: string;
  transactionHash?: string;
}

interface DonationFeedProps {
  campaignId?: number;
  limit?: number;
}

const DonationFeed: React.FC<DonationFeedProps> = ({ campaignId, limit = 10 }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRaised, setTotalRaised] = useState(0);

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [campaignId]);

  const fetchDonations = async () => {
    try {
      const url = campaignId
        ? `http://localhost:5000/api/special-donations/${campaignId}/donations`
        : 'http://localhost:5000/api/donations';

      const response = await fetch(url);
      const data = await response.json();

      const donationsList = data.donations || [];
      setDonations(donationsList.slice(0, limit));

      const total = donationsList.reduce((sum: number, d: Donation) => sum + d.amount, 0);
      setTotalRaised(total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const formatAmount = (amount: number, method: string) => {
    if (method === 'mpesa') {
      return `KES ${amount.toLocaleString()}`;
    }
    return `${(amount / 1e18).toFixed(2)} ETH`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Heart className="w-6 h-6 text-red-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Live Donations</h2>
        </div>
        <div className="flex items-center text-orange-600 font-semibold">
          <TrendingUp className="w-5 h-5 mr-2" />
          Total: KES {totalRaised.toLocaleString()}
        </div>
      </div>

      {/* Donations List */}
      {donations.length > 0 ? (
        <div className="space-y-3">
          {donations.map((donation, index) => (
            <div
              key={donation.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition"
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex items-center flex-1">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold mr-4">
                  {donation.method === 'mpesa' ? '📱' : '🔗'}
                </div>

                {/* Donation Info */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {formatAmount(donation.amount, donation.method)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {donation.method === 'mpesa' ? 'M-Pesa' : 'Crypto'} • {formatDate(donation.timestamp)}
                  </p>
                </div>
              </div>

              {/* Transaction Link */}
              {donation.transactionHash && (
                <a
                  href={`https://polygonscan.com/tx/${donation.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No donations yet. Be the first to donate!</p>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DonationFeed;

