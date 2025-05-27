const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking key contract configurations...");
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  
  // Check FundAllocation contract
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundContract = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Check contract configurations
  const fundProposalContract = await fundContract.proposalContract();
  const fundPlatformContract = await fundContract.platformContract();
  const fundOwner = await fundContract.owner();
  
  console.log("\nFundAllocation Contract Configuration:");
  console.log("proposalContract:", fundProposalContract);
  console.log("platformContract:", fundPlatformContract);
  console.log("owner:", fundOwner);
  
  // Check if configurations match
  console.log("\nDoes platformContract match CharityDAOPlatform?", 
    fundPlatformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check contract balances
  const fundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("\nFundAllocation balance:", ethers.formatEther(fundBalance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nCheck failed!");
    console.error(error);
    process.exit(1);
  });
