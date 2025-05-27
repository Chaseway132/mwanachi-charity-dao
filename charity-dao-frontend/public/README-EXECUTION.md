# Proposal Execution Guide

If you're experiencing issues with proposal execution in the main application, this guide will help you use the alternative execution tools.

## Direct Execution Tool

The Direct Execution Tool provides multiple methods to execute proposals when the standard method fails.

### How to Use

1. Open the Direct Execution Tool by clicking the link in the error message or navigating to `/direct-execute.html`
2. Enter the Proposal ID you want to execute
3. Click "Load Proposal" to verify the proposal details
4. Choose one of the execution methods:

### Execution Methods

#### Method 1: Execution via VotingGovernance (Recommended)

This is the recommended method that executes the proposal through the VotingGovernance contract.

1. Click "Execute (Method 1)"
2. Confirm the transaction in MetaMask
3. Wait for confirmation

#### Method 2: Standard Execution via FundAllocation

This tries to execute the proposal through the FundAllocation contract (may not work if you're experiencing issues with the standard method).

#### Method 3: Direct markProposalExecuted + Manual Transfer

This method directly marks the proposal as executed in the ProposalManagement contract, then manually transfers the funds.

**Warning:** This method bypasses normal checks and should only be used as a last resort.

#### Method 4: Low-level Call

This method uses a low-level call to the FundAllocation contract with a fixed gas limit.

**Warning:** This method is advanced and should only be used if other methods fail.

## Debug Proposal Tool

If you need to diagnose issues with a proposal, you can use the Debug Proposal Tool:

1. Navigate to `/debug-proposal.html`
2. Enter the Proposal ID
3. Click "Debug Proposal" to see detailed information about the proposal state
4. If needed, you can use "Force Execute" to attempt execution with advanced options

## Common Issues and Solutions

### MetaMask RPC Error / Internal JSON-RPC error

This error typically occurs when there's an issue with the transaction that MetaMask can't handle properly.

**Solution:** Use Method 1 in the Direct Execution Tool.

### Removing unpermitted intrinsics

This is a browser security feature that can sometimes block certain operations.

**Solution:** Use Method 1 in the Direct Execution Tool.

### Insufficient funds in contract

This error occurs when the FundAllocation contract doesn't have enough ETH to execute the proposal.

**Solution:** Add more ETH to the FundAllocation contract before trying to execute.

### Time lock period not completed

This error occurs when trying to execute a proposal before the required waiting period has passed.

**Solution:** Wait for the time lock period to expire (usually 45 seconds in development) and try again.

## Need More Help?

If you continue to experience issues, check the browser console (F12 or Ctrl+Shift+J) for more detailed error messages that can help diagnose the problem.
