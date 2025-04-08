const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ProposalManagement first (no constructor args)
  // This is now using the fixed ProposalManagement contract with consistent 1-based indexing
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.deploy();
  await proposalManagement.waitForDeployment();
  const proposalManagementAddress = await proposalManagement.getAddress();
  console.log("ProposalManagement deployed to:", proposalManagementAddress);

  // Deploy the FundAllocation contract with the ProposalManagement address
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = await FundAllocation.deploy(proposalManagementAddress);
  await fundAllocation.waitForDeployment();
  const fundAllocationAddress = await fundAllocation.getAddress();
  console.log("FundAllocation deployed to:", fundAllocationAddress);

  // IMPORTANT: Configure the ProposalManagement contract to recognize FundAllocation
  const setFundAllocationTx = await proposalManagement.setFundAllocationContract(fundAllocationAddress);
  await setFundAllocationTx.wait();
  console.log(`Set FundAllocation (${fundAllocationAddress}) as authorized in ProposalManagement`);

  // Deploy DonationTracking (requires FundAllocation address)
  const DonationTracking = await ethers.getContractFactory("DonationTracking");
  const donationTracking = await DonationTracking.deploy(fundAllocationAddress);
  await donationTracking.waitForDeployment();
  const donationTrackingAddress = await donationTracking.getAddress();
  console.log("DonationTracking deployed to:", donationTrackingAddress);

  // Deploy VotingGovernance (requires ProposalManagement, DonationTracking, and owner address)
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = await VotingGovernance.deploy(
    proposalManagementAddress,
    donationTrackingAddress,
    deployer.address
  );
  await votingGovernance.waitForDeployment();
  const votingGovernanceAddress = await votingGovernance.getAddress();
  console.log("VotingGovernance deployed to:", votingGovernanceAddress);

  // Deploy CharityDAOPlatform (requires all contract addresses)
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = await CharityDAOPlatform.deploy(
    proposalManagementAddress,
    donationTrackingAddress,
    votingGovernanceAddress,
    fundAllocationAddress
  );
  await charityDAOPlatform.waitForDeployment();
  const charityDAOPlatformAddress = await charityDAOPlatform.getAddress();
  console.log("CharityDAOPlatform deployed to:", charityDAOPlatformAddress);

  // Set up platform contract in FundAllocation
  console.log("Setting up platform contract authorization...");
  const setPlatformTx = await fundAllocation.setPlatformContract(charityDAOPlatformAddress);
  await setPlatformTx.wait();
  console.log("Platform contract authorization complete");

  // Log all contract addresses
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("ProposalManagement:", proposalManagementAddress);
  console.log("DonationTracking:", donationTrackingAddress);
  console.log("FundAllocation:", fundAllocationAddress);
  console.log("VotingGovernance:", votingGovernanceAddress);
  console.log("CharityDAOPlatform:", charityDAOPlatformAddress);

  // Automatically update frontend contract addresses
  try {
    console.log("\nUpdating frontend contract addresses...");
    const contractsPath = path.join(__dirname, "../charity-dao-frontend/src/config/contracts.ts");
    
    if (fs.existsSync(contractsPath)) {
      let content = fs.readFileSync(contractsPath, 'utf8');
      
      // Update all addresses in the frontend config
      content = content.replace(
        /export const PROPOSAL_MANAGEMENT = "0x[a-fA-F0-9]+";/,
        `export const PROPOSAL_MANAGEMENT = "${proposalManagementAddress}";`
      );
      
      content = content.replace(
        /export const DONATION_TRACKING = "0x[a-fA-F0-9]+";/,
        `export const DONATION_TRACKING = "${donationTrackingAddress}";`
      );
      
      content = content.replace(
        /export const VOTING_GOVERNANCE = "0x[a-fA-F0-9]+";/,
        `export const VOTING_GOVERNANCE = "${votingGovernanceAddress}";`
      );
      
      content = content.replace(
        /export const FUND_ALLOCATION = "0x[a-fA-F0-9]+";/,
        `export const FUND_ALLOCATION = "${fundAllocationAddress}";`
      );
      
      content = content.replace(
        /export const CHARITY_DAO_PLATFORM = "0x[a-fA-F0-9]+";/,
        `export const CHARITY_DAO_PLATFORM = "${charityDAOPlatformAddress}";`
      );
      
      fs.writeFileSync(contractsPath, content);
      console.log("Frontend contract addresses updated successfully!");
    } else {
      console.log("Frontend contracts.ts file not found at:", contractsPath);
    }
  } catch (error) {
    console.error("Error updating frontend contract addresses:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 