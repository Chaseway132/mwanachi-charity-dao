require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {}, // Keep Hardhat for testing
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache default RPC URL
      accounts: [
        "0x4ad4f506cb5a75a0c7f3c873bfd69430e8d15a9ce6e02198ad832ac9ae6dd365",
              ], // Replace with Ganache account private keys
    },
  },
};
