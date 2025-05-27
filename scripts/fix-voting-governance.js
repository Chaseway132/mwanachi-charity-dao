const { ethers } = require("hardhat");

async function main() {
  console.log("Fixing VotingGovernance contract reference in ProposalManagement...");
  
  // Contract addresses from deployment
  const proposalManagementAddress = "0xc78a93d9416C3CA5CCaC17d8A90545bf21c1dC82";
  const votingGovernanceAddress = "0xE2B86c663bC931ee83E4B924565538c1315633b2";
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);
  
  // Get contract instances
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalContract = ProposalManagement.attach(proposalManagementAddress);
  
  // Check current voting governance contract
  console.log("\nChecking current VotingGovernance contract...");
  try {
    const currentVotingGovernance = await proposalContract.votingGovernanceContract();
    console.log(`Current VotingGovernance: ${currentVotingGovernance}`);
    console.log(`Expected VotingGovernance: ${votingGovernanceAddress}`);
    console.log(`Match: ${currentVotingGovernance.toLowerCase() === votingGovernanceAddress.toLowerCase()}`);
    
    if (currentVotingGovernance.toLowerCase() === votingGovernanceAddress.toLowerCase()) {
      console.log("VotingGovernance contract is already correctly set.");
      return;
    }
  } catch (error) {
    console.error("Error checking current VotingGovernance:", error);
  }
  
  // Set voting governance contract
  console.log(`\nSetting VotingGovernance contract to ${votingGovernanceAddress}...`);
  try {
    const tx = await proposalContract.setVotingGovernanceContract(votingGovernanceAddress);
    await tx.wait();
    console.log("VotingGovernance contract set successfully!");
    
    // Verify
    const updatedVotingGovernance = await proposalContract.votingGovernanceContract();
    console.log(`Updated VotingGovernance: ${updatedVotingGovernance}`);
    console.log(`Correctly updated: ${updatedVotingGovernance.toLowerCase() === votingGovernanceAddress.toLowerCase()}`);
  } catch (error) {
    console.error("Error setting VotingGovernance contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 