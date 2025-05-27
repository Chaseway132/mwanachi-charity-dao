const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Copying ABI files to frontend...');

  // Contract names to copy
  const contracts = [
    'ProposalManagement',
    'DonationTracking',
    'VotingGovernance',
    'FundAllocation',
    'CharityDAOPlatform'
  ];

  // Source and destination paths
  const sourceDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  const destDir = path.join(__dirname, '..', '..', 'charity-dao-frontend', 'src', 'contracts');

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy each contract's ABI
  for (const contract of contracts) {
    const sourcePath = path.join(sourceDir, `${contract}.sol`, `${contract}.json`);
    const destPath = path.join(destDir, `${contract}.json`);

    if (fs.existsSync(sourcePath)) {
      console.log(`Copying ${contract} ABI...`);
      const artifact = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      fs.writeFileSync(destPath, JSON.stringify(artifact, null, 2));
      console.log(`Copied ${contract} ABI successfully`);
    } else {
      console.log(`Warning: Could not find ${contract} artifact`);
    }
  }

  console.log('ABI files copied successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 