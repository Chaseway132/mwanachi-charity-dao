const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 CHECKING TRANSACTION HISTORY\n");

  const addressesPath = "./deployedAddresses.json";
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ deployedAddresses.json not found!");
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const userAddress = "0x514B993c0c9Ee55420EF626D8A2c8BF4123de54C";

  console.log("📋 Addresses:");
  console.log(`  User: ${userAddress}`);
  console.log(`  DonationTracking: ${addresses.DONATION_TRACKING}`);
  console.log(`  FundAllocation: ${addresses.FUND_ALLOCATION}`);
  console.log(`  CharityDAOPlatform: ${addresses.CHARITY_DAO_PLATFORM}\n`);

  // Get current block number
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  console.log(`📊 Current Block: ${currentBlock}\n`);

  // Get all transactions from user to DonationTracking
  console.log("🔎 SEARCHING FOR TRANSACTIONS...\n");

  // Check balance history
  const dtBalance = await hre.ethers.provider.getBalance(addresses.DONATION_TRACKING);
  const faBalance = await hre.ethers.provider.getBalance(addresses.FUND_ALLOCATION);
  const platformBalance = await hre.ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);

  console.log("💰 CURRENT BALANCES:");
  console.log(`  DonationTracking: ${hre.ethers.formatEther(dtBalance)} ETH`);
  console.log(`  FundAllocation: ${hre.ethers.formatEther(faBalance)} ETH`);
  console.log(`  CharityDAOPlatform: ${hre.ethers.formatEther(platformBalance)} ETH\n`);

  // Get DonationTracking contract
  const DonationTracking = await hre.ethers.getContractAt(
    "DonationTracking",
    addresses.DONATION_TRACKING
  );

  // Get all donations
  const donations = await DonationTracking.getAllDonations();
  console.log("📝 DONATIONS IN CONTRACT:");
  console.log(`  Total: ${donations.length}`);
  
  let totalDonated = 0n;
  donations.forEach((d, i) => {
    const amount = BigInt(d.amount);
    totalDonated += amount;
    console.log(`    ${i + 1}. ${hre.ethers.formatEther(amount)} ETH from ${d.donor}`);
  });
  console.log(`  Total Donated: ${hre.ethers.formatEther(totalDonated)} ETH\n`);

  // Check if there are any events
  console.log("📡 CHECKING EVENTS...\n");

  // Get DonationReceived events
  const donationEvents = await DonationTracking.queryFilter(
    DonationTracking.filters.DonationReceived()
  );
  console.log(`  DonationReceived events: ${donationEvents.length}`);
  donationEvents.forEach((event, i) => {
    console.log(`    ${i + 1}. Block ${event.blockNumber}: ${hre.ethers.formatEther(event.args[2])} ETH`);
  });

  // Get FundsReceived events from FundAllocation
  const FundAllocation = await hre.ethers.getContractAt(
    "FundAllocation",
    addresses.FUND_ALLOCATION
  );
  const fundsReceivedEvents = await FundAllocation.queryFilter(
    FundAllocation.filters.FundsReceived()
  );
  console.log(`\n  FundsReceived events: ${fundsReceivedEvents.length}`);
  fundsReceivedEvents.forEach((event, i) => {
    console.log(`    ${i + 1}. Block ${event.blockNumber}: ${hre.ethers.formatEther(event.args[1])} ETH from ${event.args[0]}`);
  });

  console.log("\n🎯 ANALYSIS:");
  console.log(`  Donations recorded: ${donations.length}`);
  console.log(`  Total in donations: ${hre.ethers.formatEther(totalDonated)} ETH`);
  console.log(`  Total in contracts: ${hre.ethers.formatEther(dtBalance + faBalance + platformBalance)} ETH`);
  console.log(`  DonationReceived events: ${donationEvents.length}`);
  console.log(`  FundsReceived events: ${fundsReceivedEvents.length}`);

  if (totalDonated.toString() !== (dtBalance + faBalance + platformBalance).toString()) {
    console.log("\n  ⚠️  MISMATCH: Donations recorded don't match funds in contracts!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

