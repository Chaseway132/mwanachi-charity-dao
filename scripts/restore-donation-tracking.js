const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Restoring old DonationTracking contract in configuration...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get current deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get the backup of old addresses (if it exists)
  const backupPath = path.join(__dirname, "../deployedAddresses.backup.json");
  let oldAddresses;
  
  if (fs.existsSync(backupPath)) {
    console.log("Found backup of old addresses, loading from:", backupPath);
    oldAddresses = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  } else {
    console.log("No backup found, creating one now");
    // Create a backup of current addresses
    fs.writeFileSync(backupPath, JSON.stringify(addresses, null, 2));
    console.log("Backup created at:", backupPath);
    
    // We don't have old addresses, so we can't proceed
    console.log("Cannot restore old DonationTracking contract without knowing its address");
    console.log("Please provide the old DonationTracking contract address");
    return;
  }
  
  // Store the old DonationTracking address
  const oldDonationTrackingAddress = oldAddresses.DONATION_TRACKING;
  console.log("\nOld DonationTracking address:", oldDonationTrackingAddress);
  console.log("Current DonationTracking address:", addresses.DONATION_TRACKING);
  
  // Update the configuration to use the old DonationTracking address
  addresses.DONATION_TRACKING = oldDonationTrackingAddress;
  
  // Save the updated addresses
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\nUpdated addresses saved to:", addressesPath);
  
  // Update the frontend config
  const frontendAddressesPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  
  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${addresses.FUND_ALLOCATION}",
  DONATION_TRACKING: "${oldDonationTrackingAddress}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${addresses.CHARITY_DAO_PLATFORM}"
} as const;`;
  
  fs.writeFileSync(frontendAddressesPath, tsContent);
  console.log("Updated addresses saved to frontend config:", frontendAddressesPath);
  
  // Update the CharityDAOPlatform contract to use the old DonationTracking contract
  console.log("\nChecking if CharityDAOPlatform needs to be updated...");
  
  // Get the CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  
  // Check if the contract has a method to update the DonationTracking contract
  if (typeof platformContract.updateDonationTrackingContract === 'function') {
    console.log("CharityDAOPlatform has updateDonationTrackingContract method, updating...");
    await platformContract.updateDonationTrackingContract(oldDonationTrackingAddress);
    console.log("CharityDAOPlatform updated to use old DonationTracking contract");
  } else {
    console.log("CharityDAOPlatform does not have updateDonationTrackingContract method");
    console.log("You may need to redeploy the CharityDAOPlatform contract with the old DonationTracking address");
    
    // We need to redeploy the CharityDAOPlatform contract
    console.log("\nRedeploying CharityDAOPlatform with old DonationTracking address...");
    const newPlatformContract = await CharityDAOPlatform.deploy(
      addresses.PROPOSAL_MANAGEMENT,
      oldDonationTrackingAddress,
      addresses.VOTING_GOVERNANCE,
      addresses.FUND_ALLOCATION
    );
    await newPlatformContract.waitForDeployment();
    const newPlatformAddress = await newPlatformContract.getAddress();
    console.log("New CharityDAOPlatform deployed to:", newPlatformAddress);
    
    // Update the FundAllocation contract to use the new CharityDAOPlatform
    console.log("\nUpdating FundAllocation to use new CharityDAOPlatform...");
    const FundAllocation = await ethers.getContractFactory("FundAllocation");
    const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
    
    // Check who owns the FundAllocation contract
    const fundOwner = await fundAllocation.owner();
    console.log("FundAllocation owner:", fundOwner);
    
    if (fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase()) {
      console.log("FundAllocation is owned by the old CharityDAOPlatform");
      console.log("Need to deploy a new FundAllocation contract...");
      
      // Deploy a new FundAllocation contract
      console.log("\nDeploying new FundAllocation contract...");
      const newFundAllocation = await FundAllocation.deploy(addresses.PROPOSAL_MANAGEMENT);
      await newFundAllocation.waitForDeployment();
      const newFundAllocationAddress = await newFundAllocation.getAddress();
      console.log("New FundAllocation deployed to:", newFundAllocationAddress);
      
      // Set platform contract and transfer ownership
      console.log("\nSetting platform contract in new FundAllocation...");
      await newFundAllocation.setPlatformContract(newPlatformAddress);
      console.log("Platform contract set in new FundAllocation");
      
      console.log("\nTransferring ownership of new FundAllocation to CharityDAOPlatform...");
      await newFundAllocation.transferOwnership(newPlatformAddress);
      console.log("Ownership transferred to CharityDAOPlatform");
      
      // Fund the new FundAllocation contract
      console.log("\nFunding the new FundAllocation contract...");
      const amountToSend = ethers.parseEther("1.0");
      const tx = await deployer.sendTransaction({
        to: newFundAllocationAddress,
        value: amountToSend
      });
      await tx.wait();
      console.log(`Sent ${ethers.formatEther(amountToSend)} ETH to the new FundAllocation contract`);
      
      // Update the addresses
      addresses.FUND_ALLOCATION = newFundAllocationAddress;
    } else {
      console.log("FundAllocation is not owned by the old CharityDAOPlatform");
      console.log("Attempting to update platform contract...");
      
      try {
        await fundAllocation.setPlatformContract(newPlatformAddress);
        console.log("Platform contract updated in FundAllocation");
      } catch (error) {
        console.error("Error updating platform contract:", error);
        console.log("You may need to deploy a new FundAllocation contract");
        return;
      }
    }
    
    // Update the addresses
    addresses.CHARITY_DAO_PLATFORM = newPlatformAddress;
    
    // Save the updated addresses
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("\nUpdated addresses saved to:", addressesPath);
    
    // Update the frontend config again
    const updatedTsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${addresses.FUND_ALLOCATION}",
  DONATION_TRACKING: "${oldDonationTrackingAddress}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${newPlatformAddress}"
} as const;`;
    
    fs.writeFileSync(frontendAddressesPath, updatedTsContent);
    console.log("Updated addresses saved to frontend config with new CharityDAOPlatform address");
  }
  
  console.log("\nRestoration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nRestoration failed!");
    console.error(error);
    process.exit(1);
  });
