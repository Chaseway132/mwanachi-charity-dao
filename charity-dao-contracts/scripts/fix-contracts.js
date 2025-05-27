const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Starting contract fixes...");

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Fixing with account:", deployerAddress);

  try {
    // Load deployed addresses
    const addressesPath = path.join(__dirname, '../../deployedAddresses.json');
    console.log("Loading addresses from:", addressesPath);
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    console.log("Loaded addresses:", addresses);
    
    // Get contract instances
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
    const DonationTracking = await ethers.getContractFactory("DonationTracking");
    
    const proposalManagement = await ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
    const votingGovernance = await VotingGovernance.attach(addresses.VOTING_GOVERNANCE);
    const donationTracking = await DonationTracking.attach(addresses.DONATION_TRACKING);

    // Fix contract links
    console.log("\nFixing contract links...");
    
    // Set VotingGovernance in ProposalManagement
    console.log("Setting VotingGovernance in ProposalManagement...");
    const tx1 = await proposalManagement.setVotingGovernanceContract(addresses.VOTING_GOVERNANCE);
    await tx1.wait();
    console.log("VotingGovernance set in ProposalManagement");

    // Verify the link was set
    const proposalVotingGov = await proposalManagement.votingGovernanceContract();
    console.log("Verified ProposalManagement -> VotingGovernance:", proposalVotingGov);

    // Check if deployer is owner
    const owner = await proposalManagement.owner();
    console.log("\nChecking ownership...");
    console.log("Contract owner:", owner);
    console.log("Deployer address:", deployerAddress);
    
    if (owner.toLowerCase() !== deployerAddress.toLowerCase()) {
      console.error("Warning: Deployer is not the contract owner!");
    }

    // Reset signers
    console.log("\nResetting signers...");
    const currentSigners = await proposalManagement.getAuthorizedSigners();
    console.log("Current signers:", currentSigners);

    // Remove any zero addresses if present
    for (const signer of currentSigners) {
      if (signer === '0x0000000000000000000000000000000000000000') {
        try {
          console.log("Removing zero address signer...");
          const tx = await proposalManagement.removeSigner(signer);
          await tx.wait();
          console.log("Zero address signer removed");
        } catch (error) {
          console.log("Could not remove zero address:", error.message);
        }
      }
    }

    // Add deployer as signer if not already
    const isSigner = await proposalManagement.isAuthorizedSigner(deployerAddress);
    if (!isSigner) {
      console.log("\nAdding deployer as signer...");
      const tx2 = await proposalManagement.addSigner(deployerAddress);
      await tx2.wait();
      console.log("Deployer added as signer");
    } else {
      console.log("Deployer is already a signer");
    }

    // Add a second signer (using the first account)
    const signerAddress = "0xEA4204E9f8B8484Cde8d4075de8F4FE67aD25456"; // Your MetaMask address
    const isSecondSigner = await proposalManagement.isAuthorizedSigner(signerAddress);
    if (!isSecondSigner) {
      console.log("\nAdding second signer...");
      const tx3 = await proposalManagement.addSigner(signerAddress);
      await tx3.wait();
      console.log("Second signer added");
    } else {
      console.log("Second signer is already authorized");
    }

    // Get final state
    const signerCount = await proposalManagement.signerCount();
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log("\nFinal state:");
    console.log("Total signers:", signerCount.toString());
    console.log("Authorized signers:", signers);

    // Verify contract setup
    console.log("\nVerifying contract setup...");
    console.log("1. Checking VotingGovernance links...");
    const votingProposalContract = await votingGovernance.proposalContract();
    const votingDonationContract = await votingGovernance.donationContract();
    console.log("VotingGovernance -> ProposalManagement:", votingProposalContract);
    console.log("VotingGovernance -> DonationTracking:", votingDonationContract);

    console.log("\n2. Checking minimum votes requirement...");
    const minVotes = await votingGovernance.getMinVotesForApproval();
    console.log("Minimum votes required:", minVotes.toString());

    console.log("\nContract fixes completed successfully!");

  } catch (error) {
    console.error("\nFixes failed!");
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