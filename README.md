# Charity DAO Platform

A decentralized blockchain-based charity platform using DAO (Decentralized Autonomous Organization) and smart contracts for transparency and trust.

## Features

- **Smart Contract-Based Donations**: Secure and transparent donation handling
- **DAO Governance**: Community-driven decision making for fund allocation
- **IPFS Integration**: Decentralized storage for proposal and donation metadata
- **Proposal System**: Create, vote on, approve, and execute charitable proposals
- **Treasury Management**: Transparent fund tracking and allocation
- **Web3 Integration**: Seamless blockchain interaction through MetaMask

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Chaseway132/Dissertation_Blockchain_Prototype.git
   cd Dissertation_Blockchain_Prototype
   ```

2. Install dependencies for smart contracts:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd charity-dao-frontend
   npm install
   ```

4. Create a `.env.local` file in the `charity-dao-frontend` directory with your Pinata JWT:
   ```
   REACT_APP_PINATA_JWT=your_pinata_jwt_here
   ```

## Running the Application

1. Start a local Hardhat node (in the main directory):
   ```bash
   npx hardhat node
   ```

2. Deploy the contracts (in a new terminal):
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. Start the frontend application:
   ```bash
   cd charity-dao-frontend
   npm start
   ```

4. Connect MetaMask to the local network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545/
   - Chain ID: 31337
   - Currency Symbol: ETH

## Using the Platform

### Making Donations
1. Connect your MetaMask wallet
2. Navigate to the Donations page
3. Enter the donation amount
4. Confirm the transaction in MetaMask
5. Your donation will be recorded on-chain and metadata stored on IPFS

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
