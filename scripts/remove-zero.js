const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
  const addresses = require('../deployedAddresses.json');
  const abi = require('../artifacts/contracts/ProposalManagement.sol/ProposalManagement.json').abi;
  
  const contract = new ethers.Contract(addresses.PROPOSAL_MANAGEMENT, abi, provider);
  const signer = await provider.getSigner(0);
  const contractWithSigner = contract.connect(signer);
  
  console.log('Getting current signers...');
  const signers = await contract.getAuthorizedSigners();
  console.log('Current signers:', signers);
  
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  if (signers.some(s => s.toLowerCase() === zeroAddress.toLowerCase())) {
    console.log('Removing zero address...');
    const tx = await contractWithSigner.removeSigner(zeroAddress);
    await tx.wait();
    console.log('Zero address removed');
    
    const newSigners = await contract.getAuthorizedSigners();
    console.log('Updated signers:', newSigners);
  } else {
    console.log('No zero address found');
  }
}

main().catch(console.error); 