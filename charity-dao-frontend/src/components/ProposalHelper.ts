import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getProposalManagementContract, getVotingGovernanceContract } from '../utils/contracts';

export const createProposalTransaction = async (
  description: string,
  amount: string,
  recipient: string
): Promise<{success: boolean, hash?: string}> => {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const contract = await getProposalManagementContract(provider);
    const contractWithSigner = contract.connect(signer);
    
    const tx = await contractWithSigner.createProposal(
      description,
      ethers.parseEther(amount),
      recipient
    );
    const receipt = await tx.wait();
    
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false };
  }
};

export const executeProposalTransaction = async (
  proposalId: number
): Promise<{success: boolean, hash?: string}> => {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const contract = await getProposalManagementContract(provider);
    const contractWithSigner = contract.connect(signer);
    
    const tx = await contractWithSigner.executeProposal(BigInt(proposalId));
    const receipt = await tx.wait();
    
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error('Error executing proposal:', error);
    return { success: false };
  }
};

export const getProposalDetails = async (proposalId: number): Promise<any> => {
  try {
    const provider = await getProvider();
    const contract = await getProposalManagementContract(provider);
    return await contract.getProposalById(BigInt(proposalId));
  } catch (error) {
    console.error('Error getting proposal details:', error);
    return null;
  }
}; 