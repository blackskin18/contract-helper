import hre from 'hardhat';
import addr from '../shared/constants/addresses';
import { expect, use } from 'chai';
import { solidity } from 'ethereum-waffle';
import { EXECUTION_FEE } from '../shared/constants/constant';
import { tokenFixture } from './fixtures/token';
import { deployContract, expandDecimals } from '../shared/utils';

use(solidity)

describe('gmx-keeper-test', () => {
    let fastPriceFeed;
    let positionRouter;
    let gmxRouter;
    let dai;
    let keeper;
    let earn;
    let deployer;
    let user0;
    let user1;
    let user2;
    let user3;
    let user4;
    let user5;

    before(async() => {
        ({ earn } = await tokenFixture());
        [deployer, user0, user1, user2, user3, user4, user5] = await hre.ethers.getSigners();
        
        await earn.connect(deployer).startTrading();
        await earn.connect(deployer).transfer(earn.address, expandDecimals(1000, 18));
        await earn.connect(deployer).transfer(user1.address, expandDecimals(1000, 18));
        // await earn.connect(deployer).addLp(expandDecimals(100, 18), {value: expandDecimals(10, 18)});
        // await earn.connect(user2).sell(expandDecimals(1, 18));
        const userBefor = await earn.balanceOf(user1.address);
        console.log("userBefor", userBefor);
        await earn.connect(deployer).setNotBot([user2.address], true);
    })

    it('opens and executes positions', async () => {
        
    })
})