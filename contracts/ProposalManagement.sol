// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DonationTracking.sol";

contract ProposalManagement {
    struct Proposal {
        uint id;
        string description;
        uint amountRequested;
        uint voteCount;
        bool approved;
        bool executed;
        address recipient;
        address creator;
        uint signatureCount;
        uint executionTime;
    }

    mapping(uint => Proposal) public proposals;
    uint public proposalCount;
    address public owner;
    address public fundAllocationContract;
    address public donationTrackingContract;
    address public votingGovernanceContract;

    mapping(uint => mapping(address => bool)) public voterRegistry;
    mapping(uint => mapping(address => bool)) public hasSigned;
    mapping(address => bool) public authorizedSigners;
    address[] public signerList;
    uint public signerCount;

    // Constants
    uint256 public constant MIN_VOTES_FOR_APPROVAL = 3;
    uint256 public constant MIN_PROPOSAL_AMOUNT = 0.1 ether;
    uint256 public constant REQUIRED_SIGNATURES = 2;
    uint256 public constant EXECUTION_DELAY = 45 seconds;

    event ProposalCreated(uint id, string description, uint amountRequested, address creator);
    event ProposalApproved(uint id);
    event ProposalExecuted(uint id);
    event VoteCasted(uint id, address voter);
    event FundAllocationContractSet(address fundAllocationContract);
    event DonationTrackingContractSet(address donationTrackingContract);
    event VotingGovernanceContractSet(address votingGovernanceContract);
    event SignerAdded(address signer);
    event SignerRemoved(address signer);
    event ProposalSigned(uint id, address signer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlySigner() {
        require(authorizedSigners[msg.sender], "Only authorized signers can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner ||
            msg.sender == fundAllocationContract ||
            msg.sender == votingGovernanceContract,
            "Not authorized"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedSigners[msg.sender] = true;
        signerList.push(msg.sender); // Add owner to signerList array
        signerCount = 1;
        emit SignerAdded(msg.sender);
    }

    function setVotingGovernanceContract(address _votingGovernanceContract) public onlyOwner {
        require(_votingGovernanceContract != address(0), "Invalid voting governance contract address");
        votingGovernanceContract = _votingGovernanceContract;
        emit VotingGovernanceContractSet(_votingGovernanceContract);
    }

    function createProposal(string memory _description, uint _amountRequested, address _recipient) public {
        require(_amountRequested >= MIN_PROPOSAL_AMOUNT, "Amount too small");
        require(_recipient != address(0), "Invalid recipient address");

        proposalCount++;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: _description,
            amountRequested: _amountRequested,
            voteCount: 0,
            approved: false,
            executed: false,
            recipient: _recipient,
            creator: msg.sender,
            signatureCount: 0,
            executionTime: 0
        });

        emit ProposalCreated(proposalCount, _description, _amountRequested, msg.sender);
    }

    function incrementVoteCount(uint _proposalId) public {
        require(msg.sender == votingGovernanceContract, "Only voting governance contract can increment votes");
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        require(!voterRegistry[_proposalId][tx.origin], "Already voted");
        require(!proposals[_proposalId].approved, "Proposal already approved");
        require(!proposals[_proposalId].executed, "Proposal already executed");

        proposals[_proposalId].voteCount++;
        voterRegistry[_proposalId][tx.origin] = true;

        emit VoteCasted(_proposalId, tx.origin);
    }

    function signProposal(uint _proposalId) public onlySigner {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.voteCount >= MIN_VOTES_FOR_APPROVAL, "Not enough votes");
        require(!proposal.approved, "Already approved");
        require(!proposal.executed, "Already executed");
        require(!hasSigned[_proposalId][msg.sender], "Already signed");

        hasSigned[_proposalId][msg.sender] = true;
        proposal.signatureCount++;

        emit ProposalSigned(_proposalId, msg.sender);

        if (proposal.signatureCount >= REQUIRED_SIGNATURES) {
            proposal.approved = true;
            proposal.executionTime = block.timestamp + EXECUTION_DELAY;
            emit ProposalApproved(_proposalId);
        }
    }

    function markProposalExecuted(uint _proposalId) public onlyAuthorized {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.approved, "Not approved");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.executionTime, "Time lock period not completed");

        proposal.executed = true;
        emit ProposalExecuted(_proposalId);
    }

    function getProposalById(uint _proposalId) public view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        return proposals[_proposalId];
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        for (uint i = 1; i <= proposalCount; i++) {
            allProposals[i-1] = proposals[i];
        }
        return allProposals;
    }

    function canBeExecuted(uint _proposalId) public view returns (bool) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        return proposal.approved &&
               !proposal.executed &&
               block.timestamp >= proposal.executionTime;
    }

    function getRemainingExecutionDelay(uint _proposalId) public view returns (uint) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        if (!proposal.approved || proposal.executed || proposal.executionTime == 0) {
            return 0;
        }

        if (block.timestamp >= proposal.executionTime) {
            return 0;
        }

        return proposal.executionTime - block.timestamp;
    }

    function isAuthorizedSigner(address _address) public view returns (bool) {
        return authorizedSigners[_address];
    }

    function addSigner(address _signer) public onlyOwner {
        require(_signer != address(0), "Invalid signer address");
        require(!authorizedSigners[_signer], "Already a signer");
        authorizedSigners[_signer] = true;
        signerList.push(_signer);
        signerCount++;
        emit SignerAdded(_signer);
    }

    function removeSigner(address _signer) public onlyOwner {
    require(_signer != owner, "Cannot remove owner");
    require(authorizedSigners[_signer], "Not a signer");
    require(signerCount > REQUIRED_SIGNATURES, "Cannot have fewer signers than required");

    // Remove from mapping
    authorizedSigners[_signer] = false;

    // Remove from array
    for (uint i = 0; i < signerList.length; i++) {
        if (signerList[i] == _signer) {
            // Move the last element to this position and pop
            signerList[i] = signerList[signerList.length - 1];
            signerList.pop();
            break;
        }
    }

    signerCount--;
    emit SignerRemoved(_signer);
    }

    function hasVoted(uint _proposalId, address _voter) public view returns (bool) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        return voterRegistry[_proposalId][_voter];
    }

    function setFundAllocationContract(address _fundAllocationContract) public onlyOwner {
        require(_fundAllocationContract != address(0), "Invalid fund allocation contract address");
        fundAllocationContract = _fundAllocationContract;
        emit FundAllocationContractSet(_fundAllocationContract);
    }

    function setDonationTrackingContract(address _donationTrackingContract) public onlyOwner {
        require(_donationTrackingContract != address(0), "Invalid donation tracking contract address");
        donationTrackingContract = _donationTrackingContract;
        emit DonationTrackingContractSet(_donationTrackingContract);
    }

    function getAuthorizedSigners() public view returns (address[] memory) {
    address[] memory activeSigners = new address[](signerCount);
    uint activeCount = 0;

    for (uint i = 0; i < signerList.length; i++) {
        if (authorizedSigners[signerList[i]]) {
            activeSigners[activeCount] = signerList[i];
            activeCount++;
        }
    }

    return activeSigners;
  }
}

