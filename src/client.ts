import hre from 'hardhat';
import { createPublicClient, http } from "viem"
import * as chains from "viem/chains"

export const publicClient = createPublicClient({
    transport: http(),
    chain: Object.values(chains).filter((c) => c.id === hre.network.config.chainId!)[0],
})