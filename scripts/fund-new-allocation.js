// scripts/fund-new-allocation.js
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Funding new FundAllocation contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get the new FundAllocation address
  const fundAllocationAddress = addresses.FUND_ALLOCATION;
  console.log("FundAllocation address:", fundAllocationAddress);
  
  // Check current balance
  const currentBalance = await ethers.provider.getBalance(fundAllocationAddress);
  console.log(`Current balance: ${ethers.formatEther(currentBalance)} ETH`);
  
  // Send funds to the contract (1 ETH)
  const amountToSend = ethers.parseEther("1.0");
  console.log(`Sending ${ethers.formatEther(amountToSend)} ETH to FundAllocation contract...`);
  
  const tx = await deployer.sendTransaction({
    to: fundAllocationAddress,
    value: amountToSend
  });
  
  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  console.log("Transaction confirmed!");
  
  // Check the new balance
  const newBalance = await ethers.provider.getBalance(fundAllocationAddress);
  console.log(`New balance: ${ethers.formatEther(newBalance)} ETH`);
  
  console.log("Funding completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Funding failed!");
    console.error(error);
    process.exit(1);
  });