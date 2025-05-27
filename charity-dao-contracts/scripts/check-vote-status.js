const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Checking vote status...");

    // Get deployed addresses
    const addresses = require('../../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get the VotingGovernance contract
    const votingGovernance = await ethers.getContractAt("VotingGovernance", addresses.VOTING_GOVERNANCE);
    
    // Get the DonationTracking contract
    const donationTracking = await ethers.getContractAt("DonationTracking", addresses.DONATION_TRACKING);
    
    // Address to check
    const voterAddress = "0xBcdB9B05cD47EE978347E8C91133845B121e0699";
    console.log("\nChecking vote status for address:", voterAddress);
    
    // Check if address is a stakeholder
    const isStakeholder = await donationTracking.isStakeholder(voterAddress);
    console.log("Is stakeholder:", isStakeholder);
    
    // Get all proposals
    const proposals = await proposalManagement.getAllProposals();
    console.log(`\nFound ${proposals.length} proposals`);
    
    // Check if address has voted on each proposal
    for (let i = 0; i < proposals.length; i++) {
      const proposalId = proposals[i].id;
      const hasVoted = await proposalManagement.hasVoted(proposalId, voterAddress);
      console.log(`Proposal ${proposalId}: Has voted = ${hasVoted}`);
      
      // Also check using VotingGovernance contract
      try {
        const hasVotedGov = await votingGovernance.hasUserVoted(proposalId, voterAddress);
        console.log(`Proposal ${proposalId}: Has voted (VotingGovernance) = ${hasVotedGov}`);
      } catch (error) {
        console.log(`Error checking VotingGovernance for proposal ${proposalId}:`, error.message);
      }
    }
    
    // Check contract connections
    console.log("\nContract connections:");
    const proposalContract = await votingGovernance.proposalContract();
    const donationContract = await votingGovernance.donationContract();
    console.log("VotingGovernance -> ProposalManagement:", proposalContract);
    console.log("VotingGovernance -> DonationTracking:", donationContract);
    
    // Check if contracts are properly set in ProposalManagement
    const votingGovContract = await proposalManagement.votingGovernanceContract();
    const donationTrackingContract = await proposalManagement.donationTrackingContract();
    console.log("\nProposalManagement -> VotingGovernance:", votingGovContract);
    console.log("ProposalManagement -> DonationTracking:", donationTrackingContract);
    
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