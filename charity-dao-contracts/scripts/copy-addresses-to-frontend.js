import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Copying deployed addresses to frontend...');

  // Source and destination paths
  const sourcePath = path.join(__dirname, '..', '..', 'deployedAddresses.json');
  const destDir = path.join(__dirname, '..', '..', 'charity-dao-frontend', 'src', 'config');
  const destPath = path.join(destDir, 'deployedAddresses.json');

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  if (fs.existsSync(sourcePath)) {
    console.log('Copying deployed addresses...');
    const addresses = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    fs.writeFileSync(destPath, JSON.stringify(addresses, null, 2));
    console.log('Deployed addresses copied successfully!');
  } else {
    console.error('Error: Could not find deployedAddresses.json');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 