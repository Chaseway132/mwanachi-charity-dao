const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Cleaning up signer configuration...");

    // Get deployed addresses
    const addresses = require('../../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get current signers
    const currentSigners = await proposalManagement.getAuthorizedSigners();
    console.log("\nCurrent signers:", currentSigners);

    // Remove zero address if present
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const isZeroAddressSigner = await proposalManagement.isAuthorizedSigner(zeroAddress);
    
    if (isZeroAddressSigner) {
      console.log("\nRemoving zero address from signers...");
      const tx = await proposalManagement.removeSigner(zeroAddress);
      await tx.wait();
      console.log("Zero address removed from signers");
    } else {
      console.log("\nZero address is not a signer");
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