const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Funding the FundAllocation contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get the FundAllocation contract address
  const fundAllocationAddress = addresses.FUND_ALLOCATION;
  console.log("FundAllocation contract address:", fundAllocationAddress);

  // Check current balance
  const currentBalance = await ethers.provider.getBalance(fundAllocationAddress);
  console.log("Current balance:", ethers.formatEther(currentBalance), "ETH");

  // Ask for amount to send
  const amountToSend = ethers.parseEther("1.0"); // Default to 1 ETH
  console.log(`Sending ${ethers.formatEther(amountToSend)} ETH to the FundAllocation contract...`);

  // Send ETH to the contract
  const tx = await deployer.sendTransaction({
    to: fundAllocationAddress,
    value: amountToSend
  });
  
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Transaction confirmed!");

  // Check new balance
  const newBalance = await ethers.provider.getBalance(fundAllocationAddress);
  console.log("New balance:", ethers.formatEther(newBalance), "ETH");
  console.log(`Added ${ethers.formatEther(amountToSend)} ETH to the contract`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
