import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Users, Clock, CheckCircle } from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  beneficiaryName: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  totalDonors: number;
  deadline: number;
  verified: boolean;
  closed: boolean;
  location: string;
  category: string;
}

const SpecialDonationsList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/special-donations');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysLeft = (deadline: number) => {
    const now = Date.now();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      emergency: 'bg-red-100 text-red-800',
      medical: 'bg-blue-100 text-blue-800',
      education: 'bg-green-100 text-green-800',
      disaster: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'active') return !campaign.closed;
    if (filter === 'completed') return campaign.closed;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🆘 Special Causes</h1>
        <p className="text-gray-600">Help individuals and families in urgent need</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Campaigns
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === 'active'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === 'completed'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map(campaign => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-4 text-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{campaign.title}</h3>
                {campaign.verified && (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
              <p className="text-sm opacity-90">{campaign.beneficiaryName}</p>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Category Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(campaign.category)}`}>
                  {campaign.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {campaign.description}
              </p>

              {/* Location */}
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                {campaign.location}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">
                    KES {campaign.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    of KES {campaign.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${getProgressPercentage(campaign.currentAmount, campaign.targetAmount)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getProgressPercentage(campaign.currentAmount, campaign.targetAmount).toFixed(0)}% funded
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {campaign.totalDonors} donors
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {getDaysLeft(campaign.deadline)} days left
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                {campaign.closed ? (
                  <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-semibold text-center">
                    ✅ Campaign Completed
                  </div>
                ) : (
                  <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm font-semibold text-center">
                    🟢 Active
                  </div>
                )}
              </div>

              {/* Button */}
              <a
                href={`/special-donations/${campaign.id}`}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition block text-center"
              >
                View & Donate
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No campaigns found</p>
        </div>
      )}
    </div>
  );
};

export default SpecialDonationsList;

