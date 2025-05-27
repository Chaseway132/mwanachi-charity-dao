const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== SECURE IMPLEMENTATION REENTRANCY TEST ===\n");

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
  const charityDAOPlatform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);

  // Deploy the secure FundAllocation contract
  console.log("\nDeploying secure FundAllocation contract...");
  const FundAllocationSecure = await ethers.getContractFactory("FundAllocationSecure");
  const secureFundAllocation = await FundAllocationSecure.deploy(addresses.PROPOSAL_MANAGEMENT);
  await secureFundAllocation.deployed();
  console.log("FundAllocationSecure deployed to:", secureFundAllocation.address);

  // Set the platform contract
  await secureFundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
  console.log("Platform contract set in secure implementation");

  // Fund the secure contract
  console.log("\nFunding the secure FundAllocation contract with 2 ETH...");
  await deployer.sendTransaction({
    to: secureFundAllocation.address,
    value: ethers.parseEther("2")
  });
  const secureBalance = await ethers.provider.getBalance(secureFundAllocation.address);
  console.log("Secure FundAllocation balance:", ethers.formatEther(secureBalance), "ETH");

  // Deploy the attacker contract targeting the secure implementation
  console.log("\nDeploying ReentrancyAttackerSimple contract targeting secure implementation...");
  const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttackerSimple");
  const attacker = await ReentrancyAttacker.deploy(secureFundAllocation.address);
  await attacker.deployed();
  console.log("ReentrancyAttackerSimple deployed to:", attacker.address);

  // Create a proposal with the attacker contract as the recipient
  console.log("\nCreating a proposal with the attacker as recipient...");
  const proposalAmount = ethers.parseEther("0.5"); // 0.5 ETH
  const tx1 = await proposalManagement.createProposal(
    "Test Secure Implementation",
    proposalAmount,
    attacker.address
  );
  await tx1.wait();

  // Get the proposal ID
  const proposalCount = await proposalManagement.proposalCount();
  const proposalId = proposalCount.toNumber();
  console.log("Created proposal with ID:", proposalId);

  // Set the proposal ID in the attacker contract
  await attacker.setProposalId(proposalId);
  console.log("Set proposal ID in attacker contract");

  // Add votes to the proposal
  console.log("\nAdding votes to the proposal...");
  // Vote on the proposal (we need at least 3 votes)
  await charityDAOPlatform.voteOnProposal(proposalId);
  console.log("Vote 1 cast");

  // We need to use different accounts for additional votes
  // For this test, we'll just simulate it by directly incrementing the vote count
  for (let i = 0; i < 2; i++) {
    try {
      await proposalManagement.incrementVoteCount(proposalId);
      console.log(`Vote ${i+2} simulated`);
    } catch (error) {
      console.log(`Error simulating vote ${i+2}:`, error.message);
    }
  }

  // Sign the proposal to approve it
  console.log("\nSigning the proposal...");
  try {
    await proposalManagement.signProposal(proposalId);
    console.log("Proposal signed by owner");

    // We need a second signature - for testing, we'll try to sign again
    try {
      await proposalManagement.signProposal(proposalId);
      console.log("Proposal signed again (this would normally fail)");
    } catch (error) {
      console.log("Error signing again:", error.message);

      // For testing, we can directly set the proposal to approved
      console.log("\nSimulating second signature for testing...");
      // We can't directly modify the proposal, so we'll need to use a workaround
    }
  } catch (error) {
    console.log("Error signing proposal:", error.message);
  }

  // Check if the proposal is approved
  const proposal = await proposalManagement.getProposalById(proposalId);
  console.log("\nProposal approved:", proposal.approved);

  if (!proposal.approved) {
    console.log("Proposal not approved. For testing purposes, we need to get it approved.");
    console.log("Please approve the proposal manually through the UI or use multiple accounts.");
    return;
  }

  // Wait for the timelock period to expire
  const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
  if (remainingDelay.gt(0)) {
    console.log(`\nWaiting for timelock period (${remainingDelay} seconds)...`);
    // We can't actually wait in the script, so we'll use a workaround
    console.log("Please wait for the timelock period to expire before continuing");
    // For demonstration, we'll just wait a bit
    await new Promise(resolve => setTimeout(resolve, remainingDelay.toNumber() * 1000 + 1000));
  }

  // Check if the proposal can be executed
  const canExecute = await proposalManagement.canBeExecuted(proposalId);
  console.log("\nCan proposal be executed?", canExecute);

  if (!canExecute) {
    console.log("Proposal cannot be executed yet. Please check timelock and approval status.");
    return;
  }

  // Execute the proposal using the secure implementation
  console.log("\nExecuting the proposal using secure implementation...");
  try {
    const tx2 = await secureFundAllocation.executeProposal(proposalId);
    await tx2.wait();
    console.log("Proposal executed");
  } catch (error) {
    console.error("Error executing proposal:", error.message);
  }

  // Check final balances
  const finalSecureBalance = await ethers.provider.getBalance(secureFundAllocation.address);
  const attackerBalance = await attacker.getBalance();
  console.log("\nFinal Secure FundAllocation balance:", ethers.formatEther(finalSecureBalance), "ETH");
  console.log("Attacker contract balance:", ethers.formatEther(attackerBalance), "ETH");

  // Check if the attack was successful
  if (attackerBalance > proposalAmount) {
    console.log("\n⚠️ REENTRANCY ATTACK SUCCESSFUL! Even the secure implementation is vulnerable.");
    console.log("The attacker was able to drain more than the proposal amount.");
    console.log(`Expected: ${ethers.formatEther(proposalAmount)} ETH`);
    console.log(`Actual: ${ethers.formatEther(attackerBalance)} ETH`);
    console.log(`Excess: ${ethers.formatEther(attackerBalance - proposalAmount)} ETH`);
  } else {
    console.log("\n✅ Reentrancy attack prevented by secure implementation.");
    console.log(`Expected: ${ethers.formatEther(proposalAmount)} ETH`);
    console.log(`Actual: ${ethers.formatEther(attackerBalance)} ETH`);
  }

  // Withdraw funds from the attacker contract
  if (attackerBalance > 0) {
    console.log("\nWithdrawing funds from attacker contract...");
    await attacker.withdraw();
    console.log("Funds withdrawn");
  }

  console.log("\n=== TEST COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
