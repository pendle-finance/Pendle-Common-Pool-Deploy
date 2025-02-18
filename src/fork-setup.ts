import hre from "hardhat";
import { toWei } from "./misc";

export async function setUpFork() {
  const [deployer] = await hre.viem.getWalletClients();
  const weth = await hre.viem.getContractAt("IWETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  await weth.write.deposit({ value: toWei(10) });

  const yearnWeth = await hre.viem.getContractAt('ERC4626', '0xAc37729B76db6438CE62042AE1270ee574CA7571');
  await weth.write.approve([yearnWeth.address, toWei(1)]);
  await yearnWeth.write.deposit([toWei(1), deployer.account.address]);
} 