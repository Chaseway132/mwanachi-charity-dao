import { ethers } from 'ethers';
import { getProvider } from '../utils/web3';
import { getDonationTrackingContract } from '../utils/contracts';

// Define the contract interface
interface DonationTrackingContract extends ethers.BaseContract {
  donate(donor: string, options: { value: bigint }): Promise<ethers.ContractTransactionResponse>;
  getDonationById(id: bigint): Promise<any>;
  getDonationsByDonor(donor: string): Promise<any[]>;
  isStakeholder(address: string): Promise<boolean>;
}

export const donateTransaction = async (
  amount: string
): Promise<{success: boolean, hash?: string}> => {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const contract = await getDonationTrackingContract(provider);
    const contractWithSigner = contract.connect(signer);
    
    const donorAddress = await signer.getAddress();
    // Use type assertion with 'any' to bypass TypeScript's type checking
    const tx = await (contractWithSigner as any).donate(donorAddress, { value: ethers.parseEther(amount) });
    const receipt = await tx.wait();
    
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error('Error making donation:', error);
    return { success: false };
  }
};

export const getDonationDetails = async (donationId: number): Promise<any> => {
  try {
    const provider = await getProvider();
    const contract = await getDonationTrackingContract(provider);
    // Use type assertion with 'any' to bypass TypeScript's type checking
    return await (contract as any).getDonationById(BigInt(donationId));
  } catch (error) {
    console.error('Error getting donation details:', error);
    return null;
  }
};

export const getDonationHistory = async (address: string): Promise<any[]> => {
  try {
    const provider = await getProvider();
    const contract = await getDonationTrackingContract(provider);
    // Use type assertion with 'any' to bypass TypeScript's type checking
    return await (contract as any).getDonationsByDonor(address);
  } catch (error) {
    console.error('Error getting donation history:', error);
    return [];
  }
};

export const getStakeholderStatus = async (address: string): Promise<boolean> => {
  try {
    const provider = await getProvider();
    const contract = await getDonationTrackingContract(provider);
    // Use type assertion with 'any' to bypass TypeScript's type checking
    return await (contract as any).isStakeholder(address);
  } catch (error) {
    console.error('Error checking stakeholder status:', error);
    return false;
  }
}; 