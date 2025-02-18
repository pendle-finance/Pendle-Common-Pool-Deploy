import { encodeAbiParameters, Address } from "viem";
import hre from "hardhat";
import { setUpFork } from "./fork-setup";
import { toWei } from "./misc";
import { PENDLE } from "./consts";

enum SY_TYPE {
  ERC4626,
  ERC4626_NOT_REDEEMABLE,
  ERC20,
}

const config = {
  // SY PARAMS
  name: "SY Yearn WETH",
  symbol: "SY-yWETH",
  yieldToken: "0xAc37729B76db6438CE62042AE1270ee574CA7571" as Address,
  type: SY_TYPE.ERC4626,

  // POOL PARAMS
  expiry: 1750896000,
  rateMin: 0.1, // 10%,
  rateMax: 0.2, // 20%,
  desiredImpliedRate: 0.15, // 15%,

  // POOL SEEDING
  tokenToSeed: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as Address,
  amountToSeed: 10n ** 18n,
};

async function main() {
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
  await tokenToSeedContract.write.approve([
    commonDeploy.address,
    config.amountToSeed,
  ]);

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
      fee: toWei(config.rateMax / 50),
    },
    config.tokenToSeed,
    config.amountToSeed,
    PENDLE.GOVERNANCE_PROXY,
  ]);

  console.log("Transaction hash:", txHash);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
