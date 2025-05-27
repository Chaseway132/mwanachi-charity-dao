const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Fixing MetaMask RPC error for proposal execution...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get contract instances
  console.log("\nConnecting to contracts...");

  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  console.log("CharityDAOPlatform at:", await charityDAOPlatform.getAddress());

  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
  console.log("FundAllocation at:", await fundAllocation.getAddress());

  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  console.log("ProposalManagement at:", await proposalManagement.getAddress());

  // Check contract relationships
  console.log("\nVerifying contract relationships...");

  // Check FundAllocation owner
  const fundOwner = await fundAllocation.owner();
  console.log("FundAllocation owner:", fundOwner);
  console.log("Is CharityDAOPlatform the owner?",
    fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

  // Check FundAllocation platform contract
  const platformContract = await fundAllocation.platformContract();
  console.log("FundAllocation platform contract:", platformContract);
  console.log("Is CharityDAOPlatform set as platform?",
    platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

  // Check CharityDAOPlatform owner
  const platformOwner = await charityDAOPlatform.owner();
  console.log("CharityDAOPlatform owner:", platformOwner);
  console.log("Are we the owner of CharityDAOPlatform?",
    platformOwner.toLowerCase() === deployer.address.toLowerCase());

  // Check if there are any proposals
  const proposalCount = await proposalManagement.proposalCount();
  console.log("\nTotal proposals:", proposalCount.toString());

  if (proposalCount.toString() === "0") {
    console.log("No proposals found. Nothing to fix.");
    return;
  }

  // Get the latest proposal
  const latestProposalId = await proposalManagement.proposalCount();
  console.log(`\nGetting details for proposal ID: ${latestProposalId}`);

  const proposal = await proposalManagement.getProposalById(latestProposalId);
  console.log("Proposal details:", {
    id: proposal.id.toString(),
    description: proposal.description,
    amountRequested: ethers.formatEther(proposal.amountRequested),
    voteCount: proposal.voteCount.toString(),
    approved: proposal.approved,
    executed: proposal.executed,
    recipient: proposal.recipient,
    creator: proposal.creator
  });

  // Check FundAllocation balance
  const balance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("\nFundAllocation balance:", ethers.formatEther(balance), "ETH");

  // Check if the proposal is already executed
  if (proposal.executed) {
    console.log("\nProposal is already executed. Nothing to fix.");
    return;
  }

  // Check if the proposal is approved
  if (!proposal.approved) {
    console.log("\nProposal is not approved. Please approve it first.");
    return;
  }

  // Check if we have enough balance to execute
  const proposalAmount = proposal.amountRequested;
  const balanceNumber = Number(ethers.formatEther(balance));
  const amountNumber = Number(ethers.formatEther(proposalAmount));

  if (balanceNumber < amountNumber) {
    console.log(`\nInsufficient balance to execute proposal. Need ${ethers.formatEther(proposalAmount)} ETH but have ${ethers.formatEther(balance)} ETH`);
    console.log("Sending funds to the FundAllocation contract...");

    // Send ETH to the FundAllocation contract
    const tx = await deployer.sendTransaction({
      to: addresses.FUND_ALLOCATION,
      value: proposalAmount
    });
    await tx.wait();

    // Check the new balance
    const newBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
    console.log("New FundAllocation balance:", ethers.formatEther(newBalance), "ETH");
  }

  // Try to execute the proposal with a higher gas limit
  console.log("\nAttempting to execute the proposal with a higher gas limit...");
  try {
    // Execute the proposal through CharityDAOPlatform with a higher gas limit
    console.log("Executing proposal through CharityDAOPlatform...");
    const tx = await charityDAOPlatform.executeProposal(latestProposalId, {
      gasLimit: 1000000 // Higher gas limit to avoid estimation issues
    });
    await tx.wait();
    console.log("Proposal executed successfully!");

    // Verify execution
    const proposalAfterExecution = await proposalManagement.getProposalById(latestProposalId);
    console.log("Is proposal now executed?", proposalAfterExecution.executed);
  } catch (error) {
    console.error("Error executing proposal:", error);

    // Try to get more details about the error
    console.log("\nTrying to diagnose the issue...");

    // Check if the proposal can be executed directly through FundAllocation
    try {
      console.log("Checking if we can execute directly through FundAllocation...");

      // Try direct execution
      console.log("Attempting direct execution through FundAllocation...");
      const tx = await fundAllocation.executeProposal(latestProposalId, {
        gasLimit: 1000000 // Higher gas limit
      });
      await tx.wait();
      console.log("Direct execution successful!");

      // Verify execution
      const proposalAfterExecution = await proposalManagement.getProposalById(latestProposalId);
      console.log("Is proposal now executed?", proposalAfterExecution.executed);
    } catch (directError) {
      console.error("Direct execution failed:", directError);
      console.log("\nAll execution attempts failed. Please try using the debug tool in the frontend.");
    }
  }

  console.log("\nFix attempt completed! If the issue persists, please use the debug tool in the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
