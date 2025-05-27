const { ethers } = require("hardhat");
const path = require("path");

async function main() {
  try {
    // Get deployed addresses
    const addresses = require(path.join(__dirname, '../deployedAddresses.json'));
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get the owner
    const owner = await proposalManagement.owner();
    console.log("Contract owner:", owner);
    
    // Check if owner is a signer
    const isOwnerSigner = await proposalManagement.isAuthorizedSigner(owner);
    console.log("Is owner a signer?", isOwnerSigner);
    
    // Get current signers
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log("Current signers:", signers);
    
    // Add owner as signer if not already
    if (!isOwnerSigner) {
      console.log("Adding owner as signer...");
      const tx = await proposalManagement.addSigner(owner);
      await tx.wait();
      console.log("Owner added as signer");
      
      // Verify
      const newSigners = await proposalManagement.getAuthorizedSigners();
      console.log("Updated signers:", newSigners);
    }
    
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