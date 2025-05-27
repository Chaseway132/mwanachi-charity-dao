const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== DEPLOYING SECURE FUND ALLOCATION CONTRACT ===\n");

  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get contract instances
  console.log("\nConnecting to deployed contracts...");
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  const charityDAOPlatform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  const oldFundAllocation = await ethers.getContractAt("FundAllocation", addresses.FUND_ALLOCATION);

  // Check initial balances
  const initialFundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("\nOld FundAllocation balance:", ethers.formatEther(initialFundBalance), "ETH");

  // Deploy the secure FundAllocation contract
  console.log("\nDeploying SecureFundAllocation contract...");
  const SecureFundAllocation = await ethers.getContractFactory("SecureFundAllocation");
  const secureFundAllocation = await SecureFundAllocation.deploy(addresses.PROPOSAL_MANAGEMENT);
  // Wait for the transaction to be mined
  await secureFundAllocation.waitForDeployment();
  const secureFundAllocationAddress = await secureFundAllocation.getAddress();
  console.log("SecureFundAllocation deployed to:", secureFundAllocationAddress);

  // Set the platform contract
  console.log("\nSetting platform contract in SecureFundAllocation...");
  await secureFundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
  console.log("Platform contract set in SecureFundAllocation");

  // Transfer funds from old contract to new contract
  if (initialFundBalance > 0) {
    console.log("\nTransferring funds from old contract to new contract...");

    // We need to use the owner of the old contract to withdraw funds
    const oldOwner = await oldFundAllocation.owner();
    console.log("Old contract owner:", oldOwner);

    if (oldOwner.toLowerCase() === deployer.address.toLowerCase()) {
      // Create a simple contract to withdraw funds
      console.log("Creating and deploying a withdrawal helper contract...");
      const WithdrawalHelper = await ethers.getContractFactory("WithdrawalHelper");
      const withdrawalHelper = await WithdrawalHelper.deploy();
      await withdrawalHelper.waitForDeployment();
      const withdrawalHelperAddress = await withdrawalHelper.getAddress();
      console.log("WithdrawalHelper deployed to:", withdrawalHelperAddress);

      // Transfer ownership of old contract to the withdrawal helper
      console.log("Transferring ownership of old contract to withdrawal helper...");
      await oldFundAllocation.transferOwnership(withdrawalHelperAddress);
      console.log("Ownership transferred");

      // Withdraw funds from old contract to new contract
      console.log("Withdrawing funds from old contract to new contract...");
      await withdrawalHelper.withdrawFunds(
        oldFundAllocation.address,
        secureFundAllocationAddress
      );
      console.log("Funds withdrawn");

      // Transfer ownership back to deployer
      console.log("Transferring ownership back to deployer...");
      await withdrawalHelper.transferOwnershipBack(
        oldFundAllocation.address,
        deployer.address
      );
      console.log("Ownership transferred back");
    } else {
      console.log("Deployer is not the owner of the old contract. Manual fund transfer required.");
      console.log("Please transfer funds manually from the old contract to the new contract.");
    }
  } else {
    console.log("\nNo funds to transfer from old contract.");
  }

  // Update the CharityDAOPlatform to use the new FundAllocation contract
  console.log("\nUpdating CharityDAOPlatform to use the new FundAllocation contract...");
  // This would require the CharityDAOPlatform to have a function to update the FundAllocation address
  // If such a function doesn't exist, you would need to deploy a new CharityDAOPlatform contract

  // For now, we'll just print instructions
  console.log("\nIMPORTANT: You need to update the CharityDAOPlatform contract to use the new FundAllocation contract.");
  console.log("If the CharityDAOPlatform contract doesn't have a function to update the FundAllocation address,");
  console.log("you will need to deploy a new CharityDAOPlatform contract.");

  // Check final balances
  const newFundBalance = await ethers.provider.getBalance(secureFundAllocationAddress);
  console.log("\nNew SecureFundAllocation balance:", ethers.formatEther(newFundBalance), "ETH");

  // Update the deployedAddresses.json file
  console.log("\nUpdating deployedAddresses.json file...");

  // Store the old address for reference
  const oldFundAllocationAddress = addresses.FUND_ALLOCATION;
  addresses.SECURE_FUND_ALLOCATION = secureFundAllocationAddress;

  // Update the main JSON file
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("deployedAddresses.json file updated");

  // Update the frontend TypeScript file
  const frontendTsPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");
  console.log("Updating frontend TypeScript file:", frontendTsPath);

  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${secureFundAllocationAddress}", // Updated to secure implementation
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${addresses.CHARITY_DAO_PLATFORM}",
  SECURE_FUND_ALLOCATION: "${secureFundAllocationAddress}",
  OLD_FUND_ALLOCATION: "${oldFundAllocationAddress}" // Keep reference to old contract
} as const;`;

  // Create the directory if it doesn't exist
  const frontendTsDir = path.dirname(frontendTsPath);
  if (!fs.existsSync(frontendTsDir)) {
    fs.mkdirSync(frontendTsDir, { recursive: true });
  }

  fs.writeFileSync(frontendTsPath, tsContent);
  console.log("Frontend TypeScript file updated");

  // Update the frontend JSON file
  const frontendJsonPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.json");
  console.log("Updating frontend JSON file:", frontendJsonPath);

  // Create JSON content
  const jsonContent = {
    PROPOSAL_MANAGEMENT: addresses.PROPOSAL_MANAGEMENT,
    FUND_ALLOCATION: secureFundAllocationAddress, // Updated to secure implementation
    DONATION_TRACKING: addresses.DONATION_TRACKING,
    VOTING_GOVERNANCE: addresses.VOTING_GOVERNANCE,
    CHARITY_DAO_PLATFORM: addresses.CHARITY_DAO_PLATFORM,
    SECURE_FUND_ALLOCATION: secureFundAllocationAddress,
    OLD_FUND_ALLOCATION: oldFundAllocationAddress // Keep reference to old contract
  };

  // Create the directory if it doesn't exist
  const frontendJsonDir = path.dirname(frontendJsonPath);
  if (!fs.existsSync(frontendJsonDir)) {
    fs.mkdirSync(frontendJsonDir, { recursive: true });
  }

  fs.writeFileSync(frontendJsonPath, JSON.stringify(jsonContent, null, 2));
  console.log("Frontend JSON file updated");

  // Copy the ABI file for the SecureFundAllocation contract
  console.log("\nCopying SecureFundAllocation ABI to frontend...");
  const artifactsDir = path.join(__dirname, "../artifacts/contracts/SecureFundAllocation.sol");
  const abiSourcePath = path.join(artifactsDir, "SecureFundAllocation.json");
  const abiDestPath = path.join(__dirname, "../charity-dao-frontend/src/config/SecureFundAllocation.json");

  if (fs.existsSync(abiSourcePath)) {
    // Create the directory if it doesn't exist
    const abiDestDir = path.dirname(abiDestPath);
    if (!fs.existsSync(abiDestDir)) {
      fs.mkdirSync(abiDestDir, { recursive: true });
    }

    fs.copyFileSync(abiSourcePath, abiDestPath);
    console.log("SecureFundAllocation ABI copied to frontend");
  } else {
    console.log("SecureFundAllocation ABI not found at:", abiSourcePath);
  }

  console.log("\n=== DEPLOYMENT COMPLETED ===\n");
  console.log("SecureFundAllocation deployed to:", secureFundAllocationAddress);
  console.log("Old FundAllocation address:", oldFundAllocationAddress);
  console.log("\nNext steps:");
  console.log("1. Update the CharityDAOPlatform contract to use the new SecureFundAllocation contract");
  console.log("2. Update your frontend to use the new SecureFundAllocation contract");
  console.log("3. Test the new contract to ensure it works correctly");
  console.log("\nImportant files updated:");
  console.log("1. deployedAddresses.json - Main addresses file");
  console.log("2. charity-dao-frontend/src/config/deployedAddresses.ts - Frontend TypeScript addresses");
  console.log("3. charity-dao-frontend/src/config/deployedAddresses.json - Frontend JSON addresses");
  console.log("4. charity-dao-frontend/src/config/SecureFundAllocation.json - Frontend ABI file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
