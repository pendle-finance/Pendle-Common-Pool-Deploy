import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {
        url: process.env.ETH_RPC!,
      },
      chainId: 1,
      accounts: [{
        privateKey: '0x1111111111111111111111111111111111111111111111111111111111111111',
        balance: '1000000000000000000000000000000'
      }]
    },

    // FILL IN YOUR NETWORK & ACCOUNT INFORMATION HERE
    mainnet: {
      url: process.env.ETH_RPC!,
      accounts: [`${process.env.PRIVATE_KEYS}`],
    }
  }
};

export default config;
