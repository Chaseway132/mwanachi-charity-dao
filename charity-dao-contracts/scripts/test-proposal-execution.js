const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Testing proposal execution with time lock...");

  // Load deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../../deployedAddresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Get the ProposalManagement contract
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.attach(deployedAddresses.PROPOSAL_MANAGEMENT);

  // Get the CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platform = await CharityDAOPlatform.attach(deployedAddresses.CHARITY_DAO_PLATFORM);

  try {
    // Create a test proposal
    console.log("\nCreating a test proposal...");
    const testProposal = {
      description: "Test proposal for execution",
      amountRequested: ethers.parseEther("0.1"),
      recipient: deployer.address
    };

    // Create the proposal through the platform
    const tx = await platform.createProposal(
      testProposal.description,
      testProposal.amountRequested,
      testProposal.recipient
    );
    await tx.wait();

    // Get the proposal ID (it will be 1 since this is a fresh deployment)
    const proposalId = 1;
    console.log(`\nCreated proposal with ID: ${proposalId}`);

    // Check initial state
    console.log("\nChecking initial proposal state...");
    const proposals = await proposalManagement.getAllProposals();
    const initialProposal = proposals[0]; // First proposal
    console.log("Initial state:");
    console.log("- Approved:", initialProposal.approved);
    console.log("- Executed:", initialProposal.executed);
    console.log("- Vote Count:", initialProposal.voteCount.toString());
    console.log("- Signature Count:", initialProposal.signatureCount.toString());

    console.log("\nProposal created successfully!");
    console.log("Please use the frontend to:");
    console.log("1. Add at least 3 votes");
    console.log("2. Add at least 2 signatures");
    console.log("3. Wait for the 45-second time lock");
    console.log("4. Execute the proposal");
  } catch (error) {
    console.error("Error testing proposal execution:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 