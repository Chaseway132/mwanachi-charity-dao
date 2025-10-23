const express = require('express');
const router = express.Router();
const { checkAdminToken } = require('../middleware/adminAuth');
const Campaign = require('../models/Campaign');
const { isConnected } = require('../utils/database');

// In-memory fallback storage (used if MongoDB is not connected)
let campaignsMemory = [
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

// Helper function to get campaigns from DB or memory
async function getCampaigns() {
  try {
    const connected = isConnected();
    console.log('🔍 getCampaigns() - MongoDB connected:', connected);

    if (connected) {
      console.log('🔍 Fetching from MongoDB...');
      const campaigns = await Campaign.find().sort({ createdAt: -1 });
      console.log('✅ MongoDB campaigns found:', campaigns.length);

      // If no campaigns in DB, return memory campaigns as fallback
      if (campaigns.length === 0) {
        console.log('⚠️ No campaigns in MongoDB, using memory fallback');
        return campaignsMemory;
      }

      return campaigns;
    }
  } catch (error) {
    console.error('❌ Error fetching from MongoDB:', error);
  }
  console.log('📦 Using in-memory campaigns:', campaignsMemory.length);
  return campaignsMemory;
}

// Helper function to get campaign by ID
async function getCampaignById(id) {
  try {
    if (isConnected()) {
      return await Campaign.findOne({ id: parseInt(id) });
    }
  } catch (error) {
    console.error('Error fetching from MongoDB:', error);
  }
  return campaignsMemory.find(c => c.id === parseInt(id));
}

// Helper function to save campaign
async function saveCampaign(campaignData) {
  const connected = isConnected();
  console.log('💾 saveCampaign() called - MongoDB connected:', connected);

  try {
    if (connected) {
      console.log('💾 Saving campaign to MongoDB:', campaignData.title);
      const campaign = new Campaign(campaignData);
      console.log('📝 Campaign object created, calling save()...');
      const saved = await campaign.save();
      console.log('✅ Campaign saved to MongoDB:', saved.id);
      return saved;
    }
  } catch (error) {
    console.error('❌ Error saving to MongoDB:', error.message);
    console.error('❌ Full error:', error);
  }
  // Fallback to memory
  console.log('📦 Saving campaign to memory:', campaignData.title);
  campaignsMemory.push(campaignData);
  return campaignData;
}

// Helper function to update campaign
async function updateCampaign(id, updateData) {
  try {
    if (isConnected()) {
      return await Campaign.findOneAndUpdate(
        { id: parseInt(id) },
        updateData,
        { new: true }
      );
    }
  } catch (error) {
    console.error('Error updating in MongoDB:', error);
  }
  // Fallback to memory
  const campaign = campaignsMemory.find(c => c.id === parseInt(id));
  if (campaign) {
    Object.assign(campaign, updateData);
    return campaign;
  }
  return null;
}

// GET /api/special-donations - List all campaigns
router.get('/', async (req, res) => {
  try {
    const connected = isConnected();
    console.log('📊 GET /api/special-donations - MongoDB connected:', connected);

    const campaigns = await getCampaigns();
    console.log('📊 Fetched campaigns count:', campaigns.length);

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
      total: campaignsList.length,
      storage: connected ? 'MongoDB' : 'Memory'
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
router.post('/', checkAdminToken, async (req, res) => {
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

    // Get all campaigns to find max ID
    const allCampaigns = await getCampaigns();
    const newId = Math.max(...allCampaigns.map(c => c.id || 0), 0) + 1;

    // Create new campaign with proper data types for MongoDB
    const now = new Date();
    const deadlineDate = deadline ? new Date(deadline) : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));

    const newCampaign = {
      id: newId,
      title,
      description,
      beneficiaryName,
      beneficiaryPhone: beneficiaryPhone || '',
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      totalDonors: 0,
      deadline: deadlineDate, // Ensure it's a Date object
      verified: true, // Admin-created campaigns are auto-verified
      closed: false,
      location: location || '',
      category: category || 'other', // Match schema enum
      createdAt: now, // Ensure it's a Date object
      updatedAt: now,
      updates: [
        {
          id: 1,
          title: 'Campaign Created',
          content: `Campaign created by admin: ${req.admin.walletAddress}`,
          timestamp: now,
          ipfsHash: null
        }
      ],
      donations: [],
      documents: documents || []
    };

    // Save to database or memory
    console.log('📝 About to save campaign:', newCampaign.title);
    const savedCampaign = await saveCampaign(newCampaign);
    console.log('✅ Campaign saved, returned:', savedCampaign.id || savedCampaign._id);

    // Track in analytics
    if (global.analyticsData) {
      global.analyticsData.campaignsCreated++;
    }

    const storage = isConnected() ? 'MongoDB' : 'Memory';
    console.log('📊 Response - Storage:', storage, 'Campaign ID:', savedCampaign.id || savedCampaign._id);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: savedCampaign,
      storage: storage
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

