const { ethers } = require("hardhat");

async function main() {
  console.log("Fixing contract permissions and connections...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Connected account:", deployer.address);

  try {
    // Get deployed addresses from deployedAddresses.json
    const addresses = require('../../deployedAddresses.json');
    console.log("\nLoaded contract addresses:", addresses);

    // Get contract instances
    const FundAllocation = await ethers.getContractFactory("FundAllocation");
    const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");

    const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
    const proposalManagement = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
    const charityDAOPlatform = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);

    // Step 1: Set platform contract in FundAllocation
    console.log("\nStep 1: Setting platform contract in FundAllocation...");
    const platformTx = await fundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
    await platformTx.wait();
    console.log("Platform contract set successfully");

    // Step 2: Set fund allocation contract in ProposalManagement
    console.log("\nStep 2: Setting fund allocation contract in ProposalManagement...");
    const fundTx = await proposalManagement.setFundAllocationContract(addresses.FUND_ALLOCATION);
    await fundTx.wait();
    console.log("Fund allocation contract set successfully");

    // Step 3: Verify settings
    console.log("\nVerifying settings...");
    
    const platformContract = await fundAllocation.platformContract();
    console.log("FundAllocation platform contract:", platformContract);
    console.log("Expected platform contract:", addresses.CHARITY_DAO_PLATFORM);
    console.log("Platform contract correctly set:", platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());

    const fundContract = await proposalManagement.fundAllocationContract();
    console.log("\nProposalManagement fund allocation contract:", fundContract);
    console.log("Expected fund allocation contract:", addresses.FUND_ALLOCATION);
    console.log("Fund allocation contract correctly set:", fundContract.toLowerCase() === addresses.FUND_ALLOCATION.toLowerCase());

    console.log("\nPermissions fixed successfully!");

  } catch (error) {
    console.error("Error fixing permissions:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 