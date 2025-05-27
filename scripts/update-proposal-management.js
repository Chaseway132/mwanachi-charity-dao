const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== UPDATING PROPOSAL MANAGEMENT TO USE SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Updating with account:", deployer.address);
  
  // Connect to existing contracts
  console.log("\nConnecting to existing contracts...");
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  
  // Check current fund allocation contract
  const currentFundAllocation = await proposalManagement.fundAllocationContract();
  console.log("\nCurrent FundAllocation in ProposalManagement:", currentFundAllocation);
  console.log("SecureFundAllocation address:", addresses.SECURE_FUND_ALLOCATION);
  
  // If they're already the same, we're done
  if (currentFundAllocation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase()) {
    console.log("\n✅ ProposalManagement is already using the SecureFundAllocation contract!");
    return;
  }
  
  // Check if we're the owner of the ProposalManagement contract
  const owner = await proposalManagement.owner();
  console.log("\nProposalManagement owner:", owner);
  console.log("Our address:", deployer.address);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.log("\n⚠️ We are not the owner of the ProposalManagement contract!");
    console.log("Cannot update the FundAllocation reference.");
    console.log("Please use the account that owns the contract.");
    return;
  }
  
  // Update the FundAllocation reference
  console.log("\nUpdating FundAllocation reference in ProposalManagement...");
  try {
    const tx = await proposalManagement.setFundAllocationContract(addresses.SECURE_FUND_ALLOCATION);
    await tx.wait();
    console.log("FundAllocation reference updated successfully!");
    
    // Verify the update
    const updatedFundAllocation = await proposalManagement.fundAllocationContract();
    console.log("\nVerifying update...");
    console.log("Updated FundAllocation in ProposalManagement:", updatedFundAllocation);
    console.log("Is using SecureFundAllocation:", updatedFundAllocation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
    
    if (updatedFundAllocation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase()) {
      console.log("\n✅ ProposalManagement successfully updated to use SecureFundAllocation!");
    } else {
      console.log("\n❌ Update failed! ProposalManagement is not using SecureFundAllocation.");
    }
  } catch (error) {
    console.error("\n❌ Error updating FundAllocation reference:", error.message);
    console.log("This may be due to permission issues or contract restrictions.");
  }
  
  console.log("\n=== UPDATE COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
