const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
  const addresses = require('../deployedAddresses.json');
  const abi = require('../artifacts/contracts/ProposalManagement.sol/ProposalManagement.json').abi;
  
  const contract = new ethers.Contract(addresses.PROPOSAL_MANAGEMENT, abi, provider);
  const signer = await provider.getSigner(0);
  const contractWithSigner = contract.connect(signer);
  
  const owner = await contract.owner();
  console.log('Owner:', owner);
  console.log('Signer:', await signer.getAddress());
  
  const isOwnerSigner = await contract.isAuthorizedSigner(owner);
  console.log('Is owner signer?', isOwnerSigner);
  
  if (!isOwnerSigner) {
    console.log('Adding owner as signer...');
    await contractWithSigner.addSigner(owner);
  }
  
  console.log('Done');
}

main().catch(console.error); 