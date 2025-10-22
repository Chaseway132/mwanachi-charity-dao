# 📝 Code Changes Required for Production

## 1. Smart Contract: DonationTracking.sol

### Add to the contract (after existing code):

```solidity
// Add these structs and mappings
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

// Add this event
event MPesaDonationReceived(
    uint id,
    address indexed donor,
    uint amount,
    string mpesaReceiptNumber,
    string phoneNumber,
    uint timestamp
);

// Add this function
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

// Add this getter function
function getMPesaDonations() public view returns (MPesaDonation[] memory) {
    return mpesaDonations;
}
```

---

## 2. Backend: backend/utils/donationHandler.js

### Replace the `recordDonationOnBlockchain` function:

```javascript
const { ethers } = require('ethers');

async function recordDonationOnBlockchain(donation) {
  try {
    console.log('📝 Recording M-Pesa donation on blockchain:', donation.id);

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Load contract ABI
    const contractABI = [
      "function recordMPesaDonation(address _donor, uint _amount, string memory _mpesaReceiptNumber, string memory _phoneNumber) external",
      "event MPesaDonationReceived(uint id, address indexed donor, uint amount, string mpesaReceiptNumber, string phoneNumber, uint timestamp)"
    ];
    
    const contractAddress = process.env.DONATION_TRACKING_CONTRACT;
    if (!contractAddress) {
      throw new Error('DONATION_TRACKING_CONTRACT not set in environment');
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Estimate gas
    const gasEstimate = await contract.recordMPesaDonation.estimateGas(
      ethers.ZeroAddress, // Use zero address if no wallet
      ethers.parseEther((donation.amount / 1e18).toString()),
      donation.mpesaReceiptNumber,
      donation.phoneNumber
    );

    console.log('⛽ Gas estimate:', gasEstimate.toString());

    // Call recordMPesaDonation function
    const tx = await contract.recordMPesaDonation(
      ethers.ZeroAddress,
      ethers.parseEther((donation.amount / 1e18).toString()),
      donation.mpesaReceiptNumber,
      donation.phoneNumber,
      { gasLimit: gasEstimate * BigInt(120) / BigInt(100) } // 20% buffer
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

module.exports = {
  recordMPesaDonation,
  recordDonationOnBlockchain,
  getDonation,
  getAllDonations,
  updateDonationStatus
};
```

---

## 3. Frontend: charity-dao-frontend/package.json

### Add homepage field:

```json
{
  "name": "charity-dao-frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://YOUR_USERNAME.github.io/Mwanachi-Charity-DAO",
  ...rest of file
}
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 4. Frontend: charity-dao-frontend/public/404.html

### Create new file with this content:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Mwanachi Charity DAO</title>
    <script type="text/javascript">
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/')
          .replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

---

## 5. Frontend: charity-dao-frontend/src/App.tsx

### Update Router configuration:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || '/'}>
      {/* Your existing routes */}
    </Router>
  );
}

export default App;
```

---

## 6. Backend: .env.production (Create new file)

```bash
# M-Pesa Production
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_production_passkey

# Backend
BACKEND_URL=https://your-railway-app.railway.app
NODE_ENV=production
PORT=5000

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_wallet_private_key
DONATION_TRACKING_CONTRACT=0x...

# Frontend
FRONTEND_URL=https://YOUR_USERNAME.github.io/Mwanachi-Charity-DAO
```

---

## 7. GitHub Actions: .github/workflows/deploy.yml

### Create new file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd charity-dao-frontend
          npm install
      
      - name: Build
        run: |
          cd charity-dao-frontend
          npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./charity-dao-frontend/build
```

---

## 8. Backend: Procfile (Create new file)

```
web: npm start
```

---

## Summary of Changes

### Files to Create
- [ ] `backend/.env.production`
- [ ] `charity-dao-frontend/public/404.html`
- [ ] `.github/workflows/deploy.yml`
- [ ] `backend/Procfile`

### Files to Update
- [ ] `contracts/DonationTracking.sol` - Add M-Pesa function
- [ ] `backend/utils/donationHandler.js` - Add blockchain recording
- [ ] `charity-dao-frontend/package.json` - Add homepage
- [ ] `charity-dao-frontend/src/App.tsx` - Update Router

### Environment Variables to Set
- [ ] MPESA_CONSUMER_KEY
- [ ] MPESA_CONSUMER_SECRET
- [ ] MPESA_BUSINESS_SHORTCODE
- [ ] MPESA_PASSKEY
- [ ] POLYGON_RPC_URL
- [ ] PRIVATE_KEY
- [ ] DONATION_TRACKING_CONTRACT
- [ ] BACKEND_URL
- [ ] FRONTEND_URL

---

## Deployment Order

1. Update smart contracts
2. Deploy to Mumbai testnet
3. Deploy to Polygon mainnet
4. Update backend code
5. Deploy backend to Railway
6. Update frontend code
7. Deploy frontend to GitHub Pages
8. Test everything

---

## Testing After Changes

```bash
# Test smart contract
npx hardhat test

# Test backend locally
cd backend
npm start

# Test frontend locally
cd charity-dao-frontend
npm start

# Test M-Pesa callback
curl -X POST http://localhost:5000/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"Body":{"stkCallback":{"ResultCode":0,"CallbackMetadata":{"Item":[{"Name":"Amount","Value":100},{"Name":"MpesaReceiptNumber","Value":"TEST123"},{"Name":"PhoneNumber","Value":"254712345678"},{"Name":"TransactionDate","Value":"20231201120000"}]}}}}'
```

---

**All code changes are ready to implement!** 🚀

