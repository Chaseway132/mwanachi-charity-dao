const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Fixing contract connections...");

    // Get deployed addresses
    const addresses = require('../../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get the VotingGovernance contract
    const votingGovernance = await ethers.getContractAt("VotingGovernance", addresses.VOTING_GOVERNANCE);
    
    // Get the DonationTracking contract
    const donationTracking = await ethers.getContractAt("DonationTracking", addresses.DONATION_TRACKING);
    
    // Check current connections
    const currentVotingGov = await proposalManagement.votingGovernanceContract();
    const currentDonationTracking = await proposalManagement.donationTrackingContract();
    
    console.log("\nCurrent connections:");
    console.log("ProposalManagement -> VotingGovernance:", currentVotingGov);
    console.log("ProposalManagement -> DonationTracking:", currentDonationTracking);
    
    // Fix VotingGovernance connection if needed
    if (currentVotingGov === ethers.ZeroAddress) {
      console.log("\nSetting VotingGovernance contract...");
      const tx1 = await proposalManagement.setVotingGovernanceContract(addresses.VOTING_GOVERNANCE);
      await tx1.wait();
      console.log("VotingGovernance contract set successfully");
    } else {
      console.log("\nVotingGovernance contract already set correctly");
    }
    
    // Fix DonationTracking connection if needed
    if (currentDonationTracking === ethers.ZeroAddress) {
      console.log("\nSetting DonationTracking contract...");
      const tx2 = await proposalManagement.setDonationTrackingContract(addresses.DONATION_TRACKING);
      await tx2.wait();
      console.log("DonationTracking contract set successfully");
    } else {
      console.log("\nDonationTracking contract already set correctly");
    }

    // Verify final connections
    const finalVotingGov = await proposalManagement.votingGovernanceContract();
    const finalDonationTracking = await proposalManagement.donationTrackingContract();
    
    console.log("\nFinal connections:");
    console.log("ProposalManagement -> VotingGovernance:", finalVotingGov);
    console.log("ProposalManagement -> DonationTracking:", finalDonationTracking);
    
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 