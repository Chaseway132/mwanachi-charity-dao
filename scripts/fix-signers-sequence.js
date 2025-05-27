const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
  const addresses = require('../deployedAddresses.json');
  const abi = require('../artifacts/contracts/ProposalManagement.sol/ProposalManagement.json').abi;
  
  const contract = new ethers.Contract(addresses.PROPOSAL_MANAGEMENT, abi, provider);
  const signer = await provider.getSigner(0);
  const contractWithSigner = contract.connect(signer);
  
  console.log('Getting current state...');
  const signers = await contract.getAuthorizedSigners();
  const signerCount = await contract.signerCount();
  console.log('Current signers:', signers);
  console.log('Current count:', signerCount.toString());
  
  // Add a new signer first (using the second account from Ganache)
  const newSigner = await provider.getSigner(1);
  const newSignerAddress = await newSigner.getAddress();
  
  console.log('\nAdding new signer:', newSignerAddress);
  const tx1 = await contractWithSigner.addSigner(newSignerAddress);
  await tx1.wait();
  
  // Verify new signer was added
  const updatedSigners = await contract.getAuthorizedSigners();
  const updatedCount = await contract.signerCount();
  console.log('\nAfter adding new signer:');
  console.log('Signers:', updatedSigners);
  console.log('Count:', updatedCount.toString());
  
  // Now we can safely remove the zero address
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  console.log('\nRemoving zero address...');
  const tx2 = await contractWithSigner.removeSigner(zeroAddress);
  await tx2.wait();
  
  // Verify final state
  const finalSigners = await contract.getAuthorizedSigners();
  const finalCount = await contract.signerCount();
  console.log('\nFinal configuration:');
  console.log('Signers:', finalSigners);
  console.log('Count:', finalCount.toString());
}

main().catch(console.error); 