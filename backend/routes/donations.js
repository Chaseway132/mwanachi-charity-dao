const express = require('express');
const router = express.Router();
require('dotenv').config();

// Store donations in memory for now (will move to Firebase)
const donations = [];

// Get all donations
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: donations.length,
    donations: donations
  });
});

// Get donation by ID
router.get('/:id', (req, res) => {
  const donation = donations.find(d => d.id === req.params.id);
  
  if (!donation) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  res.json({
    success: true,
    donation: donation
  });
});

// Create donation record (called after M-Pesa payment)
router.post('/', async (req, res) => {
  try {
    const { 
      phoneNumber, 
      amount, 
      proposalId, 
      donorName,
      mpesaTransactionId,
      mpesaReceiptNumber
    } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ 
        error: 'Phone number and amount are required' 
      });
    }

    const donation = {
      id: `donation_${Date.now()}`,
      phoneNumber: phoneNumber,
      amount: parseFloat(amount),
      proposalId: proposalId || null,
      donorName: donorName || 'Anonymous',
      mpesaTransactionId: mpesaTransactionId,
      mpesaReceiptNumber: mpesaReceiptNumber,
      status: 'pending', // pending, confirmed, recorded_on_chain
      createdAt: new Date().toISOString(),
      blockchainTxHash: null
    };

    donations.push(donation);

    res.status(201).json({
      success: true,
      message: 'Donation recorded',
      donation: donation
    });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Update donation status (after blockchain recording)
router.patch('/:id', async (req, res) => {
  try {
    const { status, blockchainTxHash } = req.body;
    const donation = donations.find(d => d.id === req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (status) donation.status = status;
    if (blockchainTxHash) donation.blockchainTxHash = blockchainTxHash;
    donation.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Donation updated',
      donation: donation
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ error: 'Failed to update donation' });
  }
});

module.exports = router;

