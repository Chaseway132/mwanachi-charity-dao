# 🌍 Mwanachi Charity DAO

**Blockchain-based charitable platform for Kenya with M-Pesa integration and transparent fund allocation**

> **Mission:** Solving Kenya's paybill problem through transparency and trust. "We don't want people sitting behind the tent and eating all the funds while they give us funny stories."

## ✨ Features

- **Smart Contract-Based Donations**: Secure and transparent donation handling on Polygon
- **M-Pesa Integration**: Kenyan mobile payment support with STK Push
- **Special Donations System**: Emergency fundraising campaigns with real-time tracking
- **DAO Governance**: Community-driven decision making for fund allocation
- **IPFS Integration**: Decentralized storage for proposal and donation metadata
- **Proposal System**: Create, vote on, approve, and execute charitable proposals
- **Treasury Management**: Transparent fund tracking and allocation
- **Web3 Integration**: Seamless blockchain interaction through MetaMask
- **Real-time Dashboard**: Live donation updates and fund flow analytics

## Prerequisites

- Node.js 16+
- npm or yarn
- MetaMask browser extension (optional, for blockchain features)
- Git
- Safaricom Developer Account (for M-Pesa integration)
- Pinata Account (for IPFS storage)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Chaseway132/mwanachi-charity-dao.git
   cd mwanachi-charity-dao
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd charity-dao-frontend
   npm install
   ```

4. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

5. Fill in your environment variables:
   - `REACT_APP_PINATA_JWT` - Get from https://app.pinata.cloud/keys
   - `MPESA_CONSUMER_KEY` - Get from https://developer.safaricom.co.ke/
   - `MPESA_CONSUMER_SECRET` - Get from Safaricom Developer Portal
   - `PRIVATE_KEY` - Your MetaMask private key (for deployment)

## Running the Application

### Quick Start (Recommended)

```bash
# Start backend server
cd backend
node server.js

# In another terminal, start frontend
cd charity-dao-frontend
npm start
```

Or use the provided scripts:
- **Windows (PowerShell):** `.\start-servers.ps1`
- **Windows (CMD):** `start-servers.bat`

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Advanced Setup

You can use either Ganache (recommended for testing) or Hardhat Network (for development):

### Option 1: Using Ganache (Recommended for Testing)

1. Install and Start Ganache:
   - Download Ganache from [https://trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
   - Install and launch Ganache
   - Create a new workspace (or quickstart)
   - Note down the RPC Server address (usually http://127.0.0.1:7545)

2. Configure the network in hardhat.config.ts:
   ```typescript
   networks: {
     ganache: {
       url: "http://127.0.0.1:7545",
       accounts: { mnemonic: "your ganache mnemonic here" }
     }
   }
   ```

3. Deploy the contracts to Ganache:
   ```bash
   npx hardhat run scripts/deploy.ts --network ganache
   ```

4. Connect MetaMask to Ganache:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH

5. Import Test Accounts:
   - In Ganache UI, click on the key icon next to any account
   - Copy the private key
   - In MetaMask, click "Import Account" and paste the private key
   - You now have access to pre-funded test accounts

### Option 2: Using Hardhat Network (For Development)

1. Start a local Hardhat node (in the main directory):
   ```bash
npx hardhat node
   ```

2. Deploy the contracts (in a new terminal):
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. Connect MetaMask to the Hardhat network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545/
   - Chain ID: 31337
   - Currency Symbol: ETH

### Starting the Frontend

1. Start the frontend application:
   ```bash
   cd charity-dao-frontend
   npm start
   ```

2. The application will automatically connect to whichever network you've configured in MetaMask

### Network Comparison

#### Ganache (Testing)
- Persistent blockchain state between restarts
- Visual interface for monitoring accounts and transactions
- Easy account management and private key access
- Better for testing and demonstration

#### Hardhat Network (Development)
- Fresh blockchain state on each restart
- Better debugging capabilities
- Console output for contract interactions
- Ideal for development and contract testing

## Using the Platform

### 📱 M-Pesa Donations (Kenyan Mobile Payments)
1. Navigate to the Donations page
2. Select the **M-Pesa** tab
3. Enter your Kenyan phone number (254...)
4. Enter the donation amount (1-150,000 KES)
5. Click "Pay with M-Pesa"
6. Confirm the STK Push prompt on your phone
7. Your donation is recorded on-chain

### 🆘 Special Causes (Emergency Fundraising)
1. Click the **🆘 Special Causes** button in navigation
2. Browse active emergency campaigns
3. Click on a campaign to view details
4. Choose payment method (M-Pesa or Crypto)
5. Make your donation
6. See real-time updates on the campaign

### Making Donations (Crypto)
1. Connect your MetaMask wallet
2. Navigate to the Donations page
3. Select the **Crypto** tab
4. Enter the donation amount in ETH
5. Confirm the transaction in MetaMask
6. Your donation will be recorded on-chain and metadata stored on IPFS

### Creating Proposals
1. Go to the Proposals page
2. Click "Create New Proposal"
3. Fill in:
   - Title
   - Description
   - Recipient address
   - Requested amount
4. Submit the proposal
5. Metadata will be stored on IPFS for transparency

### Voting on Proposals
1. Browse active proposals
2. Click on a proposal to view details
3. Choose to vote "For" or "Against"
4. Confirm your vote transaction
5. The voting period lasts for the specified timelock duration

### Executing Proposals
1. Once a proposal passes voting:
   - The approval threshold is met
   - The timelock period has expired
2. Any member can execute the approved proposal
3. Funds will be transferred to the specified recipient

## Smart Contract Architecture

- `CharityDAOPlatform.sol`: Main contract coordinating all functionality
- `DonationTracking.sol`: Handles donation logic and tracking
- `ProposalManagement.sol`: Manages proposal creation and execution
- `VotingGovernance.sol`: Implements voting mechanisms
- `FundAllocation.sol`: Manages treasury and fund distribution

## IPFS Integration

The platform uses IPFS (via Pinata) to store:
- Proposal metadata
- Donation records
- Vote information
- Execution details

This ensures transparency and permanent record-keeping of all platform activities.

## Security Considerations

- All smart contracts are immutable once deployed
- Timelock mechanisms prevent rushed decisions
- Multi-step proposal process ensures careful fund allocation
- Transparent voting and execution process
- All transactions are permanently recorded on the blockchain

## Troubleshooting

### Common Issues with Local Networks

1. **MetaMask Connection Issues**:
   - Ensure you're using the correct RPC URL and Chain ID
   - Reset your MetaMask account if you switch between networks
   - Clear your browser cache if you experience persistent issues

2. **Ganache-Specific Issues**:
   - Make sure Ganache is running before deploying contracts
   - Check if the mnemonic in your config matches Ganache's
   - Verify the RPC server is accessible (no firewall blocking)

3. **Hardhat Network Issues**:
   - Ensure no other process is using port 8545
   - Reset the Hardhat network if you encounter nonce issues
   - Clear MetaMask transaction history if needed

### Getting Test Ether

- **For Hardhat**: The default accounts come pre-funded
- **For Ganache**: Use the pre-funded accounts shown in the Ganache UI
- Import the private keys from either network into MetaMask to access the funds

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Visual Guide

### Platform Overview
![Platform Overview](docs/images/platform-overview.png)
*The main dashboard showing treasury status (0.0 ETH temporary holding, 5.31 ETH available for proposals), donation form, and active proposals*

### Authentication & Wallet Connection
![MetaMask Authentication](docs/images/authentication)
*MetaMask authentication interface for secure wallet connection*

![MetaMask Connection](docs/images/metamask-connection.png)
*MetaMask wallet interface showing account balance and available actions*

### Making Donations
![Donation Form](docs/images/donation-form.png)
*The donation form where users can enter amount and optional description*

### IPFS Integration
![Pinata Storage](docs/images/pinata-storage.png)
*IPFS storage through Pinata showing metadata for votes, donations, approvals, and proposals*

### Proposal Lifecycle

#### 1. Pending Proposal
![Pending Proposal](docs/images/proposal-pending.png)
*A new proposal requesting 1.5 ETH for flood victims, showing 0/3 votes and pending status*

#### 2. Approved Proposal
![Approved Proposal](docs/images/proposal-approved.png)
*An approved proposal "Slums' food" with 1.0 ETH requested and full voting approval (3/3)*

#### 3. Executed Proposal
![Executed Proposal](docs/images/proposal-executed.png)
*A completed proposal showing executed status after receiving required votes*

> Note: The platform features a modern, intuitive interface that guides users through:
> - Making donations with optional descriptions
> - Creating and voting on proposals
> - Monitoring proposal status and voting progress
> - Tracking treasury balances and fund allocation
> - Connecting and managing their MetaMask wallet
