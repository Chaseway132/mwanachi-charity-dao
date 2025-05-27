const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Redeploying CharityDAOPlatform contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nCurrent Contract Addresses:");
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("DonationTracking:", addresses.DONATION_TRACKING);
  console.log("VotingGovernance:", addresses.VOTING_GOVERNANCE);
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  
  // Deploy new CharityDAOPlatform contract
  console.log("\nDeploying new CharityDAOPlatform contract...");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = await CharityDAOPlatform.deploy(
    addresses.PROPOSAL_MANAGEMENT,
    addresses.DONATION_TRACKING,
    addresses.VOTING_GOVERNANCE,
    addresses.FUND_ALLOCATION
  );
  await charityDAOPlatform.waitForDeployment();
  const charityDAOPlatformAddress = await charityDAOPlatform.getAddress();
  console.log(`New CharityDAOPlatform deployed to: ${charityDAOPlatformAddress}`);
  
  // Update FundAllocation to point to the new CharityDAOPlatform
  console.log("\nUpdating FundAllocation to point to the new CharityDAOPlatform...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Set platform contract
  console.log("Setting platform contract in FundAllocation...");
  let tx = await fundAllocation.setPlatformContract(charityDAOPlatformAddress);
  await tx.wait();
  console.log("Platform contract set in FundAllocation");
  
  // Transfer ownership
  console.log("Transferring ownership of FundAllocation to CharityDAOPlatform...");
  tx = await fundAllocation.transferOwnership(charityDAOPlatformAddress);
  await tx.wait();
  console.log("Ownership transferred to CharityDAOPlatform");
  
  // Update addresses
  addresses.CHARITY_DAO_PLATFORM = charityDAOPlatformAddress;
  
  // Save updated addresses to backend
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`\nUpdated addresses saved to: ${addressesPath}`);
  
  // Save updated addresses to frontend
  const frontendPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  
  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${addresses.FUND_ALLOCATION}",
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${charityDAOPlatformAddress}"
} as const;`;
  
  fs.writeFileSync(frontendPath, tsContent);
  console.log(`Updated addresses saved to frontend: ${frontendPath}`);
  
  // Verify configuration
  console.log("\nVerifying configuration...");
  
  // Check FundAllocation
  const platformContract = await fundAllocation.platformContract();
  const fundOwner = await fundAllocation.owner();
  
  console.log("\nFundAllocation Configuration:");
  console.log("platformContract:", platformContract);
  console.log("Expected:", charityDAOPlatformAddress);
  console.log("Matches:", platformContract.toLowerCase() === charityDAOPlatformAddress.toLowerCase());
  
  console.log("owner:", fundOwner);
  console.log("Expected:", charityDAOPlatformAddress);
  console.log("Matches:", fundOwner.toLowerCase() === charityDAOPlatformAddress.toLowerCase());
  
  // Check CharityDAOPlatform
  const fundInPlatform = await charityDAOPlatform.fundAllocationContract();
  
  console.log("\nCharityDAOPlatform Configuration:");
  console.log("fundAllocationContract:", fundInPlatform);
  console.log("Expected:", addresses.FUND_ALLOCATION);
  console.log("Matches:", fundInPlatform.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());
  
  console.log("\nRedeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Redeployment failed:", error);
    process.exit(1);
  });
