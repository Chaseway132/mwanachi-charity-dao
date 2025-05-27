const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking contract configurations...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  console.log("VotingGovernance:", addresses.VOTING_GOVERNANCE);
  console.log("DonationTracking:", addresses.DONATION_TRACKING);
  
  // Get contract instances
  console.log("\nChecking CharityDAOPlatform contract...");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  
  // Check contract configurations
  const platformProposalContract = await platformContract.proposalContract();
  const platformFundContract = await platformContract.fundAllocationContract();
  const platformVotingContract = await platformContract.votingContract();
  const platformDonationContract = await platformContract.donationContract();
  
  console.log("\nCharityDAOPlatform Contract Configuration:");
  console.log("----------------------------------------");
  console.log("proposalContract:", platformProposalContract);
  console.log("fundAllocationContract:", platformFundContract);
  console.log("votingContract:", platformVotingContract);
  console.log("donationContract:", platformDonationContract);
  
  console.log("\nChecking if configurations match:");
  console.log("--------------------------------");
  console.log("proposalContract matches:", platformProposalContract.toLowerCase() === addresses.PROPOSAL_MANAGEMENT.toLowerCase());
  console.log("fundAllocationContract matches:", platformFundContract.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());
  console.log("votingContract matches:", platformVotingContract.toLowerCase() === addresses.VOTING_GOVERNANCE.toLowerCase());
  console.log("donationContract matches:", platformDonationContract.toLowerCase() === addresses.DONATION_TRACKING.toLowerCase());
  
  // Check FundAllocation contract
  console.log("\nChecking FundAllocation contract...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundContract = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Check contract configurations
  const fundProposalContract = await fundContract.proposalContract();
  const fundPlatformContract = await fundContract.platformContract();
  const fundOwner = await fundContract.owner();
  
  console.log("\nFundAllocation Contract Configuration:");
  console.log("------------------------------------");
  console.log("proposalContract:", fundProposalContract);
  console.log("platformContract:", fundPlatformContract);
  console.log("owner:", fundOwner);
  
  console.log("\nChecking if configurations match:");
  console.log("--------------------------------");
  console.log("proposalContract matches:", fundProposalContract.toLowerCase() === addresses.PROPOSAL_MANAGEMENT.toLowerCase());
  console.log("platformContract matches:", fundPlatformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  console.log("owner matches CharityDAOPlatform:", fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check ProposalManagement contract
  console.log("\nChecking ProposalManagement contract...");
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalContract = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  
  // Check contract configurations
  const proposalOwner = await proposalContract.owner();
  
  console.log("\nProposalManagement Contract Configuration:");
  console.log("-----------------------------------------");
  console.log("owner:", proposalOwner);
  
  // Check proposal #7
  console.log("\nChecking proposal #7...");
  const proposal7 = await proposalContract.getProposalById(7);
  
  console.log("\nProposal #7 Details:");
  console.log("-------------------");
  console.log("id:", proposal7.id.toString());
  console.log("creator:", proposal7.creator);
  console.log("recipient:", proposal7.recipient);
  console.log("amount:", ethers.formatEther(proposal7.amount || proposal7.amountRequested), "ETH");
  console.log("approved:", proposal7.approved);
  console.log("executed:", proposal7.executed);
  console.log("executionTime:", proposal7.executionTime.toString());
  
  // Check contract balances
  console.log("\nChecking contract balances...");
  const fundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  
  console.log("\nContract Balances:");
  console.log("-----------------");
  console.log("FundAllocation balance:", ethers.formatEther(fundBalance), "ETH");
  
  console.log("\nChecking complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nCheck failed!");
    console.error(error);
    process.exit(1);
  });
