const { ethers } = require("hardhat");
const { FUND_ALLOCATION } = require("../charity-dao-frontend/src/config/contracts");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Sending funds with the account:", deployer.address);

  // Amount to send (0.5 ETH should be enough for test proposals)
  const amountToSend = ethers.parseEther("0.5");

  // Send funds to the FundAllocation contract
  const tx = await deployer.sendTransaction({
    to: FUND_ALLOCATION,
    value: amountToSend
  });

  console.log(`Sending ${ethers.formatEther(amountToSend)} ETH to FundAllocation contract at ${FUND_ALLOCATION}`);
  console.log(`Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  if (receipt.status === 1) {
    console.log("Transaction confirmed successfully!");
  } else {
    console.log("Transaction failed!");
  }

  // Check the balance of the FundAllocation contract
  const balance = await ethers.provider.getBalance(FUND_ALLOCATION);
  console.log(`FundAllocation contract balance: ${ethers.formatEther(balance)} ETH`);

  console.log("\nNow you can execute the proposal!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 