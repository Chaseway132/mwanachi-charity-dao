const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking FundAllocation contract owner...");
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  console.log("\nFundAllocation address:", addresses.FUND_ALLOCATION);
  
  // Get contract instance
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = await FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Get owner
  const owner = await fundAllocation.owner();
  console.log("\nFundAllocation owner:", owner);
  
  // Get current platform contract
  const platformContract = await fundAllocation.platformContract();
  console.log("\nCurrent platform contract:", platformContract);
  console.log("Expected platform contract:", addresses.CHARITY_DAO_PLATFORM);
  console.log("Match:", platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nError:", error);
    process.exit(1);
  }); 