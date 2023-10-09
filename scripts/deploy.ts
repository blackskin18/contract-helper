import * as dotenv from "dotenv";
import hre from "hardhat";
import addr from "../shared/constants/addresses";
import { expandDecimals } from "../shared/utils";

dotenv.config();


async function main() {
    const LINK = "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4";
    const EARN = "0x70fB770cB34c6C4F0D409E062B72F226D3B9D109";

    // 6 build Role
    // const EarnAirdrop = await hre.ethers.getContractFactory("EarnAirdrop");
    // const earnAirdrop = await EarnAirdrop.deploy(EARN);
    // await earnAirdrop.deployed();
    // console.log(`EarnAirdrop : ${earnAirdrop.address}`);

    // // 6 build Role
    // const EarnAirdrop = await hre.ethers.getContractFactory("EarnAirdrop");
    // const earnAirdrop = await EarnAirdrop.deploy(LINK);
    // await role.deployed();
    // console.log(`EarnAirdrop address : ${earnAirdrop.address}`);

    // 6 build Role
    const BonusCoin = await hre.ethers.getContractFactory("BonusCoin");
    const bonusCoin = await BonusCoin.deploy();
    await bonusCoin.deployed();
    console.log(`BonusCoin : ${bonusCoin.address}`);


    const BonusCoinAirdrop = await hre.ethers.getContractFactory("BonusCoinAirdrop");
    const bonusCoinAirdrop = await BonusCoinAirdrop.deploy(bonusCoin.address);
    await bonusCoinAirdrop.deployed();
    console.log(`bonusCoinAirdrop : ${bonusCoinAirdrop.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
