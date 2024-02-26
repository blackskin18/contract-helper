import hre, {ethers} from "hardhat"
import {expect, use} from "chai"
import {solidity} from "ethereum-waffle"
import {MerkleTree} from "merkletreejs";

import {loadFixture} from '@nomicfoundation/hardhat-network-helpers'

const keccak256 = require('keccak256')

import {
  expandDecimals,
  numberToWei,
  deployContract, parseSqrtX96
} from "../shared/utils"
import {BSC_ADDRESS} from "../shared/constants/addresses";

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

  it('Get price with route v2 ', async () => {
    const {pairDetailV3} = await loadFixture(getFixture)

    const res = await pairDetailV3.fetchPrice(
      BSC_ADDRESS.WBNB,
      BSC_ADDRESS.BUSD,
      [
        {
          version: 2,
          uniPool: '0x014608E87AF97a054C9a49f81E1473076D51d9a3',
        },
        {
          version: 2,
          uniPool: '0x0E91275Aec7473105c8509BC41AE54b8FE8a7Fc3',
        }
      ]
    )

    const price = parseSqrtX96(res, {decimal: 18}, {decimal: 18})
    console.log('price BNB / USD', price)
  })

  it('Get price with route v3 ', async () => {
    const {pairDetailV3} = await loadFixture(getFixture)

    const res = await pairDetailV3.fetchPrice(
      BSC_ADDRESS.WBNB,
      BSC_ADDRESS.ETH,
      [
        {
          version: 3,
          uniPool: '0x85FAac652b707FDf6907EF726751087F9E0b6687',
        },
        {
          version: 3,
          uniPool: '0xBe141893E4c6AD9272e8C04BAB7E6a10604501a5',
        },
      ]
    )

    const price = parseSqrtX96(res, {decimal: 18}, {decimal: 18})
    console.log('price BNB / ETH (v3)', price)

  })

  it('Get price with mixed route ', async () => {
    const {pairDetailV3} = await loadFixture(getFixture)

    const res = await pairDetailV3.fetchPrice(
      BSC_ADDRESS.WBNB,
      BSC_ADDRESS.ETH,
      [
        {
          version: 2,
          uniPool: '0x014608E87AF97a054C9a49f81E1473076D51d9a3',
        },
        {
          version: 2,
          uniPool: '0x0E91275Aec7473105c8509BC41AE54b8FE8a7Fc3',
        },
        {
          version: 2,
          uniPool: '0x7EFaEf62fDdCCa950418312c6C91Aef321375A00',
        },

        {
          version: 3,
          uniPool: '0xBe141893E4c6AD9272e8C04BAB7E6a10604501a5',
        },
      ]
    )

    const price = parseSqrtX96(res, {decimal: 18}, {decimal: 18})
    console.log('price BNB / ETH (mix v2 & v3)', price)
  })

  it('Get prices with mixed route ', async () => {
    const {pairDetailV3} = await loadFixture(getFixture)

    const res = await pairDetailV3.fetchPrices([
        {
          tokenBase: BSC_ADDRESS.WBNB,
          tokenQuote: BSC_ADDRESS.ETH,
            routes: [
            {
              version: 2,
              uniPool: '0x014608E87AF97a054C9a49f81E1473076D51d9a3',
            },
            {
              version: 2,
              uniPool: '0x0E91275Aec7473105c8509BC41AE54b8FE8a7Fc3',
            },
            {
              version: 2,
              uniPool: '0x7EFaEf62fDdCCa950418312c6C91Aef321375A00',
            },
            {
              version: 3,
              uniPool: '0xBe141893E4c6AD9272e8C04BAB7E6a10604501a5',
            },
          ]
        }
      ]
    )

    const price = parseSqrtX96(res[0], {decimal: 18}, {decimal: 18})
    console.log('price BNB / ETH (mix v2 & v3)', price)
  })
})
