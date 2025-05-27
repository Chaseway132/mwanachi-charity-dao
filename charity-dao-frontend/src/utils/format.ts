/**
 * Utility functions for formatting dates and timestamps
 */

/**
 * Format a date into a readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a timestamp (in seconds) into a readable string
 * @param timestamp The timestamp in seconds
 * @returns A formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  // Validate the timestamp to ensure it's reasonable
  const now = Date.now();
  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);

  // Check if the date is in the future or too far in the past
  if (date > new Date(now + 365 * 24 * 60 * 60 * 1000) || // More than a year in the future
      date < new Date(now - 5 * 365 * 24 * 60 * 60 * 1000)) { // More than 5 years in the past
    // Use current date instead
    return formatDate(now);
  }

  return formatDate(milliseconds);
};

export const formatTimeRemaining = (endTimestamp: number): string => {
  const now = Date.now();
  const timeRemaining = endTimestamp - now;

  if (timeRemaining <= 0) {
    return 'Expired';
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};