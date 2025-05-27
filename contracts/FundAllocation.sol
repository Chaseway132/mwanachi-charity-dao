// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalManagement.sol";

contract FundAllocation {
    ProposalManagement public proposalContract;
    address public owner;
    address public platformContract;

    event ProposalExecuted(uint proposalId, address beneficiary, uint amount);
    event FundsReceived(address sender, uint amount);
    event PlatformContractSet(address platformContract);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == platformContract,
            "Only owner or platform can execute proposals"
        );
        _;
    }

    constructor(address _proposalContract) {
        require(_proposalContract != address(0), "Invalid contract address.");
        proposalContract = ProposalManagement(_proposalContract);
        owner = msg.sender;
    }

    function setPlatformContract(address _platformContract) public {
        require(msg.sender == owner, "Only owner can set platform");
        require(_platformContract != address(0), "Invalid platform address");
        platformContract = _platformContract;
        emit PlatformContractSet(_platformContract);
    }

    // Accept Ether deposits
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    function executeProposal(uint _proposalId) public onlyAuthorized {
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);

        require(proposal.approved, "Proposal not approved yet.");
        require(!proposal.executed, "Proposal already executed.");
        require(address(this).balance >= proposal.amountRequested, "Insufficient contract balance.");

        // Transfer funds to the proposal recipient first
        (bool success, ) = proposal.recipient.call{value: proposal.amountRequested}("");
        require(success, "Transfer failed");

        // Mark the proposal as executed after successful transfer
        proposalContract.markProposalExecuted(_proposalId);

        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amountRequested);
    }

    // View contract balance
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
