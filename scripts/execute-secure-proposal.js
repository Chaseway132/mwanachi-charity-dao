const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== EXECUTING PROPOSAL WITH SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Executing with account:", deployer.address);
  
  // Connect to contracts
  console.log("\nConnecting to contracts...");
  const platform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  
  // Ask for the proposal ID
  const proposalId = 10n; // Change this to the ID of the proposal you want to execute
  console.log("\nExecuting proposal with ID:", proposalId);
  
  // Get proposal details
  try {
    const proposal = await proposalManagement.getProposalById(proposalId);
    console.log("\nProposal details:");
    console.log("Description:", proposal.description);
    console.log("Amount:", ethers.formatEther(proposal.amountRequested), "ETH");
    console.log("Recipient:", proposal.recipient);
    console.log("Approved:", proposal.approved);
    console.log("Executed:", proposal.executed);
    
    if (proposal.executed) {
      console.log("\n⚠️ This proposal has already been executed!");
      return;
    }
    
    if (!proposal.approved) {
      console.log("\n⚠️ This proposal has not been approved yet!");
      return;
    }
    
    // Check if the timelock period has passed
    const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
    console.log("\nRemaining timelock delay:", remainingDelay, "seconds");
    
    if (remainingDelay > 0) {
      console.log(`\n⚠️ Timelock period has not expired yet. Please wait ${remainingDelay} seconds.`);
      return;
    }
    
    // Check if the proposal can be executed
    const canExecute = await proposalManagement.canBeExecuted(proposalId);
    console.log("\nCan proposal be executed?", canExecute);
    
    if (!canExecute) {
      console.log("\n⚠️ Proposal cannot be executed yet!");
      return;
    }
    
    // Check if the fund has enough balance
    const fundBalance = await secureFundAllocation.getBalance();
    console.log("\nSecureFundAllocation balance:", ethers.formatEther(fundBalance), "ETH");
    
    if (fundBalance < proposal.amountRequested) {
      console.log("\n⚠️ SecureFundAllocation does not have enough balance!");
      console.log("Required:", ethers.formatEther(proposal.amountRequested), "ETH");
      console.log("Available:", ethers.formatEther(fundBalance), "ETH");
      return;
    }
    
    // Execute the proposal
    console.log("\nExecuting the proposal...");
    
    try {
      // Try executing through the platform first
      console.log("Executing through CharityDAOPlatform...");
      const tx1 = await platform.executeProposal(proposalId, {
        gasLimit: 500000 // Set a fixed gas limit
      });
      console.log("Transaction sent:", tx1.hash);
      await tx1.wait();
      console.log("Proposal executed through platform!");
    } catch (platformError) {
      console.error("Error executing through platform:", platformError.message);
      
      try {
        // Try direct execution through SecureFundAllocation
        console.log("\nTrying direct execution through SecureFundAllocation...");
        const tx2 = await secureFundAllocation.executeProposal(proposalId, {
          gasLimit: 500000 // Set a fixed gas limit
        });
        console.log("Transaction sent:", tx2.hash);
        await tx2.wait();
        console.log("Proposal executed directly through SecureFundAllocation!");
      } catch (directError) {
        console.error("Error with direct execution:", directError.message);
      }
    }
    
    // Check if the proposal was executed
    const finalProposal = await proposalManagement.getProposalById(proposalId);
    console.log("\nProposal executed:", finalProposal.executed);
    
    if (finalProposal.executed) {
      console.log("\n✅ Proposal execution successful!");
    } else {
      console.log("\n❌ Proposal execution failed!");
    }
  } catch (error) {
    console.error("Error getting proposal:", error.message);
  }
  
  console.log("\n=== EXECUTION COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
