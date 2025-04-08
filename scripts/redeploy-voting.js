const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Redeploying VotingGovernance with the account:", deployer.address);

  // Get existing contract addresses
  const PROPOSAL_MANAGEMENT = "0xfEDBD69977272b8D0B2f9207e70663B60647Bd82";
  const DONATION_TRACKING = "0xCe02E5eA71e81d41C957f70b51a25cEB72FBe0b8";

  // Deploy VotingGovernance
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGovernance = await VotingGovernance.deploy(
    PROPOSAL_MANAGEMENT,
    DONATION_TRACKING,
    deployer.address
  );
  await votingGovernance.waitForDeployment();
  console.log("VotingGovernance redeployed to:", await votingGovernance.getAddress());

  // Log the new contract address
  console.log("\nNew Contract Address:");
  console.log("-------------------");
  console.log("VotingGovernance:", await votingGovernance.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 