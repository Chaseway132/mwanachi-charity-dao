const { ethers } = require("hardhat");

async function main() {
  console.log("Testing donation flow...");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Get deployed addresses
    const addresses = require('../../deployedAddresses.json');
    console.log("\nLoaded contract addresses:", addresses);

    // Get contract instances
    const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
    const FundAllocation = await ethers.getContractFactory("FundAllocation");
    
    const platform = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM).connect(deployer);
    const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);

    // Check initial balances
    const initialBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
    console.log("\nInitial FundAllocation balance:", ethers.formatEther(initialBalance), "ETH");

    // Make a test donation (0.5 ETH)
    const donationAmount = ethers.parseEther("0.5");
    console.log("\nMaking test donation of 0.5 ETH...");
    
    const tx = await platform.donate({ value: donationAmount });
    await tx.wait();
    console.log("Donation transaction completed!");

    // Check final balances
    const finalBalance = await ethers.provider.getBalance(addresses.FUND_ALLOCATION);
    console.log("\nFinal FundAllocation balance:", ethers.formatEther(finalBalance), "ETH");
    
    const difference = finalBalance - initialBalance;
    console.log("Balance difference:", ethers.formatEther(difference), "ETH");

    if (difference === donationAmount) {
      console.log("\n✅ Donation flow working correctly!");
    } else {
      console.log("\n❌ Donation flow may have issues - balance not increased as expected");
    }

  } catch (error) {
    console.error("\nError testing donation:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 