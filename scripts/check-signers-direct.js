const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Connect to local network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get contract address and ABI
    const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployedAddresses.json')));
    const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'artifacts', 'contracts', 'ProposalManagement.sol', 'ProposalManagement.json'))).abi;
    
    // Create contract instance
    const contract = new ethers.Contract(addresses.PROPOSAL_MANAGEMENT, contractABI, provider);
    
    console.log('\nChecking signer configuration...');
    console.log('Contract address:', addresses.PROPOSAL_MANAGEMENT);
    
    // Get owner
    const owner = await contract.owner();
    console.log('\nContract owner:', owner);
    
    // Get signer count
    const signerCount = await contract.signerCount();
    console.log('Total signer count:', signerCount.toString());
    
    // Get all authorized signers
    const signers = await contract.getAuthorizedSigners();
    console.log('\nAuthorized signers:');
    for (const signer of signers) {
      const isOwner = signer.toLowerCase() === owner.toLowerCase();
      console.log(`- ${signer}${isOwner ? ' (owner)' : ''}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 