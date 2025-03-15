// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalManagement.sol";

contract FundAllocation {
    event ProposalExecuted(uint proposalId, address beneficiary, uint amount);

    function executeProposal(uint _proposalId, ProposalManagement proposalContract) public {
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(!proposal.executed, "Proposal already executed.");
        require(proposal.voteCount > 0, "No votes cast for this proposal.");
        require(address(this).balance >= proposal.amountRequested, "Insufficient contract balance.");

        proposalContract.markProposalExecuted(_proposalId);
        payable(msg.sender).transfer(proposal.amountRequested);

        emit ProposalExecuted(_proposalId, msg.sender, proposal.amountRequested);
    }
}
