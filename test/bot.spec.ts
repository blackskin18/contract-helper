import hre, { ethers } from 'hardhat';
import addr from '../shared/constants/addresses';
import { expect, use } from 'chai';
import { solidity } from 'ethereum-waffle';
import { EXECUTION_FEE } from '../shared/constants/constant';
import { gmxProtocolFixture } from './fixtures/gmx-protocol';
import { botProtocolFixture } from './fixtures/bot-protocol';
import { neutraProtocolFixture } from './fixtures/neutra-protocols';
import { expandDecimals, getPriceBits, increaseTime, mineBlock } from '../shared/utils';

use(solidity)

describe('bot-test', () => {

    let positionRouter;
    let fastPriceFeed;
    let keeper;

    let dai;
    let usdc;
    let deployer;
    let user0;
    let user1;
    let user2;
    let user3;
    let user4;
    let user5;
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
    let bot;
    let levelHelper;
    let geniKeeper;
    let minExecuteFee

    before(async () => {
        ({ dai, usdc, keeper, positionRouter, fastPriceFeed, gmxVault, gmxRouter } = await gmxProtocolFixture());
        ({ botFactory, levelHelper, bot, gmxHelper } = await botProtocolFixture());
        [deployer, user0, user1, user2, user3, user4, user5, geniKeeper] = await hre.ethers.getSigners();

        whale = await hre.ethers.getImpersonatedSigner(addr.BINANCE_HOT_WALLET);
        await usdc.connect(whale).transfer(deployer.address, expandDecimals(1000, 6));
        await usdc.connect(whale).approve(botFactory.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(whale).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await dai.connect(whale).approve(botFactory.address, hre.ethers.constants.MaxUint256);
        await botFactory.connect(whale).deposit(addr.USDC, expandDecimals(1000, 6));

        await levelHelper.connect(whale).buyPackage(addr.USDC, 1, user5.address);
        const userPackageTimes = await levelHelper.userPackageTimes(whale.address);

        await botFactory.connect(whale).createNewBot(0, 100, 500, 20, 20);
        // await botFactory.connect(whale).createNewBot(0, 100, 500, 20, 20);
        // await botFactory.connect(whale).createNewBot(0, user1.address, 100, 500, 20, 20);

        const bots = await botFactory.viewUserBots(whale.address, 0, 100);
        botAddress = await bots[0];
        // console.log('bots: ', bots);

        const user = await botFactory.users(whale.address)
        expect(user.balance).eq(expandDecimals(1000, 6));

        await botFactory.connect(deployer).setBotKeeper(user0.address, true);
        await botFactory.connect(deployer).setBotKeeper(gmxHelper.address, true);

        // 
        await gmxHelper.connect(deployer).setKeeper(geniKeeper.address, true);
        // expect(await botFactory.isBotKeeper(deployer.address)).eq(true);

        wbtcPrice = (await gmxVault.getMinPrice(addr.WBTC)).toString();
        wethPrice = (await gmxVault.getMinPrice(addr.WETH)).toString();
        linkPrice = (await gmxVault.getMinPrice(addr.LINK)).toString();
        uniPrice = (await gmxVault.getMinPrice(addr.UNI)).toString();

        prices = [
            wbtcPrice.substring(0, wbtcPrice.length - 27),
            wethPrice.substring(0, wethPrice.length - 27),
            linkPrice.substring(0, linkPrice.length - 27),
            uniPrice.substring(0, uniPrice.length - 27)
        ];

        bot = await hre.ethers.getContractAt("GeniBot", botAddress);
        // user whale follow trader 
        // await bot.connect(whale).addFollowTrader(addr.WBTC, user1.address);

        // const transactionHash = await deployer.sendTransaction({
        //     to: bot.address,
        //     value: expandDecimals(1, 18), // Sends exactly 1.0 ether
        // });

        // console.log('transactionHash: ', transactionHash)
    })

    it('check deposit DAI', async () => {
        await botFactory.connect(whale).deposit(addr.DAI, expandDecimals(10, 18));
        const user = await botFactory.users(whale.address);

        expect(user.balance).gt(0);
    })

    it('check buy package', async () => {
        // await levelHelper.connect(whale).buyPackage(addr.USDC, 4, user5.address);
        // const userPackageTimes = await levelHelper.userPackageTimes(whale.address);
        // console.log("levelHelper balance: ", await usdc.balanceOf(levelHelper.address));
        // console.log("whale user level: ", await levelHelper.getUserLevel(whale.address));
        // expect(userPackageTimes).gt(0);
    })
    
    it('checks SHORT increase, decrease position', async () => {
        // bot create increase position
        await bot.connect(user0).createIncreasePosition(
            user1.address,
            [addr.USDC],
            addr.WBTC,
            expandDecimals(100, 6),
            0,
            expandDecimals(200, 30),
            false,
            0,
            EXECUTION_FEE,
            {
                value: EXECUTION_FEE
            }
        )

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

        const position = await gmxVault.getPosition(bot.address, addr.USDC, addr.WBTC, false);

        expect(position[0]).eq(expandDecimals(200, 30));
        // console.log("position", position)
        await bot.connect(user0).createDecreasePositionVault(
            user1.address,
            [addr.USDC],
            addr.WBTC,
            expandDecimals(998, 29),
            expandDecimals(200, 30),
            false,
            0
        )

        // await bot.connect(user0).createDecreasePosition(
        //     user1.address,
        //     [addr.WBTC, addr.WETH],
        //     addr.WBTC,
        //     expandDecimals(998, 29),
        //     expandDecimals(200, 30),
        //     false,
        //     0,
        //     0,
        //     EXECUTION_FEE,
        //     "0x0000000000000000000000000000000000000000",
        //     {
        //         value: EXECUTION_FEE
        //     }
        // )

        // const increaseIndex2 = await positionRouter.increasePositionRequestKeysStart();
        // const decreaseIndex2 = await positionRouter.decreasePositionRequestKeysStart();
        // const blockNum2 = await hre.ethers.provider.getBlockNumber();
        // const block2 = await hre.ethers.provider.getBlock(blockNum2);
        // const timestamp2 = block.timestamp;
        // let priceBits2 =  getPriceBits(prices);

        // await fastPriceFeed.connect(keeper).setPricesWithBitsAndExecute(
        //     priceBits2,
        //     timestamp2,
        //     increaseIndex2 + 5,
        //     decreaseIndex2 + 5,
        //     0,
        //     10000
        // )

        const position2 = await gmxVault.getPosition(bot.address, addr.USDC, addr.WBTC, false);
        expect(position2[0]).eq(expandDecimals(0, 30));
    })

    // it('check revert increase position', async() => {
    //     // bot create increase position
    //     const balanceBotFactory = await usdc.balanceOf(botFactory.address);

    //     await bot.connect(user0).createIncreasePosition(
    //         user1.address,
    //         [addr.USDC],
    //         addr.WBTC,
    //         expandDecimals(1000, 6),
    //         0,
    //         expandDecimals(2000, 30),
    //         false,
    //         0,
    //         EXECUTION_FEE,
    //         {
    //             value: EXECUTION_FEE
    //         }
    //     )

    //     const increaseIndex = await positionRouter.increasePositionRequestKeysStart();
    //     const decreaseIndex = await positionRouter.decreasePositionRequestKeysStart();
    //     const blockNum = await hre.ethers.provider.getBlockNumber();
    //     const block = await hre.ethers.provider.getBlock(blockNum);
    //     const timestamp = block.timestamp;
    //     let priceBits =  getPriceBits(prices);

    //     await fastPriceFeed.connect(keeper).setPricesWithBitsAndExecute(
    //         priceBits,
    //         timestamp,
    //         increaseIndex + 5,
    //         decreaseIndex + 5,
    //         1,
    //         100
    //     )
    // })

    it('checks LONG increase, decrease position', async () => {
        // console.log("prices: ", prices)

        // bot create increase position
        await bot.connect(user0).createIncreasePosition(
            user1.address,
            [addr.USDC, addr.WBTC],
            addr.WBTC,
            expandDecimals(100, 6),
            0,
            expandDecimals(200, 30),
            true,
            expandDecimals(prices[0], 27),
            EXECUTION_FEE,
            {
                value: EXECUTION_FEE
            }
        )

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

        const position = await gmxVault.getPosition(bot.address, addr.USDC, addr.WBTC, true);

        // expect(position[0]).eq(expandDecimals(200, 30));
        // console.log("position", position)
        // await bot.connect(user0).createDecreasePosition(
        //     user1.address,
        //     [addr.USDC],
        //     addr.WBTC,
        //     expandDecimals(998, 29),
        //     expandDecimals(200, 30),
        //     true,
        //     0
        // )

        // const position2 = await gmxVault.getPosition(bot.address, addr.USDC, addr.WBTC, true);
        // expect(position2[0]).eq(expandDecimals(0, 30));
    })

    it('check withdraw balance', async () => {
        const balanceBot = await usdc.balanceOf(botFactory.address);

        await botFactory.connect(whale).withdrawBalance(expandDecimals(100, 6));
        const balanceBot2 = await usdc.balanceOf(botFactory.address);
        expect(balanceBot2).eq(balanceBot - Number(expandDecimals(100, 6)));
    })

    it("Bulk increase, decrease pass validate", async () => {
        await gmxHelper.connect(geniKeeper).bulkOrders(
            [
                [
                    user1.address,
                    bot.address,
                    [addr.USDC],
                    addr.WBTC,
                    expandDecimals(100, 6),
                    0,
                    expandDecimals(200, 30),
                    false,
                    0,
                    EXECUTION_FEE,
                ],
                [
                    user1.address,
                    bot.address,
                    [addr.USDC],
                    addr.WETH,
                    expandDecimals(100, 6),
                    0,
                    expandDecimals(200, 30),
                    false,
                    0,
                    EXECUTION_FEE,
                ]
            ],
            []
            ,
            {

                value: EXECUTION_FEE * 2
            }
        );
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

        const position = await gmxVault.getPosition(bot.address, addr.USDC, addr.WBTC, false);
        console.log(position)
        expect(position[0]).eq(expandDecimals(200, 30));

        await gmxHelper.connect(geniKeeper).bulkOrders(
            [
                
            ],
            [
                [
                    user1.address,
                    bot.address,
                    [addr.USDC],
                    addr.WBTC,
                    0,
                    expandDecimals(200, 30),
                    false,
                    position[2],
                    0,
                    EXECUTION_FEE,
                    ethers.constants.AddressZero,
                
                ]
            ]
            ,
            {

                value: EXECUTION_FEE
            }
        );    

    })
    
})
