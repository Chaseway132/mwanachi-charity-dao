const { ethers } = require("hardhat");

async function main() {
    console.log("Tracing Fund Transfer Transaction\n");

    // The transaction hash from your screenshot
    const txHash = "0xd5ec6b58435b3e6d4b6cc19678a74bdfeb2786069117eb94379ec452af1006b";
    
    // The recipient address you mentioned
    const recipientAddress = "0xEA4204E9f8B8484Cde8d4075de8F4FE67aD25456";

    try {
        // Get the transaction details
        const tx = await ethers.provider.getTransaction(txHash);
        const receipt = await ethers.provider.getTransactionReceipt(txHash);

        if (!tx || !receipt) {
            console.log("Transaction not found. This might be because:");
            console.log("1. The transaction is too old and not in Ganache's history");
            console.log("2. Ganache has been restarted since the transaction");
            console.log("\nAlternative way to verify the transfer:");
            console.log("1. Open Ganache UI");
            console.log("2. Go to 'Transactions' tab");
            console.log("3. Look for internal transactions with value 1 ETH");
            console.log("4. Check the recipient address:", recipientAddress);
            return;
        }

        console.log("1. Transaction Overview:");
        console.log("------------------------");
        console.log(`Transaction Hash: ${txHash}`);
        console.log(`From Address: ${tx.from}`);
        console.log(`To (Contract): ${tx.to}`);
        console.log(`Apparent Value: ${ethers.formatEther(tx.value)} ETH (This is 0 because it's a contract call)`);
        
        // Get contract instances
        const fundAllocation = await ethers.getContractAt("FundAllocation", tx.to);
        const proposalManagement = await ethers.getContractAt("ProposalManagement", await fundAllocation.proposalContract());

        console.log("\n2. Contract Interaction Flow:");
        console.log("------------------------");
        console.log("a. User calls FundAllocation.executeProposal()");
        console.log("b. FundAllocation gets proposal details from ProposalManagement");
        console.log("c. FundAllocation transfers ETH to recipient");
        
        console.log("\n3. Recipient Details:");
        console.log("------------------------");
        console.log(`Recipient Address: ${recipientAddress}`);
        const balanceAfter = await ethers.provider.getBalance(recipientAddress);
        console.log(`Current Balance: ${ethers.formatEther(balanceAfter)} ETH`);
        
        console.log("\n4. How to Verify in Ganache:");
        console.log("------------------------");
        console.log("1. Open Ganache UI");
        console.log("2. Click on the transaction:", txHash);
        console.log("3. Look for 'Created Contract' or 'Contract Call'");
        console.log("4. Check recipient's account:", recipientAddress);
        console.log("5. Verify balance changed from 100 ETH to 101 ETH");
        
        console.log("\n5. Why It's Hard to Trace:");
        console.log("------------------------");
        console.log("1. The transaction shows 0 ETH because it's a contract call");
        console.log("2. The recipient address is stored in the proposal data");
        console.log("3. The actual transfer happens as an internal transaction");
        console.log("4. You need to look at:");
        console.log("   - The proposal data for recipient address");
        console.log("   - The balance changes to verify the transfer");
        console.log("   - The internal transaction in Ganache");

    } catch (error) {
        console.error("\nError tracing transaction:", error.message);
        console.log("\nDon't worry! You can still verify the transfer in Ganache UI:");
        console.log("1. Open Ganache");
        console.log("2. Go to Accounts tab");
        console.log("3. Find address:", recipientAddress);
        console.log("4. Check balance history: 100 ETH → 101 ETH");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 