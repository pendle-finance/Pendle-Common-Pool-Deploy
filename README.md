# Pendle Common Pool Deployment

This repository provides a simple method for external parties to deploy pools on Pendle. Pendle common pool deployment fits you perfectly if you are hosting:

- An ERC20 with points
- An ERC4626 (with or without points, redeemable or not redeemable)

Bearing any further complication, please contact us for an in-depth discussion.

## Set up

### Environment

```
npm i
```

### Network and Account

This repo is implemented with hardhat framework. The first step is to initialize your network and account configuration in `./hardhat.config.ts`. Below is an example of a Ethereum-mainnet configuration.

```ts
    ...
    // FILL IN YOUR NETWORK & ACCOUNT INFORMATION HERE
    mainnet: {
      url: 'https://rpc.ankr.com/eth',
      accounts: ['0x1111111111111111111111111111111111111111111111111111111111111111'],
    }
```

### Pool Params 

The other step before deploying your pool is to fill in the params in `./src/deploy.ts`.

```ts
const config = {
  // SY PARAMS
  name: "SY <Your token name>",
  symbol: "SY-<Your token symbol>",
  yieldToken: "<Your ERC20/ERC4626 address>" as Address,
  type: SY_TYPE.ERC4626,

  // POOL PARAMS
  expiry: 1750896000, // 26 JUN 2025
  rateMin: 0.1, // 10%,
  rateMax: 0.2, // 20%,
  desiredImpliedRate: 0.15, // 15%,

  // POOL SEEDING
  tokenToSeed: "<Your preferred token to seed liquidity>" as Address,
  amountToSeed: 10n ** 18n,
};
```

Details for the params as follow:

| Field                | Description                                                                                                  |
|----------------------|--------------------------------------------------------------------------------------------------------------|
| `name`               | Having `SY` prefix is a must. Other than that, our suggestion is simply put your `token.name()` after a whitespace. |
| `symbol`             | Similar to `name`, having `SY-` prefix is required. You can follow it with your `token.symbol()`.             |
| `yieldToken`         | The address of your ERC20 or ERC4626 token.                                                                  |
| `type`               | The type of your yield-bearing asset. It can be `SY_TYPE.ERC20`, `SY_TYPE.ERC4626` or `SY_TYPE.ERC4626_NOT_REDEEMABLE`. |
| `expiry`             | The Unix timestamp for the pool's expiry date.                                                               |
| `rateMin`            | The minimum interest rate for the pool.                                                                      |
| `rateMax`            | The maximum interest rate for the pool.                                                                      |
| `desiredImpliedRate` | The starting interest rate for the pool. We recommend putting in the current spot interest rate (including base interest and points) for the asset respecting to your estimation. |
| `tokenToSeed`        | The address of the token you want to use for seeding liquidity.                                               |
| `amountToSeed`       | The amount of tokens you want to use for seeding liquidity, in wei.                                          |

This means you have to have at least `amountToSeed` of `tokenToSeed` in your configured account. We highly recommend you to proceed with no more than $10\$$ of token in this step and only seed the rest of your preferred initial liquidity on our UI after you check the configuration for deployed addresses.

### Deploy

Once you have filled in the parameters, you can deploy your pool by running the following command:

```bash
npx hardhat run ./scripts/deploy.ts --network mainnet
```

This will deploy your pool to the Ethereum mainnet. Console output of this command is the transaction hash of the deployment where you will be able to find the deployed addresses there.