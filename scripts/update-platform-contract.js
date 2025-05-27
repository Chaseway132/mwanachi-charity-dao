// scripts/update-platform-contract.js
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Updating CharityDAOPlatform to use new FundAllocation contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("CharityDAOPlatform address:", addresses.CHARITY_DAO_PLATFORM);
  console.log("New FundAllocation address:", addresses.FUND_ALLOCATION);
  
  // Get the CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  
  // Check current FundAllocation address
  try {
    const currentFundAllocation = await platformContract.fundAllocationContract();
    console.log("Current FundAllocation in platform:", currentFundAllocation);
    
    // If it's already set correctly, we're done
    if (currentFundAllocation.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase()) {
      console.log("CharityDAOPlatform is already using the new FundAllocation contract.");
      return;
    }
    
    // Otherwise, we need to update it
    console.log("Updating CharityDAOPlatform to use new FundAllocation contract...");
    
    // Check if there's an updateFundAllocationContract function
    if (typeof platformContract.updateFundAllocationContract === 'function') {
      const tx = await platformContract.updateFundAllocationContract(addresses.FUND_ALLOCATION);
      await tx.wait();
      console.log("CharityDAOPlatform updated successfully!");
      
      // Verify the update
      const updatedFundAllocation = await platformContract.fundAllocationContract();
      console.log("Updated FundAllocation in platform:", updatedFundAllocation);
      console.log("Update successful:", updatedFundAllocation.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());
    } else {
      console.log("CharityDAOPlatform does not have an updateFundAllocationContract function.");
      console.log("You may need to redeploy the CharityDAOPlatform contract with the new FundAllocation address.");
    }
  } catch (error) {
    console.error("Error updating CharityDAOPlatform:", error);
    console.log("You may need to redeploy the CharityDAOPlatform contract with the new FundAllocation address.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Update failed!");
    console.error(error);
    process.exit(1);
  });