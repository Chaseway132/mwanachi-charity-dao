const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Fixing platform contract configuration...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);

  try {
    // Get deployed addresses from deployedAddresses.json
    const addressesPath = path.join(__dirname, "../../deployedAddresses.json");
    console.log("\nLoading addresses from:", addressesPath);
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    console.log("\nLoaded addresses:", addresses);

    // Get contract instances
    const FundAllocation = await ethers.getContractFactory("FundAllocation");
    const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
    
    const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
    const platform = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);

    // Check current owner
    const currentOwner = await fundAllocation.owner();
    console.log("\nCurrent FundAllocation owner:", currentOwner);
    console.log("Expected owner (CharityDAOPlatform):", addresses.CHARITY_DAO_PLATFORM);
    console.log("Owner matches platform:", currentOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

    // Check current platform contract
    const currentPlatform = await fundAllocation.platformContract();
    console.log("\nCurrent platform contract:", currentPlatform);
    console.log("Expected platform contract:", addresses.CHARITY_DAO_PLATFORM);
    console.log("Platform contract matches:", currentPlatform.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

    // Set platform contract if needed
    if (currentPlatform.toLowerCase() !== addresses.CHARITY_DAO_PLATFORM.toLowerCase()) {
      console.log("\nSetting platform contract through CharityDAOPlatform...");
      const setPlatformTx = await platform.setFundAllocationPlatform();
      await setPlatformTx.wait();
      console.log("Platform contract set successfully");

      // Verify the changes
      const updatedPlatform = await fundAllocation.platformContract();
      console.log("\nVerifying changes:");
      console.log("Updated platform contract:", updatedPlatform);
      console.log("Platform contract correctly set:", updatedPlatform.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
    }

    console.log("\nConfiguration fix completed!");

  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nError:", error);
    process.exit(1);
  }); 