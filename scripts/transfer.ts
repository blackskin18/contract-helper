import * as dotenv from "dotenv";
import hre, { ethers } from "hardhat";
import addr from "../shared/constants/addresses";
import { expandDecimals, numberToWei } from "../shared/utils";

dotenv.config();


async function main() {
  const [presaleOwner, user1, user2, user3, user4] = await hre.ethers.getSigners();
  const devFeeReceiver = '0x0F92C4d54FD474019Da5a5B899154F8e6c23b1eE';
  const buyFriendTechKeysFeesReceiver = '0xc862369D6A7C069211B54E6F0FBD8A48d22C41D5';

  const earn = await hre.ethers.getContractAt("Earn", '0x1bEfE2d8417e22Da2E0432560ef9B2aB68Ab75Ad');

  await earn.connect(user4).transfer(user3.address, numberToWei(10000000))
  const bal =  await  earn.balanceOf(user4.address)
  console.log(`User ${user4.address} have balance ${ethers.utils.formatEther(bal)}`);

  // const devFeeReceiverBal = await ethers.provider.getBalance(devFeeReceiver);

  // const buyFriendTechKeysFeesReceiverBal = await ethers.provider.getBalance(buyFriendTechKeysFeesReceiver);

  // console.log({
  //   devFeeReceiverBal:ethers.utils.formatEther(devFeeReceiverBal),
  //   buyFriendTechKeysFeesReceiverBal:ethers.utils.formatEther(buyFriendTechKeysFeesReceiverBal),

  // })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
