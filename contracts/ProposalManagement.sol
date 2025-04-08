// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProposalManagement {
    struct Proposal {
        uint id;
        string description;
        uint amountRequested;
        uint voteCount;
        bool approved;
        bool executed;
        address recipient;  // Add recipient address
    }

    // Use mapping instead of array for consistent 1-based indexing
    mapping(uint => Proposal) public proposals;
    uint public proposalCount;
    address public owner;
    address public fundAllocationContract; // Add FundAllocation contract address

    mapping(uint => mapping(address => bool)) public hasVoted; // Track who voted

    event ProposalCreated(uint id, string description, uint amountRequested);
    event ProposalApproved(uint id);
    event ProposalExecuted(uint id);
    event VoteCasted(uint id, address voter);
    event FundAllocationContractSet(address fundAllocationContract);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // Allow owner or FundAllocation contract to execute proposals
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == fundAllocationContract,
            "Only owner or fund allocation contract can perform this action"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }
    
    // Set the fund allocation contract
    function setFundAllocationContract(address _fundAllocationContract) public onlyOwner {
        require(_fundAllocationContract != address(0), "Invalid fund allocation contract address");
        fundAllocationContract = _fundAllocationContract;
        emit FundAllocationContractSet(_fundAllocationContract);
    }

    function createProposal(
        string memory _description, 
        uint _amountRequested,
        address _recipient
    ) public {
        require(_recipient != address(0), "Invalid recipient address");
        
        proposalCount++;
        // Store proposal in mapping instead of array
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: _description,
            amountRequested: _amountRequested,
            voteCount: 0,
            approved: false,
            executed: false,
            recipient: _recipient
        });

        emit ProposalCreated(proposalCount, _description, _amountRequested);
    }

    function incrementVoteCount(uint _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID.");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted.");

        // FIXED: Now using the same index for both operations (1-based)
        proposals[_proposalId].voteCount++;
        hasVoted[_proposalId][msg.sender] = true; // Track the voter

        emit VoteCasted(_proposalId, msg.sender);
    }

    function markProposalApproved(uint _proposalId) public onlyOwner {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID.");
        // FIXED: Use same 1-based indexing
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.approved, "Proposal is already approved.");
       
        proposal.approved = true;
        emit ProposalApproved(_proposalId);
    }

    // Change from onlyOwner to onlyAuthorized to allow FundAllocation to call this
    function markProposalExecuted(uint _proposalId) public onlyAuthorized {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID.");
        // FIXED: Use same 1-based indexing
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.approved, "Proposal must be approved first.");
        require(!proposal.executed, "Proposal is already executed.");

        // Mark as executed - removed the transfer since it's handled by FundAllocation
        proposal.executed = true;
        emit ProposalExecuted(_proposalId);
    }

    function getProposalById(uint _proposalId) public view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID.");
        // FIXED: Use same 1-based indexing
        return proposals[_proposalId];
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        for (uint i = 1; i <= proposalCount; i++) {
            allProposals[i-1] = proposals[i]; // Convert to 0-based for array
        }
        return allProposals;
    }

    function getProposalCount() public view returns (uint) {
        return proposalCount;
    }
}
