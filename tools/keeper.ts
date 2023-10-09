
import hre from 'hardhat';
import addr from '../shared/constants/addresses';
import { expect, use } from 'chai';
import { solidity } from 'ethereum-waffle';
import { EXECUTION_FEE } from '../shared/constants/constant';
import { gmxProtocolFixture } from '../shared/fixtures/gmx-protocol';
import { botProtocolFixture } from '../shared/fixtures/bot-protocol';
import { neutraProtocolFixture } from '../shared/fixtures/neutra-protocols';
import { expandDecimals, getPriceBits, increaseTime, mineBlock } from '../shared/utils';

const main = async () => {
  let positionRouter;
  let fastPriceFeed;
  let keeper;

  let dai;
  let usdc;
  let deployer;
  let user0;
  let user1;
  let gmxVault;
  let router;
  let gmxHelper;
  let gmxRouter;

  let whale;

  let wbtcPrice;
  let wethPrice;
  let uniPrice;
  let linkPrice;
  let botFactory;
  let prices;
  let botAddress;
  let admin;

  // Prepare
  ({ dai, usdc, keeper, positionRouter, fastPriceFeed, gmxVault, gmxRouter, admin } = await gmxProtocolFixture());

  const execute = async () => {
    wbtcPrice = (await gmxVault.getMinPrice(addr.WBTC)).toString();
    wethPrice = expandDecimals(1850,30).toString();
    linkPrice = (await gmxVault.getMinPrice(addr.LINK)).toString();
    uniPrice = (await gmxVault.getMinPrice(addr.UNI)).toString();

    prices = [
      wbtcPrice.substring(0, wbtcPrice.length - 27),
      wethPrice.substring(0, wethPrice.length - 27),
      linkPrice.substring(0, linkPrice.length - 27),
      uniPrice.substring(0, uniPrice.length - 27)
    ];

    const increaseIndex = await positionRouter.increasePositionRequestKeysStart();
    const decreaseIndex = await positionRouter.decreasePositionRequestKeysStart();
    const blockNum = await hre.ethers.provider.getBlockNumber();
    const block = await hre.ethers.provider.getBlock(blockNum);
    const timestamp = block.timestamp;
    let priceBits = getPriceBits(prices);

    await fastPriceFeed.connect(keeper).setPricesWithBitsAndExecute(
      priceBits,
      timestamp,
      increaseIndex + 5,
      decreaseIndex + 5,
      2,
      10000
    )
  }
  execute()
  setInterval(() => {
    execute()
  }, 30 * 1000)
}



main().then(() => console.log('Bot execute success!')).catch((e) => {
  console.log(e)
  process.exit(0)
})