const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Fixing signer configuration...");

    // Get deployed addresses
    const addresses = require('../../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get current signers
    const currentSigners = await proposalManagement.getAuthorizedSigners();
    console.log("\nCurrent signers:", currentSigners);

    // Use a hardcoded address for the second signer
    const secondSignerAddress = "0xBcdB9B05cD47EE978347E8C91133845B121e0699"; // This is the address you mentioned earlier
    
    console.log("\nSecond account to be used as signer:", secondSignerAddress);

    // Check if second account is already a signer
    const isAlreadySigner = await proposalManagement.isAuthorizedSigner(secondSignerAddress);
    
    if (!isAlreadySigner) {
      console.log("\nAdding second account as signer...");
      const tx = await proposalManagement.addSigner(secondSignerAddress);
      await tx.wait();
      console.log("Second account added as signer");
    } else {
      console.log("\nSecond account is already a signer");
    }

    // Get updated signer list
    const updatedSigners = await proposalManagement.getAuthorizedSigners();
    console.log("\nUpdated signer list:", updatedSigners);

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
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 