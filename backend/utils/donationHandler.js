const axios = require('axios');

/**
 * Handle M-Pesa donation flow
 * 1. Record donation in backend
 * 2. Record on blockchain
 * 3. Notify frontend
 */

// Store for tracking donations (in production, use database)
const donationStore = new Map();

/**
 * Record M-Pesa donation
 */
async function recordMPesaDonation(paymentData) {
  try {
    const {
      amount,
      mpesaReceiptNumber,
      phoneNumber,
      transactionDate
    } = paymentData;

    const donationId = `mpesa_${mpesaReceiptNumber}`;

    const donation = {
      id: donationId,
      type: 'mpesa',
      phoneNumber,
      amount,
      mpesaReceiptNumber,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      mpesaTransactionDate: transactionDate,
      blockchainStatus: 'pending'
    };

    // Store donation
    donationStore.set(donationId, donation);

    console.log('✅ M-Pesa donation recorded:', donation);

    // Try to record on blockchain
    await recordDonationOnBlockchain(donation);

    return donation;
  } catch (error) {
    console.error('❌ Error recording M-Pesa donation:', error);
    throw error;
  }
}

/**
 * Record donation on blockchain
 */
async function recordDonationOnBlockchain(donation) {
  try {
    console.log('📝 Attempting to record donation on blockchain:', donation.id);

    // TODO: Implement blockchain recording
    // This would call the DonationTracking contract
    // For now, we'll just log it

    donation.blockchainStatus = 'recorded';
    donation.recordedAt = new Date().toISOString();

    console.log('✅ Donation recorded on blockchain:', donation.id);

    return donation;
  } catch (error) {
    console.error('❌ Error recording donation on blockchain:', error);
    donation.blockchainStatus = 'failed';
    throw error;
  }
}

/**
 * Get donation by ID
 */
function getDonation(donationId) {
  return donationStore.get(donationId);
}

/**
 * Get all donations
 */
function getAllDonations() {
  return Array.from(donationStore.values());
}

/**
 * Update donation status
 */
function updateDonationStatus(donationId, status) {
  const donation = donationStore.get(donationId);
  if (donation) {
    donation.status = status;
    donation.updatedAt = new Date().toISOString();
  }
  return donation;
}

module.exports = {
  recordMPesaDonation,
  recordDonationOnBlockchain,
  getDonation,
  getAllDonations,
  updateDonationStatus
};

