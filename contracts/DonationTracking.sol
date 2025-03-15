// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationTracking {
    struct Donation {
        uint id;
        address donor;
        uint amount;
        uint timestamp;
    }

    Donation[] public donations;
    uint public donationCount;

    mapping(address => bool) public stakeholders;

    event DonationReceived(uint id, address indexed donor, uint amount, uint timestamp);
    event StakeholderAdded(address indexed stakeholder);

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

        emit DonationReceived(donationCount, _donor, msg.value, block.timestamp);
    }

    function isStakeholder(address _account) public view returns (bool) {
        return stakeholders[_account];
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }
}
