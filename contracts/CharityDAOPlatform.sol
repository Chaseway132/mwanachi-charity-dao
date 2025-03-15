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
    FundAllocation public fundContract;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        proposalContract = new ProposalManagement();
        donationContract = new DonationTracking();
        votingContract = new VotingGovernance(address(proposalContract), address(donationContract));
        fundContract = new FundAllocation();
    }

    function donate() external payable {
        donationContract.donate{value: msg.value}(msg.sender);
    }

    function createProposal(string memory _description, uint _amountRequested) public onlyOwner {
        proposalContract.createProposal(_description, _amountRequested);
    }

    function voteOnProposal(uint _proposalId) public {
        votingContract.voteOnProposal(_proposalId, msg.sender);
    }

    function approveProposal(uint _proposalId) public onlyOwner {
        votingContract.approveProposal(_proposalId);
    }

    function executeProposal(uint _proposalId) public onlyOwner {
        fundContract.executeProposal(_proposalId, proposalContract);

    }

    function getAllProposals() external view returns (ProposalManagement.Proposal[] memory) {
        return proposalContract.getAllProposals();
    }

    function getAllDonations() external view returns (DonationTracking.Donation[] memory) {
        return donationContract.getAllDonations();
    }
}
