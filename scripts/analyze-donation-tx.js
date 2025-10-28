const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 ANALYZING DONATION TRANSACTIONS\n");

  const addressesPath = "./deployedAddresses.json";
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ deployedAddresses.json not found!");
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const userAddress = "0x514B993c0c9Ee55420EF626D8A2c8BF4123de54C";

  console.log("📋 Addresses:");
  console.log(`  User: ${userAddress}`);
  console.log(`  CharityDAOPlatform: ${addresses.CHARITY_DAO_PLATFORM}`);
  console.log(`  DonationTracking: ${addresses.DONATION_TRACKING}\n`);

  // Get the CharityDAOPlatform contract
  const CharityDAOPlatform = await hre.ethers.getContractAt(
    "CharityDAOPlatform",
    addresses.CHARITY_DAO_PLATFORM
  );

  // Get all donations from the platform
  console.log("📝 GETTING DONATIONS FROM PLATFORM...\n");
  const donations = await CharityDAOPlatform.getAllDonations();
  
  console.log(`Total donations: ${donations.length}`);
  donations.forEach((d, i) => {
    console.log(`\n  Donation ${i + 1}:`);
    console.log(`    ID: ${d.id}`);
    console.log(`    Donor: ${d.donor}`);
    console.log(`    Amount: ${hre.ethers.formatEther(d.amount)} ETH`);
    console.log(`    Timestamp: ${new Date(Number(d.timestamp) * 1000).toLocaleString()}`);
  });

  // Get the DonationTracking contract directly
  const DonationTracking = await hre.ethers.getContractAt(
    "DonationTracking",
    addresses.DONATION_TRACKING
  );

  console.log("\n\n📝 GETTING DONATIONS FROM DONATION TRACKING...\n");
  const dtDonations = await DonationTracking.getAllDonations();
  
  console.log(`Total donations: ${dtDonations.length}`);
  dtDonations.forEach((d, i) => {
    console.log(`\n  Donation ${i + 1}:`);
    console.log(`    ID: ${d.id}`);
    console.log(`    Donor: ${d.donor}`);
    console.log(`    Amount: ${hre.ethers.formatEther(d.amount)} ETH`);
    console.log(`    Timestamp: ${new Date(Number(d.timestamp) * 1000).toLocaleString()}`);
  });

  // Check if they match
  console.log("\n\n🔍 COMPARISON:");
  console.log(`  Platform donations: ${donations.length}`);
  console.log(`  DonationTracking donations: ${dtDonations.length}`);
  
  if (donations.length === dtDonations.length) {
    console.log("  ✅ Counts match!");
  } else {
    console.log("  ❌ Counts don't match!");
  }

  // Check balances
  console.log("\n\n💰 BALANCES:");
  const dtBalance = await hre.ethers.provider.getBalance(addresses.DONATION_TRACKING);
  const faBalance = await hre.ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  
  console.log(`  DonationTracking: ${hre.ethers.formatEther(dtBalance)} ETH`);
  console.log(`  FundAllocation: ${hre.ethers.formatEther(faBalance)} ETH`);

  // Calculate total donated
  let totalDonated = 0n;
  dtDonations.forEach(d => {
    totalDonated += BigInt(d.amount);
  });

  console.log(`\n  Total donated: ${hre.ethers.formatEther(totalDonated)} ETH`);
  console.log(`  Total in contracts: ${hre.ethers.formatEther(dtBalance + faBalance)} ETH`);

  if (totalDonated === (dtBalance + faBalance)) {
    console.log("  ✅ Funds accounted for!");
  } else {
    console.log("  ❌ Funds mismatch!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

