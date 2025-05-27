const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the ProposalManagement contract
    const proposalManagementAddress = require('../../deployedAddresses.json').PROPOSAL_MANAGEMENT;
    console.log("Contract address:", proposalManagementAddress);

    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalContract = ProposalManagement.attach(proposalManagementAddress);

    // Get contract owner
    const owner = await proposalContract.owner();
    console.log("\nContract owner:", owner);

    // Check if owner is signer
    const isOwnerSigner = await proposalContract.isAuthorizedSigner(owner);
    console.log("Is owner a signer?", isOwnerSigner);

    // Get total signer count
    const signerCount = await proposalContract.signerCount();
    console.log("\nTotal signer count:", signerCount.toString());

  } catch (error) {
    console.error("\nError:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 