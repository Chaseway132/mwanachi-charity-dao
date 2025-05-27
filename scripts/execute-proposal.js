const { ethers } = require("hardhat");

async function main() {
  console.log("Executing proposal 12...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);
  
  // Get deployed addresses
  const deployedAddresses = require('../deployedAddresses.json');
  
  // Get contract instances
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = VotingGovernance.attach(deployedAddresses.VOTING_GOVERNANCE);
  
  try {
    // Execute the proposal
    console.log("Attempting to execute proposal 12...");
    const tx = await votingGovernance.executeProposal(12);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Proposal executed successfully!");
    
    // Verify execution
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalManagement = ProposalManagement.attach(deployedAddresses.PROPOSAL_MANAGEMENT);
    const proposal = await proposalManagement.getProposalById(12);
    console.log("\nProposal state after execution:");
    console.log("Executed:", proposal.executed);
    console.log("Description:", proposal.description);
  } catch (error) {
    console.error("Error executing proposal:", error.message);
    // If there's additional error data, log it
    if (error.data) {
      console.error("Additional error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 