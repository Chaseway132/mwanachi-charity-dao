const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== TESTING SECURE FUND ALLOCATION SECURITY ===\n");
  
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
  
  // Deploy the attacker contract
  console.log("\nDeploying ReentrancyAttackerSimple contract...");
  const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttackerSimple");
  const attacker = await ReentrancyAttacker.deploy(addresses.SECURE_FUND_ALLOCATION);
  await attacker.waitForDeployment();
  const attackerAddress = await attacker.getAddress();
  console.log("ReentrancyAttackerSimple deployed to:", attackerAddress);
  
  // Fund the SecureFundAllocation contract if needed
  const initialBalance = await secureFundAllocation.getBalance();
  console.log("\nInitial SecureFundAllocation balance:", ethers.formatEther(initialBalance), "ETH");
  
  if (initialBalance < ethers.parseEther("1")) {
    console.log("Funding the SecureFundAllocation contract with 2 ETH...");
    await deployer.sendTransaction({
      to: addresses.SECURE_FUND_ALLOCATION,
      value: ethers.parseEther("2")
    });
    
    const newBalance = await secureFundAllocation.getBalance();
    console.log("New SecureFundAllocation balance:", ethers.formatEther(newBalance), "ETH");
  }
  
  // Create a proposal with the attacker contract as the recipient
  console.log("\nCreating a proposal with the attacker as recipient...");
  const proposalAmount = ethers.parseEther("0.5"); // 0.5 ETH
  
  try {
    const tx1 = await proposalManagement.createProposal(
      "Test Reentrancy Attack on Secure Implementation",
      proposalAmount,
      attackerAddress
    );
    await tx1.wait();
    
    // Get the proposal ID
    const proposalCount = await proposalManagement.proposalCount();
    const proposalId = proposalCount - 1n; // Get the latest proposal ID
    console.log("Created proposal with ID:", proposalId);
    
    // Set the proposal ID in the attacker contract
    await attacker.setProposalId(proposalId);
    console.log("Set proposal ID in attacker contract");
    
    // Vote on the proposal
    console.log("\nVoting on the proposal...");
    await charityDAOPlatform.voteOnProposal(proposalId);
    console.log("Vote cast");
    
    // Simulate additional votes
    console.log("Simulating additional votes...");
    for (let i = 0; i < 2; i++) {
      try {
        await proposalManagement.incrementVoteCount(proposalId);
        console.log(`Vote ${i+2} simulated`);
      } catch (error) {
        console.log(`Error simulating vote ${i+2}:`, error.message);
      }
    }
    
    // Sign the proposal
    console.log("\nSigning the proposal...");
    await proposalManagement.signProposal(proposalId);
    console.log("Proposal signed");
    
    // Check if the proposal is approved
    const proposal = await proposalManagement.getProposalById(proposalId);
    console.log("\nProposal approved:", proposal.approved);
    
    if (!proposal.approved) {
      console.log("Proposal not approved. Please approve the proposal manually.");
      return;
    }
    
    // Wait for the timelock period to expire
    const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
    if (remainingDelay > 0) {
      console.log(`\nWaiting for timelock period (${remainingDelay} seconds)...`);
      
      if (remainingDelay < 60) { // Only wait if less than 60 seconds
        await new Promise(resolve => setTimeout(resolve, remainingDelay * 1000 + 1000));
        console.log("Timelock period expired");
      } else {
        console.log("Timelock period too long for automated testing");
        console.log("Please run the test again after the timelock period expires");
        return;
      }
    }
    
    // Check if the proposal can be executed
    const canExecute = await proposalManagement.canBeExecuted(proposalId);
    console.log("\nCan proposal be executed?", canExecute);
    
    if (!canExecute) {
      console.log("Proposal cannot be executed yet. Please check timelock and approval status.");
      return;
    }
    
    // Record initial balances
    const initialFundBalance = await secureFundAllocation.getBalance();
    const initialAttackerBalance = await ethers.provider.getBalance(attackerAddress);
    
    console.log("\nInitial SecureFundAllocation balance:", ethers.formatEther(initialFundBalance), "ETH");
    console.log("Initial Attacker balance:", ethers.formatEther(initialAttackerBalance), "ETH");
    
    // Execute the proposal to test reentrancy
    console.log("\nExecuting the proposal to test reentrancy...");
    try {
      const tx2 = await secureFundAllocation.executeProposal(proposalId);
      await tx2.wait();
      console.log("Proposal executed");
    } catch (error) {
      console.error("Error executing proposal:", error.message);
      return;
    }
    
    // Check final balances
    const finalFundBalance = await secureFundAllocation.getBalance();
    const finalAttackerBalance = await ethers.provider.getBalance(attackerAddress);
    
    console.log("\nFinal SecureFundAllocation balance:", ethers.formatEther(finalFundBalance), "ETH");
    console.log("Final Attacker balance:", ethers.formatEther(finalAttackerBalance), "ETH");
    
    // Calculate the difference
    const fundBalanceDifference = initialFundBalance - finalFundBalance;
    const attackerBalanceDifference = finalAttackerBalance - initialAttackerBalance;
    
    console.log("\nFund balance difference:", ethers.formatEther(fundBalanceDifference), "ETH");
    console.log("Attacker balance difference:", ethers.formatEther(attackerBalanceDifference), "ETH");
    
    // Check if the attack was successful
    if (attackerBalanceDifference > proposalAmount) {
      console.log("\n⚠️ REENTRANCY ATTACK SUCCESSFUL! The contract is vulnerable.");
      console.log("The attacker was able to drain more than the proposal amount.");
      console.log(`Expected: ${ethers.formatEther(proposalAmount)} ETH`);
      console.log(`Actual: ${ethers.formatEther(attackerBalanceDifference)} ETH`);
      console.log(`Excess: ${ethers.formatEther(attackerBalanceDifference - proposalAmount)} ETH`);
    } else {
      console.log("\n✅ Reentrancy attack prevented by secure implementation.");
      console.log(`Expected: ${ethers.formatEther(proposalAmount)} ETH`);
      console.log(`Actual: ${ethers.formatEther(attackerBalanceDifference)} ETH`);
    }
    
    // Check the attack count
    const attackCount = await attacker.attackCount();
    console.log("\nAttack count:", attackCount);
    
    if (attackCount > 1) {
      console.log("⚠️ The attacker was able to make multiple calls, but didn't drain extra funds.");
      console.log("This suggests the reentrancy guard is working but could be improved.");
    } else if (attackCount === 1) {
      console.log("✅ The attacker was only able to make a single call.");
      console.log("This suggests the reentrancy guard is working correctly.");
    } else {
      console.log("❓ The attacker didn't make any calls.");
      console.log("This suggests something unexpected happened.");
    }
    
    // Withdraw funds from the attacker contract
    console.log("\nWithdrawing funds from attacker contract...");
    await attacker.withdraw();
    console.log("Funds withdrawn");
    
  } catch (error) {
    console.error("Error during testing:", error);
  }
  
  console.log("\n=== SECURITY TESTING COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
