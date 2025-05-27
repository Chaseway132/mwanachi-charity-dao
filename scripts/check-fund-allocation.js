const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking FundAllocation contract configuration...");
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  
  // Get FundAllocation contract
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundContract = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Check contract configurations
  const platformContract = await fundContract.platformContract();
  const owner = await fundContract.owner();
  
  console.log("\nFundAllocation Contract Configuration:");
  console.log("platformContract:", platformContract);
  console.log("owner:", owner);
  
  // Check if the platform contract is correctly set
  console.log("\nIs platformContract set to CharityDAOPlatform?", 
    platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check if the owner is the deployer
  const [deployer] = await ethers.getSigners();
  console.log("Is owner the deployer?", owner.toLowerCase() === deployer.address.toLowerCase());
  
  // Update the platform contract if needed
  if (platformContract.toLowerCase() !== addresses.CHARITY_DAO_PLATFORM.toLowerCase()) {
    console.log("\nUpdating platformContract to CharityDAOPlatform...");
    const tx = await fundContract.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
    await tx.wait();
    
    // Verify the update
    const updatedPlatformContract = await fundContract.platformContract();
    console.log("Updated platformContract:", updatedPlatformContract);
    console.log("Update successful:", 
      updatedPlatformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nCheck failed!");
    console.error(error);
    process.exit(1);
  });
