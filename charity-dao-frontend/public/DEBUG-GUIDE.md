# Proposal Execution Debug Guide

This guide will help you troubleshoot issues with proposal execution while respecting the contract architecture.

## Understanding the Contract Architecture

The CharityDAO platform uses a hierarchical contract architecture:

1. **CharityDAOPlatform**: The main controller contract that coordinates all functionality
2. **FundAllocation**: Manages treasury and fund distribution
3. **ProposalManagement**: Manages proposal creation and tracking
4. **VotingGovernance**: Implements voting mechanisms
5. **DonationTracking**: Handles donation logic and tracking

The correct execution flow is:
- User interacts with CharityDAOPlatform
- CharityDAOPlatform calls FundAllocation
- FundAllocation executes the proposal and transfers funds
- ProposalManagement marks the proposal as executed

## Common Execution Issues

### MetaMask RPC Error / Internal JSON-RPC error

This error typically occurs when there's an issue with the transaction that MetaMask can't handle properly.

**Possible causes:**
- Gas estimation issues
- Contract state inconsistencies
- Network congestion
- Authorization issues between contracts

**Solutions:**
1. Try again with a higher gas limit
2. Check contract relationships using the Debug Tool
3. Ensure the FundAllocation contract has enough funds
4. Fix authorization issues using the fix-authorization-issues.js script:
   ```bash
   npx hardhat run scripts/fix-authorization-issues.js --network ganache
   ```

### Authorization Issues

If you see errors like "Not authorized" or "Only owner or platform can execute proposals", there may be issues with the contract permissions.

**Possible causes:**
- FundAllocation contract doesn't recognize CharityDAOPlatform as the platform
- CharityDAOPlatform is not properly set as the owner of FundAllocation
- ProposalManagement doesn't have FundAllocation authorized

**Solutions:**
1. Run the authorization fix script:
   ```bash
   npx hardhat run scripts/fix-authorization-issues.js --network ganache
   ```
2. This script will:
   - Set CharityDAOPlatform as the platform in FundAllocation
   - Transfer ownership of FundAllocation to CharityDAOPlatform if needed
   - Authorize FundAllocation in ProposalManagement
   - Test proposal execution to verify the fix

### Removing unpermitted intrinsics

This is a browser security feature that can sometimes block certain operations.

**Solutions:**
1. Try using a different browser
2. Use the Debug Tool to check contract state
3. Try executing with the Force Execute button in the Debug Tool

### Insufficient funds in contract

This error occurs when the FundAllocation contract doesn't have enough ETH to execute the proposal.

**Solution:**
Add more ETH to the FundAllocation contract before trying to execute.

### Time lock period not completed

This error occurs when trying to execute a proposal before the required waiting period has passed.

**Solution:**
Wait for the time lock period to expire (usually 45 seconds in development) and try again.

## Using the Debug Tool

The Debug Tool helps diagnose issues with proposal execution:

1. Navigate to `/debug-proposal.html`
2. Enter the Proposal ID
3. Click "Debug Proposal" to see detailed information about the proposal state
4. Check the contract relationships and balances
5. If everything looks correct but execution still fails, you can try the "Force Execute" button

## Force Execution (Last Resort)

The Force Execute button in the Debug Tool should only be used as a last resort when normal execution fails despite all contract relationships being correct.

It attempts to execute the proposal through the proper channels while providing more detailed error information.

## Checking Contract State

If you're experiencing persistent issues, you can check the contract state using the hardhat script:

```bash
npx hardhat run scripts/check-contract-state.js --network ganache
```

This will show you:
- All contract addresses
- Contract relationships
- Contract balances
- Proposal information

## Need More Help?

If you continue to experience issues, check the browser console (F12 or Ctrl+Shift+J) for more detailed error messages that can help diagnose the problem.
