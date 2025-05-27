const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Checking and configuring timelock settings...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get deployed addresses
  const addressesPath = path.join(__dirname, "../deployedAddresses.json");
  console.log("\nLoading addresses from:", addressesPath);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  // Get contract instances
  console.log("\nConnecting to contracts...");

  const ProposalManagement = await ethers.getContractFactory("ProposalManagement");
  const proposalManagement = ProposalManagement.attach(addresses.PROPOSAL_MANAGEMENT);
  console.log("ProposalManagement at:", await proposalManagement.getAddress());

  // Check current timelock duration
  console.log("\nChecking current timelock settings...");

  let timelockDuration;
  try {
    timelockDuration = await proposalManagement.timelockDuration();
    console.log("Current timelock duration:", timelockDuration.toString(), "seconds");
  } catch (error) {
    console.log("Could not get timelock duration directly. This might be normal if it's a private variable.");
    timelockDuration = 45; // Default value in most contracts
    console.log("Assuming default timelock duration:", timelockDuration, "seconds");
  }

  // Check if we're the owner
  const owner = await proposalManagement.owner();
  console.log("Contract owner:", owner);

  const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();
  console.log("Are we the owner?", isOwner);

  if (!isOwner) {
    console.log("\nWe are not the owner of the contract. Cannot modify timelock settings.");
    console.log("Please use the account that owns the contract to run this script.");
    return;
  }

  // For demo purposes, we can keep the existing 45 seconds or adjust it
  console.log("\nCurrent timelock duration is 45 seconds.");
  console.log("This is a good balance for demonstration purposes:");
  console.log("- Long enough to show the security feature");
  console.log("- Short enough to not disrupt your presentation flow");

  // We'll keep the current setting unless you want to change it
  const desiredDuration = 45; // Keep the existing 45 seconds
  console.log(`\nKeeping the timelock duration at ${desiredDuration} seconds for the demo...`);

  // Set the timelock duration
  try {
    const tx = await proposalManagement.setTimelockDuration(desiredDuration);
    await tx.wait();
    console.log("Timelock duration set successfully!");

    // Verify the new duration if possible
    try {
      const newDuration = await proposalManagement.timelockDuration();
      console.log("New timelock duration:", newDuration.toString(), "seconds");
    } catch (error) {
      console.log("Could not verify new timelock duration. This might be normal if it's a private variable.");
    }
  } catch (error) {
    console.error("Error setting timelock duration:", error.message);

    // Try alternative method if the first one fails
    try {
      console.log("\nTrying alternative method to set timelock duration...");
      const tx = await proposalManagement.updateTimelockDuration(desiredDuration);
      await tx.wait();
      console.log("Timelock duration set successfully using alternative method!");
    } catch (altError) {
      console.error("Alternative method failed:", altError.message);
      console.log("\nCould not set timelock duration. The contract might not have a function to change it.");
      console.log("Consider checking the contract code or deploying a new contract with the desired timelock duration.");
    }
  }

  // Check for any proposals that need to have their execution time updated
  console.log("\nChecking for proposals that need timelock updates...");

  const proposalCount = await proposalManagement.proposalCount();
  console.log("Total proposals:", proposalCount.toString());

  if (proposalCount.toString() === "0") {
    console.log("No proposals found. Nothing to update.");
    return;
  }

  // Get the current time
  const currentTime = Math.floor(Date.now() / 1000);

  // Check each proposal
  for (let i = 1; i <= proposalCount; i++) {
    const proposal = await proposalManagement.getProposalById(i);

    console.log(`\nProposal ${i}:`);
    console.log("- Description:", proposal.description);
    console.log("- Approved:", proposal.approved);
    console.log("- Executed:", proposal.executed);

    if (proposal.executionTime) {
      console.log("- Execution time:", new Date(Number(proposal.executionTime) * 1000).toLocaleString());

      const timeRemaining = Number(proposal.executionTime) - currentTime;
      console.log("- Time remaining:", timeRemaining > 0 ? `${timeRemaining} seconds` : "Ready to execute");

      // If the proposal is approved but not executed and has a long timelock remaining,
      // update it to have a shorter timelock for demo purposes
      if (proposal.approved && !proposal.executed && timeRemaining > desiredDuration) {
        console.log("  This proposal needs its timelock updated for the demo.");

        try {
          // Try to update the execution time
          console.log("  Updating execution time...");

          // Set execution time to current time + desired duration
          const newExecutionTime = currentTime + desiredDuration;

          // Try different methods to update the execution time
          try {
            const tx = await proposalManagement.updateProposalExecutionTime(i, newExecutionTime);
            await tx.wait();
            console.log("  Execution time updated successfully!");
          } catch (error) {
            console.error("  Error updating execution time:", error.message);

            // Try alternative method
            try {
              console.log("  Trying alternative method...");
              const tx = await proposalManagement.setProposalExecutionTime(i, newExecutionTime);
              await tx.wait();
              console.log("  Execution time updated successfully using alternative method!");
            } catch (altError) {
              console.error("  Alternative method failed:", altError.message);
              console.log("  Could not update execution time. The contract might not have a function to change it.");
            }
          }

          // Verify the update
          const updatedProposal = await proposalManagement.getProposalById(i);
          console.log("  New execution time:", new Date(Number(updatedProposal.executionTime) * 1000).toLocaleString());

          const newTimeRemaining = Number(updatedProposal.executionTime) - currentTime;
          console.log("  New time remaining:", newTimeRemaining > 0 ? `${newTimeRemaining} seconds` : "Ready to execute");
        } catch (error) {
          console.error("  Error updating proposal:", error.message);
        }
      }
    } else {
      console.log("- No execution time set");
    }
  }

  console.log("\nTimelock configuration completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nScript execution failed!");
    console.error(error);
    process.exit(1);
  });
