import { deployments } from "hardhat";
import addr from "../../shared/constants/addresses";
import { deployContract, expandDecimals } from "../../shared/utils";

export const botProtocolFixture = deployments.createFixture(async hre => {
    // Deploy
    const geni = await deployContract("Geni", []);
    const balanceHelper = await deployContract("BalanceHelper", [geni.address]);
    const levelHelper = await deployContract("LevelHelper", [geni.address, balanceHelper.address, addr.USDC]);
    const bot = await deployContract("GeniBot", []);
    const gmxHelper = await deployContract("GmxHelper", [addr.GMX.Vault,addr.GMX.PositionRouter]);
    const botFactory = await deployContract("GeniVault", [addr.GMX.PositionRouter, addr.GMX.Vault, addr.GMX.Router, bot.address, levelHelper.address]);

    // await levelHelper.setGeniBotFactory(botFactory.address);

    return {
        botFactory,
        bot,
        levelHelper,
        geni,
        gmxHelper
    }
})
