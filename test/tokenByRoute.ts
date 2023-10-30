import hre, {ethers} from "hardhat"
import {expect, use} from "chai"
import {solidity} from "ethereum-waffle"
import {MerkleTree} from "merkletreejs";

import {loadFixture} from '@nomicfoundation/hardhat-network-helpers'

const keccak256 = require('keccak256')

import {
  expandDecimals,
  numberToWei,
  deployContract
} from "../shared/utils"

use(solidity)

const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD"
const DIE_ADDRESS = "0x0000000000000000000000000000000000000000"

describe("bot-test", () => {

  async function getFixture() {
    let pairDetailV3

    pairDetailV3 = await deployContract("TokenPriceByRoute", []);

    return {
      pairDetailV3,
    }
  }

  it('Check merkle tree with 1 element', async () => {
    const {pairDetailV3} = await loadFixture(getFixture)

    const a = await pairDetailV3.query([
      '0xbae622d0FA237a5105b0C445864A419620a59D83',
      '0x7FE20C1b2C726B2384F44DdE3CA91eE430650d09',
      '0x31C77F72BCc209AD00E3B7be13d719c08cb7BA7B',
      '0x92Fe0733C1219d1d76b09eEd091914050430AbbE',
      '0x49B355Bb422dC456314D160C353416afBcAF2996'
    ], '0x0000110000000000000000000000000000000000000000000000000000000111')

    console.log(a)
  })

})
