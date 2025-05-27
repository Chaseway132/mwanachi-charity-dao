const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Updating CharityDAOPlatform contract...");
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  
  // Get CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  
  // Check current fund allocation contract
  const currentFundContract = await platformContract.fundAllocationContract();
  console.log("\nCurrent FundAllocation in CharityDAOPlatform:", currentFundContract);
  
  // Update fund allocation contract
  console.log("\nUpdating FundAllocation in CharityDAOPlatform...");
  await platformContract.setFundAllocationContract(addresses.FUND_ALLOCATION);
  console.log("Update transaction sent");
  
  // Verify the update
  const updatedFundContract = await platformContract.fundAllocationContract();
  console.log("\nUpdated FundAllocation in CharityDAOPlatform:", updatedFundContract);
  console.log("Update successful:", updatedFundContract.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nUpdate failed!");
    console.error(error);
    process.exit(1);
  });
