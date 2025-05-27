// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProposalManagement is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 amount;
        address recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        bool cancelled;
        uint256 creationTime;
        uint256 executionTime;
        mapping(address => bool) hasVoted;
    }

    Counters.Counter private _proposalIds;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description, uint256 amount, address recipient);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PROPOSER_ROLE, msg.sender);
        _setupRole(VOTER_ROLE, msg.sender);
        _setupRole(EXECUTOR_ROLE, msg.sender);
    }

    function createProposal(
        string memory description,
        uint256 amount,
        address recipient
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");

        _proposalIds.increment();
        uint256 newProposalId = _proposalIds.current();
        proposalCount++;

        Proposal storage proposal = proposals[newProposalId];
        proposal.id = newProposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.amount = amount;
        proposal.recipient = recipient;
        proposal.creationTime = block.timestamp;

        emit ProposalCreated(newProposalId, msg.sender, description, amount, recipient);
        return newProposalId;
    }

    function castVote(uint256 proposalId, bool support) external onlyRole(VOTER_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal is cancelled");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal is cancelled");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");

        proposal.executed = true;
        proposal.executionTime = block.timestamp;

        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        require(success, "Transfer failed");

        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal already cancelled");

        proposal.cancelled = true;
        emit ProposalCancelled(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 amount,
        address recipient,
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed,
        bool cancelled,
        uint256 creationTime,
        uint256 executionTime
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.amount,
            proposal.recipient,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed,
            proposal.cancelled,
            proposal.creationTime,
            proposal.executionTime
        );
    }

    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    receive() external payable {}
} 