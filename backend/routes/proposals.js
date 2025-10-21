const express = require('express');
const router = express.Router();
require('dotenv').config();

// Store proposals in memory for now (will move to Firebase)
const proposals = [];

// Get all proposals
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: proposals.length,
    proposals: proposals
  });
});

// Get proposal by ID
router.get('/:id', (req, res) => {
  const proposal = proposals.find(p => p.id === req.params.id);
  
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  res.json({
    success: true,
    proposal: proposal
  });
});

// Create proposal (backend will submit to blockchain)
router.post('/', async (req, res) => {
  try {
    const { 
      title,
      description,
      amountRequested,
      recipientAddress,
      creatorPhone,
      category
    } = req.body;

    if (!title || !amountRequested || !recipientAddress) {
      return res.status(400).json({ 
        error: 'Title, amount, and recipient address are required' 
      });
    }

    const proposal = {
      id: `proposal_${Date.now()}`,
      title: title,
      description: description || '',
      amountRequested: parseFloat(amountRequested),
      recipientAddress: recipientAddress,
      creatorPhone: creatorPhone,
      category: category || 'general',
      status: 'pending', // pending, created_on_chain, voting, approved, executed
      votes: {
        for: 0,
        against: 0
      },
      createdAt: new Date().toISOString(),
      blockchainId: null,
      blockchainTxHash: null
    };

    proposals.push(proposal);

    res.status(201).json({
      success: true,
      message: 'Proposal created',
      proposal: proposal
    });

  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Update proposal status
router.patch('/:id', async (req, res) => {
  try {
    const { status, blockchainId, blockchainTxHash, votes } = req.body;
    const proposal = proposals.find(p => p.id === req.params.id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (status) proposal.status = status;
    if (blockchainId) proposal.blockchainId = blockchainId;
    if (blockchainTxHash) proposal.blockchainTxHash = blockchainTxHash;
    if (votes) proposal.votes = votes;
    proposal.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Proposal updated',
      proposal: proposal
    });

  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

module.exports = router;

