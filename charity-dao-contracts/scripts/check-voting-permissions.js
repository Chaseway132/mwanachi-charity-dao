const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking voting permissions...");

  // Load deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../../deployedAddresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Get the VotingGovernance contract
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = await VotingGovernance.attach(deployedAddresses.VOTING_GOVERNANCE);

  // Get the CharityDAOPlatform contract
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const platform = await CharityDAOPlatform.attach(deployedAddresses.CHARITY_DAO_PLATFORM);

  try {
    // Check if the voter address has voting rights
    const voterAddress = "0xBcdB9B05cD47EE978347E8C91133845B121e0699";
    console.log("\nChecking voting rights for address:", voterAddress);
    
    const hasVotingRights = await votingGovernance.hasVotingRights(voterAddress);
    console.log("Has voting rights:", hasVotingRights);

    // Check if the voter is registered
    const isRegistered = await votingGovernance.isRegisteredVoter(voterAddress);
    console.log("Is registered voter:", isRegistered);

    // Check voting power
    const votingPower = await votingGovernance.getVotingPower(voterAddress);
    console.log("Voting power:", votingPower.toString());

    // Check if the platform contract has the correct role
    const platformRole = await votingGovernance.PLATFORM_ROLE();
    const hasPlatformRole = await votingGovernance.hasRole(platformRole, platform.target);
    console.log("\nPlatform contract has correct role:", hasPlatformRole);

    // Check if the voter has any active votes
    const activeVotes = await votingGovernance.getActiveVotes(voterAddress);
    console.log("\nActive votes:", activeVotes.length);

    // Check proposal state
    const proposalId = 1;
    const proposal = await votingGovernance.getProposal(proposalId);
    console.log("\nProposal state:");
    console.log("- Exists:", proposal !== null);
    if (proposal) {
      console.log("- Vote count:", proposal.voteCount.toString());
      console.log("- Has voted:", await votingGovernance.hasVoted(proposalId, voterAddress));
    }
  } catch (error) {
    console.error("Error checking voting permissions:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 