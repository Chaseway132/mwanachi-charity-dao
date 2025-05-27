const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== UPDATING DONATION TRACKING TO USE SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Connect to existing contracts
  console.log("\nConnecting to existing contracts...");
  const donationTracking = await ethers.getContractAt("DonationTracking", addresses.DONATION_TRACKING);
  
  // Check current fund allocation contract
  const currentFundAllocation = await donationTracking.fundAllocationContract();
  console.log("\nCurrent FundAllocation in DonationTracking:", currentFundAllocation);
  console.log("SecureFundAllocation address:", addresses.SECURE_FUND_ALLOCATION);
  
  // If they're already the same, we're done
  if (currentFundAllocation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase()) {
    console.log("\n✅ DonationTracking is already using the SecureFundAllocation contract!");
    return;
  }
  
  // Deploy a new DonationTracking contract with the SecureFundAllocation address
  console.log("\nDeploying new DonationTracking contract...");
  const DonationTracking = await ethers.getContractFactory("DonationTracking");
  const newDonationTracking = await DonationTracking.deploy(addresses.SECURE_FUND_ALLOCATION);
  await newDonationTracking.waitForDeployment();
  const newDonationTrackingAddress = await newDonationTracking.getAddress();
  console.log("New DonationTracking deployed to:", newDonationTrackingAddress);
  
  // Verify the new contract is using the secure fund allocation
  const newFundAllocation = await newDonationTracking.fundAllocationContract();
  console.log("\nVerifying new DonationTracking setup...");
  console.log("FundAllocation in new DonationTracking:", newFundAllocation);
  console.log("Is using SecureFundAllocation:", newFundAllocation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  // Update configuration files
  console.log("\nUpdating configuration files...");
  
  // Update deployedAddresses.json
  const oldDonationTrackingAddress = addresses.DONATION_TRACKING;
  addresses.DONATION_TRACKING = newDonationTrackingAddress;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("deployedAddresses.json updated");
  
  // Update frontend files
  const frontendTsPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  const frontendJsonPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.json");
  
  if (fs.existsSync(frontendTsPath)) {
    let tsContent = fs.readFileSync(frontendTsPath, 'utf8');
    tsContent = tsContent.replace(
      `DONATION_TRACKING: "${oldDonationTrackingAddress}"`,
      `DONATION_TRACKING: "${newDonationTrackingAddress}"`
    );
    fs.writeFileSync(frontendTsPath, tsContent);
    console.log("Frontend TypeScript file updated");
  } else {
    console.log("Frontend TypeScript file not found at:", frontendTsPath);
  }
  
  if (fs.existsSync(frontendJsonPath)) {
    const frontendAddresses = JSON.parse(fs.readFileSync(frontendJsonPath, 'utf8'));
    frontendAddresses.DONATION_TRACKING = newDonationTrackingAddress;
    fs.writeFileSync(frontendJsonPath, JSON.stringify(frontendAddresses, null, 2));
    console.log("Frontend JSON file updated");
  } else {
    console.log("Frontend JSON file not found at:", frontendJsonPath);
  }
  
  // Update the CharityDAOPlatform to use the new DonationTracking contract
  console.log("\nDeploying updated CharityDAOPlatform with new DonationTracking...");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const updatedPlatform = await CharityDAOPlatform.deploy(
    addresses.PROPOSAL_MANAGEMENT,
    newDonationTrackingAddress,
    addresses.VOTING_GOVERNANCE,
    addresses.SECURE_FUND_ALLOCATION
  );
  await updatedPlatform.waitForDeployment();
  const updatedPlatformAddress = await updatedPlatform.getAddress();
  console.log("Updated CharityDAOPlatform deployed to:", updatedPlatformAddress);
  
  // Update SecureFundAllocation to point to the updated platform
  console.log("\nUpdating SecureFundAllocation to point to the updated platform...");
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  await secureFundAllocation.setPlatformContract(updatedPlatformAddress);
  console.log("Platform contract updated in SecureFundAllocation");
  
  // Update configuration files with the updated platform address
  const oldPlatformAddress = addresses.CHARITY_DAO_PLATFORM;
  addresses.CHARITY_DAO_PLATFORM = updatedPlatformAddress;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("deployedAddresses.json updated with new platform address");
  
  if (fs.existsSync(frontendTsPath)) {
    let tsContent = fs.readFileSync(frontendTsPath, 'utf8');
    tsContent = tsContent.replace(
      `CHARITY_DAO_PLATFORM: "${oldPlatformAddress}"`,
      `CHARITY_DAO_PLATFORM: "${updatedPlatformAddress}"`
    );
    fs.writeFileSync(frontendTsPath, tsContent);
    console.log("Frontend TypeScript file updated with new platform address");
  }
  
  if (fs.existsSync(frontendJsonPath)) {
    const frontendAddresses = JSON.parse(fs.readFileSync(frontendJsonPath, 'utf8'));
    frontendAddresses.CHARITY_DAO_PLATFORM = updatedPlatformAddress;
    fs.writeFileSync(frontendJsonPath, JSON.stringify(frontendAddresses, null, 2));
    console.log("Frontend JSON file updated with new platform address");
  }
  
  console.log("\n=== UPDATE COMPLETED ===\n");
  console.log("Old DonationTracking:", oldDonationTrackingAddress);
  console.log("New DonationTracking:", newDonationTrackingAddress);
  console.log("Old CharityDAOPlatform:", oldPlatformAddress);
  console.log("Updated CharityDAOPlatform:", updatedPlatformAddress);
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
