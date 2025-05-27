const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Fixing signer permissions...");

    // Get deployed addresses
    const addresses = require('../../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get the owner
    const owner = await proposalManagement.owner();
    console.log("\nContract owner:", owner);
    
    // Get current signers
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log("\nCurrent authorized signers:", signers);
    
    // Get signer count
    const signerCount = await proposalManagement.signerCount();
    console.log("\nTotal signer count:", signerCount.toString());

    // Get the target signer address (the one that needs to be added)
    const targetSignerAddress = "0xBcdB9B05cD47EE978347E8C91133845B121e0699";
    console.log("\nTarget signer address:", targetSignerAddress);

    // Check if target signer is already authorized
    const isTargetSignerAuthorized = await proposalManagement.isAuthorizedSigner(targetSignerAddress);
    console.log("Is target signer already authorized?", isTargetSignerAuthorized);

    if (!isTargetSignerAuthorized) {
      console.log("\nAdding target signer...");
      // Get the deployer account (which should be the owner)
      const [deployer] = await ethers.getSigners();
      console.log("Deployer address:", deployer.address);
      
      // Connect contract with deployer
      const contractWithDeployer = proposalManagement.connect(deployer);
      
      // Add the target signer
      const tx = await contractWithDeployer.addSigner(targetSignerAddress);
      await tx.wait();
      console.log("Target signer added successfully");
      
      // Verify the change
      const updatedSigners = await proposalManagement.getAuthorizedSigners();
      console.log("\nUpdated authorized signers:", updatedSigners);
      console.log("Updated signer count:", (await proposalManagement.signerCount()).toString());
    } else {
      console.log("\nTarget signer is already authorized, no action needed");
    }

  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 