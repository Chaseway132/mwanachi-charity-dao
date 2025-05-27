const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking CharityDAOPlatform configuration...");
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  
  // Get CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  
  // Check contract configurations
  const platformProposalContract = await platformContract.proposalContract();
  const platformFundContract = await platformContract.fundAllocationContract();
  
  console.log("\nCharityDAOPlatform Contract Configuration:");
  console.log("proposalContract:", platformProposalContract);
  console.log("fundAllocationContract:", platformFundContract);
  
  // Check if configurations match
  console.log("\nDoes proposalContract match?", 
    platformProposalContract.toLowerCase() === addresses.PROPOSAL_MANAGEMENT.toLowerCase());
  console.log("Does fundAllocationContract match?", 
    platformFundContract.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());
  
  // Check proposal #7
  console.log("\nChecking proposal #7...");
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalContract = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  const proposal7 = await proposalContract.getProposalById(7);
  
  console.log("\nProposal #7 Details:");
  console.log("id:", proposal7.id.toString());
  console.log("approved:", proposal7.approved);
  console.log("executed:", proposal7.executed);
  console.log("amount:", ethers.formatEther(proposal7.amount || proposal7.amountRequested), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nCheck failed!");
    console.error(error);
    process.exit(1);
  });
