# Testing for Reentrancy Vulnerabilities

This guide explains how to test for reentrancy vulnerabilities in the CharityDAO smart contracts.

## What is a Reentrancy Attack?

A reentrancy attack occurs when a malicious contract calls back into the vulnerable contract before the first function call is complete. This can happen when a contract sends Ether to an external address before updating its internal state.

The classic example is:
1. Contract A calls Contract B
2. Contract B sends Ether to Contract A
3. Contract A's fallback function is triggered and calls back into Contract B
4. Contract B hasn't updated its state yet, so it allows the operation again
5. This cycle can repeat until Contract B is drained of funds

## Vulnerable Pattern in Our Code

The `FundAllocation.sol` contract has a potential reentrancy vulnerability in the `executeProposal` function:

```solidity
function executeProposal(uint _proposalId) public onlyAuthorized {
    ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);

    require(proposal.approved, "Proposal not approved yet.");
    require(!proposal.executed, "Proposal already executed.");
    require(address(this).balance >= proposal.amountRequested, "Insufficient contract balance.");

    // Transfer funds to the proposal recipient first
    (bool success, ) = proposal.recipient.call{value: proposal.amountRequested}("");
    require(success, "Transfer failed");

    // Mark the proposal as executed after successful transfer
    proposalContract.markProposalExecuted(_proposalId);

    emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amountRequested);
}
```

The vulnerability exists because the contract sends funds before updating the state (marking the proposal as executed).

## Testing for Reentrancy

We've created several files to help test for reentrancy vulnerabilities:

1. `ReentrancyAttacker.sol`: A malicious contract that attempts to exploit reentrancy
2. `test-reentrancy.js`: A script to test the vulnerability on a local network
3. `ReentrancyTest.js`: A comprehensive test suite using Hardhat's testing framework
4. `SecureFundAllocation.sol`: A secure version of the contract that prevents reentrancy

### Running the Tests

To test for reentrancy vulnerabilities:

1. Start a local Hardhat node:
   ```
   npx hardhat node
   ```

2. Deploy the contracts to the local network:
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Run the reentrancy test script:
   ```
   npx hardhat run scripts/test-reentrancy.js --network localhost
   ```

4. Run the comprehensive test suite:
   ```
   npx hardhat test test/ReentrancyTest.js
   ```

## Preventing Reentrancy Attacks

There are two main ways to prevent reentrancy attacks:

1. **Use a Reentrancy Guard (Mutex)**: Add a boolean lock that prevents recursive calls
2. **Follow the Checks-Effects-Interactions Pattern**: Update state before making external calls

The `SecureFundAllocation.sol` contract demonstrates both approaches:

```solidity
// Add a mutex to prevent reentrancy
bool private locked;

modifier nonReentrant() {
    require(!locked, "ReentrancyGuard: reentrant call");
    locked = true;
    _;
    locked = false;
}

function executeProposal(uint _proposalId) public onlyAuthorized nonReentrant {
    ProposalManagement.Proposal memory proposal = proposalContract.getProposalById(_proposalId);

    require(proposal.approved, "Proposal not approved yet.");
    require(!proposal.executed, "Proposal already executed.");
    require(address(this).balance >= proposal.amountRequested, "Insufficient contract balance.");

    // Mark the proposal as executed BEFORE transferring funds (Checks-Effects-Interactions pattern)
    proposalContract.markProposalExecuted(_proposalId);
    
    // Transfer funds to the proposal recipient after updating state
    (bool success, ) = proposal.recipient.call{value: proposal.amountRequested}("");
    require(success, "Transfer failed");

    emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amountRequested);
}
```

## Recommendations

1. Update the `FundAllocation.sol` contract to use the secure implementation
2. Add OpenZeppelin's `ReentrancyGuard` contract to all contracts that handle Ether transfers
3. Always follow the Checks-Effects-Interactions pattern
4. Consider using the `.transfer()` method instead of `.call()` for Ether transfers (though this has its own limitations)
5. Regularly audit your contracts for security vulnerabilities

## Additional Resources

- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/)
- [OpenZeppelin ReentrancyGuard](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard)
- [The DAO Hack Explained](https://www.coindesk.com/learn/2016/06/25/understanding-the-dao-attack/)
