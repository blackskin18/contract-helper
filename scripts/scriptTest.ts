import * as dotenv from "dotenv";
import hre from "hardhat";
import addr from "../shared/constants/addresses";
import {expandDecimals, numberToWei} from "../shared/utils";

dotenv.config();


async function main() {
  const [presaleOwner] = await hre.ethers.getSigners();
  const Earn = await hre.ethers.getContractFactory("Earn");
  const earn = await Earn.deploy();
  await earn.deployed();
  console.log(`Earn Token address : ${earn.address}`);

  const unirouter = await hre.ethers.getContractAt("IUniRouter", '0xD99D1c33F9fC3444f8101754aBC46c52416550D1');
  const tx = await earn.approve(unirouter.address, numberToWei('40000000000'))
  await tx.wait(1)

  // await unirouter.addLiquidityETH(
  //   earn.address,
  //   numberToWei('40000000000'),
  //   numberToWei('40000000000'),
  //   numberToWei(2),
  //   presaleOwner.address,
  //   Math.floor((new Date().getTime()) / 1000) + 3600,
  //   {
  //     value: numberToWei(2)
  //   }
  // )

  // const earn = await hre.ethers.getContractAt("Earn", '0xB732ebBf473630Ea19C3D358E214a767C59FcEA5');
  // await earn.updatePair()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
