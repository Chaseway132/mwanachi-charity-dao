// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalManagement.sol";

/**
 * @title SecureFundAllocation
 * @dev A secure implementation of the FundAllocation contract that follows
 * security best practices to prevent reentrancy attacks and other vulnerabilities.
 *
 * Security features implemented:
 * 1. Reentrancy Guard: Prevents recursive calls to sensitive functions
 * 2. Checks-Effects-Interactions Pattern: Updates state before external calls
 * 3. Input Validation: Validates all inputs to prevent unexpected behavior
 * 4. Access Control: Restricts function access to authorized addresses
 * 5. Event Logging: Logs all important state changes for transparency
 */
contract SecureFundAllocation {
    // State variables
    ProposalManagement public proposalContract;
    address public owner;
    address public platformContract;

    // Security: Reentrancy guard
    bool private _locked;

    // Events for transparency and monitoring
    event ProposalExecuted(uint proposalId, address beneficiary, uint amount, uint timestamp);
    event FundsReceived(address sender, uint amount, uint timestamp);
    event PlatformContractSet(address platformContract, uint timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner, uint timestamp);

    /**
     * @dev Modifier to prevent reentrancy attacks
     * This ensures that a function cannot be called recursively before the
     * first invocation is complete, protecting against reentrancy attacks.
     */
    modifier nonReentrant() {
        require(!_locked, "SecureFundAllocation: reentrancy guard active");
        _locked = true;
        _;
        _locked = false;
    }

    /**
     * @dev Modifier to restrict access to authorized addresses
     * Only the owner or the platform contract can call functions with this modifier.
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == platformContract,
            "SecureFundAllocation: caller is not authorized"
        );
        _;
    }

    /**
     * @dev Constructor initializes the contract with the proposal management contract
     * @param _proposalContract Address of the ProposalManagement contract
     */
    constructor(address _proposalContract) {
        require(_proposalContract != address(0), "SecureFundAllocation: invalid contract address");
        proposalContract = ProposalManagement(_proposalContract);
        owner = msg.sender;
        _locked = false;
    }

    /**
     * @dev Sets the platform contract address
     * @param _platformContract Address of the platform contract
     */
    function setPlatformContract(address _platformContract) public {
        require(msg.sender == owner, "SecureFundAllocation: caller is not the owner");
        require(_platformContract != address(0), "SecureFundAllocation: invalid platform address");
        platformContract = _platformContract;
        emit PlatformContractSet(_platformContract, block.timestamp);
    }

    /**
     * @dev Fallback function to receive Ether
     * This function is called when the contract receives Ether without calldata.
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Executes a proposal securely by following the Checks-Effects-Interactions pattern
     * and using a reentrancy guard
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint _proposalId) public onlyAuthorized nonReentrant {
        // CHECKS: Validate the proposal state
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(proposal.approved, "SecureFundAllocation: proposal not approved");
        require(!proposal.executed, "SecureFundAllocation: proposal already executed");
        require(address(this).balance >= proposal.amountRequested, "SecureFundAllocation: insufficient balance");
        require(block.timestamp >= proposal.executionTime, "SecureFundAllocation: timelock period not completed");

        // EFFECTS: Update the state before external interactions
        // This follows the Checks-Effects-Interactions pattern to prevent reentrancy attacks
        proposalContract.markProposalExecuted(_proposalId);

        // INTERACTIONS: Perform external calls after state updates
        (bool success, ) = proposal.recipient.call{value: proposal.amountRequested}("");
        require(success, "SecureFundAllocation: transfer failed");

        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amountRequested, block.timestamp);
    }

    /**
     * @dev Returns the current balance of the contract
     * @return The contract's balance in wei
     */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     * @dev Transfers ownership of the contract to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "SecureFundAllocation: caller is not the owner");
        require(newOwner != address(0), "SecureFundAllocation: new owner is the zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner, block.timestamp);
    }
}
