const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("\nRedeploying ProposalManagement contract...");

    // Get signers
    const [deployer, signer1, signer2] = await ethers.getSigners();
    console.log("\nDeployer:", deployer.address);
    console.log("Additional signers:", signer1.address, signer2.address);

    // Deploy new ProposalManagement contract
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const proposalManagement = await ProposalManagement.deploy();
    await proposalManagement.waitForDeployment();
    const proposalManagementAddress = await proposalManagement.getAddress();
    console.log("\nProposalManagement deployed to:", proposalManagementAddress);

    // Add additional signers
    console.log("\nAdding signers...");
    const tx1 = await proposalManagement.addSigner(signer1.address);
    await tx1.wait();
    console.log("Added signer 1:", signer1.address);

    const tx2 = await proposalManagement.addSigner(signer2.address);
    await tx2.wait();
    console.log("Added signer 2:", signer2.address);

    // Verify final configuration
    const owner = await proposalManagement.owner();
    const signerList = await proposalManagement.getAuthorizedSigners();
    const signerCount = await proposalManagement.signerCount();

    console.log("\nFinal configuration:");
    console.log("Owner:", owner);
    console.log("Signer count:", signerCount.toString());
    console.log("Authorized signers:", signerList);

    // Update deployedAddresses.json
    const addressesPath = path.join(__dirname, '../../deployedAddresses.json');
    const addresses = require(addressesPath);
    addresses.PROPOSAL_MANAGEMENT = proposalManagementAddress;
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("\nUpdated contract address in deployedAddresses.json");

    // Update TypeScript file
    const tsPath = path.join(__dirname, '../../charity-dao-frontend/src/contracts/deployedAddresses.ts');
    const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${proposalManagementAddress}",
  FUND_ALLOCATION: "${addresses.FUND_ALLOCATION}",
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${addresses.CHARITY_DAO_PLATFORM}"
} as const;`;
    fs.writeFileSync(tsPath, tsContent);
    console.log("Updated contract address in deployedAddresses.ts");

  } catch (error) {
    console.error("\nError redeploying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 