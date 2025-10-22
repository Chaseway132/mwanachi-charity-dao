# 🚀 M-Pesa Production Setup with On-Chain Logging

## Overview

Your current setup:
- ✅ M-Pesa STK Push integration (sandbox)
- ✅ Callback handling
- ✅ DonationTracking smart contract ready
- ⚠️ No blockchain recording (TODO in code)
- ⚠️ In-memory storage only

## Step 1: Get M-Pesa Production Credentials

### 1.1 Register on Safaricom Daraja
```
1. Go to https://developer.safaricom.co.ke/
2. Click "Register" → Fill in business details
3. Verify email
4. Login to dashboard
```

### 1.2 Create Production App
```
1. Go to "My Apps" → "Create New App"
2. Select "Daraja API"
3. Fill in app details:
   - App Name: "Mwanachi Charity DAO"
   - Description: "Blockchain charity platform"
4. Click "Create"
```

### 1.3 Get Credentials
You'll receive:
- **Consumer Key** - Save this
- **Consumer Secret** - Save this
- **Business Shortcode** - Your paybill number
- **Passkey** - For STK Push (different from sandbox)

### 1.4 Configure Callback URL
```
1. In Daraja dashboard, go to "Settings"
2. Set Callback URL to: https://your-backend-domain.com/api/mpesa/callback
3. Save
```

## Step 2: Update Backend Environment

### 2.1 Create .env.production
```bash
# M-Pesa Production
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_production_passkey

# Backend
BACKEND_URL=https://your-backend-domain.com
NODE_ENV=production

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_wallet_private_key

# Database (if using)
DATABASE_URL=your_database_url
```

### 2.2 Verify in backend/routes/mpesa.js
The code already switches between sandbox and production based on `MPESA_ENVIRONMENT`

## Step 3: Implement On-Chain Logging

### 3.1 Update DonationTracking Contract

Add M-Pesa specific tracking:

```solidity
// Add to DonationTracking.sol
struct MPesaDonation {
    uint id;
    address donor;
    uint amount;
    string mpesaReceiptNumber;
    string phoneNumber;
    uint timestamp;
}

MPesaDonation[] public mpesaDonations;
mapping(string => bool) public recordedReceipts;

event MPesaDonationReceived(
    uint id,
    address indexed donor,
    uint amount,
    string mpesaReceiptNumber,
    string phoneNumber,
    uint timestamp
);

function recordMPesaDonation(
    address _donor,
    uint _amount,
    string memory _mpesaReceiptNumber,
    string memory _phoneNumber
) external {
    require(_amount > 0, "Amount must be greater than zero");
    require(!recordedReceipts[_mpesaReceiptNumber], "Receipt already recorded");
    
    recordedReceipts[_mpesaReceiptNumber] = true;
    
    MPesaDonation memory donation = MPesaDonation({
        id: mpesaDonations.length + 1,
        donor: _donor,
        amount: _amount,
        mpesaReceiptNumber: _mpesaReceiptNumber,
        phoneNumber: _phoneNumber,
        timestamp: block.timestamp
    });
    
    mpesaDonations.push(donation);
    
    emit MPesaDonationReceived(
        donation.id,
        _donor,
        _amount,
        _mpesaReceiptNumber,
        _phoneNumber,
        block.timestamp
    );
}
```

### 3.2 Update Backend to Record On-Chain

Update `backend/utils/donationHandler.js`:

```javascript
const { ethers } = require('ethers');

async function recordDonationOnBlockchain(donation) {
  try {
    console.log('📝 Recording M-Pesa donation on blockchain:', donation.id);

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Load contract ABI (you'll need to export this from your contracts)
    const contractABI = require('../abi/DonationTracking.json');
    const contractAddress = process.env.DONATION_TRACKING_CONTRACT;

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Call recordMPesaDonation function
    const tx = await contract.recordMPesaDonation(
      donation.donorAddress || ethers.ZeroAddress, // Use zero address if no wallet
      ethers.parseEther((donation.amount / 1e18).toString()),
      donation.mpesaReceiptNumber,
      donation.phoneNumber
    );

    console.log('⏳ Transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.transactionHash);

    donation.blockchainStatus = 'recorded';
    donation.blockchainTxHash = receipt.transactionHash;
    donation.recordedAt = new Date().toISOString();

    return donation;
  } catch (error) {
    console.error('❌ Error recording on blockchain:', error);
    donation.blockchainStatus = 'failed';
    donation.blockchainError = error.message;
    throw error;
  }
}
```

## Step 4: Test M-Pesa Production

### 4.1 Test STK Push
```bash
curl -X POST https://your-backend.com/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "Test-Donation",
    "description": "Test M-Pesa Donation"
  }'
```

### 4.2 Expected Response
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "data": {
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CheckoutRequestID": "ws_CO_DMZ_xxx",
    "CustomerMessage": "Success. Request accepted for processing"
  }
}
```

### 4.3 User Flow
1. User enters phone number and amount
2. STK prompt appears on their phone
3. User enters M-Pesa PIN
4. M-Pesa sends callback to your backend
5. Backend records donation in database
6. Backend records donation on blockchain
7. Frontend receives confirmation

## Step 5: Handle Errors & Edge Cases

### 5.1 Duplicate Receipt Prevention
```javascript
// In callback handler
const existingDonation = donationStore.get(`mpesa_${mpesaReceiptNumber}`);
if (existingDonation) {
  console.log('⚠️ Duplicate receipt detected, skipping');
  return;
}
```

### 5.2 Blockchain Transaction Failures
```javascript
// Retry logic
async function recordWithRetry(donation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await recordDonationOnBlockchain(donation);
    } catch (error) {
      console.log(`Retry ${i + 1}/${maxRetries}`);
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
    }
  }
}
```

### 5.3 Insufficient Gas
```javascript
// Check gas before sending
const gasEstimate = await contract.recordMPesaDonation.estimateGas(...);
const gasPrice = await provider.getGasPrice();
const totalCost = gasEstimate * gasPrice;

if (totalCost > walletBalance) {
  console.error('❌ Insufficient gas funds');
  donation.blockchainStatus = 'insufficient_gas';
  return;
}
```

## Step 6: Monitor Transactions

### 6.1 Track on PolygonScan
```
1. Go to https://polygonscan.com
2. Search for your contract address
3. View all transactions
4. Monitor gas usage
```

### 6.2 Set Up Alerts
```javascript
// Log important events
console.log(`[${new Date().toISOString()}] M-Pesa donation: ${amount} KES`);
console.log(`[${new Date().toISOString()}] Blockchain tx: ${txHash}`);
```

## Step 7: Production Checklist

- [ ] M-Pesa production credentials obtained
- [ ] Callback URL configured in Daraja
- [ ] Backend environment variables set
- [ ] DonationTracking contract updated with M-Pesa function
- [ ] Backend updated to record on blockchain
- [ ] Contract deployed to Polygon mainnet
- [ ] Contract address added to backend .env
- [ ] Test transaction completed successfully
- [ ] Blockchain transaction verified on PolygonScan
- [ ] Error handling implemented
- [ ] Monitoring set up

## Troubleshooting

### "Invalid credentials"
- Verify Consumer Key and Secret are correct
- Check MPESA_ENVIRONMENT is set to 'production'

### "Callback not received"
- Verify callback URL is publicly accessible
- Check firewall/security groups allow incoming requests
- Verify URL in Daraja dashboard matches exactly

### "Blockchain transaction failed"
- Check wallet has enough MATIC for gas
- Verify contract address is correct
- Check contract ABI matches deployed contract

### "Duplicate receipt error"
- This is expected if user retries payment
- System should handle gracefully

## Cost Estimates

**M-Pesa Fees:**
- Typically 2-3% per transaction
- Varies by amount

**Blockchain Costs (Polygon):**
- ~$0.01-0.10 per transaction
- Much cheaper than Ethereum

**Total per donation:**
- 100 KES donation = ~2-3 KES M-Pesa fee + ~0.50 KES blockchain fee

## Next Steps

1. Get production credentials from Safaricom
2. Update backend with credentials
3. Deploy updated contracts
4. Test with real M-Pesa transaction
5. Monitor blockchain for successful recording
6. Set up production monitoring

---

**Ready to process real M-Pesa payments with blockchain transparency!** 🚀

