// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalManagement.sol";
import "./DonationTracking.sol";

contract VotingGovernance {
    ProposalManagement public proposalContract;
    DonationTracking public donationContract;

    mapping(uint => mapping(address => bool)) public votes;

    event ProposalApproved(uint proposalId);

    constructor(address _proposalContract, address _donationContract) {
        proposalContract = ProposalManagement(_proposalContract);
        donationContract = DonationTracking(_donationContract);
    }

    function voteOnProposal(uint _proposalId, address _voter) public {
        require(donationContract.isStakeholder(_voter), "Only stakeholders can vote.");
        require(_proposalId > 0 && _proposalId <= proposalContract.proposalCount(), "Invalid proposal ID.");
        require(!votes[_proposalId][_voter], "You have already voted.");

        votes[_proposalId][_voter] = true;
        proposalContract.incrementVoteCount(_proposalId);
    }

    function approveProposal(uint _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalContract.proposalCount(), "Invalid proposal ID.");
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(proposal.voteCount > 0, "No votes cast for this proposal.");
        emit ProposalApproved(_proposalId);
    }
}
