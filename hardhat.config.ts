import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {
        url: 'https://rpc.ankr.com/eth',
      },
      chainId: 1,
      accounts: [{
        privateKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
        balance: '1000000000000000000000000000000'
      }]
    },

    // FILL IN YOUR NETWORK & ACCOUNT INFORMATION HERE
    mainnet: {
      url: 'https://rpc.ankr.com/eth',
      accounts: ['0x'],
    }
  }
};

export default config;
