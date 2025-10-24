import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface MPesaPaymentFormProps {
  onPaymentInitiated?: (data: any) => void;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: string) => void;
}

const MPesaPaymentForm: React.FC<MPesaPaymentFormProps> = ({
  onPaymentInitiated,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Format phone number to Kenya format (254...)
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    }
    return '254' + cleaned.slice(-9);
  };

  // Validate inputs
  const validateInputs = (): boolean => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    if (parseFloat(amount) < 1) {
      toast.error('Minimum amount is KES 1');
      return false;
    }
    if (parseFloat(amount) > 150000) {
      toast.error('Maximum amount is KES 150,000');
      return false;
    }
    return true;
  };

  // Query payment status
  const queryPaymentStatus = async (requestId: string) => {
    try {
      const response = await fetch('https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/query-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutRequestId: requestId
        })
      });

      const data = await response.json();
      
      if (data.ResultCode === '0') {
        // Payment successful
        toast.success('Payment completed successfully!');
        if (onPaymentSuccess) {
          onPaymentSuccess(data);
        }
        setCheckoutRequestId(null);
        setPhoneNumber('');
        setAmount('');
        
        // Clear polling
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
        return true;
      } else if (data.ResultCode === '1032') {
        // Request timeout - still waiting
        return false;
      } else {
        // Payment failed
        toast.error(`Payment failed: ${data.ResultDesc || 'Unknown error'}`);
        setCheckoutRequestId(null);
        if (onPaymentError) {
          onPaymentError(data.ResultDesc || 'Payment failed');
        }
        
        // Clear polling
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
        return true;
      }
    } catch (error) {
      console.error('Error querying payment status:', error);
      return false;
    }
  };

  // Initiate STK Push
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('📱 Initiating M-Pesa payment...');
      console.log('📞 Phone:', formattedPhone);
      console.log('💰 Amount:', Math.round(parseFloat(amount)));

      const backendUrl = 'https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/stk-push';
      console.log('🔗 Backend URL:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: Math.round(parseFloat(amount)),
          accountReference: `CHARITY-${Date.now()}`,
          description: 'Donation to Charity DAO'
        })
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (data.success) {
        const requestId = data.data?.CheckoutRequestID;
        if (requestId) {
          setCheckoutRequestId(requestId);
          toast.success('STK Push sent! Check your phone for the prompt.');

          if (onPaymentInitiated) {
            onPaymentInitiated(data.data);
          }

          // Start polling for payment status (every 3 seconds for 2 minutes)
          let pollCount = 0;
          const interval = setInterval(async () => {
            pollCount++;
            const completed = await queryPaymentStatus(requestId);

            if (completed || pollCount >= 40) {
              clearInterval(interval);
              setPollInterval(null);
              setLoading(false);
            }
          }, 3000);

          setPollInterval(interval);
        } else {
          toast.error('Failed to get checkout request ID');
          setLoading(false);
        }
      } else {
        toast.error(data.error || 'Failed to initiate payment');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      console.error('❌ Error type:', error instanceof TypeError ? 'TypeError' : typeof error);
      console.error('❌ Error message:', (error as Error).message);
      console.error('❌ Full error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  // Cancel payment polling
  const handleCancelPayment = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setCheckoutRequestId(null);
    setLoading(false);
    toast.info('Payment cancelled');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Pay with M-Pesa</h3>

      {!checkoutRequestId ? (
        <form onSubmit={handleInitiatePayment} className="space-y-4">
          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678 or 254712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your M-Pesa registered phone number
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              min="1"
              max="150000"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Min: KES 1 | Max: KES 150,000
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Processing...' : 'Send STK Push'}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>How it works:</strong> We'll send a payment prompt to your phone. 
              Enter your M-Pesa PIN to complete the payment.
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Waiting for Payment */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-yellow-800">Waiting for payment...</p>
                <p className="text-sm text-yellow-700">
                  Check your phone for the M-Pesa prompt
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{phoneNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-gray-900">KES {parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Request ID:</span>
              <span className="font-mono text-xs text-gray-500">{checkoutRequestId.substring(0, 12)}...</span>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleCancelPayment}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Cancel Payment
          </button>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              ⏱️ <strong>Timeout:</strong> If you don't see the prompt within 30 seconds, 
              the request may have expired. Please try again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MPesaPaymentForm;

