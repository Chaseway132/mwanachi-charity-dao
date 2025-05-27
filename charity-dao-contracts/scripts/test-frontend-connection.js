const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Testing frontend connection to new contracts...");

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
      description: "Test proposal for frontend connection",
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

    // Get all proposals
    const proposals = await proposalManagement.getAllProposals();
    console.log(`\nFound ${proposals.length} proposals after creation:`);

    for (const proposal of proposals) {
      console.log("\nProposal Details:");
      console.log("----------------");
      console.log(`ID: ${proposal.id}`);
      console.log(`Description: ${proposal.description}`);
      console.log(`Amount Requested: ${ethers.formatEther(proposal.amountRequested)} ETH`);
      console.log(`Vote Count: ${proposal.voteCount}`);
      console.log(`Approved: ${proposal.approved}`);
      console.log(`Executed: ${proposal.executed}`);
      console.log(`Recipient: ${proposal.recipient}`);
      console.log(`Signature Count: ${proposal.signatureCount}`);
      console.log(`Creation Time: ${new Date(Number(proposal.creationTime) * 1000).toLocaleString()}`);
    }

    console.log("\nFrontend connection test completed successfully!");
    console.log("You can now check the frontend to see if it displays this test proposal.");
  } catch (error) {
    console.error("Error testing frontend connection:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 