// Script to fund the FundAllocation contract
const { ethers } = require("ethers");
const { FUND_ALLOCATION } = require("../config/contracts");

async function main() {
  try {
    console.log("Starting script to fund the FundAllocation contract...");
    console.log("FundAllocation contract address:", FUND_ALLOCATION);

    // Connect to the provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Connected to provider");

    // Get signer
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log("Using account:", address);

    // Check current balance of the contract
    const contractBalance = await provider.getBalance(FUND_ALLOCATION);
    console.log("Current contract balance:", ethers.formatEther(contractBalance), "ETH");

    // Amount to send (0.5 ETH)
    const amountToSend = ethers.parseEther("0.5");
    console.log("Sending", ethers.formatEther(amountToSend), "ETH to contract");

    // Send transaction
    const tx = await signer.sendTransaction({
      to: FUND_ALLOCATION,
      value: amountToSend
    });
    console.log("Transaction sent:", tx.hash);

    // Wait for confirmation
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Check new balance
    const newBalance = await provider.getBalance(FUND_ALLOCATION);
    console.log("New contract balance:", ethers.formatEther(newBalance), "ETH");

    console.log("Funding complete!");
    return { success: true };
  } catch (error) {
    console.error("Error funding contract:", error);
    return { success: false, error };
  }
}

// Export the function to be called from the browser
window.fundContract = main;

// Run the script if executed directly
if (typeof window !== 'undefined' && window.ethereum) {
  main()
    .then(result => console.log("Script result:", result))
    .catch(error => console.error("Script error:", error));
}
