import { deployments } from "hardhat";
import addr from "../constants/addresses";
import { deployContract, expandDecimals } from "../utils";

export const botProtocolFixture = deployments.createFixture(async hre => {
    // Deploy
    const botFactory = await deployContract("BotFactory", [addr.GMX.PositionRouter, addr.GMX.Vault, addr.GMX.Router]);

    return {
        botFactory
    }
})