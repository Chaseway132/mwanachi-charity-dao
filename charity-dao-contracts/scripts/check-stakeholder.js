const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking stakeholder status...");

  // Load deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../../deployedAddresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Get the DonationTracking contract
  const DonationTracking = await ethers.getContractFactory("DonationTracking");
  const donationTracking = await DonationTracking.attach(deployedAddresses.DONATION_TRACKING);

  try {
    // Check stakeholder status for the voter
    const voterAddress = "0xBcdB9B05cD47EE978347E8C91133845B121e0699";
    console.log("\nChecking stakeholder status for address:", voterAddress);
    
    const isStakeholder = await donationTracking.isStakeholder(voterAddress);
    console.log("Is stakeholder:", isStakeholder);

    // If not a stakeholder, let's check if we can register them
    if (!isStakeholder) {
      console.log("\nAttempting to register as stakeholder...");
      const tx = await donationTracking.registerStakeholder(voterAddress);
      await tx.wait();
      console.log("Successfully registered as stakeholder");
    }

    // Check stakeholder status again
    const isStakeholderAfter = await donationTracking.isStakeholder(voterAddress);
    console.log("\nFinal stakeholder status:", isStakeholderAfter);
  } catch (error) {
    console.error("Error checking stakeholder status:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 