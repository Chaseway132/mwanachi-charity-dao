const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 DEEP DIAGNOSTIC - Finding Missing Funds\n");

  const addressesPath = "./deployedAddresses.json";
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ deployedAddresses.json not found!");
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  // Get all contract instances
  const DonationTracking = await hre.ethers.getContractAt(
    "DonationTracking",
    addresses.DONATION_TRACKING
  );
  const FundAllocation = await hre.ethers.getContractAt(
    "FundAllocation",
    addresses.FUND_ALLOCATION
  );
  const CharityDAOPlatform = await hre.ethers.getContractAt(
    "CharityDAOPlatform",
    addresses.CHARITY_DAO_PLATFORM
  );

  console.log("💰 BALANCE CHECK - All Contracts:");
  const dtBalance = await hre.ethers.provider.getBalance(addresses.DONATION_TRACKING);
  const faBalance = await hre.ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  const platformBalance = await hre.ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);
  const proposalBalance = await hre.ethers.provider.getBalance(addresses.PROPOSAL_MANAGEMENT);
  const votingBalance = await hre.ethers.provider.getBalance(addresses.VOTING_GOVERNANCE);

  console.log(`  DonationTracking: ${hre.ethers.formatEther(dtBalance)} ETH`);
  console.log(`  FundAllocation: ${hre.ethers.formatEther(faBalance)} ETH`);
  console.log(`  CharityDAOPlatform: ${hre.ethers.formatEther(platformBalance)} ETH`);
  console.log(`  ProposalManagement: ${hre.ethers.formatEther(proposalBalance)} ETH`);
  console.log(`  VotingGovernance: ${hre.ethers.formatEther(votingBalance)} ETH`);

  const totalInContracts = dtBalance + faBalance + platformBalance + proposalBalance + votingBalance;
  console.log(`  TOTAL IN CONTRACTS: ${hre.ethers.formatEther(totalInContracts)} ETH\n`);

  // Check donations
  console.log("📝 DONATIONS ANALYSIS:");
  const donations = await DonationTracking.getAllDonations();
  const donationCount = await DonationTracking.donationCount();
  
  console.log(`  Donations array length: ${donations.length}`);
  console.log(`  Donation count variable: ${donationCount.toString()}`);

  let totalRecorded = 0n;
  if (donations.length > 0) {
    donations.forEach((d, i) => {
      const amount = BigInt(d.amount);
      totalRecorded += amount;
      console.log(`    ${i + 1}. Donor: ${d.donor}, Amount: ${hre.ethers.formatEther(amount)} ETH`);
    });
  }
  console.log(`  Total recorded in donations: ${hre.ethers.formatEther(totalRecorded)} ETH\n`);

  // Check stakeholders
  console.log("👥 STAKEHOLDER CHECK:");
  const userAddress = "0x514B993c0c9Ee55420EF626D8A2c8BF4123de54C";
  const isStakeholder = await DonationTracking.isStakeholder(userAddress);
  console.log(`  User ${userAddress} is stakeholder: ${isStakeholder}\n`);

  // Analysis
  console.log("🔍 ANALYSIS:");
  console.log(`  Frontend shows Platform Balance: 0.08 ETH`);
  console.log(`  Smart contract shows DonationTracking: ${hre.ethers.formatEther(dtBalance)} ETH`);
  console.log(`  Smart contract shows FundAllocation: ${hre.ethers.formatEther(faBalance)} ETH`);
  console.log(`  Donations recorded: ${hre.ethers.formatEther(totalRecorded)} ETH\n`);

  if (totalRecorded.toString() !== totalInContracts.toString()) {
    console.log("  ⚠️  MISMATCH DETECTED:");
    console.log(`  - Donations recorded: ${hre.ethers.formatEther(totalRecorded)} ETH`);
    console.log(`  - Funds in contracts: ${hre.ethers.formatEther(totalInContracts)} ETH`);
    console.log(`  - Missing: ${hre.ethers.formatEther(totalInContracts - totalRecorded)} ETH`);
    console.log("\n  This means some donations went directly to receive() without being recorded!");
  }

  if (dtBalance > 0n) {
    console.log("\n  ⚠️  FUNDS STUCK IN DONATION TRACKING:");
    console.log(`  - ${hre.ethers.formatEther(dtBalance)} ETH is in DonationTracking`);
    console.log("  - This should have been transferred to FundAllocation");
    console.log("  - This means donate() function was NOT called");
    console.log("  - Funds went directly via receive() function");
  }

  if (faBalance > 0n && dtBalance === 0n) {
    console.log("\n  ✅ FUNDS PROPERLY TRANSFERRED:");
    console.log(`  - ${hre.ethers.formatEther(faBalance)} ETH is in FundAllocation`);
    console.log("  - These funds are ready for proposals");
  }

  console.log("\n🎯 CONCLUSION:");
  if (totalRecorded.toString() === "0") {
    console.log("  ❌ NO DONATIONS RECORDED AT ALL");
    console.log("  - All donations went to receive() function");
    console.log("  - donate() function was never called");
  } else if (totalInContracts > totalRecorded) {
    console.log("  ⚠️  PARTIAL DONATIONS RECORDED");
    console.log(`  - ${hre.ethers.formatEther(totalRecorded)} ETH recorded via donate()`);
    console.log(`  - ${hre.ethers.formatEther(totalInContracts - totalRecorded)} ETH via receive()`);
  } else if (dtBalance > 0n) {
    console.log("  ⚠️  FUNDS STUCK IN DONATION TRACKING");
    console.log("  - Donations were recorded but not transferred");
  } else {
    console.log("  ✅ ALL DONATIONS PROPERLY PROCESSED");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

