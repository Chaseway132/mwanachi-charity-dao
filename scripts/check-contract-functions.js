const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  console.log("Checking contract functions...");
  
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
  
  // Check contract functions
  console.log("\nChecking contract functions:");
  console.log("----------------------------");
  
  try {
    const owner = await proposalManagement.owner();
    console.log("owner():", owner);
  } catch (error) {
    console.error("Error calling owner():", error.message);
  }
  
  try {
    const proposalCount = await proposalManagement.proposalCount();
    console.log("proposalCount():", proposalCount.toString());
  } catch (error) {
    console.error("Error calling proposalCount():", error.message);
  }
  
  try {
    const getAllProposals = await proposalManagement.getAllProposals();
    console.log("getAllProposals():", getAllProposals);
    
    if (Array.isArray(getAllProposals)) {
      console.log(`Received ${getAllProposals.length} proposals`);
      
      for (let i = 0; i < getAllProposals.length; i++) {
        console.log(`Proposal ${i + 1}:`, {
          id: getAllProposals[i].id.toString(),
          description: getAllProposals[i].description,
          amountRequested: ethers.formatEther(getAllProposals[i].amountRequested),
          voteCount: getAllProposals[i].voteCount.toString(),
          approved: getAllProposals[i].approved,
          executed: getAllProposals[i].executed,
          recipient: getAllProposals[i].recipient,
          signatureCount: getAllProposals[i].signatureCount.toString(),
          creationTime: getAllProposals[i].creationTime?.toString() || 'N/A'
        });
      }
    }
  } catch (error) {
    console.error("Error calling getAllProposals():", error.message);
  }
  
  try {
    const getAuthorizedSigners = await proposalManagement.getAuthorizedSigners();
    console.log("getAuthorizedSigners():", getAuthorizedSigners);
  } catch (error) {
    console.error("Error calling getAuthorizedSigners():", error.message);
  }
  
  try {
    const REQUIRED_SIGNATURES = await proposalManagement.REQUIRED_SIGNATURES();
    console.log("REQUIRED_SIGNATURES():", REQUIRED_SIGNATURES.toString());
  } catch (error) {
    console.error("Error calling REQUIRED_SIGNATURES():", error.message);
  }
  
  console.log("\nContract function check complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 