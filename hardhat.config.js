require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        "0xd45bfe5f2e591b0f14c6c106597270b29547b8e0dfc6fef186bce3df81dac2e9",
        "0xb8805667126815d1419d895ef403e5e1832ca0485c2431bb9235c41277f4dbef",
        "0xc980fc1f62ba16859289f5b344f4d0ca29eaa33d43fe4042fbe6848c08a9ebf2"
      ]
    }
  }
}; 