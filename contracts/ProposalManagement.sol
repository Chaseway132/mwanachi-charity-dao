// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProposalManagement {
    struct Proposal {
        uint id;
        string description;
        uint amountRequested;
        uint voteCount;
        bool executed;
    }

    Proposal[] public proposals;
    uint public proposalCount;

    event ProposalCreated(uint id, string description, uint amountRequested);

    function createProposal(string memory _description, uint _amountRequested) public {
        proposalCount++;
        proposals.push(Proposal({
            id: proposalCount,
            description: _description,
            amountRequested: _amountRequested,
            voteCount: 0,
            executed: false
        }));
        emit ProposalCreated(proposalCount, _description, _amountRequested);
    }

    function incrementVoteCount(uint _proposalId) public {
        proposals[_proposalId - 1].voteCount++;
    }

    function markProposalExecuted(uint _proposalId) public {
        proposals[_proposalId - 1].executed = true;
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getProposalById(uint _proposalId) public view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID.");
        return proposals[_proposalId - 1];
    }
}
