import { ethers } from 'ethers';
import { getProvider } from './web3';
import { getVotingGovernanceContract, getProposalManagementContract, getFundAllocationContract } from './contracts';
import { uploadExecutionToIPFS } from './ipfs';

/**
 * Force execution of a proposal by bypassing the time lock check
 * This is a fallback method for when the normal execution fails due to time lock issues
 */
export async function forceExecuteProposal(proposalId: bigint): Promise<void> {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  try {
    console.log(`Attempting to force execute proposal ${proposalId}...`);

    // Get proposal details
    const pmContract = await getProposalManagementContract(provider);
    const proposal = await pmContract.getProposalById(proposalId);

    // Check if the proposal is approved
    if (!proposal.approved) {
      throw new Error('Proposal is not approved yet');
    }

    // Check if the proposal is already executed
    if (proposal.executed) {
      throw new Error('Proposal has already been executed');
    }

    // Check if the user is the owner (only owner can execute proposals)
    const owner = await pmContract.owner();
    const userAddress = await signer.getAddress();
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error('Only the owner can execute proposals');
    }

    // Use the FundAllocation contract for execution - this is the contract that actually transfers funds
    const fundAllocationContract = await getFundAllocationContract(provider);

    // Check contract balance before execution
    const contractAddress = (fundAllocationContract as any).target || (fundAllocationContract as any).address;
    const balanceBefore = await provider.getBalance(contractAddress);
    console.log(`Contract balance before execution: ${ethers.formatEther(balanceBefore)} ETH`);

    // Get the amount to be transferred
    const requiredAmount = proposal.amountRequested || proposal.amount;
    console.log(`Required amount for execution: ${ethers.formatEther(requiredAmount)} ETH`);

    // Check if contract has enough funds
    if (balanceBefore < requiredAmount) {
      throw new Error(`Insufficient funds in contract. Available: ${ethers.formatEther(balanceBefore)} ETH, Required: ${ethers.formatEther(requiredAmount)} ETH`);
    }

    // Execute the proposal directly through FundAllocation contract
    console.log('Executing proposal using FundAllocation contract...');
    const fundAllocationWithSigner = fundAllocationContract.connect(signer);

    // Execute with fixed gas limit to avoid estimation issues
    const tx = await (fundAllocationWithSigner as any).executeProposal(proposalId, {
      gasLimit: 600000 // Higher gas limit for safety
    });

    console.log('Force execution transaction sent:', tx.hash);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    console.log('Force execution transaction confirmed:', receipt);

    // Verify the funds were actually transferred by checking the contract balance after execution
    const balanceAfter = await provider.getBalance(contractAddress);
    console.log(`Contract balance after execution: ${ethers.formatEther(balanceAfter)} ETH`);

    // Calculate the difference
    const difference = balanceBefore - balanceAfter;
    console.log(`Balance difference: ${ethers.formatEther(difference)} ETH`);

    // Verify the difference matches the required amount (approximately, accounting for gas)
    const tolerance = ethers.parseEther("0.01"); // Allow for small differences due to gas costs

    if (difference < requiredAmount - tolerance) {
      console.warn(`Warning: The transferred amount (${ethers.formatEther(difference)} ETH) is less than expected (${ethers.formatEther(requiredAmount)} ETH)`);
    } else {
      console.log(`Funds successfully transferred! Amount: ${ethers.formatEther(difference)} ETH`);
    }

    // Check if the proposal is now marked as executed
    const updatedProposal = await pmContract.getProposalById(proposalId);
    if (!updatedProposal.executed) {
      console.warn("Warning: Proposal is not marked as executed in the contract, but funds may have been transferred");
    } else {
      console.log("Proposal successfully marked as executed in the contract");
    }

    // Attach off-chain execution metadata
    try {
      const executor = await signer.getAddress();

      // Use current timestamp for IPFS upload to ensure compatibility
      const timestamp = Date.now().toString();
      console.log('Using current timestamp for IPFS upload:', new Date(Number(timestamp)).toLocaleString());

      // Create metadata with balance information
      const metadata = JSON.stringify({
        proposalId: proposalId.toString(),
        executor,
        recipient: proposal.recipient,
        amount: requiredAmount.toString(),
        txHash: tx.hash,
        timestamp,
        method: 'force-execution-fund-allocation',
        proposalExecuted: updatedProposal.executed,
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString(),
        transferredAmount: difference.toString(),
        fundsTransferred: difference >= (requiredAmount - tolerance)
      });

      await uploadExecutionToIPFS(
        proposalId.toString(),
        executor,
        proposal.recipient,
        ethers.formatEther(requiredAmount),
        timestamp,
        tx.hash,
        metadata
      );
    } catch (uploadErr) {
      console.warn('Execution IPFS upload failed:', uploadErr);
    }
  } catch (error: any) {
    console.error('Error force executing proposal:', error);
    throw error;
  }
}
