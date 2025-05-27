const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== TESTING DONATION FLOW WITH SECURE FUND ALLOCATION ===\n");
  
  // Get the deployed contract addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("Loading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Connect to contracts
  console.log("\nConnecting to contracts...");
  const platform = await ethers.getContractAt("CharityDAOPlatform", addresses.CHARITY_DAO_PLATFORM);
  const secureFundAllocation = await ethers.getContractAt("SecureFundAllocation", addresses.SECURE_FUND_ALLOCATION);
  const donationTracking = await ethers.getContractAt("DonationTracking", addresses.DONATION_TRACKING);
  
  // Verify contract connections
  console.log("\nVerifying contract connections...");
  const fundAllocationInPlatform = await platform.fundAllocationContract();
  console.log("FundAllocation in CharityDAOPlatform:", fundAllocationInPlatform);
  console.log("Expected SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  console.log("Is correctly set:", fundAllocationInPlatform.toLowerCase() === addresses.SECURE_FUND_ALLOCATION.toLowerCase());
  
  const platformInFundAllocation = await secureFundAllocation.platformContract();
  console.log("\nPlatform in SecureFundAllocation:", platformInFundAllocation);
  console.log("Expected CharityDAOPlatform:", addresses.CHARITY_DAO_PLATFORM);
  console.log("Is correctly set:", platformInFundAllocation.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  
  const fundAllocationInDonation = await donationTracking.fundAllocationContract();
  console.log("\nFundAllocation in DonationTracking:", fundAllocationInDonation);
  console.log("Expected SecureFundAllocation:", addresses.SECURE_FUND_ALLOCATION);
  
  // If DonationTracking is not pointing to the SecureFundAllocation, we need to update it
  if (fundAllocationInDonation.toLowerCase() !== addresses.SECURE_FUND_ALLOCATION.toLowerCase()) {
    console.log("\n⚠️ DonationTracking is not pointing to the SecureFundAllocation!");
    console.log("This needs to be fixed for donations to flow correctly.");
    
    // Check if we can update it
    try {
      console.log("\nAttempting to update DonationTracking...");
      // This assumes there's a function to update the FundAllocation reference
      // If there isn't, you'll need to redeploy the DonationTracking contract
      if (typeof donationTracking.setFundAllocationContract === 'function') {
        const tx = await donationTracking.setFundAllocationContract(addresses.SECURE_FUND_ALLOCATION);
        await tx.wait();
        console.log("DonationTracking updated successfully!");
      } else {
        console.log("DonationTracking does not have a function to update the FundAllocation reference.");
        console.log("You may need to redeploy the DonationTracking contract.");
      }
    } catch (error) {
      console.error("Error updating DonationTracking:", error.message);
    }
  } else {
    console.log("✅ DonationTracking is correctly pointing to the SecureFundAllocation");
  }
  
  // Check initial balances
  console.log("\nChecking initial balances...");
  const initialPlatformBalance = await ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);
  const initialFundBalance = await secureFundAllocation.getBalance();
  
  console.log("Initial CharityDAOPlatform balance:", ethers.formatEther(initialPlatformBalance), "ETH");
  console.log("Initial SecureFundAllocation balance:", ethers.formatEther(initialFundBalance), "ETH");
  
  // Make a test donation
  console.log("\nMaking a test donation of 0.1 ETH...");
  const donationAmount = ethers.parseEther("0.1");
  
  try {
    const tx = await platform.donate({ value: donationAmount });
    console.log("Donation transaction sent:", tx.hash);
    await tx.wait();
    console.log("Donation transaction confirmed!");
    
    // Check final balances
    console.log("\nChecking final balances...");
    const finalPlatformBalance = await ethers.provider.getBalance(addresses.CHARITY_DAO_PLATFORM);
    const finalFundBalance = await secureFundAllocation.getBalance();
    
    console.log("Final CharityDAOPlatform balance:", ethers.formatEther(finalPlatformBalance), "ETH");
    console.log("Final SecureFundAllocation balance:", ethers.formatEther(finalFundBalance), "ETH");
    
    // Calculate differences
    const platformDifference = finalPlatformBalance - initialPlatformBalance;
    const fundDifference = finalFundBalance - initialFundBalance;
    
    console.log("\nBalance differences:");
    console.log("CharityDAOPlatform difference:", ethers.formatEther(platformDifference), "ETH");
    console.log("SecureFundAllocation difference:", ethers.formatEther(fundDifference), "ETH");
    
    // Check if the donation was successful
    if (fundDifference >= donationAmount) {
      console.log("\n✅ Donation flow is working correctly!");
      console.log("The SecureFundAllocation balance increased by the donation amount.");
    } else {
      console.log("\n❌ Donation flow is not working correctly!");
      console.log("The SecureFundAllocation balance did not increase by the donation amount.");
      console.log("Expected increase:", ethers.formatEther(donationAmount), "ETH");
      console.log("Actual increase:", ethers.formatEther(fundDifference), "ETH");
    }
    
    // Check if the donation was recorded
    console.log("\nChecking if donation was recorded...");
    const donationCount = await donationTracking.donationCount();
    console.log("Total donation count:", donationCount);
    
    if (donationCount > 0) {
      const latestDonation = await donationTracking.donations(donationCount - 1n);
      console.log("\nLatest donation details:");
      console.log("ID:", latestDonation.id);
      console.log("Donor:", latestDonation.donor);
      console.log("Amount:", ethers.formatEther(latestDonation.amount), "ETH");
      console.log("Timestamp:", new Date(Number(latestDonation.timestamp) * 1000).toLocaleString());
      
      if (latestDonation.donor.toLowerCase() === deployer.address.toLowerCase() && 
          latestDonation.amount >= donationAmount) {
        console.log("\n✅ Donation was correctly recorded in DonationTracking!");
      } else {
        console.log("\n❌ Donation recording has issues!");
      }
    } else {
      console.log("\n❌ No donations recorded!");
    }
    
  } catch (error) {
    console.error("Error making donation:", error);
    console.log("\nDonation flow test failed. Please check the contract connections.");
  }
  
  console.log("\n=== DONATION FLOW TEST COMPLETED ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
