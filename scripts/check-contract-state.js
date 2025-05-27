const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking current contract state...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Print all contract addresses
  console.log("\nDeployed contract addresses:");
  console.log("----------------------------");
  console.log("PROPOSAL_MANAGEMENT:", addresses.PROPOSAL_MANAGEMENT);
  console.log("FUND_ALLOCATION:", addresses.FUND_ALLOCATION);
  console.log("DONATION_TRACKING:", addresses.DONATION_TRACKING);
  console.log("VOTING_GOVERNANCE:", addresses.VOTING_GOVERNANCE);
  console.log("CHARITY_DAO_PLATFORM:", addresses.CHARITY_DAO_PLATFORM);

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

  const DonationTracking = await ethers.getContractFactory("DonationTracking");
  const donationTracking = DonationTracking.attach(addresses.DONATION_TRACKING);
  console.log("DonationTracking at:", await donationTracking.getAddress());

  // Check contract relationships
  console.log("\nContract Relationships:");
  console.log("----------------------");

  // CharityDAOPlatform
  const platformOwner = await charityDAOPlatform.owner();
  console.log("CharityDAOPlatform owner:", platformOwner);
  console.log("Is deployer the owner of CharityDAOPlatform?",
    platformOwner.toLowerCase() === deployer.address.toLowerCase());

  // FundAllocation
  const fundOwner = await fundAllocation.owner();
  console.log("\nFundAllocation owner:", fundOwner);
  console.log("Is CharityDAOPlatform the owner of FundAllocation?",
    fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

  const platformContract = await fundAllocation.platformContract();
  console.log("FundAllocation platform contract:", platformContract);
  console.log("Is CharityDAOPlatform set as platform in FundAllocation?",
    platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

  // ProposalManagement
  const proposalOwner = await proposalManagement.owner();
  console.log("\nProposalManagement owner:", proposalOwner);

  // Check if deployer is a signer
  const isSigner = await proposalManagement.authorizedSigners(deployer.address);
  console.log("Is deployer an authorized signer?", isSigner);

  // Get all signers
  console.log("\nAuthorized signers:");
  const signerCount = await proposalManagement.signerCount();
  console.log(`Total signers: ${signerCount}`);

  for (let i = 0; i < signerCount; i++) {
    const signer = await proposalManagement.signerList(i);
    console.log(`Signer ${i+1}: ${signer}`);
  }

  // Check contract balances
  console.log("\nContract Balances:");
  console.log("-----------------");

  const platformBalance = await ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);
  console.log("CharityDAOPlatform balance:", ethers.formatEther(platformBalance), "ETH");

  const fundBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log("FundAllocation balance:", ethers.formatEther(fundBalance), "ETH");

  const donationBalance = await ethers.provider.getBalance(addresses.DONATION_TRACKING);
  console.log("DonationTracking balance:", ethers.formatEther(donationBalance), "ETH");

  // Check proposals
  console.log("\nProposal Information:");
  console.log("--------------------");

  const proposalCount = await proposalManagement.proposalCount();
  console.log(`Total proposals: ${proposalCount}`);

  if (proposalCount > 0) {
    console.log("\nLatest proposal details:");
    const proposal = await proposalManagement.getProposalById(proposalCount);
    console.log({
      id: proposal.id.toString(),
      description: proposal.description,
      amountRequested: ethers.formatEther(proposal.amountRequested),
      voteCount: proposal.voteCount.toString(),
      approved: proposal.approved,
      executed: proposal.executed,
      recipient: proposal.recipient,
      creator: proposal.creator,
      signatureCount: proposal.signatureCount.toString(),
      executionTime: proposal.executionTime > 0
        ? new Date(Number(proposal.executionTime) * 1000).toLocaleString()
        : "Not set"
    });

    // Check if the proposal can be executed
    if (proposal.approved && !proposal.executed) {
      console.log("\nChecking if proposal can be executed...");

      // Check time lock
      const currentTime = Math.floor(Date.now() / 1000);
      const executionTime = Number(proposal.executionTime);

      console.log(`Execution time: ${executionTime} (${new Date(executionTime * 1000).toLocaleString()})`);
      console.log(`Current time: ${currentTime} (${new Date(currentTime * 1000).toLocaleString()})`);

      if (executionTime > currentTime) {
        console.log(`Time remaining: ${executionTime - currentTime} seconds`);
      } else {
        console.log("Time lock period has passed");
      }

      // Check funds
      const fundBalanceNumber = Number(ethers.formatEther(fundBalance));
      const amountRequestedNumber = Number(ethers.formatEther(proposal.amountRequested));

      if (fundBalanceNumber < amountRequestedNumber) {
        console.log(`Insufficient funds: Have ${fundBalanceNumber} ETH, need ${amountRequestedNumber} ETH`);
      } else {
        console.log(`Sufficient funds available: ${fundBalanceNumber} ETH (required: ${amountRequestedNumber} ETH)`);
      }
    }
  }

  console.log("\nContract state check completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
