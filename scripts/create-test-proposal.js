const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Creating a test proposal...");
  
  // Get the deployed contract addresses from the deployment file
  const deployedAddressesPath = path.join(__dirname, "../charity-dao-frontend/src/contracts/deployedAddresses.ts");
  const fileContent = fs.readFileSync(deployedAddressesPath, 'utf8');
  
  // Extract the address using a regex pattern
  const proposalManagementMatch = fileContent.match(/PROPOSAL_MANAGEMENT: '(0x[a-fA-F0-9]{40})'/);
  if (!proposalManagementMatch) {
    throw new Error("Failed to find ProposalManagement address in deployedAddresses.ts");
  }
  
  const proposalManagementAddress = proposalManagementMatch[1];
  console.log("Using ProposalManagement contract at:", proposalManagementAddress);
  
  // Get the ProposalManagement contract
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.attach(proposalManagementAddress);
  
  // Create a test proposal
  const testDescription = "Test Proposal " + new Date().toISOString();
  const amountRequested = ethers.parseEther("0.1"); // 0.1 ETH
  const recipient = (await ethers.getSigners())[0].address;
  
  console.log(`Creating proposal with description "${testDescription}", amount ${ethers.formatEther(amountRequested)} ETH, recipient ${recipient}`);
  
  // Send the transaction
  const tx = await proposalManagement.createProposal(testDescription, amountRequested, recipient);
  console.log("Transaction sent:", tx.hash);
  
  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  console.log("Transaction confirmed:", receipt.hash);
  
  // Get the proposal count to verify
  const proposalCount = await proposalManagement.getProposalCount();
  console.log("Total proposals:", proposalCount.toString());
  
  console.log("Test proposal created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 