const fs = require('fs');
const path = require('path');

async function main() {
  const deployedAddresses = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployedAddresses.json'), 'utf8')
  );

  console.log('Deployed Addresses:');
  console.log(JSON.stringify(deployedAddresses, null, 2));

  const provider = ethers.provider;
  
  console.log('\nVerifying contracts are deployed...\n');

  for (const [name, address] of Object.entries(deployedAddresses)) {
    try {
      const code = await provider.getCode(address);
      const balance = await provider.getBalance(address);
      
      if (code === '0x') {
        console.log(`❌ ${name}: NOT DEPLOYED at ${address}`);
      } else {
        console.log(`✅ ${name}: DEPLOYED at ${address}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
        console.log(`   Code length: ${code.length} bytes`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}`);
    }
  }

  // Test calling getBalance on FundAllocation
  console.log('\nTesting FundAllocation.getBalance()...');
  try {
    const FundAllocationABI = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../charity-dao-frontend/src/config/FundAllocation.json'), 'utf8')
    ).abi;

    const fundContract = new ethers.Contract(
      deployedAddresses.FUND_ALLOCATION,
      FundAllocationABI,
      provider
    );

    const balance = await fundContract.getBalance();
    console.log(`✅ FundAllocation.getBalance() returned: ${ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.log(`❌ FundAllocation.getBalance() failed: ${error.message}`);
  }

  // Test calling getAllDonations on CharityDAOPlatform
  console.log('\nTesting CharityDAOPlatform.getAllDonations()...');
  try {
    const CharityDAOPlatformABI = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../charity-dao-frontend/src/config/CharityDAOPlatform.json'), 'utf8')
    ).abi;

    const platformContract = new ethers.Contract(
      deployedAddresses.CHARITY_DAO_PLATFORM,
      CharityDAOPlatformABI,
      provider
    );

    const donations = await platformContract.getAllDonations();
    console.log(`✅ CharityDAOPlatform.getAllDonations() returned ${donations.length} donations`);
    if (donations.length > 0) {
      console.log('First donation:', donations[0]);
    }
  } catch (error) {
    console.log(`❌ CharityDAOPlatform.getAllDonations() failed: ${error.message}`);
  }
}

main().catch(console.error);

