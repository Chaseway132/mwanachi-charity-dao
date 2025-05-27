const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    const addresses = require('../deployedAddresses.json');
    const abi = require('../artifacts/contracts/ProposalManagement.sol/ProposalManagement.json').abi;
    
    const contract = new ethers.Contract(addresses.PROPOSAL_MANAGEMENT, abi, provider);
    
    // Get the owner address
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    
    // Get all available accounts
    const accounts = await provider.listAccounts();
    console.log('\nAvailable accounts:', accounts);
    
    // Find the owner's account
    const ownerAccount = accounts.find(acc => acc.toLowerCase() === owner.toLowerCase());
    if (!ownerAccount) {
      throw new Error('Owner account not found in available accounts');
    }
    
    // Connect with owner's account
    const ownerSigner = await provider.getSigner(ownerAccount);
    const contractWithSigner = contract.connect(ownerSigner);
    
    console.log('\nFixing signer configuration...');
    
    // Check current signers
    const currentSigners = await contract.getAuthorizedSigners();
    console.log('\nCurrent signers:', currentSigners);
    
    // Check if owner is a signer
    const isOwnerSigner = await contract.isAuthorizedSigner(owner);
    console.log('Is owner authorized?', isOwnerSigner);
    
    if (!isOwnerSigner) {
      console.log('\nAdding owner as signer...');
      const tx = await contractWithSigner.addSigner(owner);
      await tx.wait();
      console.log('Owner added as signer');
    }
    
    // Check for zero address
    if (currentSigners.includes('0x0000000000000000000000000000000000000000')) {
      console.log('\nRemoving zero address...');
      const tx = await contractWithSigner.removeSigner('0x0000000000000000000000000000000000000000');
      await tx.wait();
      console.log('Zero address removed');
    }
    
    // Verify final state
    const finalSigners = await contract.getAuthorizedSigners();
    const signerCount = await contract.signerCount();
    console.log('\nFinal configuration:');
    console.log('- Total signers:', signerCount.toString());
    console.log('- Current signers:', finalSigners);
    
    console.log('\nDone!');
  } catch (error) {
    console.error('\nError:', error);
    if (error.info) {
      console.error('Additional error info:', error.info);
    }
  }
}

main(); 