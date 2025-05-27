const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== VERIFYING SECURE CONTRACT SETUP ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Verifying with account:", deployer.address);
  
  // Connect to contracts
  console.log("\nConnecting to contracts...");
  const platform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const donationTracking = await ethers.getContractAt("DonationTracking", addresses.DONATION_TRACKING);
  const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
  
  // Verify contract connections
  console.log("\nVerifying contract connections...");
  
  // Check CharityDAOPlatform -> SecureFundAllocation
  const fundAllocationInPlatform = await platform.fundAllocationContract();
  console.log("FundAllocation in CharityDAOPlatform:", fundAllocationInPlatform);
  console.log("Expected SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  console.log("Is correctly set:", fundAllocationInPlatform.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  // Check SecureFundAllocation -> CharityDAOPlatform
  const platformInFundAllocation = await secureFundAllocation.platformContract();
  console.log("\nPlatform in SecureFundAllocation:", platformInFundAllocation);
  console.log("Expected CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("Is correctly set:", platformInFundAllocation.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check DonationTracking -> FundAllocation
  const fundAllocationInDonation = await donationTracking.fundAllocationContract();
  console.log("\nFundAllocation in DonationTracking:", fundAllocationInDonation);
  console.log("Expected SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  console.log("Is correctly set:", fundAllocationInDonation.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  // Check contract balances
  console.log("\nChecking contract balances...");
  const platformBalance = await ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);
  const fundBalance = await secureFundAllocation.getBalance();
  
  console.log("CharityDAOPlatform balance:", ethers.formatEther(platformBalance), "ETH");
  console.log("SecureFundAllocation balance:", ethers.formatEther(fundBalance), "ETH");
  
  console.log("\n=== VERIFICATION COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
