// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "./ProposalManagement.sol";
import "./DonationTracking.sol";
import "hardhat/console.sol"; // Debugging (remove in production)


contract VotingGovernance {
    ProposalManagement public proposalContract;
    DonationTracking public donationContract;
    address public owner;


    event ProposalApproved(uint proposalId);
    event ProposalVoted(uint proposalId, address voter);
    event OwnershipTransferred(address oldOwner, address newOwner);
    event ProposalExecuted(uint proposalId);


    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }


    constructor(address _proposalContract, address _donationContract, address _owner) {
        require(_proposalContract != address(0) && _donationContract != address(0) && _owner != address(0), "Invalid address");
        proposalContract = ProposalManagement(_proposalContract);
        donationContract = DonationTracking(_donationContract);
        owner = _owner;


        console.log("VotingGovernance deployed. Owner:", owner);
    }


    function voteOnProposal(uint _proposalId) public {
        console.log("Voting address:", msg.sender); // Debugging purpose only

        require(_proposalId > 0 && _proposalId <= proposalContract.proposalCount(), "Invalid proposal ID.");
        require(donationContract.isStakeholder(msg.sender), "Only stakeholders can vote");
        
        // FIXED: Call incrementVoteCount which now uses consistent 1-based indexing
        proposalContract.incrementVoteCount(_proposalId);

        console.log("Vote registered for proposal ID:", _proposalId);
        emit ProposalVoted(_proposalId, msg.sender);
    }




    function approveProposal(uint _proposalId) public onlyOwner {
        require(_proposalId > 0 && _proposalId <= proposalContract.proposalCount(), "Invalid proposal ID.");
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(proposal.voteCount > 0, "No votes cast for this proposal.");


        console.log("Approving proposal ID:", _proposalId);
        proposalContract.markProposalApproved(_proposalId);
        emit ProposalApproved(_proposalId);
    }


    function executeProposal(uint _proposalId) public onlyOwner {
        require(_proposalId > 0 && _proposalId <= proposalContract.proposalCount(), "Invalid proposal ID.");
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(proposal.approved, "Proposal must be approved before execution.");

        console.log("Executing proposal ID:", _proposalId);
        proposalContract.markProposalExecuted(_proposalId);
        emit ProposalExecuted(_proposalId);
    }


    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");


        console.log("Ownership transferred from:", owner, "to:", newOwner);
        emit OwnershipTransferred(owner, newOwner);


        owner = newOwner;
    }
}
