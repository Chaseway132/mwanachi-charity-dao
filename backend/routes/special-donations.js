const express = require('express');
const router = express.Router();
const { checkAdminToken } = require('../middleware/adminAuth');

// In-memory storage for special donations campaigns
// TODO: Replace with database (MongoDB/PostgreSQL)
let campaigns = [
  {
    id: 1,
    title: 'Emergency Medical Fund - Ojwang\' Memorial',
    beneficiaryName: 'Ojwang\' Family',
    description: 'Raising funds for medical expenses and justice for Ojwang\' who died in police custody. This campaign aims to support his family and advocate for accountability.',
    targetAmount: 500000,
    currentAmount: 125000,
    totalDonors: 45,
    deadline: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    verified: true,
    closed: false,
    location: 'Nairobi, Kenya',
    category: 'emergency',
    createdAt: Date.now(),
    updates: [
      {
        id: 1,
        title: 'Campaign Launched',
        content: 'We have launched this campaign to support the Ojwang\' family.',
        timestamp: Date.now(),
        ipfsHash: 'QmExample1'
      }
    ],
    donations: [
      {
        id: 1,
        donor: '0x1234567890123456789012345678901234567890',
        amount: 50000,
        method: 'mpesa',
        mpesaReceiptNumber: 'LIJ123456789',
        timestamp: Date.now() - (2 * 60 * 60 * 1000),
        transactionHash: '0xabc123'
      }
    ]
  }
];

let donationIdCounter = 1;

// GET /api/special-donations - List all campaigns
router.get('/', (req, res) => {
  try {
    const campaignsList = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      currentAmount: campaign.currentAmount,
      totalDonors: campaign.totalDonors,
      deadline: campaign.deadline,
      verified: campaign.verified,
      closed: campaign.closed,
      location: campaign.location,
      category: campaign.category,
      createdAt: campaign.createdAt
    }));
    
    res.json({ 
      success: true,
      campaigns: campaignsList,
      total: campaignsList.length
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/special-donations/:id - Get campaign details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const campaign = campaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }
    
    res.json({ 
      success: true,
      campaign 
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/special-donations/:id/donations - Get campaign donations
router.get('/:id/donations', (req, res) => {
  try {
    const { id } = req.params;
    const campaign = campaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }
    
    // Return latest 10 donations
    const donations = campaign.donations.slice(-10).reverse();
    
    res.json({ 
      success: true,
      donations,
      total: campaign.donations.length
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/special-donations/:id/updates - Get campaign updates
router.get('/:id/updates', (req, res) => {
  try {
    const { id } = req.params;
    const campaign = campaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }
    
    const updates = campaign.updates.reverse();
    
    res.json({ 
      success: true,
      updates
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/special-donations/:id/donate - Record donation
router.post('/:id/donate', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, phoneNumber, mpesaReceiptNumber, donor } = req.body;
    
    // Validate input
    if (!amount || !method) {
      return res.status(400).json({ 
        success: false,
        error: 'Amount and method are required' 
      });
    }
    
    const campaign = campaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }
    
    if (campaign.closed) {
      return res.status(400).json({ 
        success: false,
        error: 'Campaign is closed' 
      });
    }
    
    // Create donation record
    const donation = {
      id: donationIdCounter++,
      donor: donor || phoneNumber || 'Anonymous',
      amount: parseFloat(amount),
      method,
      mpesaReceiptNumber: mpesaReceiptNumber || null,
      timestamp: Date.now(),
      transactionHash: `0x${Math.random().toString(16).slice(2)}`
    };
    
    // Update campaign
    campaign.donations.push(donation);
    campaign.currentAmount += parseFloat(amount);
    campaign.totalDonors += 1;
    
    // Check if campaign target is reached
    if (campaign.currentAmount >= campaign.targetAmount) {
      campaign.closed = true;
    }
    
    res.json({ 
      success: true,
      donation,
      campaign: {
        id: campaign.id,
        currentAmount: campaign.currentAmount,
        targetAmount: campaign.targetAmount,
        totalDonors: campaign.totalDonors,
        closed: campaign.closed
      }
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/special-donations/:id/update - Post campaign update (admin)
router.post('/:id/update', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, ipfsHash } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false,
        error: 'Title and content are required' 
      });
    }
    
    const campaign = campaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }
    
    const update = {
      id: campaign.updates.length + 1,
      title,
      content,
      timestamp: Date.now(),
      ipfsHash: ipfsHash || null
    };
    
    campaign.updates.push(update);
    
    res.json({ 
      success: true,
      update
    });
  } catch (error) {
    console.error('Error posting update:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/special-donations - Create new campaign (ADMIN ONLY)
router.post('/', checkAdminToken, (req, res) => {
  try {
    const {
      title,
      description,
      beneficiaryName,
      beneficiaryPhone,
      targetAmount,
      deadline,
      location,
      category,
      documents
    } = req.body;

    // Validate required fields
    if (!title || !description || !beneficiaryName || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, beneficiaryName, targetAmount'
      });
    }

    // Generate new campaign ID
    const newId = Math.max(...campaigns.map(c => c.id), 0) + 1;

    // Create new campaign
    const newCampaign = {
      id: newId,
      title,
      description,
      beneficiaryName,
      beneficiaryPhone: beneficiaryPhone || '',
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      totalDonors: 0,
      deadline: deadline || Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days default
      verified: true, // Admin-created campaigns are auto-verified
      closed: false,
      location: location || '',
      category: category || 'general',
      createdAt: Date.now(),
      createdBy: req.admin.walletAddress,
      createdByType: 'admin',
      authorityTier: 'admin',
      status: 'active',
      updates: [
        {
          id: 1,
          title: 'Campaign Created',
          content: `Campaign created by admin: ${req.admin.walletAddress}`,
          timestamp: Date.now(),
          ipfsHash: null
        }
      ],
      donations: [],
      documents: documents || []
    };

    campaigns.push(newCampaign);

    // Track in analytics
    if (global.analyticsData) {
      global.analyticsData.campaignsCreated++;
    }

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: newCampaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

