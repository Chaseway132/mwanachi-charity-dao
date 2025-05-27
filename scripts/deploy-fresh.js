const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting fresh deployment...");

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with account:", deployerAddress);

  try {
    // Deploy ProposalManagement contract
    console.log("\nDeploying ProposalManagement...");
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalManagement = await ProposalManagement.deploy();
    await proposalManagement.waitForDeployment();
    const proposalManagementAddress = await proposalManagement.getAddress();
    console.log("ProposalManagement deployed to:", proposalManagementAddress);

    // Deploy FundAllocation contract with ProposalManagement address
    console.log("\nDeploying FundAllocation...");
    const FundAllocation = await ethers.getContractFactory("FundAllocation");
    const fundAllocation = await FundAllocation.deploy(proposalManagementAddress);
    await fundAllocation.waitForDeployment();
    const fundAllocationAddress = await fundAllocation.getAddress();
    console.log("FundAllocation deployed to:", fundAllocationAddress);

    // Deploy DonationTracking contract
    console.log("\nDeploying DonationTracking...");
    const DonationTracking = await ethers.getContractFactory("DonationTracking");
    const donationTracking = await DonationTracking.deploy();
    await donationTracking.waitForDeployment();
    const donationTrackingAddress = await donationTracking.getAddress();
    console.log("DonationTracking deployed to:", donationTrackingAddress);

    // Deploy VotingGovernance contract with dependencies
    console.log("\nDeploying VotingGovernance...");
    const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
    const votingGovernance = await VotingGovernance.deploy(
      proposalManagementAddress,
      donationTrackingAddress
    );
    await votingGovernance.waitForDeployment();
    const votingGovernanceAddress = await votingGovernance.getAddress();
    console.log("VotingGovernance deployed to:", votingGovernanceAddress);

    // Deploy main CharityDAOPlatform contract with all dependencies
    console.log("\nDeploying CharityDAOPlatform...");
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

    // Set up contract links
    console.log("\nSetting up contract links...");

    // 1. Set VotingGovernance in ProposalManagement
    console.log("Setting VotingGovernance in ProposalManagement...");
    const tx1 = await proposalManagement.setVotingGovernanceContract(votingGovernanceAddress);
    await tx1.wait();

    // 2. Set PlatformContract in FundAllocation
    console.log("Setting PlatformContract in FundAllocation...");
    const tx2 = await fundAllocation.setPlatformContract(charityDAOPlatformAddress);
    await tx2.wait();

    // 3. Transfer FundAllocation ownership to CharityDAOPlatform
    console.log("Transferring FundAllocation ownership...");
    const tx3 = await fundAllocation.transferOwnership(charityDAOPlatformAddress);
    await tx3.wait();

    // Set up signers
    console.log("\nSetting up signers...");

    // Add deployer as a signer
    console.log("Adding deployer as signer:", deployerAddress);
    const tx4 = await proposalManagement.addSigner(deployerAddress);
    await tx4.wait();

    // Save contract addresses
    const addresses = {
      PROPOSAL_MANAGEMENT: proposalManagementAddress,
      FUND_ALLOCATION: fundAllocationAddress,
      DONATION_TRACKING: donationTrackingAddress,
      VOTING_GOVERNANCE: votingGovernanceAddress,
      CHARITY_DAO_PLATFORM: charityDAOPlatformAddress
    };

    // Save to JSON file
    const addressesPath = path.join(__dirname, '../deployedAddresses.json');
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("\nContract addresses saved to:", addressesPath);

    // Save to TypeScript file for frontend
    const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${proposalManagementAddress}",
  FUND_ALLOCATION: "${fundAllocationAddress}",
  DONATION_TRACKING: "${donationTrackingAddress}",
  VOTING_GOVERNANCE: "${votingGovernanceAddress}",
  CHARITY_DAO_PLATFORM: "${charityDAOPlatformAddress}"
} as const;`;

    const tsPath = path.join(__dirname, '../charity-dao-frontend/src/config/deployedAddresses.ts');
    fs.writeFileSync(tsPath, tsContent);
    console.log("Contract addresses saved to:", tsPath);

    // Verify final setup
    console.log("\nVerifying final setup...");

    // Check contract links
    const votingGovInProposal = await proposalManagement.votingGovernanceContract();
    console.log("\n1. Contract Links:");
    console.log("VotingGovernance in ProposalManagement:", votingGovInProposal);
    console.log("Expected:", votingGovernanceAddress);

    // Check FundAllocation configuration
    const platformInFund = await fundAllocation.platformContract();
    const fundOwner = await fundAllocation.owner();
    console.log("\n2. FundAllocation Configuration:");
    console.log("PlatformContract in FundAllocation:", platformInFund);
    console.log("Expected:", charityDAOPlatformAddress);
    console.log("Owner of FundAllocation:", fundOwner);
    console.log("Expected:", charityDAOPlatformAddress);

    // Check CharityDAOPlatform configuration
    const fundInPlatform = await charityDAOPlatform.fundAllocationContract();
    console.log("\n3. CharityDAOPlatform Configuration:");
    console.log("FundAllocation in CharityDAOPlatform:", fundInPlatform);
    console.log("Expected:", fundAllocationAddress);

    // Check signers
    const signers = await proposalManagement.getAuthorizedSigners();
    const signerCount = await proposalManagement.signerCount();
    console.log("\n4. Signers Setup:");
    console.log("Total signers:", signerCount.toString());
    console.log("Authorized signers:", signers);

    // Check minimum votes
    const minVotes = await votingGovernance.getMinVotesForApproval();
    console.log("\n5. Voting Setup:");
    console.log("Minimum votes required:", minVotes.toString());

    console.log("\nDeployment completed successfully!");

  } catch (error) {
    console.error("\nDeployment failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nTop-level error:");
    console.error(error);
    process.exit(1);
  });