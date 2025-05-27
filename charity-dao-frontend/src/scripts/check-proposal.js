// Script to check the status of a proposal
const { ethers } = require("ethers");
const { 
  PROPOSAL_MANAGEMENT, 
  FUND_ALLOCATION, 
  VOTING_GOVERNANCE 
} = require("../config/contracts");
const ProposalManagementABI = require("../config/ProposalManagement.json");
const FundAllocationABI = require("../config/FundAllocation.json");
const VotingGovernanceABI = require("../config/VotingGovernance.json");

async function main(proposalId = 1) {
  try {
    console.log(`Checking status of proposal ${proposalId}...`);

    // Connect to the provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Connected to provider");

    // Get signer
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log("Using account:", address);

    // Create contract instances
    const proposalContract = new ethers.Contract(
      PROPOSAL_MANAGEMENT,
      ProposalManagementABI.abi,
      provider
    );
    
    const fundContract = new ethers.Contract(
      FUND_ALLOCATION,
      FundAllocationABI.abi,
      provider
    );
    
    const votingContract = new ethers.Contract(
      VOTING_GOVERNANCE,
      VotingGovernanceABI.abi,
      provider
    );

    // Get proposal details
    const proposal = await proposalContract.getProposalById(BigInt(proposalId));
    console.log("Proposal details:", {
      id: proposalId,
      description: proposal.description,
      amount: ethers.formatEther(proposal.amount || proposal.amountRequested),
      recipient: proposal.recipient,
      votesFor: Number(proposal.votesFor),
      votesAgainst: Number(proposal.votesAgainst),
      approved: proposal.approved,
      executed: proposal.executed,
      creationTime: new Date(Number(proposal.creationTime) * 1000).toLocaleString(),
      executionTime: proposal.executionTime > 0 
        ? new Date(Number(proposal.executionTime) * 1000).toLocaleString() 
        : 'Not executed'
    });

    // Check if proposal can be executed
    const canExecute = await votingContract.canExecute(BigInt(proposalId));
    console.log("Can execute:", canExecute);

    // Check fund contract balance
    const balance = await provider.getBalance(FUND_ALLOCATION);
    console.log("Fund contract balance:", ethers.formatEther(balance), "ETH");

    // Check if user is owner
    const owner = await proposalContract.owner();
    console.log("Contract owner:", owner);
    console.log("Is current user the owner:", owner.toLowerCase() === address.toLowerCase());

    // Check if proposal is approved
    console.log("Is proposal approved:", proposal.approved);

    // Check if proposal is executed
    console.log("Is proposal executed:", proposal.executed);

    // Check remaining execution delay if applicable
    if (!proposal.executed && proposal.approved) {
      try {
        const delay = await votingContract.getRemainingExecutionDelay(BigInt(proposalId));
        console.log("Remaining execution delay:", Number(delay), "seconds");
      } catch (error) {
        console.log("Could not get remaining execution delay:", error.message);
      }
    }

    return {
      success: true,
      proposal,
      canExecute,
      balance: ethers.formatEther(balance),
      isOwner: owner.toLowerCase() === address.toLowerCase()
    };
  } catch (error) {
    console.error("Error checking proposal:", error);
    return { success: false, error };
  }
}

// Export the function to be called from the browser
window.checkProposal = main;

// Run the script if executed directly
if (typeof window !== 'undefined' && window.ethereum) {
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id') || 1;
  
  main(proposalId)
    .then(result => console.log("Script result:", result))
    .catch(error => console.error("Script error:", error));
}
