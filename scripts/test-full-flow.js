const { ethers } = require("hardhat");

async function main() {
  console.log("Testing complete proposal flow on Ganache...");
  console.log("Starting script execution...");

  try {
    // Check network connection
    const network = await ethers.provider.getNetwork();
    console.log("Connected to network:", network.name, "(chainId:", network.chainId, ")");
    
    // Get all signers
    const signers = await ethers.getSigners();
    console.log("\nTotal signers available:", signers.length);

    if (signers.length < 5) {
      throw new Error(`Not enough accounts available. Need at least 5 accounts, but got ${signers.length}`);
    }

    // Get deployed addresses first
    console.log("\nLoading deployed addresses...");
    const addresses = require('../deployedAddresses.json');
    console.log("Loaded contract addresses:", addresses);

    // Assign roles
    const deployer = signers[0];
    const voter1 = signers[1];
    const voter2 = signers[2];
    const signer1 = signers[3];
    const signer2 = signers[4];

    console.log("\nAccounts:");
    console.log("Deployer:", deployer.address);
    console.log("Voter 1:", voter1.address);
    console.log("Voter 2:", voter2.address);
    console.log("Signer 1:", signer1.address);
    console.log("Signer 2:", signer2.address);

    // First, add the signers to the contract
    console.log("\nAdding authorized signers...");
    const proposalMgmt = await ethers.getContractAt("ProposalManagement", addresses.PROPOSAL_MANAGEMENT, deployer);
    
    // Add signers if they're not already authorized
    const isAuthorizedSigner1 = await proposalMgmt.isAuthorizedSigner(signer1.address);
    const isAuthorizedSigner2 = await proposalMgmt.isAuthorizedSigner(signer2.address);

    if (!isAuthorizedSigner1) {
      console.log("Adding signer 1...");
      const tx = await proposalMgmt.addSigner(signer1.address);
      await tx.wait();
      console.log("Signer 1 added");
    } else {
      console.log("Signer 1 already authorized");
    }

    if (!isAuthorizedSigner2) {
      console.log("Adding signer 2...");
      const tx = await proposalMgmt.addSigner(signer2.address);
      await tx.wait();
      console.log("Signer 2 added");
    } else {
      console.log("Signer 2 already authorized");
    }

    // Get contract instances
    console.log("\nGetting contract instances...");
    const platform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM, deployer);
    const voting = await ethers.getContractAt("VotingGovernance", addresses.VOTING_GOVERNANCE, deployer);
    const fundAllocation = await ethers.getContractAt("FundAllocation", addresses.FUND_ALLOCATION, deployer);
    const donationTracking = await ethers.getContractAt("DonationTracking", addresses.DONATION_TRACKING, deployer);
    console.log("Successfully attached to all contracts");

    // Check fund balance
    console.log("\nChecking fund balance...");
    const fundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
    console.log("Current fund balance:", ethers.formatEther(fundBalance), "ETH");

    // Make voters stakeholders by donating
    console.log("\nMaking voters stakeholders...");
    const donationAmount = ethers.parseEther("0.1");
    
    // Voter 1 donates
    console.log("Voter 1 donating...");
    const tx1 = await platform.connect(voter1).donate({ value: donationAmount });
    console.log("Transaction sent, waiting for confirmation...");
    await tx1.wait();
    console.log("Voter 1 donated successfully");

    // Voter 2 donates
    console.log("Voter 2 donating...");
    const tx2 = await platform.connect(voter2).donate({ value: donationAmount });
    console.log("Transaction sent, waiting for confirmation...");
    await tx2.wait();
    console.log("Voter 2 donated successfully");

    // Create a proposal
    console.log("\nCreating test proposal...");
    const proposalAmount = ethers.parseEther("0.5");
    const proposalDesc = "Test proposal for disaster relief";
    const beneficiary = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example beneficiary

    console.log("Sending create proposal transaction...");
    const createTx = await platform.createProposal(proposalDesc, proposalAmount, beneficiary);
    console.log("Transaction sent, waiting for confirmation...");
    const createReceipt = await createTx.wait();
    console.log("Transaction confirmed");
    
    // Get proposal ID from event
    console.log("Extracting proposal ID from event...");
    const proposalCreatedEvent = createReceipt.logs.find(
      log => log.fragment && log.fragment.name === 'ProposalCreated'
    );
    const proposalId = proposalCreatedEvent ? proposalCreatedEvent.args[0] : 1;
    console.log("Proposal created with ID:", proposalId.toString());

    // Vote on proposal
    console.log("\nVoting on proposal...");
    console.log("Voter 1 voting...");
    await voting.connect(voter1).voteOnProposal(proposalId);
    console.log("Voter 1 voted");
    
    console.log("Voter 2 voting...");
    await voting.connect(voter2).voteOnProposal(proposalId);
    console.log("Voter 2 voted");
    
    console.log("Deployer voting...");
    await voting.connect(deployer).voteOnProposal(proposalId);
    console.log("Deployer voted");

    // Sign the proposal
    console.log("\nSigning the proposal...");
    console.log("Signer 1 signing...");
    await proposalMgmt.connect(signer1).signProposal(proposalId);
    console.log("Signer 1 signed the proposal");
    
    console.log("Signer 2 signing...");
    await proposalMgmt.connect(signer2).signProposal(proposalId);
    console.log("Signer 2 signed the proposal");
    
    // Check if proposal is automatically approved after signing
    console.log("\nChecking proposal state after signing...");
    const proposalAfterSigning = await proposalMgmt.getProposalById(proposalId);
    console.log("Proposal state after signing:");
    console.log("- Approved:", proposalAfterSigning.approved);
    console.log("- Signatures:", proposalAfterSigning.signatureCount.toString());
    
    if (proposalAfterSigning.approved) {
      console.log("✅ Proposal automatically approved after required signatures");
    } else {
      console.log("❌ Proposal not automatically approved - check contract logic");
    }

    // Wait for timelock period (45 seconds)
    console.log("\nWaiting for timelock period (45 seconds)...");
    console.log("Current time:", new Date().toISOString());
    
    // Use ethers.provider.send to increase time by 45 seconds
    console.log("Increasing time by 45 seconds...");
    await ethers.provider.send("evm_increaseTime", [45 * 1000]); // 45 seconds in milliseconds
    console.log("Mining a new block to apply time change...");
    await ethers.provider.send("evm_mine", []); // Mine a new block to apply the time change
    
    console.log("Time after timelock:", new Date().toISOString());
    console.log("Timelock period completed");

    // Execute proposal
    console.log("\nExecuting proposal...");
    console.log("Sending execute proposal transaction...");
    await platform.executeProposal(proposalId);
    console.log("Proposal executed");

    // Verify final state
    console.log("\nVerifying final proposal state...");
    const proposal = await proposalMgmt.getProposalById(proposalId);
    console.log("Final proposal state:");
    console.log("- Approved:", proposal.approved);
    console.log("- Executed:", proposal.executed);
    console.log("- Vote count:", proposal.voteCount.toString());
    console.log("- Signatures:", proposal.signatureCount.toString());

    // Check final fund balance
    console.log("\nChecking final fund balance...");
    const finalBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
    console.log("Final fund balance:", ethers.formatEther(finalBalance), "ETH");
    console.log("Balance change:", ethers.formatEther(finalBalance - fundBalance), "ETH");

    console.log("\n✅ Full flow test completed successfully!");

  } catch (error) {
    console.error("\nError during test:", error);
    console.error("Error details:", error.message);
    if (error.transaction) {
      console.error("Transaction hash:", error.transaction.hash);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  }); 