const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("\nStarting signer configuration fix...");

    // Get the ProposalManagement contract
    const proposalManagementAddress = require('../../deployedAddresses.json').PROPOSAL_MANAGEMENT;
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalContract = ProposalManagement.attach(proposalManagementAddress);

    // Get contract owner
    const owner = await proposalContract.owner();
    console.log("\nContract owner:", owner);

    // Check if owner is signer
    const isOwnerSigner = await proposalContract.isAuthorizedSigner(owner);
    console.log("Is owner currently a signer?", isOwnerSigner);

    // Get current signers
    const currentSigners = await proposalContract.getAuthorizedSigners();
    console.log("\nCurrent signers:", currentSigners);

    // Get signer count
    const signerCount = await proposalContract.signerCount();
    console.log("\nTotal signer count:", signerCount.toString());

    // Check for zero address
    const hasZeroAddress = currentSigners.includes("0x0000000000000000000000000000000000000000");
    if (hasZeroAddress) {
      console.log("\nRemoving zero address from signers...");
      const tx = await proposalContract.removeSigner("0x0000000000000000000000000000000000000000");
      await tx.wait();
      console.log("Zero address removed successfully");
    }

    // Get final state
    const finalSigners = await proposalContract.getAuthorizedSigners();
    const finalCount = await proposalContract.signerCount();
    console.log("\nFinal configuration:");
    console.log("Signers:", finalSigners);
    console.log("Count:", finalCount.toString());

  } catch (error) {
    console.error("\nError fixing signer configuration:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 