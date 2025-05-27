const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Testing proposal execution flow...");

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
    console.log("No proposals found. Creating a test proposal...");
    
    // Create a test proposal
    const description = "Test proposal for execution flow";
    const amount = ethers.parseEther("0.1");
    const recipient = deployer.address;
    
    console.log(`Creating proposal: ${description}, Amount: ${ethers.formatEther(amount)} ETH, Recipient: ${recipient}`);
    const tx = await charityDAOPlatform.createProposal(description, amount, recipient);
    await tx.wait();
    
    console.log("Proposal created successfully!");
    
    // Get the new proposal count
    const newProposalCount = await proposalManagement.proposalCount();
    console.log("New proposal count:", newProposalCount.toString());
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
  
  // Check if the proposal is approved
  if (!proposal.approved) {
    console.log("\nProposal is not approved. Approving it now...");
    
    // First, add some votes
    console.log("Adding votes to the proposal...");
    await charityDAOPlatform.voteOnProposal(latestProposalId);
    console.log("Vote added");
    
    // Check if we're a signer
    const isSigner = await proposalManagement.authorizedSigners(deployer.address);
    console.log("Are we an authorized signer?", isSigner);
    
    if (!isSigner) {
      console.log("Adding ourselves as a signer...");
      await proposalManagement.addSigner(deployer.address);
      console.log("Added as signer");
    }
    
    // Sign the proposal
    console.log("Signing the proposal...");
    await proposalManagement.signProposal(latestProposalId);
    console.log("Proposal signed");
    
    // Add another signature if needed
    const updatedProposal = await proposalManagement.getProposalById(latestProposalId);
    if (!updatedProposal.approved) {
      console.log("Need another signature. Adding a second signature...");
      // This is just for testing - in production you'd need another account
      await proposalManagement.signProposal(latestProposalId);
      console.log("Second signature added");
    }
    
    // Check if the proposal is now approved
    const finalProposal = await proposalManagement.getProposalById(latestProposalId);
    console.log("Is proposal now approved?", finalProposal.approved);
  }

  // Check if we have enough balance to execute
  const proposalAmount = proposal.amountRequested;
  if (balance.lt(proposalAmount)) {
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

  // Try to execute the proposal
  console.log("\nAttempting to execute the proposal...");
  try {
    // Check if the proposal is already executed
    const proposalBeforeExecution = await proposalManagement.getProposalById(latestProposalId);
    if (proposalBeforeExecution.executed) {
      console.log("Proposal is already executed!");
    } else {
      // Execute the proposal
      console.log("Executing proposal through CharityDAOPlatform...");
      const tx = await charityDAOPlatform.executeProposal(latestProposalId);
      await tx.wait();
      console.log("Proposal executed successfully!");
      
      // Verify execution
      const proposalAfterExecution = await proposalManagement.getProposalById(latestProposalId);
      console.log("Is proposal now executed?", proposalAfterExecution.executed);
    }
  } catch (error) {
    console.error("Error executing proposal:", error);
    
    // Try to get more details about the error
    console.log("\nTrying to diagnose the issue...");
    
    // Check if the proposal can be executed directly through FundAllocation
    try {
      console.log("Checking if we can execute directly through FundAllocation...");
      const canExecute = await fundAllocation.callStatic.executeProposal(latestProposalId);
      console.log("Can execute directly:", canExecute);
    } catch (callError) {
      console.log("Direct execution would fail:", callError.message);
    }
    
    // Check time lock if applicable
    try {
      console.log("Checking if time lock is an issue...");
      const executionTime = proposal.executionTime;
      const currentTime = Math.floor(Date.now() / 1000);
      console.log(`Execution time: ${executionTime}, Current time: ${currentTime}`);
      console.log(`Time remaining: ${executionTime > currentTime ? executionTime - currentTime : 0} seconds`);
    } catch (timeError) {
      console.log("Error checking time lock:", timeError.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
