const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Fixing contract permissions...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get contract instances
  console.log("\nConnecting to contracts...");
  
  const CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
  const charityDAOPlatform = CharityDAOPlatform.attach(addresses.CHARITY_DAO_PLATFORM);
  console.log("CharityDAOPlatform at:", await charityDAOPlatform.getAddress());
  
  const FundAllocation = await ethers.getContractFactory("FundAllocation");
  const fundAllocation = FundAllocation.attach(addresses.FUND_ALLOCATION);
  console.log("FundAllocation at:", await fundAllocation.getAddress());
  
  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  console.log("ProposalManagement at:", await proposalManagement.getAddress());

  // Check if we're the owner of CharityDAOPlatform
  const platformOwner = await charityDAOPlatform.owner();
  console.log("\nCharityDAOPlatform owner:", platformOwner);
  
  const isPlatformOwner = platformOwner.toLowerCase() === deployer.address.toLowerCase();
  console.log("Are we the owner of CharityDAOPlatform?", isPlatformOwner);
  
  if (!isPlatformOwner) {
    console.log("We are not the owner of CharityDAOPlatform. Cannot proceed with fixes.");
    return;
  }

  // Step 1: Set the platform contract in FundAllocation
  console.log("\nStep 1: Setting platform contract in FundAllocation...");
  
  try {
    // Use the CharityDAOPlatform's method to set itself as the platform contract
    console.log("Calling setFundAllocationPlatform() on CharityDAOPlatform...");
    const tx1 = await charityDAOPlatform.setFundAllocationPlatform();
    await tx1.wait();
    console.log("Platform contract set successfully!");
    
    // Verify the update
    const platformContract = await fundAllocation.platformContract();
    console.log("FundAllocation platform contract is now:", platformContract);
    console.log("Is CharityDAOPlatform set as platform?", 
      platformContract.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase());
  } catch (error) {
    console.error("Error setting platform contract:", error.message);
    
    // Try direct approach if the first method fails
    try {
      console.log("\nTrying direct approach to set platform contract...");
      
      // Check if we're the owner of FundAllocation
      const fundOwner = await fundAllocation.owner();
      console.log("FundAllocation owner:", fundOwner);
      
      const isFundOwner = fundOwner.toLowerCase() === deployer.address.toLowerCase();
      console.log("Are we the owner of FundAllocation?", isFundOwner);
      
      if (isFundOwner) {
        console.log("Setting platform contract directly on FundAllocation...");
        const tx2 = await fundAllocation.setPlatformContract(addresses.CHARITY_DAO_PLATFORM);
        await tx2.wait();
        console.log("Platform contract set successfully!");
        
        // Verify the update
        const platformContract = await fundAllocation.platformContract();
        console.log("FundAllocation platform contract is now:", platformContract);
      } else {
        console.log("We are not the owner of FundAllocation. Cannot set platform contract directly.");
      }
    } catch (innerError) {
      console.error("Error with direct approach:", innerError.message);
    }
  }

  // Step 2: Check and fix ownership of FundAllocation
  console.log("\nStep 2: Checking ownership of FundAllocation...");
  
  const fundOwner = await fundAllocation.owner();
  console.log("FundAllocation owner:", fundOwner);
  
  const isFundOwner = fundOwner.toLowerCase() === deployer.address.toLowerCase();
  console.log("Are we the owner of FundAllocation?", isFundOwner);
  
  const isPlatformFundOwner = fundOwner.toLowerCase() === addresses.CHARITY_DAO_PLATFORM.toLowerCase();
  console.log("Is CharityDAOPlatform the owner of FundAllocation?", isPlatformFundOwner);
  
  if (isFundOwner) {
    console.log("Transferring ownership of FundAllocation to CharityDAOPlatform...");
    const tx3 = await fundAllocation.transferOwnership(addresses.CHARITY_DAO_PLATFORM);
    await tx3.wait();
    console.log("Ownership transferred successfully!");
    
    // Verify the update
    const newFundOwner = await fundAllocation.owner();
    console.log("FundAllocation owner is now:", newFundOwner);
  } else if (isPlatformFundOwner) {
    console.log("CharityDAOPlatform is already the owner of FundAllocation. No action needed.");
  } else {
    console.log("We are not the owner of FundAllocation and neither is CharityDAOPlatform.");
    console.log("Consider deploying a new FundAllocation contract with correct ownership.");
  }

  // Step 3: Check if we're an authorized signer in ProposalManagement
  console.log("\nStep 3: Checking if we're an authorized signer...");
  
  const isSigner = await proposalManagement.authorizedSigners(deployer.address);
  console.log("Are we an authorized signer?", isSigner);
  
  if (!isSigner) {
    // Check if we can add ourselves as a signer
    const proposalOwner = await proposalManagement.owner();
    console.log("ProposalManagement owner:", proposalOwner);
    
    const isProposalOwner = proposalOwner.toLowerCase() === deployer.address.toLowerCase();
    console.log("Are we the owner of ProposalManagement?", isProposalOwner);
    
    if (isProposalOwner) {
      console.log("Adding ourselves as a signer...");
      const tx4 = await proposalManagement.addSigner(deployer.address);
      await tx4.wait();
      console.log("Added as signer successfully!");
      
      // Verify the update
      const isNowSigner = await proposalManagement.authorizedSigners(deployer.address);
      console.log("Are we now an authorized signer?", isNowSigner);
    } else {
      console.log("We are not the owner of ProposalManagement. Cannot add ourselves as a signer.");
    }
  }

  console.log("\nContract permissions check and fix completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
