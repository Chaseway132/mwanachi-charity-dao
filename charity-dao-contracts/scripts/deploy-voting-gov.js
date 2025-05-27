const fs = require("fs");
const addresses = require("../deployedAddresses.json");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy the NEW VotingGovernance
  const VotingGovernance = await ethers.getContractFactory("VotingGovernance");
  const votingGov = await VotingGovernance.deploy(
    addresses.PROPOSAL_MANAGEMENT,   // existing ProposalManagement
    addresses.DONATION_TRACKING,     // existing DonationTracking
    deployer.address                 // owner / admin
  );
  await votingGov.waitForDeployment();
  const newVGAddr = await votingGov.getAddress();
  console.log("VotingGovernance deployed at:", newVGAddr);

  // 2. Tell ProposalManagement to use the new VG instance
  const pm = await ethers.getContractAt(
    "ProposalManagement",
    addresses.PROPOSAL_MANAGEMENT
  );
  const tx = await pm.setVotingGovernanceContract(newVGAddr);
  await tx.wait();
  console.log("ProposalManagement updated ✔");

  // 3. Persist new address for the front-end
  addresses.VOTING_GOVERNANCE = newVGAddr;
  fs.writeFileSync("deployedAddresses.json", JSON.stringify(addresses, null, 2));
  console.log("Updated deployedAddresses.json");

  // (optional) emit a TS helper for the React app
  fs.writeFileSync(
    "charity-dao-frontend/src/contracts/deployedAddresses.ts",
    `export const DEPLOYED_ADDRESSES = ${JSON.stringify(addresses, null, 2)} as const;`
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });