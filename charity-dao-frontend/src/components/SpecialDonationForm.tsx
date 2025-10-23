import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';

interface SpecialDonationFormProps {
  campaignId: number;
  onSuccess: () => void;
}

const SpecialDonationForm: React.FC<SpecialDonationFormProps> = ({ campaignId, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'crypto'>('mpesa');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pollingCheckoutId, setPollingCheckoutId] = useState<string | null>(null);

  // M-Pesa validation
  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 12 && (cleanPhone.startsWith('254') || cleanPhone.startsWith('2547') || cleanPhone.startsWith('2541'));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.startsWith('254') ? cleanPhone : '254' + cleanPhone.slice(-9);
  };

  // M-Pesa Donation
  const handleMPesaDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Initiate STK Push
      const response = await fetch('https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: Math.round(parseFloat(amount)),
          accountReference: `SPECIAL-${campaignId}-${Date.now()}`,
          description: `Special Donation - Campaign ${campaignId}`
        })
      });

      const data = await response.json();

      if (data.success && data.data?.CheckoutRequestID) {
        setPollingCheckoutId(data.data.CheckoutRequestID);
        toast.info('STK Push sent! Please enter your M-Pesa PIN');

        // Poll for payment status
        let attempts = 0;
        const maxAttempts = 40; // 2 minutes

        const pollInterval = setInterval(async () => {
          attempts++;

          try {
            const statusResponse = await fetch('https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/query-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                checkoutRequestId: data.data.CheckoutRequestID
              })
            });

            const statusData = await statusResponse.json();

            if (statusData.success && statusData.data?.ResultCode === '0') {
              clearInterval(pollInterval);
              setPollingCheckoutId(null);
              toast.success('Payment successful! Thank you for your donation');
              
              // Record donation
              await recordDonation(
                formattedPhone,
                parseFloat(amount),
                statusData.data?.MpesaReceiptNumber || 'N/A'
              );

              setAmount('');
              setPhoneNumber('');
              setDonorName('');
              onSuccess();
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setPollingCheckoutId(null);
              toast.error('Payment timeout. Please try again.');
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 3000);
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Crypto Donation
  const handleCryptoDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // This would integrate with Web3 wallet
      toast.info('Crypto donation feature coming soon');
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process donation');
      setLoading(false);
    }
  };

  const recordDonation = async (phone: string, amount: number, mpesaReceipt: string) => {
    try {
      await fetch('https://mwanachi-charity-dao-backend.onrender.com/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          amount,
          campaignId,
          donorName: donorName || 'Anonymous',
          mpesaReceiptNumber: mpesaReceipt,
          type: 'special'
        })
      });
    } catch (error) {
      console.error('Error recording donation:', error);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      {/* Payment Method Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPaymentMethod('mpesa')}
          className={`flex-1 py-2 px-3 rounded font-semibold transition ${
            paymentMethod === 'mpesa'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          📱 M-Pesa
        </button>
        <button
          onClick={() => setPaymentMethod('crypto')}
          className={`flex-1 py-2 px-3 rounded font-semibold transition ${
            paymentMethod === 'crypto'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          🔗 Crypto
        </button>
      </div>

      {/* M-Pesa Form */}
      {paymentMethod === 'mpesa' && (
        <form onSubmit={handleMPesaDonation} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">Format: 254712345678</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              min="1"
              max="150000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">Min: KES 1, Max: KES 150,000</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || pollingCheckoutId !== null}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center"
          >
            {loading || pollingCheckoutId ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              '💝 Donate via M-Pesa'
            )}
          </button>
        </form>
      )}

      {/* Crypto Form */}
      {paymentMethod === 'crypto' && (
        <form onSubmit={handleCryptoDonation} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              '🔗 Donate via Crypto'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default SpecialDonationForm;

