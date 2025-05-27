const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Attack Test", function () {
  let ProposalManagement;
  let FundAllocation;
  let CharityDAOPlatform;
  let DonationTracking;
  let VotingGovernance;
  let ReentrancyAttacker;

  let proposalManagement;
  let fundAllocation;
  let charityDAOPlatform;
  let donationTracking;
  let votingGovernance;
  let attacker;

  let owner;
  let user1;
  let user2;
  let user3;

  const MIN_PROPOSAL_AMOUNT = ethers.utils.parseEther("0.1");
  const ATTACK_AMOUNT = ethers.utils.parseEther("0.5");

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy contracts
    ProposalManagement = await ethers.getContractFactory("ProposalManagement");
    proposalManagement = await ProposalManagement.deploy();
    await proposalManagement.deployed();

    DonationTracking = await ethers.getContractFactory("DonationTracking");
    donationTracking = await DonationTracking.deploy();
    await donationTracking.deployed();

    VotingGovernance = await ethers.getContractFactory("VotingGovernance");
    votingGovernance = await VotingGovernance.deploy(proposalManagement.address);
    await votingGovernance.deployed();

    FundAllocation = await ethers.getContractFactory("FundAllocation");
    fundAllocation = await FundAllocation.deploy(proposalManagement.address);
    await fundAllocation.deployed();

    CharityDAOPlatform = await ethers.getContractFactory("CharityDAOPlatform");
    charityDAOPlatform = await CharityDAOPlatform.deploy(
      proposalManagement.address,
      donationTracking.address,
      votingGovernance.address,
      fundAllocation.address
    );
    await charityDAOPlatform.deployed();

    // Set up contract connections
    await proposalManagement.setVotingGovernanceContract(votingGovernance.address);
    await proposalManagement.setFundAllocationContract(fundAllocation.address);
    await proposalManagement.setDonationTrackingContract(donationTracking.address);
    await fundAllocation.setPlatformContract(charityDAOPlatform.address);

    // Deploy the attacker contract
    ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
    attacker = await ReentrancyAttacker.deploy(
      fundAllocation.address, // This is already payable in the context of deployment
      proposalManagement.address
    );
    await attacker.deployed();

    // Fund the FundAllocation contract
    await owner.sendTransaction({
      to: fundAllocation.address,
      value: ethers.utils.parseEther("2")
    });

    // Add signers
    await proposalManagement.addSigner(user1.address);
    await proposalManagement.addSigner(user2.address);
  });

  it("Should test for reentrancy vulnerability", async function () {
    // Create a proposal with the attacker as the recipient
    await proposalManagement.createProposal(
      "Test Reentrancy Attack",
      ATTACK_AMOUNT,
      attacker.address
    );

    // Get the proposal ID
    const proposalCount = await proposalManagement.proposalCount();
    const proposalId = proposalCount.toNumber();

    // Set the proposal ID in the attacker contract
    await attacker.setProposalId(proposalId);

    // Vote on the proposal
    await charityDAOPlatform.voteOnProposal(proposalId);
    await charityDAOPlatform.connect(user1).voteOnProposal(proposalId);
    await charityDAOPlatform.connect(user2).voteOnProposal(proposalId);

    // Sign the proposal to approve it
    await proposalManagement.signProposal(proposalId);
    await proposalManagement.connect(user1).signProposal(proposalId);

    // Check if the proposal is approved
    const proposal = await proposalManagement.getProposalById(proposalId);
    expect(proposal.approved).to.be.true;

    // Wait for the timelock period to expire
    // In Hardhat, we can use evm_increaseTime
    const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
    await ethers.provider.send("evm_increaseTime", [remainingDelay.toNumber() + 1]);
    await ethers.provider.send("evm_mine");

    // Record initial balances
    const initialFundBalance = await ethers.provider.getBalance(fundAllocation.address);
    const initialAttackerBalance = await attacker.getBalance();

    console.log("Initial FundAllocation balance:", ethers.utils.formatEther(initialFundBalance), "ETH");
    console.log("Initial Attacker balance:", ethers.utils.formatEther(initialAttackerBalance), "ETH");

    // Execute the proposal to trigger the reentrancy attack
    await charityDAOPlatform.executeProposal(proposalId);

    // Check final balances
    const finalFundBalance = await ethers.provider.getBalance(fundAllocation.address);
    const finalAttackerBalance = await attacker.getBalance();

    console.log("Final FundAllocation balance:", ethers.utils.formatEther(finalFundBalance), "ETH");
    console.log("Final Attacker balance:", ethers.utils.formatEther(finalAttackerBalance), "ETH");

    // Check if the attack was successful
    if (finalAttackerBalance.gt(ATTACK_AMOUNT)) {
      console.log("REENTRANCY ATTACK SUCCESSFUL! The contract is vulnerable.");
      console.log("The attacker was able to drain more than the proposal amount.");
    } else {
      console.log("Reentrancy attack failed or was prevented. The contract appears to be secure.");
    }

    // For the test to pass, we expect the attack to fail (if the contract is secure)
    // If you want to test that the contract is vulnerable, change this expectation
    expect(finalAttackerBalance).to.equal(ATTACK_AMOUNT);
  });

  it("Should demonstrate a secure implementation", async function () {
    // Deploy a secure version of FundAllocation
    const SecureFundAllocation = await ethers.getContractFactory("SecureFundAllocation");
    const secureFundAllocation = await SecureFundAllocation.deploy(proposalManagement.address);
    await secureFundAllocation.deployed();
    await secureFundAllocation.setPlatformContract(charityDAOPlatform.address);

    // Fund the secure contract
    await owner.sendTransaction({
      to: secureFundAllocation.address,
      value: ethers.utils.parseEther("2")
    });

    // Deploy a new attacker targeting the secure contract
    const secureAttacker = await ReentrancyAttacker.deploy(
      secureFundAllocation.address,
      proposalManagement.address
    );
    await secureAttacker.deployed();

    // Create a proposal with the attacker as the recipient
    await proposalManagement.createProposal(
      "Test Secure Implementation",
      ATTACK_AMOUNT,
      secureAttacker.address
    );

    // Get the proposal ID
    const proposalCount = await proposalManagement.proposalCount();
    const proposalId = proposalCount.toNumber();

    // Set the proposal ID in the attacker contract
    await secureAttacker.setProposalId(proposalId);

    // Vote and sign the proposal
    await charityDAOPlatform.voteOnProposal(proposalId);
    await charityDAOPlatform.connect(user1).voteOnProposal(proposalId);
    await charityDAOPlatform.connect(user2).voteOnProposal(proposalId);
    await proposalManagement.signProposal(proposalId);
    await proposalManagement.connect(user1).signProposal(proposalId);

    // Wait for the timelock period to expire
    const remainingDelay = await proposalManagement.getRemainingExecutionDelay(proposalId);
    await ethers.provider.send("evm_increaseTime", [remainingDelay.toNumber() + 1]);
    await ethers.provider.send("evm_mine");

    // Record initial balances
    const initialSecureFundBalance = await ethers.provider.getBalance(secureFundAllocation.address);
    const initialAttackerBalance = await secureAttacker.getBalance();

    // Execute the proposal
    await secureFundAllocation.executeProposal(proposalId);

    // Check final balances
    const finalSecureFundBalance = await ethers.provider.getBalance(secureFundAllocation.address);
    const finalAttackerBalance = await secureAttacker.getBalance();

    // The secure implementation should only transfer the exact amount
    expect(finalAttackerBalance).to.equal(ATTACK_AMOUNT);
    expect(initialSecureFundBalance.sub(finalSecureFundBalance)).to.equal(ATTACK_AMOUNT);
  });
});
