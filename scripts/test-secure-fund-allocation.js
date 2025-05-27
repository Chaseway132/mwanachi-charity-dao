const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== TESTING SECURE FUND ALLOCATION CONTRACT ===\n");
  
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
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const charityDAOPlatform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  
  // Test 1: Check contract connections
  console.log("\n--- Test 1: Check Contract Connections ---");
  const proposalContract = await secureFundAllocation.proposalContract();
  const platformContract = await secureFundAllocation.platformContract();
  const owner = await secureFundAllocation.owner();
  
  console.log("ProposalManagement contract:", proposalContract);
  console.log("Platform contract:", platformContract);
  console.log("Owner:", owner);
  
  console.log("Expected ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  console.log("Expected Platform:", addresses.CHARITY_DAO_PLATFORM);
  
  if (proposalContract.toLowerCase() === addresses.PROPOSAL_MANAGEMENT.toLowerCase()) {
    console.log("✅ ProposalManagement contract correctly set");
  } else {
    console.log("❌ ProposalManagement contract incorrectly set");
  }
  
  if (platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase()) {
    console.log("✅ Platform contract correctly set");
  } else {
    console.log("❌ Platform contract incorrectly set");
  }
  
  // Test 2: Fund the contract
  console.log("\n--- Test 2: Fund the Contract ---");
  const initialBalance = await secureFundAllocation.getBalance();
  console.log("Initial balance:", ethers.formatEther(initialBalance), "ETH");
  
  if (initialBalance < ethers.parseEther("0.5")) {
    console.log("Funding the contract with 1 ETH...");
    await deployer.sendTransaction({
      to: addresses.SECURE_FUND_ALLOCATION,
      value: ethers.parseEther("1")
    });
    
    const newBalance = await secureFundAllocation.getBalance();
    console.log("New balance:", ethers.formatEther(newBalance), "ETH");
    
    if (newBalance > initialBalance) {
      console.log("✅ Contract funded successfully");
    } else {
      console.log("❌ Contract funding failed");
    }
  } else {
    console.log("✅ Contract already has sufficient funds");
  }
  
  // Test 3: Create a proposal
  console.log("\n--- Test 3: Create a Proposal ---");
  const proposalAmount = ethers.parseEther("0.1"); // 0.1 ETH
  const recipient = deployer.address; // Using deployer as recipient for testing
  
  console.log("Creating a proposal...");
  console.log("Amount:", ethers.formatEther(proposalAmount), "ETH");
  console.log("Recipient:", recipient);
  
  try {
    const tx1 = await proposalManagement.createProposal(
      "Test Secure Implementation",
      proposalAmount,
      recipient
    );
    await tx1.wait();
    
    const proposalCount = await proposalManagement.proposalCount();
    const proposalId = proposalCount - 1n; // Get the latest proposal ID
    console.log("Created proposal with ID:", proposalId);
    
    const proposal = await proposalManagement.getProposalById(proposalId);
    console.log("Proposal details:");
    console.log("- Description:", proposal.description);
    console.log("- Amount:", ethers.formatEther(proposal.amountRequested), "ETH");
    console.log("- Recipient:", proposal.recipient);
    console.log("- Approved:", proposal.approved);
    console.log("- Executed:", proposal.executed);
    
    console.log("✅ Proposal created successfully");
    
    // Test 4: Vote on the proposal
    console.log("\n--- Test 4: Vote on the Proposal ---");
    console.log("Voting on proposal ID:", proposalId);
    
    try {
      const tx2 = await charityDAOPlatform.voteOnProposal(proposalId);
      await tx2.wait();
      
      const voteCount = await proposalManagement.getVoteCount(proposalId);
      console.log("Vote count:", voteCount);
      
      if (voteCount > 0) {
        console.log("✅ Vote cast successfully");
      } else {
        console.log("❌ Vote casting failed");
      }
      
      // For testing purposes, we'll simulate additional votes
      console.log("Simulating additional votes...");
      for (let i = 0; i < 2; i++) {
        try {
          await proposalManagement.incrementVoteCount(proposalId);
          console.log(`Vote ${i+2} simulated`);
        } catch (error) {
          console.log(`Error simulating vote ${i+2}:`, error.message);
        }
      }
      
      const finalVoteCount = await proposalManagement.getVoteCount(proposalId);
      console.log("Final vote count:", finalVoteCount);
      
      // Test 5: Sign the proposal
      console.log("\n--- Test 5: Sign the Proposal ---");
      console.log("Signing proposal ID:", proposalId);
      
      try {
        const tx3 = await proposalManagement.signProposal(proposalId);
        await tx3.wait();
        
        // For testing, we need a second signature
        // This would normally be done by a different account
        console.log("Simulating second signature...");
        
        // Get authorized signers
        const signers = await proposalManagement.getAuthorizedSigners();
        console.log("Authorized signers:", signers);
        
        // Check if the proposal is approved
        const updatedProposal = await proposalManagement.getProposalById(proposalId);
        console.log("Proposal approved:", updatedProposal.approved);
        
        if (updatedProposal.approved) {
          console.log("✅ Proposal approved successfully");
          
          // Test 6: Wait for timelock
          console.log("\n--- Test 6: Wait for Timelock ---");
          const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
          console.log("Remaining timelock delay:", remainingDelay, "seconds");
          
          if (remainingDelay > 0) {
            console.log(`Waiting for timelock period (${remainingDelay} seconds)...`);
            console.log("Please wait for the timelock period to expire before continuing");
            
            // For testing purposes, we'll wait a bit
            if (remainingDelay < 60) { // Only wait if less than 60 seconds
              await new Promise(resolve => setTimeout(resolve, remainingDelay * 1000 + 1000));
              console.log("Timelock period expired");
            } else {
              console.log("Timelock period too long for automated testing");
              console.log("Please run the test again after the timelock period expires");
              return;
            }
          } else {
            console.log("✅ Timelock period already expired");
          }
          
          // Test 7: Execute the proposal
          console.log("\n--- Test 7: Execute the Proposal ---");
          console.log("Executing proposal ID:", proposalId);
          
          const canExecute = await proposalManagement.canBeExecuted(proposalId);
          console.log("Can proposal be executed?", canExecute);
          
          if (canExecute) {
            try {
              const initialRecipientBalance = await ethers.provider.getBalance(recipient);
              console.log("Initial recipient balance:", ethers.formatEther(initialRecipientBalance), "ETH");
              
              const tx4 = await secureFundAllocation.executeProposal(proposalId);
              await tx4.wait();
              
              const finalRecipientBalance = await ethers.provider.getBalance(recipient);
              console.log("Final recipient balance:", ethers.formatEther(finalRecipientBalance), "ETH");
              
              const balanceDifference = finalRecipientBalance - initialRecipientBalance;
              console.log("Balance difference:", ethers.formatEther(balanceDifference), "ETH");
              
              if (balanceDifference > 0) {
                console.log("✅ Proposal executed successfully");
                console.log("✅ Funds transferred to recipient");
              } else {
                console.log("❌ Funds not transferred to recipient");
              }
              
              // Check if the proposal is marked as executed
              const executedProposal = await proposalManagement.getProposalById(proposalId);
              console.log("Proposal executed:", executedProposal.executed);
              
              if (executedProposal.executed) {
                console.log("✅ Proposal marked as executed");
              } else {
                console.log("❌ Proposal not marked as executed");
              }
            } catch (error) {
              console.error("Error executing proposal:", error.message);
            }
          } else {
            console.log("❌ Proposal cannot be executed yet");
          }
        } else {
          console.log("❌ Proposal not approved");
        }
      } catch (error) {
        console.error("Error signing proposal:", error.message);
      }
    } catch (error) {
      console.error("Error voting on proposal:", error.message);
    }
  } catch (error) {
    console.error("Error creating proposal:", error.message);
  }
  
  console.log("\n=== TESTING COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
