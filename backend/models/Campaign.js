const mongoose = require('mongoose');

// Campaign Schema
const campaignSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  beneficiaryName: {
    type: String,
    required: true,
    trim: true
  },
  beneficiaryPhone: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDonors: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  closed: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['emergency', 'education', 'health', 'infrastructure', 'other'],
    default: 'other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updates: [{
    id: Number,
    title: String,
    content: String,
    timestamp: Date,
    ipfsHash: String
  }],
  donations: [{
    id: Number,
    donor: String,
    amount: Number,
    method: String,
    mpesaReceiptNumber: String,
    timestamp: Date,
    transactionHash: String
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date
  }]
}, { timestamps: true });

// Create index for faster queries
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ verified: 1 });

// Pre-save middleware to update updatedAt
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export model
const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;

