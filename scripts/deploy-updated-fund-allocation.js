// scripts/deploy-updated-fund-allocation.js
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Deploying updated FundAllocation contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Deploy updated FundAllocation contract with existing ProposalManagement address
  console.log("\nDeploying updated FundAllocation...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = await FundAllocation.deploy(addresses.PROPOSAL_MANAGEMENT);
  await fundAllocation.waitForDeployment();
  const fundAllocationAddress = await fundAllocation.getAddress();
  console.log("Updated FundAllocation deployed to:", fundAllocationAddress);
  
  // Set platform contract to CharityDAOPlatform
  console.log("\nSetting platform contract...");
  await fundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
  console.log("Platform contract set to:", addresses.CHARITY_DAO_PLATFORM);
  
  // Transfer ownership to CharityDAOPlatform
  console.log("\nTransferring ownership to CharityDAOPlatform...");
  await fundAllocation.transferOwnership(addresses.CHARITY_DAO_PLATFORM);
  console.log("Ownership transferred to:", addresses.CHARITY_DAO_PLATFORM);
  
  // Update the address in the deployedAddresses.json file
  addresses.FUND_ALLOCATION = fundAllocationAddress;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\nUpdated addresses saved to:", addressesPath);
  
  // Update the address in the frontend config
  const frontendAddressesPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  
  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${fundAllocationAddress}",
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${addresses.CHARITY_DAO_PLATFORM}"
} as const;`;
  
  fs.writeFileSync(frontendAddressesPath, tsContent);
  console.log("Updated addresses saved to frontend config:", frontendAddressesPath);
  
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Updated FundAllocation:", fundAllocationAddress);
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nDeployment failed!");
    console.error(error);
    process.exit(1);
  });