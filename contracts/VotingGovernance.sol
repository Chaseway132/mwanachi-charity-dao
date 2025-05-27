// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProposalManagement.sol";
import "./DonationTracking.sol";

contract VotingGovernance {
    ProposalManagement public proposalContract;
    DonationTracking public donationContract;
    address public owner;

    uint256 public constant MIN_VOTES_FOR_APPROVAL = 3;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event VoteCasted(uint256 proposalId, address voter);
    event ProposalApproved(uint256 proposalId);

    constructor(
        address _proposalContract,
        address _donationContract,
        address _owner
    ) {
        require(_proposalContract != address(0), "Invalid ProposalManagement address");
        require(_donationContract != address(0), "Invalid DonationTracking address");
        require(_owner != address(0), "Invalid owner address");
        
        proposalContract = ProposalManagement(_proposalContract);
        donationContract = DonationTracking(_donationContract);
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyStakeholder() {
        require(donationContract.isStakeholder(msg.sender), "Only stakeholders can vote");
        _;
    }

    function voteOnProposal(uint256 _proposalId) external onlyStakeholder {
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(!proposal.approved, "Proposal already approved");
        require(!proposal.executed, "Proposal already executed");

        // Update state before external calls
        hasVoted[_proposalId][msg.sender] = true;
        
        // Make external call after state updates
        proposalContract.incrementVoteCount(_proposalId);
        
        emit VoteCasted(_proposalId, msg.sender);
    }

    function approveProposal(uint256 _proposalId) external onlyOwner {
        ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);
        require(!proposal.approved, "Already approved");
        require(!proposal.executed, "Already executed");
        require(proposal.voteCount >= MIN_VOTES_FOR_APPROVAL, "Insufficient votes");

        proposalContract.signProposal(_proposalId);
        emit ProposalApproved(_proposalId);
    }

    function hasUserVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return hasVoted[_proposalId][_voter];
    }

    function getMinVotesForApproval() external pure returns (uint256) {
        return MIN_VOTES_FOR_APPROVAL;
    }

    // ---------------------------------------------
    // Execution helpers (time-lock aware)
    // ---------------------------------------------

    /**
     * @dev Checks whether a proposal can be executed. It simply forwards the
     *      request to the ProposalManagement contract which contains the
     *      canonical logic (approved, not executed, time-lock complete).
     */
    function canExecute(uint256 _proposalId) external view returns (bool) {
        return proposalContract.canBeExecuted(_proposalId);
    }

    /**
     * @dev Returns the remaining delay (in seconds) before a proposal becomes
     *      executable. This is helpful for front-end timers. The logic again is
     *      delegated to ProposalManagement.
     */
    function getRemainingExecutionDelay(uint256 _proposalId) external view returns (uint256) {
        return proposalContract.getRemainingExecutionDelay(_proposalId);
    }

    /**
     * @dev Executes an approved proposal once the time-lock has passed. Only the
     *      owner (admin) can perform this action.
     */
    function executeProposal(uint256 _proposalId) external onlyOwner {
        require(proposalContract.canBeExecuted(_proposalId), "Cannot execute yet");

        // Mark as executed inside ProposalManagement. This function will revert
        // if requirements are not met (approved, not yet executed, time-lock).
        proposalContract.markProposalExecuted(_proposalId);

        // Any subsequent fund release logic should live inside FundAllocation
        // and/or ProposalManagement. For the scope of this helper we merely
        // update the state so that the front-end can detect execution.
    }
}