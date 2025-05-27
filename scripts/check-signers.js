const { ethers } = require("hardhat");

async function main() {
  console.log("Checking signer and proposal status...");

  try {
    // Get deployed addresses
    const addresses = require('../deployedAddresses.json');
    
    // Get the ProposalManagement contract
    const proposalManagement = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT);
    
    // Get current signers
    const signers = await proposalManagement.getAuthorizedSigners();
    console.log("\nAuthorized signers:", signers);
    
    // Get all proposals
    const proposals = await proposalManagement.getAllProposals();
    console.log("\nProposals:", proposals);
    
    // Check each proposal's vote count
    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];
      console.log(`\nProposal ${proposal.id}:`);
      console.log("- Votes:", proposal.voteCount.toString());
      console.log("- Approved:", proposal.approved);
      console.log("- Executed:", proposal.executed);
      console.log("- Signature count:", proposal.signatureCount.toString());
    }

  } catch (error) {
    console.error("\nScript failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 