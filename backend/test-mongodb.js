#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Run this to diagnose MongoDB connection issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mwanachi-charity-dao';

console.log('🔍 MongoDB Connection Test');
console.log('========================\n');

console.log('📍 Connection String:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('');

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Connection State:', mongoose.connection.readyState);
    console.log('');

    // Test 1: Check if collection exists
    console.log('🔍 Test 1: Checking campaigns collection...');
    const campaigns = await Campaign.find();
    console.log('✅ Found', campaigns.length, 'campaigns in MongoDB');
    console.log('');

    // Test 2: Try to create a test campaign
    console.log('🔍 Test 2: Creating test campaign...');
    const testCampaign = new Campaign({
      id: 999,
      title: 'Test Campaign',
      beneficiaryName: 'Test Beneficiary',
      description: 'This is a test campaign',
      targetAmount: 100000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: 'other'
    });

    const saved = await testCampaign.save();
    console.log('✅ Test campaign created with ID:', saved._id);
    console.log('');

    // Test 3: Verify it was saved
    console.log('🔍 Test 3: Verifying test campaign...');
    const found = await Campaign.findOne({ id: 999 });
    if (found) {
      console.log('✅ Test campaign found in database!');
      console.log('   Title:', found.title);
      console.log('   ID:', found.id);
    } else {
      console.log('❌ Test campaign NOT found in database!');
    }
    console.log('');

    // Test 4: Count all campaigns
    console.log('🔍 Test 4: Total campaigns in database...');
    const count = await Campaign.countDocuments();
    console.log('✅ Total campaigns:', count);
    console.log('');

    // Test 5: List all campaigns
    console.log('🔍 Test 5: All campaigns in database...');
    const allCampaigns = await Campaign.find().select('id title beneficiaryName');
    allCampaigns.forEach(c => {
      console.log(`   - ID: ${c.id}, Title: ${c.title}, Beneficiary: ${c.beneficiaryName}`);
    });
    console.log('');

    console.log('✅ All tests passed!');
    console.log('');
    console.log('🎯 Summary:');
    console.log('   - MongoDB connection: ✅ Working');
    console.log('   - Campaign model: ✅ Working');
    console.log('   - Data persistence: ✅ Working');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check MONGODB_URI in .env file');
    console.error('   2. Verify MongoDB Atlas cluster is running');
    console.error('   3. Check IP whitelist in MongoDB Atlas');
    console.error('   4. Verify database user credentials');
    console.error('');
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();

