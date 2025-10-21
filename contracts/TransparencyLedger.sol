// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title TransparencyLedger
 * @dev Immutable on-chain ledger for all special donations
 * Ensures complete transparency and accountability
 */
contract TransparencyLedger {
    
    // ============ Events ============
    
    event SpecialDonationCreated(
        uint256 indexed campaignId,
        string beneficiaryName,
        uint256 targetAmount,
        uint256 timestamp
    );
    
    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        string method,
        string mpesaReceiptNumber,
        uint256 timestamp
    );
    
    event FundsTransferred(
        uint256 indexed campaignId,
        address indexed beneficiary,
        uint256 amount,
        string method,
        uint256 timestamp
    );
    
    event CampaignUpdated(
        uint256 indexed campaignId,
        string updateTitle,
        string updateContent,
        uint256 timestamp
    );
    
    event CampaignClosed(
        uint256 indexed campaignId,
        uint256 totalRaised,
        uint256 totalDonors,
        uint256 timestamp
    );
    
    // ============ Structs ============
    
    struct Campaign {
        uint256 id;
        string beneficiaryName;
        string beneficiaryPhone;
        string beneficiaryIdHash;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 createdAt;
        uint256 deadline;
        bool verified;
        bool closed;
        uint256 totalDonors;
        string ipfsDocumentsHash;
    }
    
    struct Donation {
        uint256 id;
        uint256 campaignId;
        address donor;
        uint256 amount;
        string method;
        string mpesaReceiptNumber;
        uint256 timestamp;
        bool verified;
    }
    
    struct CampaignUpdate {
        uint256 id;
        uint256 campaignId;
        string title;
        string content;
        string ipfsHash;
        uint256 timestamp;
    }
    
    // ============ State Variables ============
    
    address public owner;
    address public backendAddress;
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(uint256 => CampaignUpdate[]) public campaignUpdates;
    mapping(address => uint256[]) public donorCampaigns;
    
    uint256 public campaignCount = 0;
    uint256 public totalDonationsReceived = 0;
    uint256 public totalFundsRaised = 0;
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _backendAddress) {
        owner = msg.sender;
        backendAddress = _backendAddress;
    }
    
    // ============ Admin Functions ============
    
    function setBackendAddress(address _backendAddress) external onlyOwner {
        backendAddress = _backendAddress;
    }
    
    // ============ Campaign Management ============
    
    /**
     * @dev Create a new special donation campaign
     */
    function createSpecialCampaign(
        string memory _beneficiaryName,
        string memory _beneficiaryPhone,
        string memory _beneficiaryIdHash,
        uint256 _targetAmount,
        uint256 _deadline,
        string memory _ipfsDocumentsHash
    ) external onlyOwner returns (uint256) {
        campaignCount++;
        
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            beneficiaryName: _beneficiaryName,
            beneficiaryPhone: _beneficiaryPhone,
            beneficiaryIdHash: _beneficiaryIdHash,
            targetAmount: _targetAmount,
            currentAmount: 0,
            createdAt: block.timestamp,
            deadline: _deadline,
            verified: false,
            closed: false,
            totalDonors: 0,
            ipfsDocumentsHash: _ipfsDocumentsHash
        });
        
        emit SpecialDonationCreated(
            campaignCount,
            _beneficiaryName,
            _targetAmount,
            block.timestamp
        );
        
        return campaignCount;
    }
    
    /**
     * @dev Verify a campaign (admin only)
     */
    function verifyCampaign(uint256 _campaignId) external onlyOwner {
        require(campaigns[_campaignId].id != 0, "Campaign not found");
        campaigns[_campaignId].verified = true;
    }
    
    // ============ Donation Recording ============
    
    /**
     * @dev Record a donation to a campaign
     * Called by backend after payment is confirmed
     */
    function recordDonation(
        uint256 _campaignId,
        address _donor,
        uint256 _amount,
        string memory _method,
        string memory _mpesaReceiptNumber
    ) external onlyBackend returns (uint256) {
        require(campaigns[_campaignId].id != 0, "Campaign not found");
        require(!campaigns[_campaignId].closed, "Campaign closed");
        require(_amount > 0, "Amount must be greater than zero");
        
        totalDonationsReceived++;
        
        Donation memory donation = Donation({
            id: totalDonationsReceived,
            campaignId: _campaignId,
            donor: _donor,
            amount: _amount,
            method: _method,
            mpesaReceiptNumber: _mpesaReceiptNumber,
            timestamp: block.timestamp,
            verified: true
        });
        
        campaignDonations[_campaignId].push(donation);
        campaigns[_campaignId].currentAmount += _amount;
        campaigns[_campaignId].totalDonors++;
        donorCampaigns[_donor].push(_campaignId);
        totalFundsRaised += _amount;
        
        emit DonationReceived(
            _campaignId,
            _donor,
            _amount,
            _method,
            _mpesaReceiptNumber,
            block.timestamp
        );
        
        return totalDonationsReceived;
    }
    
    // ============ Fund Transfer ============
    
    /**
     * @dev Record fund transfer to beneficiary
     */
    function transferFundsToBeneficiary(
        uint256 _campaignId,
        address _beneficiary,
        uint256 _amount,
        string memory _method
    ) external onlyOwner {
        require(campaigns[_campaignId].id != 0, "Campaign not found");
        require(campaigns[_campaignId].currentAmount >= _amount, "Insufficient funds");
        
        campaigns[_campaignId].currentAmount -= _amount;
        
        emit FundsTransferred(
            _campaignId,
            _beneficiary,
            _amount,
            _method,
            block.timestamp
        );
    }
    
    // ============ Campaign Updates ============
    
    /**
     * @dev Post an update to a campaign
     */
    function postCampaignUpdate(
        uint256 _campaignId,
        string memory _title,
        string memory _content,
        string memory _ipfsHash
    ) external onlyOwner {
        require(campaigns[_campaignId].id != 0, "Campaign not found");
        
        CampaignUpdate memory update = CampaignUpdate({
            id: campaignUpdates[_campaignId].length + 1,
            campaignId: _campaignId,
            title: _title,
            content: _content,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp
        });
        
        campaignUpdates[_campaignId].push(update);
        
        emit CampaignUpdated(
            _campaignId,
            _title,
            _content,
            block.timestamp
        );
    }
    
    // ============ Campaign Closure ============
    
    /**
     * @dev Close a campaign
     */
    function closeCampaign(uint256 _campaignId) external onlyOwner {
        require(campaigns[_campaignId].id != 0, "Campaign not found");
        
        campaigns[_campaignId].closed = true;
        
        emit CampaignClosed(
            _campaignId,
            campaigns[_campaignId].currentAmount,
            campaigns[_campaignId].totalDonors,
            block.timestamp
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        returns (Campaign memory) 
    {
        return campaigns[_campaignId];
    }
    
    /**
     * @dev Get all donations for a campaign
     */
    function getCampaignDonations(uint256 _campaignId) 
        external 
        view 
        returns (Donation[] memory) 
    {
        return campaignDonations[_campaignId];
    }
    
    /**
     * @dev Get donation count for a campaign
     */
    function getCampaignDonationCount(uint256 _campaignId) 
        external 
        view 
        returns (uint256) 
    {
        return campaignDonations[_campaignId].length;
    }
    
    /**
     * @dev Get all updates for a campaign
     */
    function getCampaignUpdates(uint256 _campaignId) 
        external 
        view 
        returns (CampaignUpdate[] memory) 
    {
        return campaignUpdates[_campaignId];
    }
    
    /**
     * @dev Get campaigns a donor has contributed to
     */
    function getDonorCampaigns(address _donor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return donorCampaigns[_donor];
    }
    
    /**
     * @dev Get total statistics
     */
    function getStatistics() 
        external 
        view 
        returns (
            uint256 totalCampaigns,
            uint256 totalDonations,
            uint256 totalRaised
        ) 
    {
        return (campaignCount, totalDonationsReceived, totalFundsRaised);
    }
}

