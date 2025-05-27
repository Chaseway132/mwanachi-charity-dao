const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Fixing authorization issues between contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get contract instances
  console.log("\nConnecting to contracts...");
  
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  console.log("CharityDAOPlatform at:", await charityDAOPlatform.getAddress());
  
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
  console.log("FundAllocation at:", await fundAllocation.getAddress());
  
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  console.log("ProposalManagement at:", await proposalManagement.getAddress());
  
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = VotingGovernance.attach(addresses.VOTING_GOVERNANCE);
  console.log("VotingGovernance at:", await votingGovernance.getAddress());

  // Check contract relationships
  console.log("\nVerifying contract relationships...");
  
  // Check FundAllocation owner
  const fundOwner = await fundAllocation.owner();
  console.log("FundAllocation owner:", fundOwner);
  console.log("Is CharityDAOPlatform the owner?", 
    fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check FundAllocation platform contract
  const platformContract = await fundAllocation.platformContract();
  console.log("FundAllocation platform contract:", platformContract);
  console.log("Is CharityDAOPlatform set as platform?", 
    platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check CharityDAOPlatform owner
  const platformOwner = await charityDAOPlatform.owner();
  console.log("CharityDAOPlatform owner:", platformOwner);
  console.log("Are we the owner of CharityDAOPlatform?", 
    platformOwner.toLowerCase() === deployer.address.toLowerCase());

  // Step 1: Ensure the CharityDAOPlatform is set as the platform contract in FundAllocation
  console.log("\nStep 1: Setting platform contract in FundAllocation...");
  try {
    // Check if we're the owner of FundAllocation
    const isFundOwner = fundOwner.toLowerCase() === deployer.address.toLowerCase();
    const isPlatformFundOwner = fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase();
    
    if (isFundOwner) {
      console.log("We are the owner of FundAllocation. Setting platform contract...");
      const tx1 = await fundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
      await tx1.wait();
      console.log("Platform contract set successfully!");
      
      // Transfer ownership to CharityDAOPlatform
      console.log("Transferring ownership to CharityDAOPlatform...");
      const tx2 = await fundAllocation.transferOwnership(addresses.CHARITY_DAO_PLATFORM);
      await tx2.wait();
      console.log("Ownership transferred successfully!");
    } else if (isPlatformFundOwner) {
      // If CharityDAOPlatform is already the owner, we need to call through it
      console.log("CharityDAOPlatform is already the owner. Setting platform contract through CharityDAOPlatform...");
      const tx = await charityDAOPlatform.setFundAllocationPlatform();
      await tx.wait();
      console.log("Platform contract set successfully through CharityDAOPlatform!");
    } else {
      console.log("We are not the owner of FundAllocation and neither is CharityDAOPlatform.");
      console.log("This is an unexpected state. Consider redeploying the contracts.");
    }
    
    // Verify the update
    const updatedPlatformContract = await fundAllocation.platformContract();
    console.log("Updated FundAllocation platform contract:", updatedPlatformContract);
    console.log("Is CharityDAOPlatform set as platform?", 
      updatedPlatformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  } catch (error) {
    console.error("Error setting platform contract:", error.message);
  }

  // Step 2: Ensure ProposalManagement has the correct authorizations
  console.log("\nStep 2: Setting up ProposalManagement authorizations...");
  try {
    // Check if we're the owner of ProposalManagement
    const proposalOwner = await proposalManagement.owner();
    const isProposalOwner = proposalOwner.toLowerCase() === deployer.address.toLowerCase();
    
    if (isProposalOwner) {
      // Check if FundAllocation is authorized
      let isAuthorized = false;
      try {
        isAuthorized = await proposalManagement.isAuthorized(addresses.FUND_ALLOCATION);
      } catch (error) {
        console.log("Could not check authorization directly. Assuming not authorized.");
      }
      
      if (!isAuthorized) {
        console.log("Authorizing FundAllocation in ProposalManagement...");
        try {
          const tx = await proposalManagement.setFundAllocationContract(addresses.FUND_ALLOCATION);
          await tx.wait();
          console.log("FundAllocation authorized successfully!");
        } catch (error) {
          console.error("Error authorizing FundAllocation:", error.message);
          
          // Try alternative method
          try {
            console.log("Trying alternative method to authorize FundAllocation...");
            const tx = await proposalManagement.addAuthorized(addresses.FUND_ALLOCATION);
            await tx.wait();
            console.log("FundAllocation authorized successfully using alternative method!");
          } catch (altError) {
            console.error("Alternative method failed:", altError.message);
          }
        }
      } else {
        console.log("FundAllocation is already authorized in ProposalManagement.");
      }
    } else {
      console.log("We are not the owner of ProposalManagement. Cannot set authorizations.");
    }
  } catch (error) {
    console.error("Error setting up ProposalManagement authorizations:", error.message);
  }

  // Step 3: Try to execute a proposal to test the fix
  console.log("\nStep 3: Testing proposal execution...");
  
  // Check if there are any proposals
  const proposalCount = await proposalManagement.proposalCount();
  console.log("Total proposals:", proposalCount.toString());
  
  if (proposalCount.toString() === "0") {
    console.log("No proposals found. Cannot test execution.");
    return;
  }
  
  // Get the latest proposal
  const latestProposalId = await proposalManagement.proposalCount();
  console.log(`Getting details for proposal ID: ${latestProposalId}`);
  
  const proposal = await proposalManagement.getProposalById(latestProposalId);
  console.log("Proposal details:", {
    id: proposal.id.toString(),
    description: proposal.description,
    amountRequested: ethers.formatEther(proposal.amountRequested),
    voteCount: proposal.voteCount.toString(),
    approved: proposal.approved,
    executed: proposal.executed,
    recipient: proposal.recipient,
    creator: proposal.creator
  });
  
  // Check if the proposal is already executed
  if (proposal.executed) {
    console.log("Proposal is already executed. Cannot test execution.");
    return;
  }
  
  // Check if the proposal is approved
  if (!proposal.approved) {
    console.log("Proposal is not approved. Cannot test execution.");
    return;
  }
  
  // Try to execute the proposal
  try {
    console.log("Executing proposal through CharityDAOPlatform...");
    const tx = await charityDAOPlatform.executeProposal(latestProposalId, {
      gasLimit: 1000000 // Higher gas limit to avoid estimation issues
    });
    await tx.wait();
    console.log("Proposal executed successfully!");
    
    // Verify execution
    const proposalAfterExecution = await proposalManagement.getProposalById(latestProposalId);
    console.log("Is proposal now executed?", proposalAfterExecution.executed);
  } catch (error) {
    console.error("Error executing proposal:", error.message);
    console.log("Fix was not successful. Please check contract relationships and try again.");
  }

  console.log("\nAuthorization fix attempt completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
