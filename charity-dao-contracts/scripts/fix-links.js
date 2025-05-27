const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Fixing contract links...");

  try {
    // Load deployed addresses
    const addressesPath = path.join(__dirname, "../../deployedAddresses.json");
    console.log("Loading addresses from:", addressesPath);
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    // Get contract instances
    const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    
    const votingGovernance = await VotingGovernance.attach(addresses.VOTING_GOVERNANCE);
    const proposalManagement = await ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);

    // Check contract links
    console.log("\nChecking contract links:");
    
    // Check ProposalManagement -> VotingGovernance
    const proposalVotingContract = await proposalManagement.votingGovernanceContract();
    console.log("\nProposalManagement -> VotingGovernance:", proposalVotingContract);
    console.log("Expected:", addresses.VOTING_GOVERNANCE);
    console.log("Match:", proposalVotingContract.toLowerCase() === addresses.VOTING_GOVERNANCE.toLowerCase());

    // Fix links if needed
    if (proposalVotingContract.toLowerCase() !== addresses.VOTING_GOVERNANCE.toLowerCase()) {
      console.log("\nFixing VotingGovernance link in ProposalManagement...");
      const tx = await proposalManagement.setVotingGovernanceContract(addresses.VOTING_GOVERNANCE);
      await tx.wait();
      console.log("Fixed VotingGovernance link");
      
      // Verify fix
      const newProposalVotingContract = await proposalManagement.votingGovernanceContract();
      console.log("\nVerifying fix:");
      console.log("New ProposalManagement -> VotingGovernance:", newProposalVotingContract);
      console.log("Expected:", addresses.VOTING_GOVERNANCE);
      console.log("Match:", newProposalVotingContract.toLowerCase() === addresses.VOTING_GOVERNANCE.toLowerCase());
    }

    console.log("\nFix completed!");

  } catch (error) {
    console.error("\nFix failed!");
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