const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("\nTesting proposal signing flow...");

    // Get contract addresses
    const addresses = require('../../deployedAddresses.json');
    const proposalManagementAddress = addresses.PROPOSAL_MANAGEMENT;
    const votingGovernanceAddress = addresses.VOTING_GOVERNANCE;

    // Get contracts
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
    
    const proposalContract = ProposalManagement.attach(proposalManagementAddress);
    const votingContract = VotingGovernance.attach(votingGovernanceAddress);

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("\nUsing account:", deployer.address);

    // Create a test proposal
    const description = "Test Proposal for Signing";
    const amount = ethers.parseEther("0.1");
    const recipient = deployer.address;

    console.log("\nCreating test proposal...");
    const createTx = await proposalContract.createProposal(description, amount, recipient);
    await createTx.wait();
    
    // Get the proposal ID (should be the latest one)
    const proposalCount = await proposalContract.proposalCount();
    const proposalId = proposalCount;
    console.log("Created proposal ID:", proposalId);

    // Get proposal details
    const proposal = await proposalContract.getProposalById(proposalId);
    console.log("\nProposal details:");
    console.log("Description:", proposal.description);
    console.log("Amount:", ethers.formatEther(proposal.amountRequested), "ETH");
    console.log("Vote count:", proposal.voteCount.toString());
    console.log("Approved:", proposal.approved);
    console.log("Executed:", proposal.executed);

    // Cast 3 votes (minimum required)
    console.log("\nCasting votes...");
    for(let i = 0; i < 3; i++) {
      const voteTx = await votingContract.vote(proposalId, true);
      await voteTx.wait();
      console.log(`Vote ${i + 1} cast`);
    }

    // Check if proposal can be signed
    const updatedProposal = await proposalContract.getProposalById(proposalId);
    console.log("\nUpdated vote count:", updatedProposal.voteCount.toString());

    // Try to sign the proposal
    console.log("\nAttempting to sign proposal...");
    const signTx = await proposalContract.signProposal(proposalId);
    await signTx.wait();
    console.log("Proposal signed successfully");

    // Get final proposal state
    const finalProposal = await proposalContract.getProposalById(proposalId);
    console.log("\nFinal proposal state:");
    console.log("Vote count:", finalProposal.voteCount.toString());
    console.log("Signature count:", finalProposal.signatureCount.toString());
    console.log("Approved:", finalProposal.approved);
    console.log("Executed:", finalProposal.executed);

  } catch (error) {
    console.error("\nError during test:", error);
    // Log more details about the error
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.message) {
      console.error("Error message:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 