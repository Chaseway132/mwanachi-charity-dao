import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MapPin, Users, Clock, CheckCircle, Share2, ExternalLink } from 'lucide-react';
import SpecialDonationForm from './SpecialDonationForm';
import CommentSection from './CommentSection';

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
  story: string;
  contractAddress: string;
}

interface Donation {
  id: number;
  amount: number;
  method: string;
  timestamp: number;
  donor?: string;
}

interface Update {
  id: number;
  title: string;
  content: string;
  timestamp: number;
}

interface SpecialDonationDetailProps {
  campaignId: number;
  onBack: () => void;
}

const SpecialDonationDetail: React.FC<SpecialDonationDetailProps> = ({ campaignId, onBack }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
    const interval = setInterval(fetchCampaignDetails, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const [campaignRes, donationsRes, updatesRes] = await Promise.all([
        fetch(`https://mwanachi-charity-dao-backend.onrender.com/api/special-donations/${campaignId}`),
        fetch(`https://mwanachi-charity-dao-backend.onrender.com/api/special-donations/${campaignId}/donations`),
        fetch(`https://mwanachi-charity-dao-backend.onrender.com/api/special-donations/${campaignId}/updates`)
      ]);

      const campaignData = await campaignRes.json();
      const donationsData = await donationsRes.json();
      const updatesData = await updatesRes.json();

      setCampaign(campaignData.campaign);
      setDonations(donationsData.donations || []);
      setUpdates(updatesData.updates || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Help support ${campaign?.beneficiaryName}! ${campaign?.title}`;
    if (navigator.share) {
      navigator.share({ title: campaign?.title, text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-orange-500 hover:text-orange-600 mb-6 font-semibold"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Campaigns
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 text-white mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                <p className="text-lg opacity-90">{campaign.beneficiaryName}</p>
              </div>
              {campaign.verified && (
                <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Story */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Story</h2>
            <p className="text-gray-700 leading-relaxed">{campaign.story}</p>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Progress</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-lg mb-2">
                <span className="font-bold text-orange-600">
                  KES {campaign.currentAmount.toLocaleString()}
                </span>
                <span className="text-gray-600">
                  of KES {campaign.targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-4 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(campaign.currentAmount, campaign.targetAmount)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {getProgressPercentage(campaign.currentAmount, campaign.targetAmount).toFixed(0)}% funded
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.totalDonors}</p>
                <p className="text-sm text-gray-600">Donors</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{getDaysLeft(campaign.deadline)}</p>
                <p className="text-sm text-gray-600">Days Left</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Heart className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.totalDonors > 0 ? (campaign.currentAmount / campaign.totalDonors).toFixed(0) : 0}
                </p>
                <p className="text-sm text-gray-600">Avg Donation</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection campaignId={campaign.id} type="campaign" />

          {/* Recent Donations */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Donations</h2>

            {donations.length > 0 ? (
              <div className="space-y-3">
                {donations.slice(0, 5).map(donation => (
                  <div key={donation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">
                        KES {donation.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {donation.method === 'mpesa' ? '📱 M-Pesa' : '🔗 Crypto'} • {formatDate(donation.timestamp)}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No donations yet. Be the first to donate!</p>
            )}
          </div>

          {/* Updates */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Updates</h2>

            {updates.length > 0 ? (
              <div className="space-y-4">
                {updates.map(update => (
                  <div key={update.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{update.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(update.timestamp)}</p>
                    <p className="text-gray-700">{update.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No updates yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Donation Form */}
          {!campaign.closed && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-4">
              <button
                onClick={() => setShowDonationForm(!showDonationForm)}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
              >
                💝 Donate Now
              </button>
              
              {showDonationForm && (
                <SpecialDonationForm
                  campaignId={campaign.id}
                  onSuccess={() => {
                    setShowDonationForm(false);
                    fetchCampaignDetails();
                  }}
                />
              )}
            </div>
          )}

          {/* Campaign Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Info</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {campaign.location}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold text-gray-900 capitalize">{campaign.category}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">
                  {campaign.closed ? '✅ Completed' : '🟢 Active'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="font-semibold">
                  {campaign.verified ? '✅ Yes' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-lg transition"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Campaign
          </button>

          {/* Blockchain Link */}
          {campaign.contractAddress && (
            <a
              href={`https://polygonscan.com/address/${campaign.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-3 px-4 rounded-lg transition mt-4"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View on PolygonScan
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialDonationDetail;

