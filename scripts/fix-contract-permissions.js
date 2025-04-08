const { ethers } = require("hardhat");

async function main() {
  console.log("Fixing contract permissions for ProposalManagement and FundAllocation contracts...");
  
  // Contract addresses from deployment
  const proposalManagementAddress = "0x3487996B4F6EA237248720896D4915884bAE05d4";
  const fundAllocationAddress = "0x8ec4B52F5aa2AA5BE4175093caf7d9c97b943b6E";
  const platformAddress = "0x0f1097e50D8FA286a3AcAB8635a3bd7A41fd00C7";
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);
  
  // Get contract instances
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  
  const proposalContract = ProposalManagement.attach(proposalManagementAddress);
  const fundContract = FundAllocation.attach(fundAllocationAddress);
  
  console.log("\nStep 1: Checking if ProposalManagement contract has the setFundAllocationContract function");
  // Check if the function exists (might not if we haven't redeployed)
  try {
    const funcExists = typeof proposalContract.setFundAllocationContract === "function";
    console.log(`Does setFundAllocationContract exist? ${funcExists ? 'Yes' : 'No'}`);
    
    if (!funcExists) {
      console.log("❌ The setFundAllocationContract function does not exist.");
      console.log("The contracts need to be redeployed with the updated code.");
      console.log("\nPlease follow these steps:");
      console.log("1. Run: npx hardhat compile");
      console.log("2. Run: npx hardhat run scripts/deploy.js --network ganache");
      console.log("3. Update contracts in frontend if necessary");
      return;
    }
  } catch (error) {
    console.error("Error checking function existence:", error);
    return;
  }
  
  // Step 1: Set fund allocation contract in proposal management
  console.log(`\nStep 2: Setting FundAllocation (${fundAllocationAddress}) as authorized caller in ProposalManagement...`);
  try {
    const tx1 = await proposalContract.setFundAllocationContract(fundAllocationAddress, {
      gasLimit: 500000
    });
    console.log("Transaction sent:", tx1.hash);
    const receipt1 = await tx1.wait();
    console.log("Transaction confirmed with status:", receipt1.status);
    console.log("✅ Successfully set FundAllocation contract in ProposalManagement");
    
    // Verify the change
    try {
      const authorizedContract = await proposalContract.fundAllocationContract();
      console.log(`Authorized FundAllocation contract: ${authorizedContract}`);
      console.log(`Match expected: ${authorizedContract.toLowerCase() === fundAllocationAddress.toLowerCase()}`);
    } catch (error) {
      console.error("Could not verify fundAllocationContract:", error.message);
    }
  } catch (error) {
    console.error("Error setting FundAllocation contract:", error.message);
  }
  
  // Step 2: Set platform contract in fund allocation
  console.log(`\nStep 3: Setting Platform contract (${platformAddress}) in FundAllocation...`);
  try {
    const tx2 = await fundContract.setPlatformContract(platformAddress, {
      gasLimit: 500000
    });
    console.log("Transaction sent:", tx2.hash);
    const receipt2 = await tx2.wait();
    console.log("Transaction confirmed with status:", receipt2.status);
    console.log("✅ Successfully set Platform contract in FundAllocation");
    
    // Verify the change
    const setplatformContract = await fundContract.platformContract();
    console.log(`Platform contract set to: ${setplatformContract}`);
    console.log(`Match expected: ${setplatformContract.toLowerCase() === platformAddress.toLowerCase()}`);
  } catch (error) {
    console.error("Error setting Platform contract:", error.message);
  }
  
  // Step 3: Test direct execution to ensure permissions are working
  console.log("\nStep 4: Testing direct proposal execution (if applicable)...");
  
  try {
    // Check if there are any proposals
    const allProposals = await proposalContract.getAllProposals();
    console.log(`Found ${allProposals.length} proposals`);
    
    // Find an approved but not executed proposal
    let testProposalId = 0;
    for (let i = 0; i < allProposals.length; i++) {
      const proposal = allProposals[i];
      if (proposal.approved && !proposal.executed) {
        testProposalId = proposal.id;
        console.log(`Found eligible proposal ID ${testProposalId} for testing execution`);
        break;
      }
    }
    
    if (testProposalId > 0) {
      console.log(`Testing execution of proposal ID ${testProposalId}...`);
      try {
        // Check fund balance
        const fundBalance = await ethers.provider.getBalance(fundAllocationAddress);
        console.log(`Fund balance: ${ethers.formatEther(fundBalance)} ETH`);
        
        // Get proposal details
        const testProposal = await proposalContract.getProposalById(testProposalId);
        console.log(`Proposal amount: ${ethers.formatEther(testProposal.amountRequested)} ETH`);
        
        if (fundBalance >= testProposal.amountRequested) {
          const executeTx = await fundContract.executeProposal(testProposalId, {
            gasLimit: 1000000
          });
          console.log("Execution transaction sent:", executeTx.hash);
          const executeReceipt = await executeTx.wait();
          console.log("✅ Proposal execution successful! Status:", executeReceipt.status);
          
          // Verify it was marked as executed
          const updatedProposal = await proposalContract.getProposalById(testProposalId);
          console.log(`Proposal executed status: ${updatedProposal.executed}`);
        } else {
          console.log("⚠️ Insufficient funds for execution. Please add more ETH to the contract.");
        }
      } catch (error) {
        console.error("❌ Execution test failed:", error.message);
      }
    } else {
      console.log("No eligible proposals found for testing execution.");
    }
  } catch (error) {
    console.error("Error testing execution:", error.message);
  }
  
  console.log("\nPermission fixes complete.");
  console.log("To fully test:");
  console.log("1. Open the frontend app");
  console.log("2. Use the Hard Reload From Blockchain button");
  console.log("3. Create a proposal if needed");
  console.log("4. Vote on it to get it approved");
  console.log("5. Try to execute it");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 