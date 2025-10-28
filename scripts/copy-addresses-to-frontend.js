const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Copying deployed addresses to frontend...");

  // Source and destination paths
  const sourcePath = path.join(__dirname, "../deployedAddresses.json");
  const destDir = path.join(__dirname, "../charity-dao-frontend/src/config");
  const destPath = path.join(destDir, "deployedAddresses.ts");

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Read the source file
  console.log("Reading addresses from:", sourcePath);
  const addresses = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  // Create TypeScript content
  const tsContent = `// Auto-generated contract addresses
export const DEPLOYED_ADDRESSES = {
  PROPOSAL_MANAGEMENT: "${addresses.PROPOSAL_MANAGEMENT}",
  FUND_ALLOCATION: "${addresses.FUND_ALLOCATION}",
  DONATION_TRACKING: "${addresses.DONATION_TRACKING}",
  VOTING_GOVERNANCE: "${addresses.VOTING_GOVERNANCE}",
  CHARITY_DAO_PLATFORM: "${addresses.CHARITY_DAO_PLATFORM}"
} as const;`;

  // Write to destination file
  fs.writeFileSync(destPath, tsContent);
  console.log("Addresses copied to:", destPath);

  // NOTE: We intentionally do NOT create a JSON file here
  // Reason: JSON files can be imported directly and bypass TypeScript type safety
  // This ensures all address imports go through the TypeScript file for consistency
  // If a JSON file exists from old deployments, it should be deleted

  console.log("Address copying completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
