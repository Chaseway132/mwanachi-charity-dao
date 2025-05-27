const { ethers } = require("hardhat");

async function main() {
  console.log("Starting signer setup...");

  try {
    // Get deployed addresses
    const addresses = require('../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get the deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("\nDeployer address:", deployerAddress);
    
    // Check current signers
    const currentSigners = await proposalManagement.getAuthorizedSigners();
    console.log("\nCurrent signers:", currentSigners);
    
    // Check if deployer is already a signer
    const isDeployerSigner = await proposalManagement.isAuthorizedSigner(deployerAddress);
    console.log("Is deployer a signer?", isDeployerSigner);
    
    if (!isDeployerSigner) {
      console.log("\nAdding deployer as signer...");
      const tx = await proposalManagement.addSigner(deployerAddress);
      await tx.wait();
      console.log("Deployer added as signer");
    }
    
    // Try to remove zero address if present
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const hasZeroAddress = currentSigners.includes(zeroAddress);
    
    if (hasZeroAddress) {
      console.log("\nRemoving zero address from signers...");
      try {
        const tx = await proposalManagement.removeSigner(zeroAddress);
        await tx.wait();
        console.log("Zero address removed");
      } catch (error) {
        console.log("Failed to remove zero address:", error.message);
      }
    }
    
    // Get final signer list
    const finalSigners = await proposalManagement.getAuthorizedSigners();
    console.log("\nFinal signers:", finalSigners);

  } catch (error) {
    console.error("\nScript failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
