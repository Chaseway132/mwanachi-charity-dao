# Troubleshooting Guide

## MetaMask RPC Errors and "Removing unpermitted intrinsics"

If you're encountering MetaMask RPC errors or "Removing unpermitted intrinsics" errors when trying to execute proposals, follow these steps to resolve the issue:

### 1. Check Contract State

First, check the current state of your contracts to identify any issues:

```bash
npx hardhat run scripts/check-contract-state.js --network localhost
```

This will show you:
- All contract addresses
- Contract relationships
- Contract balances
- Proposal information

### 2. Fix Contract Permissions

If the contract relationships are incorrect, run the permission fix script:

```bash
npx hardhat run scripts/fix-contract-permissions.js --network localhost
```

This script will:
- Set the CharityDAOPlatform as the platform contract in FundAllocation
- Transfer ownership of FundAllocation to CharityDAOPlatform if needed
- Add your account as a signer if you're not already one

### 3. Test Execution Flow

To test if the proposal execution flow works correctly:

```bash
npx hardhat run scripts/test-execution-flow.js --network localhost
```

This script will:
- Create a test proposal if none exists
- Add votes and signatures to approve the proposal
- Fund the FundAllocation contract if needed
- Try to execute the proposal and diagnose any issues

### 4. Deploy New Contracts (If Needed)

If the above steps don't resolve the issue, you may need to deploy new contracts:

```bash
npx hardhat run scripts/fix-metamask-rpc-error.js --network localhost
```

This script will:
- Deploy a new FundAllocation contract with correct settings
- Deploy a new CharityDAOPlatform contract with the updated FundAllocation address
- Update all address references in configuration files
- Fund the new FundAllocation contract

### 5. Restart Your Frontend Application

After making any changes to the contracts or configuration, restart your frontend application to use the updated contracts:

```bash
cd charity-dao-frontend
npm start
```

## Common Issues and Solutions

### 1. Insufficient Funds in FundAllocation Contract

**Symptom**: Proposal execution fails with "Insufficient contract balance" error.

**Solution**: Send ETH to the FundAllocation contract:

```bash
npx hardhat run scripts/fund-contract.js --network localhost
```

### 2. Time Lock Period Not Completed

**Symptom**: Proposal execution fails with "time lock period not completed" error.

**Solution**: Wait for the time lock period to expire (usually 45 seconds in development) and try again.

### 3. Contract Ownership Issues

**Symptom**: Execution fails with permission errors.

**Solution**: Run the fix-contract-permissions.js script to correct ownership and permissions.

### 4. MetaMask Transaction Errors

**Symptom**: MetaMask shows "Internal JSON-RPC error" or transaction fails silently.

**Solution**: 
1. Reset your MetaMask account (Settings > Advanced > Reset Account)
2. Make sure you're connected to the correct network
3. Try using a different execution method through the debug tools

### 5. Contract Address Mismatch

**Symptom**: Frontend shows different contract addresses than what's deployed.

**Solution**: Check that the addresses in `deployedAddresses.json` and `charity-dao-frontend/src/config/deployedAddresses.ts` match. If not, run:

```bash
npx hardhat run scripts/copy-addresses-to-frontend.js
```

## Advanced Debugging

For advanced debugging, use the debug tools provided in the public directory:

- `debug-proposal.html`: Detailed proposal debugging and alternative execution methods
- `direct-execute.html`: Direct execution through different contracts
- `check-proposal.html`: Check proposal details and execution requirements
- `fund-contract.html`: Send funds to the FundAllocation contract

Access these tools by opening them directly in your browser from the `charity-dao-frontend/public` directory.
