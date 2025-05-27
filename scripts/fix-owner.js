const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract fixes...");

  try {
    // Get the first signer (deployer)
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address:", deployerAddress);

    // Get the ProposalManagement contract
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalManagement = await ProposalManagement.attach("0xEe4A1e2cce17BF98b572eb6F1d503EadcE474655");

    // Get contract owner
    const owner = await proposalManagement.owner();
    console.log("Contract owner:", owner);

    // Check if owner is already a signer
    const isOwnerSigner = await proposalManagement.isAuthorizedSigner(owner);
    console.log("Is owner already a signer?", isOwnerSigner);

    if (!isOwnerSigner) {
      console.log("Adding owner as signer...");
      const tx = await proposalManagement.addSigner(owner);
      await tx.wait();
      console.log("Owner added as signer");
    }

    // Get final signer list
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log("Current signers:", signers);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 