import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

interface FundFlowData {
  mpesaAmount: number;
  cryptoAmount: number;
  targetAmount: number;
  currentAmount: number;
  transfers: Array<{
    date: string;
    amount: number;
  }>;
}

interface FundFlowChartProps {
  campaignId?: number;
}

const FundFlowChart: React.FC<FundFlowChartProps> = ({ campaignId }) => {
  const [fundData, setFundData] = useState<FundFlowData>({
    mpesaAmount: 0,
    cryptoAmount: 0,
    targetAmount: 0,
    currentAmount: 0,
    transfers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundData();
  }, [campaignId]);

  const fetchFundData = async () => {
    try {
      const url = campaignId
        ? `http://localhost:5000/api/special-donations/${campaignId}`
        : 'http://localhost:5000/api/donations/stats';

      const response = await fetch(url);
      const data = await response.json();

      if (campaignId) {
        const campaign = data.campaign;
        // Calculate M-Pesa vs Crypto from donations
        const donations = data.donations || [];
        const mpesaTotal = donations
          .filter((d: any) => d.method === 'mpesa')
          .reduce((sum: number, d: any) => sum + d.amount, 0);
        const cryptoTotal = donations
          .filter((d: any) => d.method === 'crypto')
          .reduce((sum: number, d: any) => sum + d.amount, 0);

        setFundData({
          mpesaAmount: mpesaTotal,
          cryptoAmount: cryptoTotal,
          targetAmount: campaign.targetAmount,
          currentAmount: campaign.currentAmount,
          transfers: []
        });
      } else {
        setFundData(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fund data:', error);
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'M-Pesa', value: fundData.mpesaAmount },
    { name: 'Crypto', value: fundData.cryptoAmount }
  ];

  const barData = [
    {
      name: 'Target',
      amount: fundData.targetAmount,
      fill: '#e5e7eb'
    },
    {
      name: 'Raised',
      amount: fundData.currentAmount,
      fill: '#f97316'
    }
  ];

  const COLORS = ['#f97316', '#3b82f6'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-orange-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Fund Flow Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart - Payment Methods */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          {fundData.mpesaAmount > 0 || fundData.cryptoAmount > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: KES ${value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `KES ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-600">
              No donations yet
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span className="text-sm text-gray-700">
                M-Pesa: KES {fundData.mpesaAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-700">
                Crypto: {(fundData.cryptoAmount / 1e18).toFixed(2)} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart - Target vs Raised */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Target vs Raised</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `KES ${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>

          {/* Stats */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Target:</span>
              <span className="font-semibold text-gray-900">
                KES {fundData.targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Raised:</span>
              <span className="font-semibold text-orange-600">
                KES {fundData.currentAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm text-gray-700">Progress:</span>
              <span className="font-semibold text-gray-900">
                {((fundData.currentAmount / fundData.targetAmount) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-orange-500 mr-2" />
            <p className="text-sm text-gray-600">Total Raised</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            KES {fundData.currentAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
            <p className="text-sm text-gray-600">Target Amount</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            KES {fundData.targetAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-sm text-gray-600">Remaining</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            KES {Math.max(0, fundData.targetAmount - fundData.currentAmount).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundFlowChart;

