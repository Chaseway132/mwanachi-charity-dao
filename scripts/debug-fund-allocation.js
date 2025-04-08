const { ethers } = require("hardhat");

async function main() {
  console.log("Debugging FundAllocation contract...");
  
  // Contract addresses from deployment
  const fundAddress = "0x8ec4B52F5aa2AA5BE4175093caf7d9c97b943b6E";
  const platformAddress = "0x0f1097e50D8FA286a3AcAB8635a3bd7A41fd00C7";
  const proposalAddress = "0x3487996B4F6EA237248720896D4915884bAE05d4";
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);
  
  // Get contract instances
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  
  const fundContract = FundAllocation.attach(fundAddress);
  const proposalContract = ProposalManagement.attach(proposalAddress);
  const platformContract = CharityDAOPlatform.attach(platformAddress);
  
  // Check configuration
  console.log("\n--- Contract Configuration ---");
  const owner = await fundContract.owner();
  console.log(`FundAllocation owner: ${owner}`);
  console.log(`Expected owner: ${deployer.address}`);
  console.log(`Owner match: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
  
  const platform = await fundContract.platformContract();
  console.log(`Platform contract set to: ${platform}`);
  console.log(`Expected platform: ${platformAddress}`);
  console.log(`Platform match: ${platform.toLowerCase() === platformAddress.toLowerCase()}`);
  
  // Check fund balance
  const fundBalance = await ethers.provider.getBalance(fundAddress);
  console.log(`FundAllocation balance: ${ethers.formatEther(fundBalance)} ETH`);
  
  // Check if there are any proposals
  console.log("\n--- Proposals Status ---");
  try {
    const allProposals = await proposalContract.getAllProposals();
    console.log(`Found ${allProposals.length} proposals`);
    
    // Check each proposal
    for (let i = 0; i < allProposals.length; i++) {
      const proposalId = BigInt(i + 1); // 1-indexed
      const proposal = await proposalContract.getProposalById(proposalId);
      
      console.log(`\nProposal ${proposalId}:`);
      console.log(`Description: ${proposal.description}`);
      console.log(`Recipient: ${proposal.recipient}`);
      console.log(`Amount: ${ethers.formatEther(proposal.amountRequested)} ETH`);
      console.log(`Vote count: ${proposal.voteCount}`);
      console.log(`Approved: ${proposal.approved}`);
      console.log(`Executed: ${proposal.executed}`);
      
      // Check if it's valid for execution
      if (proposal.approved && !proposal.executed) {
        console.log("This proposal is ready for execution!");
        
        // Check if funds are sufficient
        if (fundBalance >= proposal.amountRequested) {
          console.log("Funds are sufficient for execution");
          
          // Try to diagnose execution issue by checking permissions
          console.log("\n--- Permission Check ---");
          const platformOwner = await platformContract.owner();
          console.log(`Platform owner: ${platformOwner}`);
          
          // Try direct execution to debug
          try {
            console.log("\nAttempting direct execution...");
            // Try direct execution with fundContract
            const tx = await fundContract.executeProposal(proposalId, {
              gasLimit: 1000000 // Set high gas limit
            });
            console.log("Transaction sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("Execution successful!", receipt);
          } catch (error) {
            console.log("Direct execution failed:");
            console.log(error.message);
            
            // Check executeProposal function on FundAllocation
            try {
              console.log("\nChecking if executeProposal function exists on FundAllocation...");
              // Check if fund contract has executeProposal function
              if (typeof fundContract.executeProposal === "function") {
                console.log("executeProposal function exists");
                
                // Fix: Try to set platform contract again
                console.log("\nAttempting to reset platform contract...");
                const resetTx = await fundContract.setPlatformContract(platformAddress, {
                  gasLimit: 500000
                });
                await resetTx.wait();
                console.log("Platform contract reset successfully");
                
                // Verify the change
                const updatedPlatform = await fundContract.platformContract();
                console.log(`Updated platform contract: ${updatedPlatform}`);
                
                // Try to execute proposal again after platform reset
                try {
                  console.log("\nTrying execution after platform reset...");
                  const tx2 = await fundContract.executeProposal(proposalId, {
                    gasLimit: 1000000
                  });
                  const receipt2 = await tx2.wait();
                  console.log("Execution successful after platform reset!", receipt2);
                } catch (error2) {
                  console.log("Execution still failed after platform reset:");
                  console.log(error2.message);
                }
              } else {
                console.log("executeProposal function does NOT exist on FundAllocation!");
              }
            } catch (checkError) {
              console.log("Error checking fund contract:", checkError.message);
            }
          }
        } else {
          console.log("Insufficient funds for execution");
        }
      }
    }
  } catch (error) {
    console.log("Error getting proposals:", error.message);
  }
  
  console.log("\nDebugging complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 