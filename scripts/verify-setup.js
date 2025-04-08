const hre = require("hardhat");

async function main() {
    // Get signers
    const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();
    console.log("Using accounts:");
    console.log("Voter 1:", voter1.address);
    console.log("Voter 2:", voter2.address);
    console.log("Voter 3:", voter3.address);

    // Get contract instances with updated addresses
    const fundAllocation = await hre.ethers.getContractAt("FundAllocation", "0x849CD0ac6556D421B78a382D98f0a410E71327A5");
    const platform = await hre.ethers.getContractAt("CharityDAOPlatform", "0xbd1fb5e3cdC72BAefBAC1ca4655BD39a93D4902c");
    const votingGovernance = await hre.ethers.getContractAt("VotingGovernance", "0x180dAad9c449Aea97E49baCb94cF31c9029ceD03");

    // Check ownership and authorization
    console.log("\nChecking ownership and authorization:");
    console.log("Platform contract:", platform.address);
    console.log("Platform owner:", await platform.owner());
    console.log("Voting Governance owner:", await votingGovernance.owner());

    // Check initial fund balance
    const initialBalance = await fundAllocation.getBalance();
    console.log("\nInitial fund balance:", hre.ethers.formatEther(initialBalance), "ETH");

    // Make donations to become stakeholders
    console.log("\nMaking donations to become stakeholders...");
    const donationAmount = hre.ethers.parseEther("1.0");

    // Donate from voter1
    console.log("Voter 1 donating...");
    await platform.connect(voter1).donate({ value: donationAmount });
    console.log("Voter 1 is stakeholder:", await platform.isStakeholder(voter1.address));

    // Donate from voter2
    console.log("Voter 2 donating...");
    await platform.connect(voter2).donate({ value: donationAmount });
    console.log("Voter 2 is stakeholder:", await platform.isStakeholder(voter2.address));

    // Donate from voter3
    console.log("Voter 3 donating...");
    await platform.connect(voter3).donate({ value: donationAmount });
    console.log("Voter 3 is stakeholder:", await platform.isStakeholder(voter3.address));

    // Create a test proposal
    console.log("\nCreating test proposal...");
    const proposalTx = await platform.createProposal(
        "Test Proposal",
        "This is a test proposal for verification",
        hre.ethers.parseEther("1.0")
    );
    await proposalTx.wait();
    console.log("Proposal created");

    // Vote on the proposal
    console.log("\nVoting on proposal...");
    try {
        await votingGovernance.connect(voter1).voteOnProposal(1);
        console.log("Voter 1 voted successfully");
    } catch (error) {
        console.log("Error voting with voter 1:", error.message);
    }

    try {
        await votingGovernance.connect(voter2).voteOnProposal(1);
        console.log("Voter 2 voted successfully");
    } catch (error) {
        console.log("Error voting with voter 2:", error.message);
    }

    try {
        await votingGovernance.connect(voter3).voteOnProposal(1);
        console.log("Voter 3 voted successfully");
    } catch (error) {
        console.log("Error voting with voter 3:", error.message);
    }

    // Approve the proposal
    console.log("\nApproving proposal...");
    try {
        await votingGovernance.approveProposal(1);
        console.log("Proposal approved successfully");
    } catch (error) {
        console.log("Error approving proposal:", error.message);
    }

    // Check final state
    const finalBalance = await fundAllocation.getBalance();
    console.log("\nFinal fund balance:", hre.ethers.formatEther(finalBalance), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 
    }); 