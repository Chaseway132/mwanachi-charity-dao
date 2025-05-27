const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting voting test...");

  try {
    // Load deployed addresses
    const addressesPath = path.join(__dirname, '../../deployedAddresses.json');
    console.log("Loading addresses from:", addressesPath);
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    // Get contract instances
    const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const DonationTracking = await ethers.getContractFactory("DonationTracking");
    
    const votingGovernance = await VotingGovernance.attach(addresses.VOTING_GOVERNANCE);
    const proposalManagement = await ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
    const donationTracking = await DonationTracking.attach(addresses.DONATION_TRACKING);

    // Get the test accounts
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const testAddress = "0xEA4204E9f8B8484Cde8d4075de8F4FE67aD25456"; // Your MetaMask address

    console.log("\nTest setup:");
    console.log("Deployer address:", deployerAddress);
    console.log("Test address:", testAddress);

    // Check contract links
    console.log("\nChecking contract links:");
    const votingProposalContract = await votingGovernance.proposalContract();
    const votingDonationContract = await votingGovernance.donationContract();
    console.log("VotingGovernance -> ProposalManagement:", votingProposalContract);
    console.log("VotingGovernance -> DonationTracking:", votingDonationContract);

    // Check if addresses are stakeholders
    console.log("\nChecking stakeholder status:");
    const isDeployerStakeholder = await donationTracking.isStakeholder(deployerAddress);
    const isTestAddressStakeholder = await donationTracking.isStakeholder(testAddress);
    console.log("Deployer is stakeholder:", isDeployerStakeholder);
    console.log("Test address is stakeholder:", isTestAddressStakeholder);

    // Check if addresses are signers
    console.log("\nChecking signer status:");
    const isDeployerSigner = await proposalManagement.isAuthorizedSigner(deployerAddress);
    const isTestAddressSigner = await proposalManagement.isAuthorizedSigner(testAddress);
    console.log("Deployer is signer:", isDeployerSigner);
    console.log("Test address is signer:", isTestAddressSigner);

    // Get all authorized signers
    console.log("\nAuthorized signers:");
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log(signers);

    // Get minimum votes required
    const minVotes = await votingGovernance.getMinVotesForApproval();
    console.log("\nMinimum votes required:", minVotes.toString());

    // Try to vote on a proposal
    console.log("\nTrying to vote on proposal 1...");
    try {
      const tx = await votingGovernance.voteOnProposal(1);
      await tx.wait();
      console.log("Vote successful!");
    } catch (error) {
      console.log("Vote failed:", error.message);
    }

    console.log("\nTest completed!");

  } catch (error) {
    console.error("\nTest failed!");
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