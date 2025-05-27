const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== MAKING A TEST DONATION TO SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Connect to contracts
  console.log("\nConnecting to contracts...");
  const platform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  
  // Check initial balances
  console.log("\nChecking initial balances...");
  const initialFundBalance = await secureFundAllocation.getBalance();
  console.log("Initial SecureFundAllocation balance:", ethers.formatEther(initialFundBalance), "ETH");
  
  // Make a donation
  console.log("\nMaking a donation of 0.1 ETH...");
  const donationAmount = ethers.parseEther("0.1");
  
  try {
    const tx = await platform.donate({ value: donationAmount });
    console.log("Donation transaction sent:", tx.hash);
    await tx.wait();
    console.log("Donation transaction confirmed!");
    
    // Check final balance
    console.log("\nChecking final balance...");
    const finalFundBalance = await secureFundAllocation.getBalance();
    console.log("Final SecureFundAllocation balance:", ethers.formatEther(finalFundBalance), "ETH");
    
    // Calculate difference
    const difference = finalFundBalance - initialFundBalance;
    console.log("\nBalance difference:", ethers.formatEther(difference), "ETH");
    
    if (difference >= donationAmount) {
      console.log("\n✅ Donation successful! The SecureFundAllocation balance increased.");
    } else {
      console.log("\n❌ Donation issue! The SecureFundAllocation balance did not increase as expected.");
    }
  } catch (error) {
    console.error("Error making donation:", error);
  }
  
  console.log("\n=== TEST DONATION COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
