const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== COMPARING FUND ALLOCATION IMPLEMENTATIONS ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Get contract instances
  console.log("\nConnecting to deployed contracts...");
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  const oldFundAllocation = await ethers.getContractAt("FundAllocation", addresses.FUND_ALLOCATION);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const charityDAOPlatform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  
  // Compare contract properties
  console.log("\n--- Comparing Contract Properties ---");
  
  // Get owners
  const oldOwner = await oldFundAllocation.owner();
  const newOwner = await secureFundAllocation.owner();
  
  console.log("Old FundAllocation owner:", oldOwner);
  console.log("SecureFundAllocation owner:", newOwner);
  
  // Get platform contracts
  const oldPlatform = await oldFundAllocation.platformContract();
  const newPlatform = await secureFundAllocation.platformContract();
  
  console.log("Old FundAllocation platform:", oldPlatform);
  console.log("SecureFundAllocation platform:", newPlatform);
  
  // Get proposal contracts
  const oldProposalContract = await oldFundAllocation.proposalContract();
  const newProposalContract = await secureFundAllocation.proposalContract();
  
  console.log("Old FundAllocation proposal contract:", oldProposalContract);
  console.log("SecureFundAllocation proposal contract:", newProposalContract);
  
  // Get balances
  const oldBalance = await oldFundAllocation.getBalance();
  const newBalance = await secureFundAllocation.getBalance();
  
  console.log("Old FundAllocation balance:", ethers.formatEther(oldBalance), "ETH");
  console.log("SecureFundAllocation balance:", ethers.formatEther(newBalance), "ETH");
  
  // Compare contract code size (as a proxy for complexity)
  console.log("\n--- Comparing Contract Code Size ---");
  
  const oldCode = await ethers.provider.getCode(addresses.FUND_ALLOCATION);
  const newCode = await ethers.provider.getCode(addresses.SECURE_FUND_ALLOCATION);
  
  console.log("Old FundAllocation code size:", oldCode.length / 2 - 1, "bytes");
  console.log("SecureFundAllocation code size:", newCode.length / 2 - 1, "bytes");
  
  // Compare gas usage for common operations
  console.log("\n--- Comparing Gas Usage ---");
  
  // Fund both contracts for testing
  if (oldBalance < ethers.parseEther("0.5")) {
    console.log("Funding the old FundAllocation contract with 1 ETH...");
    await deployer.sendTransaction({
      to: addresses.FUND_ALLOCATION,
      value: ethers.parseEther("1")
    });
  }
  
  if (newBalance < ethers.parseEther("0.5")) {
    console.log("Funding the SecureFundAllocation contract with 1 ETH...");
    await deployer.sendTransaction({
      to: addresses.SECURE_FUND_ALLOCATION,
      value: ethers.parseEther("1")
    });
  }
  
  // Create proposals for both implementations
  console.log("\nCreating proposals for both implementations...");
  
  // Create proposal for old implementation
  const oldProposalTx = await proposalManagement.createProposal(
    "Test Old Implementation",
    ethers.parseEther("0.1"),
    deployer.address
  );
  const oldProposalReceipt = await oldProposalTx.wait();
  const oldProposalGasUsed = oldProposalReceipt.gasUsed;
  
  // Create proposal for new implementation
  const newProposalTx = await proposalManagement.createProposal(
    "Test New Implementation",
    ethers.parseEther("0.1"),
    deployer.address
  );
  const newProposalReceipt = await newProposalTx.wait();
  const newProposalGasUsed = newProposalReceipt.gasUsed;
  
  console.log("Gas used to create proposal (old):", oldProposalGasUsed.toString());
  console.log("Gas used to create proposal (new):", newProposalGasUsed.toString());
  
  // Get the proposal IDs
  const proposalCount = await proposalManagement.proposalCount();
  const oldProposalId = proposalCount - 2n; // Second to last proposal
  const newProposalId = proposalCount - 1n; // Last proposal
  
  console.log("Old proposal ID:", oldProposalId);
  console.log("New proposal ID:", newProposalId);
  
  // Vote on both proposals
  console.log("\nVoting on both proposals...");
  
  // Vote on old proposal
  const oldVoteTx = await charityDAOPlatform.voteOnProposal(oldProposalId);
  const oldVoteReceipt = await oldVoteTx.wait();
  const oldVoteGasUsed = oldVoteReceipt.gasUsed;
  
  // Vote on new proposal
  const newVoteTx = await charityDAOPlatform.voteOnProposal(newProposalId);
  const newVoteReceipt = await newVoteTx.wait();
  const newVoteGasUsed = newVoteReceipt.gasUsed;
  
  console.log("Gas used to vote on proposal (old):", oldVoteGasUsed.toString());
  console.log("Gas used to vote on proposal (new):", newVoteGasUsed.toString());
  
  // Simulate additional votes for both proposals
  console.log("\nSimulating additional votes for both proposals...");
  for (let i = 0; i < 2; i++) {
    await proposalManagement.incrementVoteCount(oldProposalId);
    await proposalManagement.incrementVoteCount(newProposalId);
  }
  
  // Sign both proposals
  console.log("\nSigning both proposals...");
  
  // Sign old proposal
  const oldSignTx = await proposalManagement.signProposal(oldProposalId);
  const oldSignReceipt = await oldSignTx.wait();
  const oldSignGasUsed = oldSignReceipt.gasUsed;
  
  // Sign new proposal
  const newSignTx = await proposalManagement.signProposal(newProposalId);
  const newSignReceipt = await newSignTx.wait();
  const newSignGasUsed = newSignReceipt.gasUsed;
  
  console.log("Gas used to sign proposal (old):", oldSignGasUsed.toString());
  console.log("Gas used to sign proposal (new):", newSignGasUsed.toString());
  
  // Wait for timelock to expire
  console.log("\nChecking timelock periods...");
  
  const oldRemainingDelay = await proposalManagement.getRemainingExecutionDelay(oldProposalId);
  const newRemainingDelay = await proposalManagement.getRemainingExecutionDelay(newProposalId);
  
  console.log("Remaining timelock delay (old):", oldRemainingDelay, "seconds");
  console.log("Remaining timelock delay (new):", newRemainingDelay, "seconds");
  
  if (oldRemainingDelay > 0 || newRemainingDelay > 0) {
    console.log("\nWaiting for timelock periods to expire...");
    console.log("Please run the test again after the timelock periods expire");
    return;
  }
  
  // Execute both proposals
  console.log("\nExecuting both proposals...");
  
  // Check if proposals can be executed
  const oldCanExecute = await proposalManagement.canBeExecuted(oldProposalId);
  const newCanExecute = await proposalManagement.canBeExecuted(newProposalId);
  
  console.log("Can old proposal be executed?", oldCanExecute);
  console.log("Can new proposal be executed?", newCanExecute);
  
  if (oldCanExecute && newCanExecute) {
    try {
      // Execute old proposal
      const oldExecuteTx = await oldFundAllocation.executeProposal(oldProposalId);
      const oldExecuteReceipt = await oldExecuteTx.wait();
      const oldExecuteGasUsed = oldExecuteReceipt.gasUsed;
      
      console.log("Gas used to execute proposal (old):", oldExecuteGasUsed.toString());
    } catch (error) {
      console.error("Error executing old proposal:", error.message);
    }
    
    try {
      // Execute new proposal
      const newExecuteTx = await secureFundAllocation.executeProposal(newProposalId);
      const newExecuteReceipt = await newExecuteTx.wait();
      const newExecuteGasUsed = newExecuteReceipt.gasUsed;
      
      console.log("Gas used to execute proposal (new):", newExecuteGasUsed.toString());
    } catch (error) {
      console.error("Error executing new proposal:", error.message);
    }
    
    // Check if proposals were executed
    const oldProposal = await proposalManagement.getProposalById(oldProposalId);
    const newProposal = await proposalManagement.getProposalById(newProposalId);
    
    console.log("\nOld proposal executed:", oldProposal.executed);
    console.log("New proposal executed:", newProposal.executed);
  } else {
    console.log("One or both proposals cannot be executed yet");
  }
  
  console.log("\n=== COMPARISON COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
