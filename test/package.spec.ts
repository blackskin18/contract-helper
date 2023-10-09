import hre from 'hardhat';
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
    let user0, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12, user13, user14, user15, leader1Lv1, leader2Lv1, leader1Lv2, leader2Lv2; 
    let user16, user17, user18, user19, user20, user21, user22, user23, user24, user25, user26, user27, user28, user29, user30, user31; 
    let gmxVault;
    let router;
    let gmxRouter;
    let whale;
    let geni;
;
    let botFactory;
    let bot;
    let levelHelper;
    let deadAddress = "0x000000000000000000000000000000000000dEaD";
    let dieAddress = "0x0000000000000000000000000000000000000000";
    
    before(async() => {
        ({dai, usdc, keeper, positionRouter, fastPriceFeed, gmxVault, gmxRouter } = await gmxProtocolFixture());
        ({botFactory, levelHelper, bot, geni} = await botProtocolFixture());
        [deployer, user0, user1, user2, user3, user4, user5, user6, user7, 
        user8, user9, user10, user11, user12, user13, user14, user15, leader1Lv1, leader2Lv1, leader1Lv2, 
        leader2Lv2, user16, user17, user18, user19, user20, user21, user22, user23, user24, user25, user26, 
        user27, user28, user29, user30, user31] = await hre.ethers.getSigners();
        whale = await hre.ethers.getImpersonatedSigner(addr.USDC_WHALE);
        await dai.connect(whale).approve(botFactory.address, hre.ethers.constants.MaxUint256);

        await geni.connect(deployer).mint(deployer.address, expandDecimals(10000000, 18));
        
        await geni.connect(deployer).approve(levelHelper.address, hre.ethers.constants.MaxUint256);

        await usdc.connect(deployer).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user0).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user1).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user2).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user3).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user4).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user5).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user6).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user7).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user8).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user9).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user10).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user11).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user12).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user13).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user14).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user15).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user16).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user17).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user18).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user19).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user20).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user21).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user22).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user23).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user24).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user25).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user26).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user27).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user28).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user29).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user30).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(user31).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(leader1Lv1).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(leader2Lv1).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(leader1Lv2).approve(levelHelper.address, hre.ethers.constants.MaxUint256);
        await usdc.connect(leader2Lv2).approve(levelHelper.address, hre.ethers.constants.MaxUint256);

        await usdc.connect(whale).transfer(deployer.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user0.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user1.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user2.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user3.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user4.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user5.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user6.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user7.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user8.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user9.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user10.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user11.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user12.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user13.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user14.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user15.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user16.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user17.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user18.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user19.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user20.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user21.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user22.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user23.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user24.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user25.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user26.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user27.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user28.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user29.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user30.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(user31.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(leader1Lv1.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(leader2Lv1.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(leader1Lv2.address, expandDecimals(2000, 6));
        await usdc.connect(whale).transfer(leader2Lv2.address, expandDecimals(2000, 6));

        await geni.connect(deployer).transfer(levelHelper.address, expandDecimals(20000, 18));

        // set leaders level 1
        await levelHelper.connect(deployer).setLeaderLevel1(leader1Lv1.address);
        await levelHelper.connect(deployer).setLeaderLevel1(leader2Lv1.address);

        // set leaders level 2
        await levelHelper.connect(deployer).setLeaderLevel2(leader1Lv2.address);
        await levelHelper.connect(deployer).setLeaderLevel2(leader2Lv2.address);

        // view leader lv1 
        const leadersLv1 = await levelHelper.connect(deployer).viewLeaderLevel1(0, 10);
        const leadersLv2 = await levelHelper.connect(deployer).viewLeaderLevel2(0, 10);
        // console.log('leadersLv1: ', leadersLv1);
        

        // buy packages
        // await levelHelper.connect(user1).buyPackage(addr.USDC, 4, user10.address);
        // await levelHelper.connect(leader1Lv1).buyPackage(addr.USDC, 4, user1.address);
        // await levelHelper.connect(deployer).addminBuyPackageUser(user11.address, 4, user1.address, true);

        // await levelHelper.connect(leader1Lv2).buyPackage(addr.USDC, 4, leader1Lv1.address);
        // // await levelHelper.connect(user1).buyPackage(addr.USDC, 4, leader1Lv1.address);
        // await levelHelper.connect(user2).buyPackage(addr.USDC, 1, leader1Lv1.address);
        // await levelHelper.connect(user3).buyPackage(addr.USDC, 4, leader1Lv1.address);
        // await levelHelper.connect(user4).buyPackage(addr.USDC, 4, leader1Lv1.address);
        // await levelHelper.connect(leader1Lv2).buyPackage(addr.USDC, 4, leader1Lv1.address);

        // const lockAirdropAmount = await levelHelper.lockAirdropAmount(leader1Lv1.address);
        // const unLockAirdropAmount = await levelHelper.unLockAirdropAmount(leader1Lv1.address);
        // await levelHelper.connect(leader1Lv1).claimRewardAirdrop();

        // const lockAirdropAmount2 = await levelHelper.lockAirdropAmount(leader1Lv2.address);
        // const unLockAirdropAmount2 = await levelHelper.unLockAirdropAmount(leader1Lv2.address);
        // await levelHelper.connect(leader1Lv2).claimRewardAirdrop();

        // const totalAirdropAmount = await levelHelper.totalAirdropAmount();
        // console.log("lockAirdropAmount leader1Lv1: ", totalAirdropAmount / 1e18);
        // console.log("unLockAirdropAmount leader1Lv1: ", unLockAirdropAmount / 1e18);
        // console.log('geni balance leader1Lv1: ', await geni.balanceOf(leader1Lv1.address) / 1e18);

        // console.log("lockAirdropAmount leader1Lv2: ", lockAirdropAmount2 / 1e18);
        // console.log("unLockAirdropAmount leader1Lv2: ", unLockAirdropAmount2 / 1e18);
        // console.log('geni balance leader1Lv2: ', await geni.balanceOf(leader1Lv2.address) / 1e18);

        // console.log("totalAirdropAmount: ", totalAirdropAmount / 1e18);
        await levelHelper.adminBuyPackageUserBatch([user1.address, user2.address], [4, 4], [dieAddress, user1.address], [false, false], [false, false]);
        const userPackageId = await levelHelper.userPackageId(user2.address);
        const userPackageTimes = await levelHelper.userPackageTimes(user2.address);
        const refUsers = await levelHelper.refUsers(user2.address);
        console.log("userPackageId ", userPackageId);
        console.log("userPackageTimes ", userPackageTimes);
        console.log("refUsers ", refUsers);
    })

    it('check package: 1 level', async() => {

      // const packId = await levelHelper.getUserPackageId(user1.address);
      // const totalPackage1 = await levelHelper.totalPackages(1);
      // const totalPackage4 = await levelHelper.totalPackages(4);
      // const totalRevenue = await levelHelper.totalRevenue(addr.USDC);
      // const totalITReward = await levelHelper.totalITReward(addr.USDC);
      // const totalReferralReward = await levelHelper.totalReferralReward(addr.USDC);
      // const totalLeaderLv1Reward = await levelHelper.totalLeaderLv1Reward(addr.USDC);
      // const totalLeaderLv2Reward = await levelHelper.totalLeaderLv2Reward(addr.USDC);
      // const adminPendingRevenue = await levelHelper.pendingRevenue(deployer.address, addr.USDC);
      // const viewUserInfo = await levelHelper.viewUserInfo(leader1Lv1.address, addr.USDC);
      // const viewCurrentUserInfo = await levelHelper.viewCurrentUserInfo(leader1Lv1.address, addr.USDC);
      // const leaderTokenReferral = await levelHelper.leaderTokenReferral(leader1Lv1.address, addr.USDC);
      // const leaderTokenReferralTotal = await levelHelper.leaderTokenReferralTotal(leader1Lv1.address, addr.USDC);

      //   const totalRevenueCal = 21 * 1000 + 5 + 30 * 2 + 200;
      //   const totalReferralRewardCal1 = 1000 * 0.1 + 1000 * 0.19 + 1000 * 0.27 + 1000 * 0.34 + 1000 * 0.4 + 1000 * 0.45 + 1000 * 0.49 + 1000 * 0.52 + 1000 * 0.54 + 1000 * 0.55 + 1000 * 0.55 + 1000 * 0.55;
      //   const totalReferralRewardCal2 = 2471.85;
      //   const totalReferralRewardCal = totalReferralRewardCal1 + totalReferralRewardCal2;
        
      //   // expect(packId).eq(4);
      //   // expect(totalPackage1).eq(1);
      //   // expect(totalPackage4).eq(21);
      //   // expect(totalRevenue).eq(expandDecimals(totalRevenueCal, 6));
      //   // expect(totalReferralReward).eq(expandDecimals(totalReferralRewardCal * 100, 4));
      //   // expect(totalITReward).eq(expandDecimals(totalRevenueCal * 5, 4)); // 5% percent
      //   // expect(adminPendingRevenue).eq(expandDecimals((totalRevenueCal - totalReferralRewardCal) * 100, 4));
      //   // expect(totalLeaderLv1Reward).eq(expandDecimals((totalRevenueCal - 2000) * 10, 4)); // 10%
      //   // expect(totalLeaderLv2Reward).eq(expandDecimals((totalRevenueCal - 4000) * 5, 4)); // 5%

      //   expect(viewUserInfo[1].referralAmount).eq(expandDecimals(100, 6));
      //   expect(viewUserInfo[1].count).eq(1);
      //   expect(viewUserInfo[1].refCount).eq(1);
      //   expect(viewCurrentUserInfo[1].referralAmount).eq(expandDecimals(100, 6));

      //   expect(viewUserInfo[10].referralAmount).eq(expandDecimals(10, 6));
      //   expect(viewUserInfo[10].count).eq(1);
      //   expect(viewUserInfo[10].refCount).eq(1);
      //   expect(viewCurrentUserInfo[10].referralAmount).eq(expandDecimals(10, 6));

      //   // console.log("leaderTokenReferral", leaderTokenReferral)
      //   // console.log("leaderTokenReferralTotal", leaderTokenReferralTotal)
      //   // await levelHelper.connect(deployer).resetLeaderData([leader1Lv1.address], addr.USDC);
      //   const viewCurrentUser = await levelHelper.viewCurrentUserInfo(user19.address, addr.USDC);
      //   const pendingRevenue = await levelHelper.pendingRevenue(user19.address, addr.USDC);

      //   // console.log("viewCurrentUser", viewCurrentUser)
      //   // console.log("pendingRevenue", pendingRevenue)
      //   await levelHelper.connect(user19).claimPendingRevenue(addr.USDC)
      //   const viewCurrentUser2 = await levelHelper.viewCurrentUserInfo(leader2Lv2.address, addr.USDC);
      //   // console.log("viewCurrentUser2", viewCurrentUser2)

      //   await levelHelper.connect(deployer).adminDeleteUserPackage(leader2Lv2.address, addr.USDC);

      //   const viewCurrentUser3 = await levelHelper.viewCurrentUserInfo(leader2Lv2.address, addr.USDC);
      //   // console.log("viewCurrentUser3", viewCurrentUser3)

      //   const leaderTokenReferral2 = await levelHelper.leaderTokenReferral(leader2Lv2.address, addr.USDC);
      //   const leaderTokenReferralTotal2 = await levelHelper.leaderTokenReferralTotal(leader2Lv2.address, addr.USDC);

        // console.log("leaderTokenReferral2", leaderTokenReferral2)
        // console.log("leaderTokenReferralTotal2", leaderTokenReferralTotal2)
    })

    it('check admin settings', async() => {
      await levelHelper.connect(deployer).setGovToken(addr.USDC);
      const govToken = await levelHelper.govToken();
      expect(govToken).eq(addr.USDC);

      await levelHelper.connect(deployer).setActiveReferral(false);
      const activeReferral = await levelHelper.activeReferral();
      expect(activeReferral).eq(false);

      await levelHelper.connect(deployer).setITPercent(1000);
      const itPercent = await levelHelper.itPercent();
      expect(itPercent).eq(1000);

      await levelHelper.connect(deployer).setRefLevelHandle(101);
      const refLevelHandle = await levelHelper.refLevelHandle();
      expect(refLevelHandle).eq(101);

      await levelHelper.connect(deployer).setRefLevelHandleMax(101);
      const refLevelHandleMax = await levelHelper.refLevelHandleMax();
      expect(refLevelHandleMax).eq(101);

      // await levelHelper.connect(deployer).setLeadersPercent(15, 10);
      // const leaderLv1Percent = await levelHelper.leaderLv1Percent();
      // const leaderLv2Percent = await levelHelper.leaderLv2Percent();
      // expect(leaderLv1Percent).eq(15);
      // expect(leaderLv2Percent).eq(10);

      await levelHelper.connect(deployer).setTokenBuyBurnPercent(addr.USDC, 1000);
      const tokenBuyBurnPercent = await levelHelper.tokenBuyBurnPercent(addr.USDC);
      expect(tokenBuyBurnPercent).eq(1000);

      await levelHelper.connect(deployer).setLevelsRefPercent(1, 1000);
      const levelsRefPercent = await levelHelper.levelsRefPercent(1);
      expect(levelsRefPercent).eq(1000);

      await levelHelper.connect(deployer).setPackageLevels(4, 10);
      const packageLevels = await levelHelper.packageLevels(4);
      expect(packageLevels).eq(10);

      // await levelHelper.connect(deployer).setPackageTokenFeeAmount(addr.USDC, 1, expandDecimals(1000, 6));
      // const packageTokenFeeAmount = await levelHelper.packageTokenFeeAmount(addr.USDC, 1);
      // expect(packageTokenFeeAmount).eq(expandDecimals(1000, 6));
    })
})
