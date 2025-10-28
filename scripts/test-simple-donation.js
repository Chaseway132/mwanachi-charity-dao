const fs = require('fs');
const path = require('path');

async function main() {
  const deployedAddresses = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployedAddresses.json'), 'utf8')
  );

  console.log('=== TESTING DONATION FLOW ===\n');
  console.log('Deployed Addresses:');
  Object.entries(deployedAddresses).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  const provider = ethers.provider;
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log('\nSigner Address:', signerAddress);

  // Load ABIs
  const CharityDAOPlatformABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../charity-dao-frontend/src/config/CharityDAOPlatform.json'), 'utf8')
  ).abi;

  const DonationTrackingABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../charity-dao-frontend/src/config/DonationTracking.json'), 'utf8')
  ).abi;

  const FundAllocationABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../charity-dao-frontend/src/config/FundAllocation.json'), 'utf8')
  ).abi;

  // Create contract instances
  const platformContract = new ethers.Contract(
    deployedAddresses.CHARITY_DAO_PLATFORM,
    CharityDAOPlatformABI,
    signer
  );

  const donationContract = new ethers.Contract(
    deployedAddresses.DONATION_TRACKING,
    DonationTrackingABI,
    provider
  );

  const fundContract = new ethers.Contract(
    deployedAddresses.FUND_ALLOCATION,
    FundAllocationABI,
    provider
  );

  // Step 1: Check initial balances
  console.log('\n=== STEP 1: CHECK INITIAL BALANCES ===');
  const initialDonationBalance = await provider.getBalance(deployedAddresses.DONATION_TRACKING);
  const initialFundBalance = await provider.getBalance(deployedAddresses.FUND_ALLOCATION);
  console.log('DonationTracking balance:', ethers.formatEther(initialDonationBalance), 'ETH');
  console.log('FundAllocation balance:', ethers.formatEther(initialFundBalance), 'ETH');

  // Step 2: Check donation count
  console.log('\n=== STEP 2: CHECK DONATION COUNT ===');
  try {
    const donationCount = await donationContract.donationCount();
    console.log('Current donation count:', donationCount.toString());
  } catch (error) {
    console.error('ERROR reading donation count:', error.message);
  }

  // Step 3: Make a small donation
  console.log('\n=== STEP 3: MAKE DONATION ===');
  const donationAmount = ethers.parseEther('0.01');
  console.log('Sending donation of', ethers.formatEther(donationAmount), 'ETH...');

  try {
    const tx = await platformContract.donate({ value: donationAmount });
    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
  } catch (error) {
    console.error('❌ ERROR during donation:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    return;
  }

  // Step 4: Check balances after donation
  console.log('\n=== STEP 4: CHECK BALANCES AFTER DONATION ===');
  const afterDonationBalance = await provider.getBalance(deployedAddresses.DONATION_TRACKING);
  const afterFundBalance = await provider.getBalance(deployedAddresses.FUND_ALLOCATION);
  console.log('DonationTracking balance:', ethers.formatEther(afterDonationBalance), 'ETH');
  console.log('FundAllocation balance:', ethers.formatEther(afterFundBalance), 'ETH');

  // Step 5: Check donation records
  console.log('\n=== STEP 5: CHECK DONATION RECORDS ===');
  try {
    const donations = await donationContract.getAllDonations();
    console.log('Total donations recorded:', donations.length);
    if (donations.length > 0) {
      const latest = donations[donations.length - 1];
      console.log('Latest donation:', {
        id: latest.id.toString(),
        donor: latest.donor,
        amount: ethers.formatEther(latest.amount),
        timestamp: new Date(Number(latest.timestamp) * 1000).toISOString()
      });
    }
  } catch (error) {
    console.error('ERROR reading donations:', error.message);
  }

  // Step 6: Check if signer is stakeholder
  console.log('\n=== STEP 6: CHECK STAKEHOLDER STATUS ===');
  try {
    const isStakeholder = await donationContract.isStakeholder(signerAddress);
    console.log('Is signer a stakeholder?', isStakeholder);
  } catch (error) {
    console.error('ERROR checking stakeholder:', error.message);
  }

  // Step 7: Check FundAllocation balance via contract method
  console.log('\n=== STEP 7: CHECK FUND ALLOCATION BALANCE VIA CONTRACT ===');
  try {
    const fundBalance = await fundContract.getBalance();
    console.log('FundAllocation.getBalance():', ethers.formatEther(fundBalance), 'ETH');
  } catch (error) {
    console.error('ERROR calling getBalance():', error.message);
  }

  console.log('\n=== TEST COMPLETE ===');
}

main().catch(console.error);

