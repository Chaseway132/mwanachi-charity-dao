const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting signer configuration fix...");

    // Get deployed addresses
    const addresses = require('../deployedAddresses.json');
    
    // Get the contract factory and attach to deployed address
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const contract = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
    
    // Get the owner address
    const owner = await contract.owner();
    console.log("\nContract owner:", owner);
    
    // Check if owner is currently a signer
    const isOwnerSigner = await contract.isAuthorizedSigner(owner);
    console.log("Is owner currently a signer?", isOwnerSigner);
    
    if (!isOwnerSigner) {
      console.log("\nAdding owner back as signer...");
      const tx = await contract.addSigner(owner);
      await tx.wait();
      console.log("Owner added as signer");
    }
    
    // Get current signers
    const signers = await contract.getAuthorizedSigners();
    console.log("\nCurrent signers:", signers);
    
    // Check for and remove zero address if present
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const hasZeroAddress = signers.some(s => s.toLowerCase() === zeroAddress.toLowerCase());
    
    if (hasZeroAddress) {
      console.log("\nRemoving zero address from signers...");
      const tx = await contract.removeSigner(zeroAddress);
      await tx.wait();
      console.log("Zero address removed");
    }
    
    // Verify final configuration
    console.log("\nVerifying final configuration...");
    
    const finalSigners = await contract.getAuthorizedSigners();
    const signerCount = await contract.signerCount();
    const finalOwnerStatus = await contract.isAuthorizedSigner(owner);
    
    console.log("\nFinal state:");
    console.log("- Owner is signer:", finalOwnerStatus);
    console.log("- Total signer count:", signerCount.toString());
    console.log("- Current signers:", finalSigners);
    
    console.log("\nConfiguration fix completed!");
    
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