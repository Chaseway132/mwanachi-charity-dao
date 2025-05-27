const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting donation process...");

  try {
    // Load deployed addresses
    const addressesPath = path.join(__dirname, '../../deployedAddresses.json');
    console.log("Loading addresses from:", addressesPath);
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    // Get contract instances
    const DonationTracking = await ethers.getContractFactory("DonationTracking");
    const donationTracking = await DonationTracking.attach(addresses.DONATION_TRACKING);

    // Get the test accounts
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("\nDeployer address:", deployerAddress);

    // Check initial stakeholder status
    console.log("\nChecking initial stakeholder status:");
    const initialStatus = await donationTracking.isStakeholder(deployerAddress);
    console.log("Is stakeholder before donation:", initialStatus);

    // Make a donation (1.5 ETH)
    const donationAmount = ethers.parseEther("1.5");
    console.log("\nMaking donation of 1.5 ETH...");
    const tx = await donationTracking.makeDonation({ value: donationAmount });
    await tx.wait();
    console.log("Donation successful!");

    // Check final stakeholder status
    console.log("\nChecking final stakeholder status:");
    const finalStatus = await donationTracking.isStakeholder(deployerAddress);
    console.log("Is stakeholder after donation:", finalStatus);

    // Get total donations
    const totalDonations = await donationTracking.getTotalDonations();
    console.log("\nTotal donations:", ethers.formatEther(totalDonations), "ETH");

    console.log("\nDonation process completed successfully!");

  } catch (error) {
    console.error("\nDonation failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nTop-level error:");
    console.error(error);
    process.exit(1);
  }); 