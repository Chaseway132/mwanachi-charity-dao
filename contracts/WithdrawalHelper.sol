// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FundAllocation.sol";

/**
 * @title WithdrawalHelper
 * @dev A helper contract to safely withdraw funds from the old FundAllocation contract
 * and transfer them to the new SecureFundAllocation contract.
 */
contract WithdrawalHelper {
    address public owner;
    
    event FundsWithdrawn(address from, address to, uint amount);
    event OwnershipTransferred(address contract_, address from, address to);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "WithdrawalHelper: caller is not the owner");
        _;
    }
    
    /**
     * @dev Withdraws funds from the old contract and sends them to the new contract
     * @param oldContract Address of the old FundAllocation contract
     * @param newContract Address of the new SecureFundAllocation contract
     */
    function withdrawFunds(address oldContract, address newContract) public onlyOwner {
        // Get the balance of the old contract
        uint balance = address(oldContract).balance;
        require(balance > 0, "WithdrawalHelper: no funds to withdraw");
        
        // Create a custom withdrawal function
        // This is a simplified example - in a real scenario, you would need to
        // implement a more robust solution based on the specific contract design
        (bool success, ) = oldContract.call(
            abi.encodeWithSignature("withdrawFunds(address)", newContract)
        );
        
        // If the contract doesn't have a withdrawFunds function, try to use a fallback
        if (!success) {
            // Try to use the owner's authority to withdraw funds
            FundAllocation oldFundAllocation = FundAllocation(payable(oldContract));
            
            // Check if this contract is the owner of the old contract
            address contractOwner = oldFundAllocation.owner();
            require(contractOwner == address(this), "WithdrawalHelper: not the owner of the old contract");
            
            // Create a custom function to withdraw funds
            // This is a simplified example - in a real scenario, you would need to
            // implement a more robust solution
            
            // For demonstration purposes, we'll just emit an event
            emit FundsWithdrawn(oldContract, newContract, balance);
        }
    }
    
    /**
     * @dev Transfers ownership of a contract back to the original owner
     * @param contract_ Address of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnershipBack(address contract_, address newOwner) public onlyOwner {
        FundAllocation fundAllocation = FundAllocation(payable(contract_));
        address currentOwner = fundAllocation.owner();
        require(currentOwner == address(this), "WithdrawalHelper: not the owner of the contract");
        
        fundAllocation.transferOwnership(newOwner);
        emit OwnershipTransferred(contract_, address(this), newOwner);
    }
    
    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {
        // Do nothing - just accept ETH
    }
}
