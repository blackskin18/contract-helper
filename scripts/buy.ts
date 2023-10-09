import * as dotenv from "dotenv";
import hre, { ethers } from "hardhat";
import addr from "../shared/constants/addresses";
import { expandDecimals, numberToWei } from "../shared/utils";

dotenv.config();


async function main() {
  const [presaleOwner, user1, user2, user3, user4] = await hre.ethers.getSigners();

  const earn = await hre.ethers.getContractAt("Earn", '0x1bEfE2d8417e22Da2E0432560ef9B2aB68Ab75Ad');

  const unirouter = await hre.ethers.getContractAt("IUniRouter", '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');

  await unirouter.connect(user4).swapExactETHForTokensSupportingFeeOnTransferTokens(
    0,
    [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      earn.address
    ],
    user4.address,
    1694664164,
    {
      value: numberToWei(0.1)
    }
  )
  const bal = await earn.balanceOf(user4.address)

  console.log(`User ${user4.address} have balance ${ethers.utils.formatEther(bal)}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
