const { ethers } = require("hardhat");

async function main() {
  console.log("Starting signer fixes...");

  try {
    // Get deployed addresses
    const addresses = require('../deployedAddresses.json');
    
    // Create a wallet with the owner's private key
    const ownerPrivateKey = "0xd45bfe5f2e591b0f14c6c106597270b29547b8e0dfc6fef186bce3df81dac2e9";
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt(
      "ProposalManagement",
      addresses.PROPOSAL_MANAGEMENT,
      ownerWallet
    );
    
    // Get owner address
    const ownerAddress = await ownerWallet.getAddress();
    console.log("\nOwner address:", ownerAddress);
    
    // Check current signers
    const currentSigners = await proposalManagement.getAuthorizedSigners();
    console.log("\nCurrent signers:", currentSigners);
    
    // Check if owner is already a signer
    const isOwnerSigner = await proposalManagement.isAuthorizedSigner(ownerAddress);
    console.log("Is owner a signer?", isOwnerSigner);
    
    if (!isOwnerSigner) {
      console.log("\nAdding owner as signer...");
      const tx = await proposalManagement.addSigner(ownerAddress);
      await tx.wait();
      console.log("Owner added as signer");
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