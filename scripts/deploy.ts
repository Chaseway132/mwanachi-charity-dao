import { ethers } from "hardhat";

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", await deployer.getAddress());

  // Deploy ProposalManagement contract
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.deploy();
  await proposalManagement.waitForDeployment();
  const proposalManagementAddress = await proposalManagement.getAddress();
  console.log("ProposalManagement deployed to:", proposalManagementAddress);

  // Deploy FundAllocation contract with ProposalManagement address
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = await FundAllocation.deploy(proposalManagementAddress);
  await fundAllocation.waitForDeployment();
  const fundAllocationAddress = await fundAllocation.getAddress();
  console.log("FundAllocation deployed to:", fundAllocationAddress);

  // Deploy DonationTracking contract with FundAllocation address
  const DonationTracking = await ethers.getContractFactory("DonationTracking");
  const donationTracking = await DonationTracking.deploy(fundAllocationAddress);
  await donationTracking.waitForDeployment();
  const donationTrackingAddress = await donationTracking.getAddress();
  console.log("DonationTracking deployed to:", donationTrackingAddress);

  // Deploy VotingGovernance contract with dependencies
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = await VotingGovernance.deploy(
    proposalManagementAddress,
    donationTrackingAddress,
    await deployer.getAddress()
  );
  await votingGovernance.waitForDeployment();
  const votingGovernanceAddress = await votingGovernance.getAddress();
  console.log("VotingGovernance deployed to:", votingGovernanceAddress);

  // Deploy main CharityDAOPlatform contract with all dependencies
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

  // Transfer ownership of FundAllocation to CharityDAOPlatform
  console.log("Transferring FundAllocation ownership to CharityDAOPlatform...");
  const fundAllocationWithSigner = await ethers.getContractAt("FundAllocation", fundAllocationAddress, deployer);
  await fundAllocationWithSigner.transferOwnership(charityDAOPlatformAddress);
  console.log("FundAllocation ownership transferred successfully");

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("ProposalManagement:", proposalManagementAddress);
  console.log("DonationTracking:", donationTrackingAddress);
  console.log("VotingGovernance:", votingGovernanceAddress);
  console.log("FundAllocation:", fundAllocationAddress);
  console.log("CharityDAOPlatform:", charityDAOPlatformAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 