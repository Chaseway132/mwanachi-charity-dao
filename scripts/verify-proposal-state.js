const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying proposal state and configuration...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);
  
  // Get contract instances
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  
  // Get deployed addresses from deployedAddresses.json
  const deployedAddresses = require('../deployedAddresses.json');
  
  const proposalManagement = ProposalManagement.attach(deployedAddresses.PROPOSAL_MANAGEMENT);
  const votingGovernance = VotingGovernance.attach(deployedAddresses.VOTING_GOVERNANCE);
  
  // Check proposal management configuration
  console.log("\n--- ProposalManagement Configuration ---");
  const owner = await proposalManagement.owner();
  console.log("Owner:", owner);
  console.log("Is deployer the owner:", owner.toLowerCase() === deployer.address.toLowerCase());
  
  // Get all proposals
  console.log("\n--- Proposals Status ---");
  const proposals = await proposalManagement.getAllProposals();
  console.log("Total proposals:", proposals.length);
  
  // Check each proposal's state
  for (let i = 0; i < proposals.length; i++) {
    const proposal = proposals[i];
    console.log(`\nProposal ${i + 1}:`);
    console.log("Description:", proposal.description);
    console.log("Vote count:", proposal.voteCount.toString());
    console.log("Signature count:", proposal.signatureCount.toString());
    console.log("Approved:", proposal.approved);
    console.log("Executed:", proposal.executed);
    
    if (proposal.executionTime) {
      const now = Math.floor(Date.now() / 1000);
      const executionTime = Number(proposal.executionTime);
      console.log("Execution time:", new Date(executionTime * 1000).toLocaleString());
      console.log("Time until execution:", executionTime - now, "seconds");
      
      // Check if proposal can be executed
      const canExecute = await proposalManagement.canBeExecuted(i + 1);
      console.log("Can be executed:", canExecute);
      
      if (!canExecute) {
        const remainingDelay = await proposalManagement.getRemainingExecutionDelay(i + 1);
        console.log("Remaining execution delay:", remainingDelay.toString(), "seconds");
      }
    }
  }
  
  // Check voting governance configuration
  console.log("\n--- VotingGovernance Configuration ---");
  const votingOwner = await votingGovernance.owner();
  console.log("Owner:", votingOwner);
  console.log("Is deployer the owner:", votingOwner.toLowerCase() === deployer.address.toLowerCase());
  
  const minVotes = await votingGovernance.getMinVotesForApproval();
  console.log("Minimum votes required:", minVotes.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 