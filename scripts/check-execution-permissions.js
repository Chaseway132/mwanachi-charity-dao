const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Checking execution permissions...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log("\nContract Addresses:");
  console.log("CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("FundAllocation:", addresses.FUND_ALLOCATION);
  console.log("ProposalManagement:", addresses.PROPOSAL_MANAGEMENT);
  
  // Get CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platformContract = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  
  // Get FundAllocation contract
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundContract = FundAllocation.attach(addresses.FUND_ALLOCATION);
  
  // Get ProposalManagement contract
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalContract = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  
  // Check contract configurations
  console.log("\nChecking contract configurations...");
  
  // Check CharityDAOPlatform
  const platformOwner = await platformContract.owner();
  const platformFundContract = await platformContract.fundAllocationContract();
  
  console.log("\nCharityDAOPlatform Configuration:");
  console.log("Owner:", platformOwner);
  console.log("FundAllocation contract:", platformFundContract);
  console.log("Is deployer the owner?", platformOwner.toLowerCase() === deployer.address.toLowerCase());
  console.log("Is FundAllocation set correctly?", platformFundContract.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());
  
  // Check FundAllocation
  const fundOwner = await fundContract.owner();
  const fundPlatformContract = await fundContract.platformContract();
  
  console.log("\nFundAllocation Configuration:");
  console.log("Owner:", fundOwner);
  console.log("Platform contract:", fundPlatformContract);
  console.log("Is CharityDAOPlatform the owner?", fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  console.log("Is platform contract set correctly?", fundPlatformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check proposal 1
  console.log("\nChecking proposal 1...");
  try {
    const proposal = await proposalContract.getProposalById(1);
    console.log("Proposal 1 details:");
    console.log("ID:", proposal.id.toString());
    console.log("Approved:", proposal.approved);
    console.log("Executed:", proposal.executed);
    console.log("Amount:", ethers.formatEther(proposal.amount || proposal.amountRequested), "ETH");
    console.log("Recipient:", proposal.recipient);
    
    // Check if proposal can be executed
    console.log("\nChecking if proposal can be executed...");
    
    // Check if proposal is approved
    if (!proposal.approved) {
      console.log("Proposal is not approved");
    } else if (proposal.executed) {
      console.log("Proposal is already executed");
    } else {
      console.log("Proposal is approved and not executed");
      
      // Check contract balance
      const balance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
      console.log("FundAllocation balance:", ethers.formatEther(balance), "ETH");
      
      if (balance < proposal.amount) {
        console.log("Insufficient funds in contract");
      } else {
        console.log("Sufficient funds in contract");
        
        // Try to execute the proposal directly through FundAllocation
        console.log("\nTrying to execute proposal directly through FundAllocation...");
        try {
          const tx = await fundContract.executeProposal(1, { gasLimit: 1000000 });
          console.log("Transaction sent:", tx.hash);
          
          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt.hash);
          
          // Check if proposal is now executed
          const updatedProposal = await proposalContract.getProposalById(1);
          console.log("Proposal executed:", updatedProposal.executed);
        } catch (error) {
          console.error("Error executing proposal:", error);
          
          // Try to execute through CharityDAOPlatform
          console.log("\nTrying to execute proposal through CharityDAOPlatform...");
          try {
            const tx = await platformContract.executeProposal(1, { gasLimit: 1000000 });
            console.log("Transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt.hash);
            
            // Check if proposal is now executed
            const updatedProposal = await proposalContract.getProposalById(1);
            console.log("Proposal executed:", updatedProposal.executed);
          } catch (platformError) {
            console.error("Error executing through platform:", platformError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error getting proposal:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
  });
