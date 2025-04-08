// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FundAllocation.sol";

contract DonationTracking {
    struct Donation {
        uint id;
        address donor;
        uint amount;
        uint timestamp;
    }

    Donation[] public donations;
    uint public donationCount;
    FundAllocation public fundAllocationContract;
    mapping(address => bool) public stakeholders;

    event DonationReceived(uint id, address indexed donor, uint amount, uint timestamp);
    event StakeholderAdded(address indexed stakeholder);
    event StakeholderCheck(address account, bool isStakeholder); // Event for logging

    constructor(address payable _fundAllocationContract) {
        require(_fundAllocationContract != address(0), "Invalid fund allocation contract address");
        fundAllocationContract = FundAllocation(_fundAllocationContract);
    }

    function donate(address _donor) external payable {
        require(msg.value > 0, "Donation amount must be greater than zero.");

        donationCount++;
        donations.push(Donation({
            id: donationCount,
            donor: _donor,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        if (!stakeholders[_donor]) {
            stakeholders[_donor] = true;
            emit StakeholderAdded(_donor);
        }

        // Transfer funds to FundAllocation contract
        (bool success, ) = address(fundAllocationContract).call{value: msg.value}("");
        require(success, "Failed to transfer funds to FundAllocation contract");

        emit DonationReceived(donationCount, _donor, msg.value, block.timestamp);
    }

    function isStakeholder(address _account) public view returns (bool) {
        return stakeholders[_account];
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }
}
