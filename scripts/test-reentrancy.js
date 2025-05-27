const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Testing reentrancy vulnerability...");

  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Get contract instances
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  const fundAllocation = await ethers.getContractAt("FundAllocation", addresses.FUND_ALLOCATION);
  const charityDAOPlatform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);

  // Deploy the attacker contract
  console.log("Deploying ReentrancyAttacker contract...");
  const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
  const attacker = await ReentrancyAttacker.deploy(
    addresses.FUND_ALLOCATION, // This will be treated as payable in deployment context
    addresses.PROPOSAL_MANAGEMENT
  );
  await attacker.deployed();
  console.log("ReentrancyAttacker deployed to:", attacker.address);

  // Check initial balances
  const initialFundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("Initial FundAllocation balance:", ethers.utils.formatEther(initialFundBalance), "ETH");

  // Fund the FundAllocation contract if needed
  if (initialFundBalance.lt(ethers.utils.parseEther("1"))) {
    console.log("Funding the FundAllocation contract...");
    await deployer.sendTransaction({
      to: addresses.FUND_ALLOCATION,
      value: ethers.utils.parseEther("2")
    });
    const newBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
    console.log("New FundAllocation balance:", ethers.utils.formatEther(newBalance), "ETH");
  }

  // Create a proposal with the attacker contract as the recipient
  console.log("Creating a proposal with the attacker as recipient...");
  const proposalAmount = ethers.utils.parseEther("0.5"); // 0.5 ETH
  const tx1 = await proposalManagement.createProposal(
    "Test Reentrancy Attack",
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
  console.log("Adding votes to the proposal...");
  // Add user1 as a signer if not already
  const isUser1Signer = await proposalManagement.isAuthorizedSigner(user1.address);
  if (!isUser1Signer) {
    await proposalManagement.addSigner(user1.address);
    console.log("Added user1 as a signer");
  }

  // Add user2 as a signer if not already
  const isUser2Signer = await proposalManagement.isAuthorizedSigner(user2.address);
  if (!isUser2Signer) {
    await proposalManagement.addSigner(user2.address);
    console.log("Added user2 as a signer");
  }

  // Vote on the proposal (simulate multiple votes)
  for (let i = 0; i < 3; i++) {
    const voter = [deployer, user1, user2][i % 3];
    const hasVoted = await proposalManagement.hasVoted(proposalId, voter.address);
    if (!hasVoted) {
      await charityDAOPlatform.connect(voter).voteOnProposal(proposalId);
      console.log(`User ${voter.address} voted on proposal`);
    }
  }

  // Sign the proposal to approve it
  console.log("Signing the proposal...");
  await proposalManagement.signProposal(proposalId);
  console.log("Deployer signed the proposal");

  await proposalManagement.connect(user1).signProposal(proposalId);
  console.log("User1 signed the proposal");

  // Check if the proposal is approved
  const proposal = await proposalManagement.getProposalById(proposalId);
  console.log("Proposal approved:", proposal.approved);

  // Wait for the timelock period to expire
  const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
  if (remainingDelay.gt(0)) {
    console.log(`Waiting for timelock period (${remainingDelay} seconds)...`);
    // We can't actually wait in the script, so we'll use a workaround
    // In a real test, you would use something like ethers.provider.send("evm_increaseTime", [remainingDelay.toNumber()])
    console.log("Please wait for the timelock period to expire before continuing");
    // For demonstration, we'll just wait a bit
    await new Promise(resolve => setTimeout(resolve, remainingDelay.toNumber() * 1000 + 1000));
  }

  // Execute the proposal to trigger the reentrancy attack
  console.log("Executing the proposal to test reentrancy...");
  try {
    const tx2 = await charityDAOPlatform.executeProposal(proposalId);
    await tx2.wait();
    console.log("Proposal executed");
  } catch (error) {
    console.error("Error executing proposal:", error.message);
  }

  // Check final balances
  const finalFundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  const attackerBalance = await attacker.getBalance();
  console.log("Final FundAllocation balance:", ethers.utils.formatEther(finalFundBalance), "ETH");
  console.log("Attacker contract balance:", ethers.utils.formatEther(attackerBalance), "ETH");

  // Check if the attack was successful
  if (attackerBalance.gt(proposalAmount)) {
    console.log("REENTRANCY ATTACK SUCCESSFUL! The contract is vulnerable.");
    console.log("The attacker was able to drain more than the proposal amount.");
  } else {
    console.log("Reentrancy attack failed or was prevented. The contract appears to be secure.");
  }

  // Withdraw funds from the attacker contract
  if (attackerBalance.gt(0)) {
    console.log("Withdrawing funds from attacker contract...");
    await attacker.withdraw();
    console.log("Funds withdrawn");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
