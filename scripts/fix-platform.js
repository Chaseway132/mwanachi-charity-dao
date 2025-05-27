const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Fixing CharityDAOPlatform contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nCurrent Contract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  console.log("VotingGovernance:", addresses.VOTING_GOVERNANCE);
  console.log("DonationTracking:", addresses.DONATION_TRACKING);
  
  // Deploy updated CharityDAOPlatform contract with correct FundAllocation address
  console.log("\nDeploying updated CharityDAOPlatform...");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = await CharityDAOPlatform.deploy(
    addresses.PROPOSAL_MANAGEMENT,
    addresses.DONATION_TRACKING,
    addresses.VOTING_GOVERNANCE,
    addresses.FUND_ALLOCATION
  );
  await charityDAOPlatform.waitForDeployment();
  const charityDAOPlatformAddress = await charityDAOPlatform.getAddress();
  console.log("Updated CharityDAOPlatform deployed to:", charityDAOPlatformAddress);
  
  // Update the address in the deployedAddresses.json file
  addresses.CHARITY_DAO_PLATFORM = charityDAOPlatformAddress;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\nUpdated addresses saved to:", addressesPath);
  
  // Update the address in the frontend config
  const frontendAddressesPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  
  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${addresses.FUND_ALLOCATION}",
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${charityDAOPlatformAddress}"
} as const;`;
  
  fs.writeFileSync(frontendAddressesPath, tsContent);
  console.log("Updated addresses saved to frontend config:", frontendAddressesPath);
  
  // Update the FundAllocation contract to point to the new CharityDAOPlatform
  console.log("\nUpdating FundAllocation to point to new CharityDAOPlatform...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Check current platform contract
  const currentPlatform = await fundAllocation.platformContract();
  console.log("Current platform contract in FundAllocation:", currentPlatform);
  
  // Update platform contract
  await fundAllocation.setPlatformContract(charityDAOPlatformAddress);
  console.log("Platform contract updated in FundAllocation");
  
  // Verify the update
  const updatedPlatform = await fundAllocation.platformContract();
  console.log("Updated platform contract in FundAllocation:", updatedPlatform);
  console.log("Update successful:", updatedPlatform.toLowerCase() === charityDAOPlatformAddress.toLowerCase());
  
  // Transfer ownership of FundAllocation to CharityDAOPlatform
  console.log("\nTransferring ownership of FundAllocation to CharityDAOPlatform...");
  await fundAllocation.transferOwnership(charityDAOPlatformAddress);
  console.log("Ownership transferred to CharityDAOPlatform");
  
  // Verify the ownership transfer
  const newOwner = await fundAllocation.owner();
  console.log("New owner of FundAllocation:", newOwner);
  console.log("Ownership transfer successful:", newOwner.toLowerCase() === charityDAOPlatformAddress.toLowerCase());
  
  console.log("\nFix completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nFix failed!");
    console.error(error);
    process.exit(1);
  });
