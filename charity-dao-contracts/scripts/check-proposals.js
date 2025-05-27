const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking proposals on the blockchain...");

  // Load deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../../deployedAddresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  // Get the ProposalManagement contract
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.attach(deployedAddresses.PROPOSAL_MANAGEMENT);

  try {
    // Get all proposals
    const proposals = await proposalManagement.getAllProposals();
    console.log(`\nFound ${proposals.length} proposals:`);

    for (const proposal of proposals) {
      console.log("\nProposal Details:");
      console.log("----------------");
      console.log(`ID: ${proposal.id}`);
      console.log(`Description: ${proposal.description}`);
      console.log(`Amount Requested: ${ethers.formatEther(proposal.amountRequested)} ETH`);
      console.log(`Vote Count: ${proposal.voteCount}`);
      console.log(`Approved: ${proposal.approved}`);
      console.log(`Executed: ${proposal.executed}`);
      console.log(`Recipient: ${proposal.recipient}`);
      console.log(`Signature Count: ${proposal.signatureCount}`);
      console.log(`Creation Time: ${new Date(Number(proposal.creationTime) * 1000).toLocaleString()}`);

      // Check if proposal can be executed
      try {
        const canBeExecuted = await proposalManagement.canBeExecuted(proposal.id);
        console.log(`Can Be Executed: ${canBeExecuted}`);
        
        if (!canBeExecuted) {
          const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposal.id);
          console.log(`Remaining Execution Delay: ${remainingDelay} seconds`);
        }
      } catch (error) {
        console.log("Error checking execution status:", error.message);
      }

      // Check if proposal has required signatures
      try {
        const REQUIRED_SIGNATURES = await proposalManagement.REQUIRED_SIGNATURES();
        const hasRequiredSignatures = proposal.signatureCount >= REQUIRED_SIGNATURES;
        console.log(`Has Required Signatures: ${hasRequiredSignatures} (${proposal.signatureCount}/${REQUIRED_SIGNATURES})`);
      } catch (error) {
        console.log("Error checking signatures:", error.message);
      }
    }
  } catch (error) {
    console.error("Error fetching proposals:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 