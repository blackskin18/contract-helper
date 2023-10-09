import { deployments } from "hardhat";
import addr from "../../shared/constants/addresses";
import { deployContract, expandDecimals } from "../../shared/utils";

export const tokenFixture = deployments.createFixture(async hre => {
    // Deploy
    const earn = await deployContract("BonusCoin", []);
    // console.log("Earn address: ", earn.address);

    // const totalSupply = await earn.totalSupply();
    // console.log("Earn totalSupply: ", totalSupply);

    return {
        earn
    }
})
