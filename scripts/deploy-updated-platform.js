const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Deploying updated CharityDAOPlatform contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Deploy updated CharityDAOPlatform contract with new FundAllocation address
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

  // Check who owns the FundAllocation contract
  console.log("\nChecking FundAllocation ownership...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
  const currentOwner = await fundAllocation.owner();
  console.log("Current FundAllocation owner:", currentOwner);

  // Check if we're the owner
  const deployerAddress = await deployer.getAddress();
  const isOwner = currentOwner.toLowerCase() === deployerAddress.toLowerCase();
  console.log("Are we the owner?", isOwner);

  if (isOwner) {
    // If we're the owner, set the platform contract and transfer ownership
    console.log("\nSetting platform contract in FundAllocation...");
    await fundAllocation.setPlatformContract(charityDAOPlatformAddress);
    console.log("Platform contract set in FundAllocation");

    console.log("\nTransferring ownership of FundAllocation to CharityDAOPlatform...");
    await fundAllocation.transferOwnership(charityDAOPlatformAddress);
    console.log("Ownership transferred to CharityDAOPlatform");
  } else {
    console.log("\nWe are not the owner of the FundAllocation contract.");
    console.log("Need to deploy a new FundAllocation contract...");

    // Deploy a new FundAllocation contract
    console.log("\nDeploying new FundAllocation contract...");
    const newFundAllocation = await FundAllocation.deploy(addresses.PROPOSAL_MANAGEMENT);
    await newFundAllocation.waitForDeployment();
    const newFundAllocationAddress = await newFundAllocation.getAddress();
    console.log("New FundAllocation deployed to:", newFundAllocationAddress);

    // Set platform contract and transfer ownership
    console.log("\nSetting platform contract in new FundAllocation...");
    await newFundAllocation.setPlatformContract(charityDAOPlatformAddress);
    console.log("Platform contract set in new FundAllocation");

    console.log("\nTransferring ownership of new FundAllocation to CharityDAOPlatform...");
    await newFundAllocation.transferOwnership(charityDAOPlatformAddress);
    console.log("Ownership transferred to CharityDAOPlatform");

    // Update the address in the deployedAddresses.json file
    addresses.FUND_ALLOCATION = newFundAllocationAddress;
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("\nUpdated addresses saved to:", addressesPath);

    // Update the frontend config again with the new FundAllocation address
    const updatedTsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${newFundAllocationAddress}",
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${charityDAOPlatformAddress}"
} as const;`;

    fs.writeFileSync(frontendAddressesPath, updatedTsContent);
    console.log("Updated addresses saved to frontend config with new FundAllocation address");

    // Fund the new FundAllocation contract
    console.log("\nFunding the new FundAllocation contract...");
    const amountToSend = ethers.parseEther("1.0");
    const tx = await deployer.sendTransaction({
      to: newFundAllocationAddress,
      value: amountToSend
    });
    await tx.wait();
    console.log(`Sent ${ethers.formatEther(amountToSend)} ETH to the new FundAllocation contract`);
  }

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Updated CharityDAOPlatform:", charityDAOPlatformAddress);
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nDeployment failed!");
    console.error(error);
    process.exit(1);
  });
