const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Updating ProposalManagement ABI in frontend...');

  // Source and destination paths
  const sourcePath = path.join(__dirname, '..', 'artifacts', 'contracts', 'ProposalManagement.sol', 'ProposalManagement.json');
  const destPath = path.join(__dirname, '..', '..', 'charity-dao-frontend', 'src', 'contracts', 'ProposalManagement.json');

  if (fs.existsSync(sourcePath)) {
    console.log('Found latest ProposalManagement ABI, copying to frontend...');
    const artifact = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    fs.writeFileSync(destPath, JSON.stringify(artifact, null, 2));
    console.log('Updated ProposalManagement ABI successfully!');
  } else {
    console.log('Error: Could not find ProposalManagement artifact');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 