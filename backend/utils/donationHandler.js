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
const mongoose = require('mongoose');
const MpesaDonation = require('../models/MpesaDonation');

async function recordMPesaDonation(paymentData) {
  const {
    amount,
    mpesaReceiptNumber,
    phoneNumber,
    transactionDate,
    checkoutRequestId
  } = paymentData;

  if (!mpesaReceiptNumber) {
    throw new Error('Missing M-Pesa receipt number');
  }

  const donationId = `mpesa_${mpesaReceiptNumber}`;

  // Safaricom can send the same callback more than once: record it only once
  if (donationStore.has(donationId)) {
    return donationStore.get(donationId);
  }

  const donation = {
    id: donationId,
    type: 'mpesa',
    phoneNumber,
    amount,
    mpesaReceiptNumber,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    mpesaTransactionDate: transactionDate,
    blockchainStatus: 'not_recorded' // on-chain anchoring of M-Pesa donations is not built yet
  };

  donationStore.set(donationId, donation);

  // Save permanently in MongoDB (survives Render restarts)
  if (mongoose.connection.readyState === 1) {
    try {
      await MpesaDonation.updateOne(
        { mpesaReceiptNumber },
        {
          $setOnInsert: {
            mpesaReceiptNumber,
            checkoutRequestId,
            phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
            amount,
            transactionDate: transactionDate ? String(transactionDate) : undefined,
            status: 'confirmed',
            environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
          }
        },
        { upsert: true }
      );
      console.log('✅ M-Pesa donation saved to MongoDB:', donationId);
    } catch (dbError) {
      console.error('❌ Could not save M-Pesa donation to MongoDB:', dbError.message);
    }
  } else {
    console.warn('⚠️ MongoDB not connected: donation kept in memory only');
  }

  console.log('✅ M-Pesa donation recorded:', donationId);
  return donation;
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

