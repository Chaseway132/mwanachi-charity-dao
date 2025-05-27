const { ethers } = require("hardhat");

async function main() {
  console.log("Checking current signer status...");

  try {
    // Get deployed addresses
    const addresses = require('../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get the owner
    const owner = await proposalManagement.owner();
    console.log("\nContract owner:", owner);
    
    // Get current signers
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log("\nCurrent authorized signers:", signers);
    
    // Check if owner is a signer
    const isOwnerSigner = await proposalManagement.isAuthorizedSigner(owner);
    console.log("\nIs owner a signer?", isOwnerSigner);
    
    // Get signer count
    const signerCount = await proposalManagement.signerCount();
    console.log("\nTotal signer count:", signerCount.toString());
    
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 