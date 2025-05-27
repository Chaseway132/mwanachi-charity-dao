const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking contract ownership...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  
  // Check CharityDAOPlatform ownership
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  const platformOwner = await platformContract.owner();
  
  console.log("\nCharityDAOPlatform owner:", platformOwner);
  console.log("Is deployer the owner?", platformOwner.toLowerCase() === deployer.address.toLowerCase());
  
  // Check FundAllocation ownership
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundContract = FundAllocation.attach(addresses.FUND_ALLOCATION);
  const fundOwner = await fundContract.owner();
  
  console.log("\nFundAllocation owner:", fundOwner);
  console.log("Is deployer the owner?", fundOwner.toLowerCase() === deployer.address.toLowerCase());
  console.log("Is CharityDAOPlatform the owner?", fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check ProposalManagement ownership
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalContract = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  const proposalOwner = await proposalContract.owner();
  
  console.log("\nProposalManagement owner:", proposalOwner);
  console.log("Is deployer the owner?", proposalOwner.toLowerCase() === deployer.address.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nCheck failed!");
    console.error(error);
    process.exit(1);
  });
