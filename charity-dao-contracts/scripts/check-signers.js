const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the ProposalManagement contract
    const proposalManagementAddress = require('../../deployedAddresses.json').PROPOSAL_MANAGEMENT;
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalContract = ProposalManagement.attach(proposalManagementAddress);

    // Get contract owner
    const owner = await proposalContract.owner();
    console.log("\nContract owner:", owner);

    // Get signer count
    const signerCount = await proposalContract.signerCount();
    console.log("\nSigner count:", signerCount.toString());

    // Get all authorized signers
    const signerList = await proposalContract.getAuthorizedSigners();
    console.log("\nAuthorized signers:", signerList);

    // Check if owner is authorized signer
    const isOwnerSigner = await proposalContract.isAuthorizedSigner(owner);
    console.log("\nIs owner an authorized signer?", isOwnerSigner);

    // Get deployer's address
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("\nDeployer address:", deployerAddress);
    console.log("Is deployer owner?", deployerAddress === owner);
    console.log("Is deployer authorized signer?", await proposalContract.isAuthorizedSigner(deployerAddress));

  } catch (error) {
    console.error("\nError checking signers:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 