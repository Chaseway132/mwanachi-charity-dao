// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalManagement.sol";
import "./DonationTracking.sol";
import "./VotingGovernance.sol";
import "./FundAllocation.sol";

contract CharityDAOPlatform {
    ProposalManagement public proposalContract;
    DonationTracking public donationContract;
    VotingGovernance public votingContract;
    FundAllocation public fundAllocationContract;
    address public owner;

    enum ProposalStatus { Pending, Approved, Rejected, Executed }

    struct Proposal {
        string description;
        uint amountRequested;
        address recipient;
        ProposalStatus status;
    }

    mapping(uint => Proposal) public proposals;

    // Restricts access to owner-only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Constructor initializes contract dependencies
    constructor(
        address _proposalContract,
        address _donationContract,
        address _votingContract,
        address payable _fundAllocationContract
    ) {
        owner = msg.sender;
        proposalContract = ProposalManagement(_proposalContract);
        donationContract = DonationTracking(_donationContract);
        votingContract = VotingGovernance(_votingContract);
        fundAllocationContract = FundAllocation(_fundAllocationContract);
    }

    // Function to donate funds
    function donate() external payable {
        donationContract.donate{value: msg.value}(msg.sender);
    }

    // Anyone can create a proposal
    function createProposal(
        string memory _description, 
        uint _amountRequested,
        address _recipient
    ) public {
        proposalContract.createProposal(_description, _amountRequested, _recipient);
    }

    // Allows stakeholders to vote on proposals
    function voteOnProposal(uint _proposalId) public {
        votingContract.voteOnProposal(_proposalId);
    }

    // Only the owner can approve proposals
    function approveProposal(uint _proposalId) public onlyOwner {
        votingContract.approveProposal(_proposalId);
    }

    // Only the owner can execute approved proposals
    function executeProposal(uint _proposalId) public onlyOwner {
        // Call the FundAllocation contract to execute the proposal
        fundAllocationContract.executeProposal(_proposalId);
        
        // No need to manually update status as it's handled by the ProposalManagement contract
        // The FundAllocation contract will emit its own event
    }

    // Fetches all proposals from ProposalManagement contract
    function getAllProposals() external view returns (ProposalManagement.Proposal[] memory) {
        return proposalContract.getAllProposals();
    }

    // Fetches all donation records from DonationTracking contract
    function getAllDonations() external view returns (DonationTracking.Donation[] memory) {
        return donationContract.getAllDonations();
    }

    // Function to set the platform contract in FundAllocation
    function setFundAllocationPlatform() public onlyOwner {
        fundAllocationContract.setPlatformContract(address(this));
    }

    event ProposalExecuted(uint indexed proposalId);
}
