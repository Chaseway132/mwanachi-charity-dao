import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Lock, Plus, LogOut, CheckCircle, AlertCircle, Eye, EyeOff, BarChart3, Users, TrendingUp, Clock } from 'lucide-react';

interface AdminDashboardProps {
  onLogout?: () => void;
  onCampaignCreated?: () => void;
}

interface Analytics {
  totalVisits: number;
  uniqueVisitors: number;
  campaignsCreated: number;
  totalDonations: number;
  lastVisit: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onCampaignCreated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisits: 0,
    uniqueVisitors: 0,
    campaignsCreated: 0,
    totalDonations: 0,
    lastVisit: ''
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // Campaign form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    beneficiaryName: '',
    beneficiaryPhone: '',
    targetAmount: '',
    deadline: '',
    location: '',
    category: 'emergency'
  });

  // Load analytics on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const response = await fetch('https://mwanachi-charity-dao-backend.onrender.com/api/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Simple username/password authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.username || !loginForm.password) {
      toast.error('Please enter username and password');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:5000/api/admin/login-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Authentication failed');
        return;
      }

      // Store token and username
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', loginForm.username);
      setAdminUsername(loginForm.username);
      setIsAuthenticated(true);
      toast.success('Admin logged in successfully!');

      // Load analytics after login
      loadAnalytics();
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Create campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('https://mwanachi-charity-dao-backend.onrender.com/api/special-donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create campaign');
        return;
      }

      toast.success('Campaign created successfully!');
      setFormData({
        title: '',
        description: '',
        beneficiaryName: '',
        beneficiaryPhone: '',
        targetAmount: '',
        deadline: '',
        location: '',
        category: 'emergency'
      });
      setShowCreateForm(false);

      // Reload analytics
      loadAnalytics();

      // Notify parent component to refresh campaigns list
      if (onCampaignCreated) {
        onCampaignCreated();
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    setAdminUsername('');
    setLoginForm({ username: '', password: '' });
    setFormData({
      title: '',
      description: '',
      beneficiaryName: '',
      beneficiaryPhone: '',
      targetAmount: '',
      deadline: '',
      location: '',
      category: 'emergency'
    });
    toast.info('Logged out');
    onLogout?.();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Admin Login</h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your credentials to access the admin dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="Enter username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Demo Credentials:</strong><br/>
              Username: admin<br/>
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage special donation campaigns</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Admin Info & Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Info */}
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-bold text-gray-900">{adminUsername}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-bold text-green-600">✓ Authenticated</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Campaigns Created</p>
                <p className="font-bold text-gray-900">{analytics.campaignsCreated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalVisits}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Visitors</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.uniqueVisitors}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalDonations}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Visit</p>
                <p className="text-sm font-bold text-gray-900">{analytics.lastVisit || 'N/A'}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Create Campaign Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition mb-6"
        >
          <Plus className="w-5 h-5" />
          Create New Campaign
        </button>

        {/* Create Campaign Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Emergency Medical Fund"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficiary Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficiary Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.beneficiaryPhone}
                    onChange={(e) => setFormData({ ...formData, beneficiaryPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="254712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nairobi, Kenya"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="disaster">Disaster Relief</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Detailed description of the campaign"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Campaign'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900">Admin Features</h3>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>✓ Create new special donation campaigns</li>
                <li>✓ Campaigns are auto-verified (Tier 3: Admin Authority)</li>
                <li>✓ All campaigns recorded on blockchain</li>
                <li>✓ Full transparency and audit trail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

