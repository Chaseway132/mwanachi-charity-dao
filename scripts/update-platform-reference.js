const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Updating platform contract reference in FundAllocation...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get the FundAllocation contract
  console.log("\nConnecting to FundAllocation contract at:", addresses.FUND_ALLOCATION);
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);

  // Check current platform contract
  const currentPlatform = await fundAllocation.platformContract();
  console.log("Current platform contract:", currentPlatform);
  
  // Check if the platform contract is already set correctly
  if (currentPlatform.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase()) {
    console.log("Platform contract is already set correctly!");
  } else {
    // Set the platform contract
    console.log("\nSetting platform contract to:", addresses.CHARITY_DAO_PLATFORM);
    const tx = await fundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
    await tx.wait();
    console.log("Platform contract updated successfully!");
    
    // Verify the update
    const newPlatform = await fundAllocation.platformContract();
    console.log("New platform contract:", newPlatform);
  }

  // Check current owner
  const currentOwner = await fundAllocation.owner();
  console.log("\nCurrent FundAllocation owner:", currentOwner);
  
  // Check if we're the owner
  const deployerAddress = await deployer.getAddress();
  const isOwner = currentOwner.toLowerCase() === deployerAddress.toLowerCase();
  console.log("Are we the owner?", isOwner);
  
  if (isOwner) {
    // If we're the owner, transfer ownership to the platform contract
    console.log("\nTransferring ownership to CharityDAOPlatform...");
    await fundAllocation.transferOwnership(addresses.CHARITY_DAO_PLATFORM);
    console.log("Ownership transferred to CharityDAOPlatform");
    
    // Verify the ownership transfer
    const newOwner = await fundAllocation.owner();
    console.log("New FundAllocation owner:", newOwner);
  } else if (currentOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase()) {
    console.log("CharityDAOPlatform is already the owner of FundAllocation!");
  } else {
    console.log("\nWe are not the owner of the FundAllocation contract.");
    console.log("Cannot transfer ownership. Please use the account that owns the contract.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
