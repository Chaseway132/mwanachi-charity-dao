const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Directly executing proposal #7 using FundAllocation contract...");
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  
  // Get proposal details
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalContract = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  const proposal7 = await proposalContract.getProposalById(7);
  
  console.log("\nProposal #7 Details:");
  console.log("id:", proposal7.id.toString());
  console.log("approved:", proposal7.approved);
  console.log("executed:", proposal7.executed);
  console.log("amount:", ethers.formatEther(proposal7.amount || proposal7.amountRequested), "ETH");
  console.log("recipient:", proposal7.recipient);
  
  // Check FundAllocation balance
  const fundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("\nFundAllocation balance:", ethers.formatEther(fundBalance), "ETH");
  
  // Execute the proposal directly using FundAllocation
  console.log("\nExecuting proposal #7 using FundAllocation...");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundContract = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Execute with higher gas limit
  const tx = await fundContract.executeProposal(7, { gasLimit: 1000000 });
  console.log("Transaction sent:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("\nWaiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction mined:", receipt.hash);
  
  // Check if proposal is now executed
  const updatedProposal = await proposalContract.getProposalById(7);
  console.log("\nUpdated Proposal #7 Details:");
  console.log("executed:", updatedProposal.executed);
  
  // Check FundAllocation balance after execution
  const fundBalanceAfter = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("\nFundAllocation balance after execution:", ethers.formatEther(fundBalanceAfter), "ETH");
  console.log("Difference:", ethers.formatEther(fundBalance - fundBalanceAfter), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nExecution failed!");
    console.error(error);
    process.exit(1);
  });
