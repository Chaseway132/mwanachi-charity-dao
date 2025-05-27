const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Updating frontend ABIs...');

  // Contract names to update
  const contracts = [
    'ProposalManagement',
    'FundAllocation',
    'DonationTracking',
    'VotingGovernance',
    'CharityDAOPlatform'
  ];

  // Source and destination paths
  const sourceDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  const destDir = path.join(__dirname, '..', '..', 'charity-dao-frontend', 'src', 'contracts');

  // Update each contract's ABI
  for (const contract of contracts) {
    const sourcePath = path.join(sourceDir, `${contract}.sol`, `${contract}.json`);
    const destPath = path.join(destDir, `${contract}.json`);

    if (fs.existsSync(sourcePath)) {
      console.log(`Updating ${contract} ABI...`);
      const artifact = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      fs.writeFileSync(destPath, JSON.stringify(artifact, null, 2));
      console.log(`Updated ${contract} ABI successfully`);
    } else {
      console.log(`Warning: Could not find ${contract} artifact`);
    }
  }

  console.log('Frontend ABIs updated successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 