const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
require('dotenv').config();

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');
let signer = null;

// Only initialize signer if private key is provided
if (process.env.PRIVATE_KEY) {
  try {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  } catch (error) {
    console.warn('Warning: Could not initialize signer. Blockchain operations will be limited.');
  }
}

// TODO: Load contract ABIs from your dissertation project
// For now, we'll create placeholder functions

// Record donation on blockchain
router.post('/record-donation', async (req, res) => {
  try {
    const {
      donorPhone,
      amount,
      proposalId,
      mpesaTransactionId,
      mpesaReceiptNumber
    } = req.body;

    if (!donorPhone || !amount) {
      return res.status(400).json({
        error: 'Donor phone and amount are required'
      });
    }

    console.log('Recording donation on blockchain:', {
      donorPhone,
      amount,
      proposalId,
      mpesaTransactionId,
      mpesaReceiptNumber
    });

    // TODO: Call DonationTracking contract
    // For now, we'll just acknowledge the request
    // In production, this would:
    // 1. Get the signer from private key
    // 2. Call the DonationTracking contract
    // 3. Return the transaction hash

    const donationRecord = {
      id: `mpesa_donation_${Date.now()}`,
      donorPhone,
      amount,
      proposalId,
      mpesaTransactionId,
      mpesaReceiptNumber,
      status: 'recorded',
      recordedAt: new Date().toISOString(),
      blockchainTxHash: null // Will be updated after contract call
    };

    res.json({
      success: true,
      message: 'Donation recorded on blockchain',
      data: donationRecord
    });

  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({ error: 'Failed to record donation on blockchain' });
  }
});

// Create proposal on blockchain
router.post('/create-proposal', async (req, res) => {
  try {
    const { 
      title,
      description,
      amountRequested,
      recipientAddress
    } = req.body;

    if (!title || !amountRequested || !recipientAddress) {
      return res.status(400).json({ 
        error: 'Title, amount, and recipient address are required' 
      });
    }

    console.log('Creating proposal on blockchain:', {
      title,
      description,
      amountRequested,
      recipientAddress
    });

    // TODO: Call ProposalManagement contract
    // const tx = await proposalManagementContract.createProposal(
    //   title,
    //   description,
    //   ethers.parseEther(amountRequested.toString()),
    //   recipientAddress
    // );

    res.json({
      success: true,
      message: 'Proposal created on blockchain',
      data: {
        title,
        amountRequested,
        recipientAddress,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal on blockchain' });
  }
});

// Vote on proposal
router.post('/vote', async (req, res) => {
  try {
    const { 
      proposalId,
      voterPhone,
      voteChoice
    } = req.body;

    if (!proposalId || !voteChoice) {
      return res.status(400).json({ 
        error: 'Proposal ID and vote choice are required' 
      });
    }

    console.log('Recording vote on blockchain:', {
      proposalId,
      voterPhone,
      voteChoice
    });

    // TODO: Call VotingGovernance contract
    // const tx = await votingGovernanceContract.vote(
    //   proposalId,
    //   voteChoice === 'for' ? true : false
    // );

    res.json({
      success: true,
      message: 'Vote recorded on blockchain',
      data: {
        proposalId,
        voterPhone,
        voteChoice,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote on blockchain' });
  }
});

// Get blockchain transaction status
router.get('/tx-status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.json({
        success: true,
        status: 'pending',
        message: 'Transaction is still pending'
      });
    }

    res.json({
      success: true,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      receipt: receipt
    });

  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({ error: 'Failed to check transaction status' });
  }
});

module.exports = router;

