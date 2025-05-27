const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying all contracts from scratch...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Step 1: Deploy ProposalManagement contract
  console.log("\nDeploying ProposalManagement contract...");
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.deploy();
  await proposalManagement.waitForDeployment();
  const proposalManagementAddress = await proposalManagement.getAddress();
  console.log(`ProposalManagement deployed to: ${proposalManagementAddress}`);

  // Step 2: Deploy FundAllocation contract
  console.log("\nDeploying FundAllocation contract...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = await FundAllocation.deploy(proposalManagementAddress);
  await fundAllocation.waitForDeployment();
  const fundAllocationAddress = await fundAllocation.getAddress();
  console.log(`FundAllocation deployed to: ${fundAllocationAddress}`);

  // Step 3: Deploy DonationTracking contract
  console.log("\nDeploying DonationTracking contract...");
  const DonationTracking = await ethers.getContractFactory("DonationTracking");
  const donationTracking = await DonationTracking.deploy(fundAllocationAddress);
  await donationTracking.waitForDeployment();
  const donationTrackingAddress = await donationTracking.getAddress();
  console.log(`DonationTracking deployed to: ${donationTrackingAddress}`);

  // Step 4: Deploy VotingGovernance contract
  console.log("\nDeploying VotingGovernance contract...");
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = await VotingGovernance.deploy(
    proposalManagementAddress,
    donationTrackingAddress,
    deployer.address
  );
  await votingGovernance.waitForDeployment();
  const votingGovernanceAddress = await votingGovernance.getAddress();
  console.log(`VotingGovernance deployed to: ${votingGovernanceAddress}`);

  // Step 5: Deploy CharityDAOPlatform contract
  console.log("\nDeploying CharityDAOPlatform contract...");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = await CharityDAOPlatform.deploy(
    proposalManagementAddress,
    donationTrackingAddress,
    votingGovernanceAddress,
    fundAllocationAddress
  );
  await charityDAOPlatform.waitForDeployment();
  const charityDAOPlatformAddress = await charityDAOPlatform.getAddress();
  console.log(`CharityDAOPlatform deployed to: ${charityDAOPlatformAddress}`);

  // Step 6: Configure contracts to reference each other
  console.log("\nConfiguring contract references...");

  // Set VotingGovernance contract in ProposalManagement
  console.log("Setting VotingGovernance in ProposalManagement...");
  let tx = await proposalManagement.setVotingGovernanceContract(votingGovernanceAddress);
  await tx.wait();
  console.log("VotingGovernance set in ProposalManagement");

  // Set PlatformContract in FundAllocation
  console.log("Setting PlatformContract in FundAllocation...");
  tx = await fundAllocation.setPlatformContract(charityDAOPlatformAddress);
  await tx.wait();
  console.log("PlatformContract set in FundAllocation");

  // Transfer ownership of FundAllocation to CharityDAOPlatform
  console.log("Transferring ownership of FundAllocation to CharityDAOPlatform...");
  tx = await fundAllocation.transferOwnership(charityDAOPlatformAddress);
  await tx.wait();
  console.log("Ownership of FundAllocation transferred to CharityDAOPlatform");

  // Check if deployer is already a signer
  console.log("Checking if deployer is already a signer...");
  const isSignerAlready = await proposalManagement.isAuthorizedSigner(deployer.address);

  if (!isSignerAlready) {
    console.log("Adding deployer as signer...");
    tx = await proposalManagement.addSigner(deployer.address);
    await tx.wait();
    console.log("Deployer added as signer");
  } else {
    console.log("Deployer is already a signer");
  }

  // Step 7: Save deployed addresses
  const deployedAddresses = {
    PROPOSAL_MANAGEMENT: proposalManagementAddress,
    FUND_ALLOCATION: fundAllocationAddress,
    DONATION_TRACKING: donationTrackingAddress,
    VOTING_GOVERNANCE: votingGovernanceAddress,
    CHARITY_DAO_PLATFORM: charityDAOPlatformAddress
  };

  // Save to backend
  const backendPath = path.join(__dirname, "../deployedAddresses.json");
  fs.writeFileSync(backendPath, JSON.stringify(deployedAddresses, null, 2));
  console.log(`\nDeployed addresses saved to: ${backendPath}`);

  // Save to frontend
  const frontendPath = path.join(__dirname, "../charity-dao-frontend/src/config/deployedAddresses.ts");

  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${proposalManagementAddress}",
  FUND_ALLOCATION: "${fundAllocationAddress}",
  DONATION_TRACKING: "${donationTrackingAddress}",
  VOTING_GOVERNANCE: "${votingGovernanceAddress}",
  CHARITY_DAO_PLATFORM: "${charityDAOPlatformAddress}"
} as const;`;

  fs.writeFileSync(frontendPath, tsContent);
  console.log(`Deployed addresses saved to frontend: ${frontendPath}`);

  // Step 8: Verify contract configurations
  console.log("\nVerifying contract configurations...");

  // Verify ProposalManagement
  const votingContract = await proposalManagement.votingGovernanceContract();
  console.log(`ProposalManagement.votingGovernanceContract: ${votingContract}`);
  console.log(`Matches VotingGovernance address: ${votingContract.toLowerCase() === votingGovernanceAddress.toLowerCase()}`);

  // Verify FundAllocation
  const platformContract = await fundAllocation.platformContract();
  const fundOwner = await fundAllocation.owner();
  console.log(`FundAllocation.platformContract: ${platformContract}`);
  console.log(`Matches CharityDAOPlatform address: ${platformContract.toLowerCase() === charityDAOPlatformAddress.toLowerCase()}`);
  console.log(`FundAllocation.owner: ${fundOwner}`);
  console.log(`Matches CharityDAOPlatform address: ${fundOwner.toLowerCase() === charityDAOPlatformAddress.toLowerCase()}`);

  // Verify CharityDAOPlatform
  const platformProposalContract = await charityDAOPlatform.proposalContract();
  const platformFundContract = await charityDAOPlatform.fundAllocationContract();
  const platformVotingContract = await charityDAOPlatform.votingContract();
  const platformDonationContract = await charityDAOPlatform.donationContract();

  console.log(`CharityDAOPlatform.proposalContract: ${platformProposalContract}`);
  console.log(`Matches ProposalManagement address: ${platformProposalContract.toLowerCase() === proposalManagementAddress.toLowerCase()}`);

  console.log(`CharityDAOPlatform.fundAllocationContract: ${platformFundContract}`);
  console.log(`Matches FundAllocation address: ${platformFundContract.toLowerCase() === fundAllocationAddress.toLowerCase()}`);

  console.log(`CharityDAOPlatform.votingContract: ${platformVotingContract}`);
  console.log(`Matches VotingGovernance address: ${platformVotingContract.toLowerCase() === votingGovernanceAddress.toLowerCase()}`);

  console.log(`CharityDAOPlatform.donationContract: ${platformDonationContract}`);
  console.log(`Matches DonationTracking address: ${platformDonationContract.toLowerCase() === donationTrackingAddress.toLowerCase()}`);

  console.log("\nDeployment and configuration completed successfully!");

  // Return the deployed addresses for testing
  return deployedAddresses;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
