const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 CHECKING IF CONTRACTS ARE DEPLOYED\n");

  const addressesPath = "./deployedAddresses.json";
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ deployedAddresses.json not found!");
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  console.log("📋 Checking addresses:\n");

  for (const [name, address] of Object.entries(addresses)) {
    try {
      const code = await hre.ethers.provider.getCode(address);
      const balance = await hre.ethers.provider.getBalance(address);
      
      if (code === '0x') {
        console.log(`❌ ${name}: NOT DEPLOYED`);
        console.log(`   Address: ${address}`);
      } else {
        console.log(`✅ ${name}: DEPLOYED`);
        console.log(`   Address: ${address}`);
        console.log(`   Code length: ${code.length} bytes`);
        console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}`);
    }
    console.log();
  }

  // Now test calling getAllDonations on CharityDAOPlatform
  console.log("\n🧪 TESTING getAllDonations() CALL\n");
  
  try {
    const CharityDAOPlatform = await hre.ethers.getContractAt(
      "CharityDAOPlatform",
      addresses.CHARITY_DAO_PLATFORM
    );

    console.log(`Calling getAllDonations() on ${addresses.CHARITY_DAO_PLATFORM}...`);
    const donations = await CharityDAOPlatform.getAllDonations();
    console.log(`✅ Success! Got ${donations.length} donations`);
    donations.forEach((d, i) => {
      console.log(`  ${i + 1}. ${hre.ethers.formatEther(d.amount)} ETH from ${d.donor}`);
    });
  } catch (error) {
    console.log(`❌ Error calling getAllDonations():`);
    console.log(`   ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

