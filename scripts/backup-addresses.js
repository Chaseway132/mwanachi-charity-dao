const path = require("path");
const fs = require("fs");

// Get the old addresses from deployedAddresses.json
const oldAddresses = {
  "PROPOSAL_MANAGEMENT": "0xd550c0df4afbbe26854f9c1d2ad6ce2b385037d9",
  "FUND_ALLOCATION": "0xEf9A8ce5b36Eb8b1d48152B59BAeCD32eaE3E9B9",
  "DONATION_TRACKING": "0x3487996B4F6EA237248720896D4915884bAE05d4",
  "VOTING_GOVERNANCE": "0x32f15DCD39AEA5c23c9ea01f84Cca08ccbB1534E",
  "CHARITY_DAO_PLATFORM": "0x9612eFAFc54D35C370E8A694a7f0995A7e4A45b8"
};

// Save the old addresses to a backup file
const backupPath = path.join(__dirname, "../deployedAddresses.backup.json");
fs.writeFileSync(backupPath, JSON.stringify(oldAddresses, null, 2));

console.log("Backup of old addresses created at:", backupPath);
