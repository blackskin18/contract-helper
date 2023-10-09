import {ethers} from 'hardhat';
import {expect, use} from 'chai';
import {solidity} from 'ethereum-waffle';
import {bigNumberify, expandDecimals, genMerkleTree, numberToWei, weiToNumber} from '../shared/utils';

import {loadFixture} from '@nomicfoundation/hardhat-network-helpers'
import {ZERO_ADDRESS} from "../shared/constants/constant";

use(solidity)

const INIT_AMOUNT_AIRDROP = 100000;
const TOTAL_AIRDROP = 250000000;
const PERCENT_EACH_REDUCE_TIME = 80;

describe('airdrop EARN', () => {
  async function getFixture() {
    const [owner, acc1, acc2, acc3] = await ethers.getSigners();
    const BocoToken = await ethers.getContractFactory("BonusCoin");
    const BocoAirdrop = await ethers.getContractFactory("BonusCoinAirdrop");

    const bocoToken = await BocoToken.deploy()
    const bocoAirdrop = await BocoAirdrop.deploy(bocoToken.address)
    await bocoToken.startTrading()
    await bocoAirdrop.startAirdrop(true)

    return {
      owner,
      acc1,
      acc2,
      acc3,
      bocoToken,
      bocoAirdrop,
    }
  }

  it('Calculate how many token for each user', async () => {
    const totalUser = 14500
    const reward = {}
    let initAmountAirdrop = bigNumberify(numberToWei(100000));
    let totalAirdrop = bigNumberify(numberToWei(250000000));
    let totalClaimed = bigNumberify(0);
    for(let i = 0; i < totalUser; i++) {
      let amount = initAmountAirdrop;
      let reduceTime = totalClaimed.mul(100).div(totalAirdrop).div(5);

      for (let i = 0; i < reduceTime.toNumber(); i ++) {
        amount = amount.mul(PERCENT_EACH_REDUCE_TIME).div(100);
      }
      totalClaimed = totalClaimed.add(amount)

      reward[amount.toString()] = (reward[amount.toString()] || 0) + 1
    }
  })

  it('Should Success when: acc claim too late', async () => {
    const {owner, acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP / 10 * 9, 18))
    await bocoAirdrop.setMerkleRoot(root)
    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(64000, 18))
    await expect(bocoAirdrop.connect(acc2).claim(proofs[acc2.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc2.address, expandDecimals(64000, 18))
  })

  it('Should Success when: acc claim with referrer (10% bonus for referrer) (first user)', async () => {
    const {owner, acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)
    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS))
      .to.emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))
    await expect(bocoAirdrop.connect(acc2).claim(proofs[acc2.address], acc1.address))
      .to.emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc2.address, expandDecimals(INIT_AMOUNT_AIRDROP , 18))
      .to.emit(bocoToken, 'Transfer').withArgs(bocoAirdrop.address, acc1.address, expandDecimals(INIT_AMOUNT_AIRDROP / 10, 18))
  })

  it('Gas don\`t increase too much when have ref ', async () => {
    const {owner, acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)
    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS))
      .to.emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))

    const hasRefGas = await bocoAirdrop.connect(acc2).estimateGas.claim(proofs[acc2.address], acc1.address)
    const donotHasRefGas = await bocoAirdrop.connect(acc2).estimateGas.claim(proofs[acc2.address], ZERO_ADDRESS)

    expect(hasRefGas).lt(donotHasRefGas.mul(13).div(10))
  })

  it('Gas don\`t increase too much when claim too late ', async () => {
    const {owner, acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)

    const gasWhenClaimSoon = await bocoAirdrop.connect(acc2).estimateGas.claim(proofs[acc2.address], ZERO_ADDRESS)
    await bocoAirdrop.recoverFungibleTokens(bocoToken.address, expandDecimals(TOTAL_AIRDROP / 10 * 9, 18))
    const gasWhenClaimLate = await bocoAirdrop.connect(acc2).estimateGas.claim(proofs[acc2.address], ZERO_ADDRESS)
    expect(gasWhenClaimLate).lt(gasWhenClaimSoon.mul(13).div(10))
  })

  it('Should Success when: acc claim with referrer (10% bonus for referrer)', async () => {
    const {owner, acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP / 10 * 9, 18))
    await bocoAirdrop.setMerkleRoot(root)
    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(64000, 18))
    await expect(bocoAirdrop.connect(acc2).claim(proofs[acc2.address], acc1.address))
      .to.emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc2.address, expandDecimals(64000, 18))
      .to.emit(bocoToken, 'Transfer').withArgs(bocoAirdrop.address, acc1.address, expandDecimals(6400, 18))
  })

  it('Should Success when: acc is in list airdrop', async () => {
    const {owner, acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)

    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))
    await expect(bocoAirdrop.connect(acc2).claim(proofs[acc2.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc2.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))
  })

  it('Should success: admin recover token', async () => {
    const {owner, bocoToken, bocoAirdrop} = await loadFixture(getFixture)

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await expect(bocoAirdrop.recoverFungibleTokens(bocoToken.address, expandDecimals(TOTAL_AIRDROP, 18))).emit(bocoToken, 'Transfer').withArgs(bocoAirdrop.address, owner.address, expandDecimals(TOTAL_AIRDROP, 18))
  })
  //
  it('Should fail when: admin off contract', async () => {
    const {acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)

    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))
    await bocoAirdrop.startAirdrop(false)
    await expect(bocoAirdrop.connect(acc2).claim(proofs[acc2.address], ZERO_ADDRESS)).reverted
  })
  //
  it('Should fail when: user claim 2 times', async () => {
    const {acc1, acc2, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])


    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)

    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS)).emit(bocoAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))
    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], ZERO_ADDRESS)).reverted
  })

  it('Should fail when: acc (not admin) set merkleRoot', async () => {
    const {acc1, acc2, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await expect(bocoAirdrop.connect(acc1).setMerkleRoot(root)).reverted
  })
  //
  it('Should Fail when: acc is not in list airdrop', async () => {
    const {acc1, acc2, acc3, bocoToken, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await bocoAirdrop.setMerkleRoot(root)

    await expect(bocoAirdrop.connect(acc3).claim(proofs[acc1.address], expandDecimals(INIT_AMOUNT_AIRDROP, 18))).reverted
  })

  it('Should fail when: acc (not admin) recover token', async () => {
    const {acc1, bocoToken, bocoAirdrop} = await loadFixture(getFixture)

    await bocoToken.transfer(bocoAirdrop.address, expandDecimals(TOTAL_AIRDROP, 18))
    await expect(bocoAirdrop.connect(acc1).recoverFungibleTokens(bocoToken.address, expandDecimals(INIT_AMOUNT_AIRDROP, 18))).reverted
  })

  it('Should fail when: not have token on airdrop contract', async () => {
    const {acc1, acc2, bocoAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree([acc1.address, acc2.address])

    await bocoAirdrop.setMerkleRoot(root)

    await expect(bocoAirdrop.connect(acc1).claim(proofs[acc1.address], expandDecimals(INIT_AMOUNT_AIRDROP, 18))).reverted
  })
})
