const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Diagnosing Donation Flow Issues...\n");

  // Get deployed addresses
  const addressesPath = "./deployedAddresses.json";
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ deployedAddresses.json not found!");
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  console.log("📋 Deployed Addresses:");
  console.log(`  CharityDAOPlatform: ${addresses.CHARITY_DAO_PLATFORM}`);
  console.log(`  DonationTracking: ${addresses.DONATION_TRACKING}`);
  console.log(`  FundAllocation: ${addresses.FUND_ALLOCATION}`);
  console.log(`  ProposalManagement: ${addresses.PROPOSAL_MANAGEMENT}`);
  console.log(`  VotingGovernance: ${addresses.VOTING_GOVERNANCE}\n`);

  // Get contracts
  const CharityDAOPlatform = await hre.ethers.getContractAt(
    "CharityDAOPlatform",
    addresses.CHARITY_DAO_PLATFORM
  );
  const DonationTracking = await hre.ethers.getContractAt(
    "DonationTracking",
    addresses.DONATION_TRACKING
  );
  const FundAllocation = await hre.ethers.getContractAt(
    "FundAllocation",
    addresses.FUND_ALLOCATION
  );

  // Check balances
  console.log("💰 Current Balances:");
  const dtBalance = await hre.ethers.provider.getBalance(addresses.DONATION_TRACKING);
  const faBalance = await hre.ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  console.log(`  DonationTracking: ${hre.ethers.formatEther(dtBalance)} ETH`);
  console.log(`  FundAllocation: ${hre.ethers.formatEther(faBalance)} ETH\n`);

  // Check donations recorded
  console.log("📝 Donations Recorded:");
  try {
    const donations = await DonationTracking.getAllDonations();
    const donationCount = await DonationTracking.donationCount();
    console.log(`  Total donations: ${donations.length}`);
    console.log(`  Donation count from contract: ${donationCount.toString()}`);

    let totalDonated = 0n;
    if (donations.length > 0) {
      donations.forEach((d, i) => {
        const amount = BigInt(d.amount);
        totalDonated += amount;
        console.log(`    ${i + 1}. ID: ${d.id}, Donor: ${d.donor}, Amount: ${hre.ethers.formatEther(amount)} ETH, Time: ${new Date(Number(d.timestamp) * 1000).toLocaleString()}`);
      });
      console.log(`  Total donated: ${hre.ethers.formatEther(totalDonated)} ETH`);
    } else {
      console.log("  ❌ NO DONATIONS RECORDED!");
    }
  } catch (error) {
    console.error(`  ❌ Error reading donations: ${error.message}`);
  }

  console.log("\n🔗 Contract Links:");
  try {
    const dtFundAlloc = await DonationTracking.fundAllocationContract();
    console.log(`  DonationTracking → FundAllocation: ${dtFundAlloc}`);
    console.log(`  Expected: ${addresses.FUND_ALLOCATION}`);
    console.log(`  Match: ${dtFundAlloc.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase() ? "✅" : "❌"}`);
  } catch (error) {
    console.error(`  ❌ Error checking links: ${error.message}`);
  }

  console.log("\n🎯 Diagnosis:");

  // Check CharityDAOPlatform balance
  const platformBalance = await hre.ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);
  console.log(`  CharityDAOPlatform Balance: ${hre.ethers.formatEther(platformBalance)} ETH`);

  if (dtBalance > 0n && faBalance === 0n) {
    console.log("\n  ⚠️  ISSUE FOUND:");
    console.log("  - Funds are in DonationTracking");
    console.log("  - But NOT transferred to FundAllocation");
    console.log("  - This means donate() function is NOT being called");
    console.log("  - Funds are going directly via receive() function");
    console.log("\n  SOLUTION:");
    console.log("  - The frontend should call CharityDAOPlatform.donate()");
    console.log("  - Which calls DonationTracking.donate()");
    console.log("  - Which records the donation AND transfers to FundAllocation");
  } else if (dtBalance === 0n && faBalance > 0n) {
    console.log("\n  ✅ WORKING CORRECTLY:");
    console.log("  - Funds are in FundAllocation");
    console.log("  - Donations are being recorded");
    console.log("  - Ready for proposals to use these funds");
  } else if (dtBalance === 0n && faBalance === 0n) {
    console.log("\n  ⚠️  NO FUNDS:");
    console.log("  - No donations have been made yet");
  } else {
    console.log("\n  ⚠️  MIXED STATE:");
    console.log("  - Funds in both contracts");
    console.log("  - Some donations may not have been transferred");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

