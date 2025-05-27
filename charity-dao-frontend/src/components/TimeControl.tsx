import React, { useState } from 'react';
import { ethers } from 'ethers';
import { advanceTime, setTime } from '../utils/contracts';

interface TimeControlProps {
  provider: ethers.BrowserProvider;
}

const TimeControl: React.FC<TimeControlProps> = ({ provider }) => {
  const [seconds, setSeconds] = useState<number>(3600); // 1 hour default
  const [timestamp, setTimestamp] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  const updateCurrentTime = async () => {
    try {
      const block = await provider.getBlock('latest');
      setCurrentTime(new Date(block!.timestamp * 1000).toLocaleString());
    } catch (error) {
      console.error('Error getting current time:', error);
    }
  };

  const handleAdvanceTime = async () => {
    try {
      await advanceTime(provider, seconds);
      await updateCurrentTime();
    } catch (error) {
      console.error('Error advancing time:', error);
    }
  };

  const handleSetTime = async () => {
    try {
      const date = new Date(timestamp);
      const unixTimestamp = Math.floor(date.getTime() / 1000);
      await setTime(provider, unixTimestamp);
      await updateCurrentTime();
    } catch (error) {
      console.error('Error setting time:', error);
    }
  };

  // Update current time on component mount
  React.useEffect(() => {
    updateCurrentTime();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Time Control (Testing Only)</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Blockchain Time:</p>
        <p className="font-mono">{currentTime}</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Advance Time (seconds)
        </label>
        <div className="flex">
          <input
            type="number"
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
            className="flex-1 p-2 border rounded-l"
            min="1"
          />
          <button
            onClick={handleAdvanceTime}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Advance
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Set Time
        </label>
        <div className="flex">
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="flex-1 p-2 border rounded-l"
          />
          <button
            onClick={handleSetTime}
            className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeControl; 