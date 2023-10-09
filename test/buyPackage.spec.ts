import hre, { ethers } from "hardhat"
import addr from "../shared/constants/addresses"
import { expect, use } from "chai"
import { solidity } from "ethereum-waffle"
import { EXECUTION_FEE } from "../shared/constants/constant"
import { gmxProtocolFixture } from "./fixtures/gmx-protocol"
import { botProtocolFixture } from "./fixtures/bot-protocol"
import { neutraProtocolFixture } from "./fixtures/neutra-protocols"
import {
  bigNumberify,
  expandDecimals,
  getPriceBits,
  increaseTime,
  mineBlock,
  numberToWei,
  weiToNumber
} from "../shared/utils"

use(solidity)

describe("bot-test", () => {

  let positionRouter
  let fastPriceFeed
  let keeper

  let dai
  let usdc
  let weth
  let deployer
  let user0, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12, user13, user14,
    user15, leader1Lv1, leader2Lv1, leader1Lv2, leader2Lv2
  let user16, user17, user18, user19, user20, user21, user22, user23, user24, user25, user26, user27, user28, user29,
    user30, user31
  let gmxVault
  let router
  let gmxRouter
  let whale
  let geni
  let botFactory
  let bot
  let levelHelper
  let deadAddress = "0x000000000000000000000000000000000000dEaD"
  let dieAddress = "0x0000000000000000000000000000000000000000"

  before(async () => {
    await resetDataTest()
  })

  async function resetDataTest() {
    ({ dai, usdc, weth, keeper, positionRouter, fastPriceFeed, gmxVault, gmxRouter } = await gmxProtocolFixture());
    ({ botFactory, levelHelper, bot, geni } = await botProtocolFixture());
    [deployer, user0, user1, user2, user3, user4, user5, user6, user7,
      user8, user9, user10, user11, user12, user13, user14, user15, leader1Lv1, leader2Lv1, leader1Lv2,
      leader2Lv2, user16, user17, user18, user19, user20, user21, user22, user23, user24, user25, user26,
      user27, user28, user29, user30, user31] = await hre.ethers.getSigners()
    whale = await hre.ethers.getImpersonatedSigner(addr.USDC_WHALE)
    await dai.connect(whale).approve(botFactory.address, hre.ethers.constants.MaxUint256)

    await geni.connect(deployer).mint(deployer.address, expandDecimals(10000000, 18))

    await geni.connect(deployer).approve(levelHelper.address, hre.ethers.constants.MaxUint256)

    await usdc.connect(deployer).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user0).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user1).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user2).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user3).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user4).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user5).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user6).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user7).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user8).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user9).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user10).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user11).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user12).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user13).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user14).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user15).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user16).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user17).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user18).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user19).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user20).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user21).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user22).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user23).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user24).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user25).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user26).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user27).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user28).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user29).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user30).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(user31).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(leader1Lv1).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(leader2Lv1).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(leader1Lv2).approve(levelHelper.address, hre.ethers.constants.MaxUint256)
    await usdc.connect(leader2Lv2).approve(levelHelper.address, hre.ethers.constants.MaxUint256)

    await usdc.connect(whale).transfer(deployer.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user0.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user1.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user2.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user3.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user4.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user5.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user6.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user7.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user8.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user9.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user10.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user11.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user12.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user13.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user14.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user15.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user16.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user17.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user18.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user19.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user20.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user21.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user22.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user23.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user24.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user25.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user26.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user27.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user28.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user29.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user30.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(user31.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(leader1Lv1.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(leader2Lv1.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(leader1Lv2.address, expandDecimals(2000, 6))
    await usdc.connect(whale).transfer(leader2Lv2.address, expandDecimals(2000, 6))

    await geni.connect(deployer).transfer(levelHelper.address, expandDecimals(20000, 18))

    // set leaders level 1
    await levelHelper.connect(deployer).setLeaderLevel1(leader1Lv1.address)
    await levelHelper.connect(deployer).setLeaderLevel1(leader2Lv1.address)

    // set leaders level 2
    await levelHelper.connect(deployer).setLeaderLevel2(leader1Lv2.address)
    await levelHelper.connect(deployer).setLeaderLevel2(leader2Lv2.address)

    // view leader lv1
    const leadersLv1 = await levelHelper.connect(deployer).viewLeaderLevel1(0, 10)
    const leadersLv2 = await levelHelper.connect(deployer).viewLeaderLevel2(0, 10)
    // console.log('leadersLv1: ', leadersLv1);

    // await levelHelper.connect(deployer).setGovToken(addr.USDC)
    await levelHelper.setTokenFeeSupported(addr.WETH, true)

    // buy packages
    // await levelHelper.connect(user1).buyPackage([], 4, user10.address)
    // await levelHelper.connect(leader1Lv1).buyPackage([], 4, user1.address)
  }

  it("Should be reverted: Buy package with not MAIN_STABLECOIN (Weth -> uni)", async () => {
    await weth.connect(user2).deposit({ value: numberToWei(100) })
    await weth.connect(user2).approve(levelHelper.address, numberToWei(1000))
    await expect(levelHelper.connect(user2).buyPackage(
      [
        { tokenIn: addr.WETH, tokenOut: addr.UNI, fee: bigNumberify(100) }
      ],
      bigNumberify(4),
      user2.address
    )).revertedWith("PATHS: end token must be MAIN_STABLECOIN")
  })

  it("Should be reverted: Buy package with unsupported token", async () => {
    await weth.connect(user2).deposit({ value: numberToWei(100) })
    await weth.connect(user2).approve(levelHelper.address, numberToWei(1000))
    await expect(levelHelper.connect(user2).buyPackage(
      [
        { tokenIn: addr.DAI, tokenOut: addr.USDC, fee: bigNumberify(100) }
      ],
      bigNumberify(4),
      user2.address
    )).revertedWith("TOKEN FEE IS NOT SUPPORTED")
  })

  it("Buy package with other token (Weth -> usdc)", async () => {
    await weth.connect(user2).deposit({ value: numberToWei(100) })
    await weth.connect(user2).approve(levelHelper.address, numberToWei(1000))
    await expect(levelHelper.connect(user2).buyPackage(
      [
        { tokenIn: addr.WETH, tokenOut: addr.USDC, fee: bigNumberify(100) }
      ],
      bigNumberify(4),
      user2.address
    )).to.emit(weth, "Transfer").withArgs(user2.address, levelHelper.address, "541916496799708709")
  })

  it("Buy package with other token (Weth -> usdt -> usdc)", async () => {
    await weth.connect(user3).deposit({ value: numberToWei(100) })
    await weth.connect(user3).approve(levelHelper.address, numberToWei(1000))
    await expect(levelHelper.connect(user3).buyPackage(
      [
        { tokenIn: addr.WETH, tokenOut: addr.USDT, fee: bigNumberify(100) },
        { tokenIn: addr.USDT, tokenOut: addr.USDC, fee: bigNumberify(100) }
      ],
      bigNumberify(4),
      user2.address
    )).to.emit(weth, "Transfer").withArgs(user3.address, levelHelper.address, "542605620704968415")
  })


  it("Buy package with ETH", async () => {
    await levelHelper.setTokenFeeSupported(addr.ETH, true)
    const nativeBalanceBefore = await ethers.provider.getBalance(user4.address)
    await expect(levelHelper.connect(user4).buyPackage(
      [
        { tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }
      ],
      bigNumberify(4),
      user2.address,
      { value: numberToWei(100) }
    )).to.emit(levelHelper, "BuyPackage")

    expect(await ethers.provider.getBalance(user4.address)).eq(nativeBalanceBefore.sub("541916496799708709"))
  })

  it("ClaimRevenueReward", async () => {
    await expect(levelHelper.connect(user2).claimPendingRevenue([weth.address, addr.ETH]))
      .to.emit(levelHelper, "RevenueClaim").withArgs(user2.address, weth.address, "54260562070496841")
      .to.emit(levelHelper, "RevenueClaim").withArgs(user2.address, addr.ETH, "54191649679970870")
  })

  it("Admin recover eth", async () => {
    const levelHelperBalanceBefore = await ethers.provider.getBalance(levelHelper.address)
    const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address)
    expect(levelHelperBalanceBefore).gt(0)
    await levelHelper.connect(deployer).adminRecoverToken(addr.ETH, levelHelperBalanceBefore)
    expect(await ethers.provider.getBalance(levelHelper.address)).eq(0)
    expect(await ethers.provider.getBalance(deployer.address)).eq(deployerBalanceBefore.add(levelHelperBalanceBefore))
  })

  it("Ref tree work around", async () => {
    await resetDataTest()

    await levelHelper.connect(leader1Lv2).buyPackage([], 4, leader1Lv1.address)
    await levelHelper.connect(user1).buyPackage([], 4, leader1Lv2.address)
    await levelHelper.connect(user2).buyPackage([], 4, user1.address) // $100 for  user 1
    await levelHelper.connect(user3).buyPackage([], 4, user2.address) // $20 for  user 1
    await levelHelper.connect(user4).buyPackage([], 4, user3.address) // $20 for  user 1
    await levelHelper.connect(user5).buyPackage([], 4, user4.address) // $20 for  user 1
    await levelHelper.connect(user6).buyPackage([], 4, user5.address) // $20 for  user 1
    await levelHelper.connect(user7).buyPackage([], 4, user6.address) // $20 for  user 1
    await levelHelper.connect(user8).buyPackage([], 4, user7.address) // $20 for  user 1
    await levelHelper.connect(user9).buyPackage([], 4, user8.address) // $20 for  user 1
    await levelHelper.connect(user10).buyPackage([], 4, user9.address) // $20 for  user 1
    await levelHelper.connect(user11).buyPackage([], 4, user10.address) // $20 for  user 1
    // => user 1 reward = 100 + 20 *  9 = 280
    // => user 2 reward = 100 + 20 *  8 = 260
    // ...
    expect(await levelHelper.pendingRevenue(user1.address, usdc.address)).eq(numberToWei(100 + 20 * 9, 6))
    expect(await levelHelper.pendingRevenue(user2.address, usdc.address)).eq(numberToWei(100 + 20 * 8, 6))
    expect(await levelHelper.pendingRevenue(user3.address, usdc.address)).eq(numberToWei(100 + 20 * 7, 6))
    expect(await levelHelper.pendingRevenue(user4.address, usdc.address)).eq(numberToWei(100 + 20 * 6, 6))
    expect(await levelHelper.pendingRevenue(user5.address, usdc.address)).eq(numberToWei(100 + 20 * 5, 6))
    expect(await levelHelper.pendingRevenue(user6.address, usdc.address)).eq(numberToWei(100 + 20 * 4, 6))
    expect(await levelHelper.pendingRevenue(user7.address, usdc.address)).eq(numberToWei(100 + 20 * 3, 6))
    expect(await levelHelper.pendingRevenue(user8.address, usdc.address)).eq(numberToWei(100 + 20 * 2, 6))
    expect(await levelHelper.pendingRevenue(user9.address, usdc.address)).eq(numberToWei(100 + 20, 6))
    expect(await levelHelper.pendingRevenue(user10.address, usdc.address)).eq(numberToWei(100, 6))

    await levelHelper.setTokenFeeSupported(addr.ETH, true);
    // 541916496799708709 = 1000 USD = price package 4
    await levelHelper.connect(user12).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user1.address, {value: numberToWei(1)})  // 541916496799708709 / 10 for  user 1 (10%)
    await levelHelper.connect(user13).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user12.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user14).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user13.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user15).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user14.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user16).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user15.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user17).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user16.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user18).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user17.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user19).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user18.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user20).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user19.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)
    await levelHelper.connect(user21).buyPackage([{ tokenIn: addr.ETH, tokenOut: addr.USDC, fee: bigNumberify(100) }], 4, user20.address, {value: numberToWei(1)}) // 541916496799708709 / 50 for user 1 (2%)

    const package4Price = bigNumberify("541916496799708709")
    // => user 1 reward = package4Price * 10% + package4Price * 2% *  9
    // => user 2 reward = package4Price * 10% + package4Price * 2% *  8
    // ...
    expect(await levelHelper.pendingRevenue(user1.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(9)))
    expect(await levelHelper.pendingRevenue(user12.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(8)))
    expect(await levelHelper.pendingRevenue(user13.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(7)))
    expect(await levelHelper.pendingRevenue(user14.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(6)))
    expect(await levelHelper.pendingRevenue(user15.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(5)))
    expect(await levelHelper.pendingRevenue(user16.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(4)))
    expect(await levelHelper.pendingRevenue(user17.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(3)))
    expect(await levelHelper.pendingRevenue(user18.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(2)))
    expect(await levelHelper.pendingRevenue(user19.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(1)))
    expect(await levelHelper.pendingRevenue(user20.address, addr.ETH)).eq(package4Price.div(10).add(package4Price.div(50).mul(0)))
    expect(await levelHelper.pendingRevenue(user21.address, addr.ETH)).eq(0)
  })
})
