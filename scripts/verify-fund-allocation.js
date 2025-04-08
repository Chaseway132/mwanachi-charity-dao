const { ethers } = require("hardhat");
const { FUND_ALLOCATION, CHARITY_DAO_PLATFORM } = require("../charity-dao-frontend/src/config/contracts");

async function main() {
  console.log("Verifying FundAllocation contract configuration...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);
  
  // Get contract instances
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(FUND_ALLOCATION);
  
  // Check owner
  const owner = await fundAllocation.owner();
  console.log("FundAllocation owner:", owner);
  console.log("Is deployer the owner:", owner.toLowerCase() === deployer.address.toLowerCase());
  
  // Check platform contract
  const platformContract = await fundAllocation.platformContract();
  console.log("Current platform contract:", platformContract);
  console.log("Expected platform contract:", CHARITY_DAO_PLATFORM);
  console.log("Platform contract matches:", platformContract.toLowerCase() === CHARITY_DAO_PLATFORM.toLowerCase());
  
  // Check balance
  const balance = await ethers.provider.getBalance(FUND_ALLOCATION);
  console.log("FundAllocation balance:", ethers.formatEther(balance), "ETH");
  
  // Fix platform contract if needed
  if (platformContract.toLowerCase() !== CHARITY_DAO_PLATFORM.toLowerCase()) {
    console.log("Platform contract mismatch. Updating...");
    const setPlatformTx = await fundAllocation.setPlatformContract(CHARITY_DAO_PLATFORM);
    await setPlatformTx.wait();
    
    // Verify
    const updatedPlatform = await fundAllocation.platformContract();
    console.log("Updated platform contract:", updatedPlatform);
    console.log("Platform contract correctly updated:", updatedPlatform.toLowerCase() === CHARITY_DAO_PLATFORM.toLowerCase());
  } else {
    console.log("Platform contract correctly configured.");
  }
  
  // Send additional ETH if balance is low
  if (balance < ethers.parseEther("0.5")) {
    console.log("Balance is low. Sending 1 ETH...");
    const tx = await deployer.sendTransaction({
      to: FUND_ALLOCATION,
      value: ethers.parseEther("1.0")
    });
    await tx.wait();
    
    const newBalance = await ethers.provider.getBalance(FUND_ALLOCATION);
    console.log("Updated balance:", ethers.formatEther(newBalance), "ETH");
  }
  
  console.log("Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 