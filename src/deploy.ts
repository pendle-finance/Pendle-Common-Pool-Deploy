import { encodeAbiParameters, Address } from "viem";
import hre from "hardhat";
import { setUpFork } from "./fork-setup";
import { toWei } from "./misc";
import { PENDLE } from "./consts";
import { publicClient } from "./client";

enum SY_TYPE {
  ERC4626,
  ERC4626_NOT_REDEEMABLE,
  ERC20,
}

const config = {
  // SY PARAMS
  name: "SY " + "Yearn WETH",
  symbol: "SY-" + "yWETH",
  yieldToken: "0xAc37729B76db6438CE62042AE1270ee574CA7571" as Address, // If it's 4626, use the 4626 address. Else, use the erc20 address
  type: SY_TYPE.ERC4626, // change accordingly

  // POOL PARAMS
  expiry: 1750896000, // Should be thursday
  rateMin: 0.1, // 10%,
  rateMax: 0.2, // 20%,
  desiredImpliedRate: 0.15, // 15%,

  // POOL SEEDING
  tokenToSeed: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as Address, // If it's 4626, it can be the asset or 4626 itself
  amountToSeed: 10n ** 18n, // change if necessary
};

async function main() {
  validateConfig();
  const commonDeploy = await hre.viem.getContractAt(
    "IPendleCommonPoolDeployHelperV2",
    PENDLE.COMMON_POOL_DEPLOY_HELPER
  );

  if (hre.network.name === "hardhat") {
    await setUpFork();
  }

  const tokenToSeedContract = await hre.viem.getContractAt(
    "IERC20",
    config.tokenToSeed
  );

  await tokenToSeedContract.write
    .approve([PENDLE.COMMON_POOL_DEPLOY_HELPER, config.amountToSeed])
    .then(async (hash) => {
      console.log("Approve TxHash:", hash);
      if (hre.network.name === "hardhat") {
        return;
      }
      await publicClient.waitForTransactionReceipt({ hash });
    });

  const constructorParams = encodeAbiParameters(
    [
      {
        type: "string",
      },
      {
        type: "string",
      },
      {
        type: "address",
      },
    ],
    [config.name, config.symbol, config.yieldToken]
  );

  let deployFunc;
  switch (config.type) {
    case SY_TYPE.ERC4626:
      deployFunc = commonDeploy.write.deployERC4626Market;
      break;
    case SY_TYPE.ERC4626_NOT_REDEEMABLE:
      deployFunc = commonDeploy.write.deployERC4626NotRedeemableMarket;
      break;
    case SY_TYPE.ERC20:
      deployFunc = commonDeploy.write.deployERC20Market;
      break;
    default:
      throw new Error("Invalid SY type");
  }

  const txHash = await deployFunc([
    constructorParams,
    {
      expiry: config.expiry,
      rateMin: toWei(config.rateMin),
      rateMax: toWei(config.rateMax),
      desiredImpliedRate: toWei(config.desiredImpliedRate),
      fee: toWei(config.rateMax / 25),
    },
    config.tokenToSeed,
    config.amountToSeed,
    PENDLE.GOVERNANCE_PROXY,
  ]);

  console.log("Deploy transaction hash:", txHash);
}

function validateConfig() {
  if (config.rateMin > config.desiredImpliedRate) {
    throw new Error("rateMin should be less than desiredImpliedRate");
  }
  if (config.rateMax < config.desiredImpliedRate) {
    throw new Error("rateMax should be greater than desiredImpliedRate");
  }
  if (config.expiry % 604800 !== 0) {
    throw new Error("Expiry should be on Thursday");
  }
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
