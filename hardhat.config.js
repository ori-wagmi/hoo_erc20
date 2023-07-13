require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
      },
      arbitrum: {
        url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARB_API_KEY}`,
        accounts: [process.env.DEPLOYER_PRIV_KEY],
      } 
    },
  solidity: {
    version: "0.8.10",
    settings: {
        optimizer: {
            enabled: false,
            runs: 200,
        },
    },
  },
};
