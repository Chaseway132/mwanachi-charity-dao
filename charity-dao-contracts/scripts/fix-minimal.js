const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the ProposalManagement contract
    const proposalManagementAddress = require('../../deployedAddresses.json').PROPOSAL_MANAGEMENT;
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalContract = ProposalManagement.attach(proposalManagementAddress);

    // Get contract owner
    const owner = await proposalContract.owner();
    console.log("Owner:", owner);

    // Check if owner is signer
    const isOwnerSigner = await proposalContract.isAuthorizedSigner(owner);
    console.log("Is owner signer?", isOwnerSigner);

    // Get all signers
    const signerList = await proposalContract.getAuthorizedSigners();
    console.log("\nCurrent signers:", signerList);

    // Try to add a new signer if needed
    const [deployer, newSigner] = await ethers.getSigners();
    if (!signerList.includes(newSigner.address)) {
      console.log("\nAdding new signer:", newSigner.address);
      const tx = await proposalContract.addSigner(newSigner.address);
      await tx.wait();
      console.log("New signer added");
    }

    // Get final state
    const finalSignerList = await proposalContract.getAuthorizedSigners();
    console.log("\nFinal signers:", finalSignerList);

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