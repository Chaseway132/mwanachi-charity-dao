import CharityDAOPlatformABI from '../config/CharityDAOPlatform.json';
import DonationTrackingABI from '../config/DonationTracking.json';
import FundAllocationABI from '../config/FundAllocation.json';
import ProposalManagementABI from '../config/ProposalManagement.json';
import VotingGovernanceABI from '../config/VotingGovernance.json';

// Extract the ABI array from the contract artifacts
export const CharityDAOPlatformABI_Interface = CharityDAOPlatformABI.abi;
export const DonationTrackingABI_Interface = DonationTrackingABI.abi;
export const FundAllocationABI_Interface = FundAllocationABI.abi;
export const ProposalManagementABI_Interface = ProposalManagementABI.abi;
export const VotingGovernanceABI_Interface = VotingGovernanceABI.abi; 