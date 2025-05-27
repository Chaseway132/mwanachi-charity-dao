const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== UPDATING CHARITYDAOPLATFORM TO USE SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Connect to existing contracts
  console.log("\nConnecting to existing contracts...");
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const oldPlatform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  
  // Verify the current setup
  console.log("\nVerifying current setup...");
  const currentFundAllocation = await oldPlatform.fundAllocationContract();
  console.log("Current FundAllocation in CharityDAOPlatform:", currentFundAllocation);
  console.log("SecureFundAllocation address:", addresses.SECURE_FUND_ALLOCATION);
  
  // Deploy new CharityDAOPlatform with SecureFundAllocation
  console.log("\nDeploying new CharityDAOPlatform...");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const newPlatform = await CharityDAOPlatform.deploy(
    addresses.PROPOSAL_MANAGEMENT,
    addresses.DONATION_TRACKING,
    addresses.VOTING_GOVERNANCE,
    addresses.SECURE_FUND_ALLOCATION
  );
  await newPlatform.waitForDeployment();
  const newPlatformAddress = await newPlatform.getAddress();
  console.log("New CharityDAOPlatform deployed to:", newPlatformAddress);
  
  // Verify the new platform is using the secure fund allocation
  const newFundAllocation = await newPlatform.fundAllocationContract();
  console.log("\nVerifying new platform setup...");
  console.log("FundAllocation in new CharityDAOPlatform:", newFundAllocation);
  console.log("Is using SecureFundAllocation:", newFundAllocation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  // Update SecureFundAllocation to point to the new platform
  console.log("\nUpdating SecureFundAllocation to point to the new platform...");
  const platformTx = await secureFundAllocation.setPlatformContract(newPlatformAddress);
  await platformTx.wait();
  console.log("Platform contract updated in SecureFundAllocation");
  
  // Verify the update
  const platformInFundAllocation = await secureFundAllocation.platformContract();
  console.log("Platform in SecureFundAllocation:", platformInFundAllocation);
  console.log("Is correctly set:", platformInFundAllocation.toLowerCase() === newPlatformAddress.toLowerCase());
  
  // Set up the new platform by calling setFundAllocationPlatform
  console.log("\nSetting up the new platform...");
  try {
    const setupTx = await newPlatform.setFundAllocationPlatform();
    await setupTx.wait();
    console.log("Platform setup completed successfully");
  } catch (error) {
    console.error("Error setting up platform:", error.message);
    console.log("This may be because the platform is already set correctly");
  }
  
  // Update configuration files
  console.log("\nUpdating configuration files...");
  
  // Update deployedAddresses.json
  const oldPlatformAddress = addresses.CHARITY_DAO_PLATFORM;
  addresses.CHARITY_DAO_PLATFORM = newPlatformAddress;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("deployedAddresses.json updated");
  
  // Update frontend files
  const frontendTsPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  const frontendJsonPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.json");
  
  if (fs.existsSync(frontendTsPath)) {
    let tsContent = fs.readFileSync(frontendTsPath, 'utf8');
    tsContent = tsContent.replace(
      `CHARITY_DAO_PLATFORM: "${oldPlatformAddress}"`,
      `CHARITY_DAO_PLATFORM: "${newPlatformAddress}"`
    );
    fs.writeFileSync(frontendTsPath, tsContent);
    console.log("Frontend TypeScript file updated");
  } else {
    console.log("Frontend TypeScript file not found at:", frontendTsPath);
  }
  
  if (fs.existsSync(frontendJsonPath)) {
    const frontendAddresses = JSON.parse(fs.readFileSync(frontendJsonPath, 'utf8'));
    frontendAddresses.CHARITY_DAO_PLATFORM = newPlatformAddress;
    fs.writeFileSync(frontendJsonPath, JSON.stringify(frontendAddresses, null, 2));
    console.log("Frontend JSON file updated");
  } else {
    console.log("Frontend JSON file not found at:", frontendJsonPath);
  }
  
  // Transfer any funds from old platform to new platform if needed
  const oldPlatformBalance = await ethers.provider.getBalance(oldPlatformAddress);
  if (oldPlatformBalance > 0) {
    console.log("\nOld platform has a balance of:", ethers.formatEther(oldPlatformBalance), "ETH");
    console.log("You may want to transfer these funds to the new platform manually");
  }
  
  console.log("\n=== UPDATE COMPLETED ===\n");
  console.log("Old CharityDAOPlatform:", oldPlatformAddress);
  console.log("New CharityDAOPlatform:", newPlatformAddress);
  console.log("SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  
  console.log("\nNext steps:");
  console.log("1. Restart your frontend application to use the new contract addresses");
  console.log("2. Test the donation flow to ensure funds are properly transferred");
  console.log("3. Verify that the fund balance updates correctly in the UI");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
