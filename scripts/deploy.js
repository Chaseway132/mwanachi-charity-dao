const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with the account:", deployer.address);

    // Deploy the contract
    const CharityDAOPlatform = await hre.ethers.getContractFactory("CharityDAOPlatform");
    const contract = await CharityDAOPlatform.deploy();

    // Wait for deployment
    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
