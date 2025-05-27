import React, { useState } from 'react';
import { toast } from 'react-toastify';

const SettingsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [gasLimit, setGasLimit] = useState('300000');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Mock API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store settings in localStorage for demo purposes
      localStorage.setItem('charityDAO_settings', JSON.stringify({
        notifications,
        darkMode,
        gasLimit: parseInt(gasLimit)
      }));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className={`block ${notifications ? 'bg-indigo-600' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${notifications ? 'translate-x-6' : ''}`}></div>
              </div>
              <div className="ml-3 text-gray-700">
                Enable notifications
              </div>
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Receive updates about proposal status changes and other important events
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Display</h3>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className={`block ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${darkMode ? 'translate-x-6' : ''}`}></div>
              </div>
              <div className="ml-3 text-gray-700">
                Dark mode
              </div>
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Switch between light and dark theme (coming soon)
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Settings</h3>
          <div className="mt-2">
            <label htmlFor="gasLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Default Gas Limit
            </label>
            <input
              type="text"
              id="gasLimit"
              value={gasLimit}
              onChange={(e) => setGasLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="300000"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended: 300,000 for most operations
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 