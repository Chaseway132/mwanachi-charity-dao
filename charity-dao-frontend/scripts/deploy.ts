import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = await ProposalManagement.deploy();
  await proposalManagement.waitForDeployment();

  console.log("ProposalManagement deployed to:", await proposalManagement.getAddress());

  // Grant roles to the deployer
  const PROPOSER_ROLE = await proposalManagement.PROPOSER_ROLE();
  const VOTER_ROLE = await proposalManagement.VOTER_ROLE();
  const EXECUTOR_ROLE = await proposalManagement.EXECUTOR_ROLE();

  await proposalManagement.grantRole(PROPOSER_ROLE, deployer.address);
  await proposalManagement.grantRole(VOTER_ROLE, deployer.address);
  await proposalManagement.grantRole(EXECUTOR_ROLE, deployer.address);

  console.log("Roles granted to deployer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 