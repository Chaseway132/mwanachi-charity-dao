const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== TESTING PROPOSAL EXECUTION WITH SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Connect to contracts
  console.log("\nConnecting to contracts...");
  const platform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  
  // Verify contract connections
  console.log("\nVerifying contract connections...");
  
  // Check CharityDAOPlatform -> SecureFundAllocation
  const fundAllocationInPlatform = await platform.fundAllocationContract();
  console.log("FundAllocation in CharityDAOPlatform:", fundAllocationInPlatform);
  console.log("Expected SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  console.log("Is correctly set:", fundAllocationInPlatform.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  // Check ProposalManagement -> SecureFundAllocation
  const fundAllocationInProposal = await proposalManagement.fundAllocationContract();
  console.log("\nFundAllocation in ProposalManagement:", fundAllocationInProposal);
  console.log("Expected SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  console.log("Is correctly set:", fundAllocationInProposal.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  // Check SecureFundAllocation -> ProposalManagement
  const proposalInFundAllocation = await secureFundAllocation.proposalContract();
  console.log("\nProposalContract in SecureFundAllocation:", proposalInFundAllocation);
  console.log("Expected ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  console.log("Is correctly set:", proposalInFundAllocation.toLowerCase() === addresses.PROPOSAL_MANAGEMENT.toLowerCase());
  
  // Check SecureFundAllocation -> CharityDAOPlatform
  const platformInFundAllocation = await secureFundAllocation.platformContract();
  console.log("\nPlatform in SecureFundAllocation:", platformInFundAllocation);
  console.log("Expected CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("Is correctly set:", platformInFundAllocation.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check contract balances
  console.log("\nChecking contract balances...");
  const fundBalance = await secureFundAllocation.getBalance();
  console.log("SecureFundAllocation balance:", ethers.formatEther(fundBalance), "ETH");
  
  if (fundBalance < ethers.parseEther("0.1")) {
    console.log("\n⚠️ SecureFundAllocation balance is low. Adding funds...");
    await deployer.sendTransaction({
      to: addresses.SECURE_FUND_ALLOCATION,
      value: ethers.parseEther("1")
    });
    const newBalance = await secureFundAllocation.getBalance();
    console.log("New SecureFundAllocation balance:", ethers.formatEther(newBalance), "ETH");
  }
  
  // Create a test proposal
  console.log("\nCreating a test proposal...");
  const proposalAmount = ethers.parseEther("0.1");
  const recipient = deployer.address;
  
  try {
    const tx1 = await proposalManagement.createProposal(
      "Test Secure Execution",
      proposalAmount,
      recipient
    );
    await tx1.wait();
    
    const proposalCount = await proposalManagement.proposalCount();
    const proposalId = proposalCount - 1n;
    console.log("Created proposal with ID:", proposalId);
    
    // Get proposal details
    const proposal = await proposalManagement.getProposalById(proposalId);
    console.log("\nProposal details:");
    console.log("Description:", proposal.description);
    console.log("Amount:", ethers.formatEther(proposal.amountRequested), "ETH");
    console.log("Recipient:", proposal.recipient);
    console.log("Approved:", proposal.approved);
    console.log("Executed:", proposal.executed);
    
    // Add votes to the proposal
    console.log("\nAdding votes to the proposal...");
    for (let i = 0; i < 3; i++) {
      try {
        await proposalManagement.incrementVoteCount(proposalId);
        console.log(`Vote ${i+1} added`);
      } catch (error) {
        console.error(`Error adding vote ${i+1}:`, error.message);
      }
    }
    
    // Sign the proposal
    console.log("\nSigning the proposal...");
    try {
      // Add the deployer as a signer if not already
      const isAuthorizedSigner = await proposalManagement.isAuthorizedSigner(deployer.address);
      if (!isAuthorizedSigner) {
        console.log("Adding deployer as authorized signer...");
        await proposalManagement.addSigner(deployer.address);
        console.log("Deployer added as signer");
      }
      
      const tx2 = await proposalManagement.signProposal(proposalId);
      await tx2.wait();
      console.log("Proposal signed");
      
      // Check if the proposal is approved
      const updatedProposal = await proposalManagement.getProposalById(proposalId);
      console.log("\nProposal approved:", updatedProposal.approved);
      
      if (updatedProposal.approved) {
        // Wait for timelock to expire
        const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
        console.log("\nRemaining timelock delay:", remainingDelay, "seconds");
        
        if (remainingDelay > 0) {
          console.log(`Waiting for timelock period (${remainingDelay} seconds)...`);
          await new Promise(resolve => setTimeout(resolve, remainingDelay * 1000 + 1000));
          console.log("Timelock period expired");
        }
        
        // Execute the proposal
        console.log("\nExecuting the proposal...");
        
        // Check if the proposal can be executed
        const canExecute = await proposalManagement.canBeExecuted(proposalId);
        console.log("Can proposal be executed?", canExecute);
        
        if (canExecute) {
          try {
            // Try executing through the platform first
            console.log("Executing through CharityDAOPlatform...");
            const tx3 = await platform.executeProposal(proposalId, {
              gasLimit: 500000 // Set a fixed gas limit
            });
            await tx3.wait();
            console.log("Proposal executed through platform!");
          } catch (platformError) {
            console.error("Error executing through platform:", platformError.message);
            
            try {
              // Try direct execution through SecureFundAllocation
              console.log("\nTrying direct execution through SecureFundAllocation...");
              const tx4 = await secureFundAllocation.executeProposal(proposalId, {
                gasLimit: 500000 // Set a fixed gas limit
              });
              await tx4.wait();
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
        } else {
          console.log("\n❌ Proposal cannot be executed yet!");
        }
      } else {
        console.log("\n❌ Proposal not approved!");
      }
    } catch (error) {
      console.error("Error signing proposal:", error.message);
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
