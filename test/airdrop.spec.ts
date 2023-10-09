import {ethers} from 'hardhat';
import {expect, use} from 'chai';
import {solidity} from 'ethereum-waffle';
import {expandDecimals, genMerkleTree} from '../shared/utils';

import {loadFixture} from '@nomicfoundation/hardhat-network-helpers'

use(solidity)

describe('airdrop EARN', () => {
  async function getFixture() {
    const [owner, acc1, acc2, acc3] = await ethers.getSigners();
    const EarnToken = await ethers.getContractFactory("Earn");
    const EarnAirdrop = await ethers.getContractFactory("EarnAirdrop");

    const earnToken = await EarnToken.deploy()
    const earnAirdrop = await EarnAirdrop.deploy(earnToken.address)
    await earnToken.startTrading()
    await earnAirdrop.startAirdrop(true)

    return {
      owner,
      acc1,
      acc2,
      acc3,
      earnToken,
      earnAirdrop,
    }
  }

  //
  it('Should Success when: acc is in list airdrop', async () => {
    const {owner, acc1, acc2, earnToken, earnAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree({
      [acc1.address]: expandDecimals(10, 18),
      [acc2.address]: expandDecimals(10, 18)
    })

    await earnToken.transfer(earnAirdrop.address, expandDecimals(25000000000, 18))
    await earnAirdrop.setMerkleRoot(root)

    await expect(earnAirdrop.connect(acc1).claim(proofs[acc1.address], expandDecimals(10, 18))).emit(earnAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(10, 18))
    await expect(earnAirdrop.connect(acc2).claim(proofs[acc2.address], expandDecimals(10, 18))).emit(earnAirdrop, 'ClaimAirdrop').withArgs(acc2.address, expandDecimals(10, 18))
  })

  it('Should success: admin recover token', async () => {
    const {owner, earnToken, earnAirdrop} = await loadFixture(getFixture)

    await earnToken.transfer(earnAirdrop.address, expandDecimals(25000000000, 18))
    await expect(earnAirdrop.recoverFungibleTokens(earnToken.address, expandDecimals(25000000000, 18))).emit(earnToken, 'Transfer').withArgs(earnAirdrop.address, owner.address, expandDecimals(25000000000, 18))
  })

  it('Should fail when: admin off contract', async () => {
    const {acc1, acc2, earnToken, earnAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree({
      [acc1.address]: expandDecimals(10, 18),
      [acc2.address]: expandDecimals(10, 18)
    })

    await earnToken.transfer(earnAirdrop.address, expandDecimals(25000000000, 18))
    await earnAirdrop.setMerkleRoot(root)

    await expect(earnAirdrop.connect(acc1).claim(proofs[acc1.address], expandDecimals(10, 18))).emit(earnAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(10, 18))
    await earnAirdrop.startAirdrop(false)
    await expect(earnAirdrop.connect(acc2).claim(proofs[acc2.address], expandDecimals(10, 18))).reverted
  })

  it('Should fail when: user claim 2 times', async () => {
    const {acc1, acc2, earnToken, earnAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree({
      [acc1.address]: expandDecimals(10, 18),
      [acc2.address]: expandDecimals(10, 18)
    })

    await earnToken.transfer(earnAirdrop.address, expandDecimals(25000000000, 18))
    await earnAirdrop.setMerkleRoot(root)

    await expect(earnAirdrop.connect(acc1).claim(proofs[acc1.address], expandDecimals(10, 18))).emit(earnAirdrop, 'ClaimAirdrop').withArgs(acc1.address, expandDecimals(10, 18))
    await expect(earnAirdrop.connect(acc1).claim(proofs[acc1.address], expandDecimals(10, 18))).reverted
  })

  it('Should fail when: acc (not admin) set merkleRoot', async () => {
    const {acc1, acc2, earnAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree({
      [acc1.address]: expandDecimals(10, 18),
      [acc2.address]: expandDecimals(10, 18)
    })

    await expect(earnAirdrop.connect(acc1).setMerkleRoot(root)).reverted
  })

  it('Should Fail when: acc is not in list airdrop', async () => {
    const {acc1, acc2, acc3, earnToken, earnAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree({
      [acc1.address]: expandDecimals(10, 18),
      [acc2.address]: expandDecimals(10, 18)
    })

    await earnToken.transfer(earnAirdrop.address, expandDecimals(25000000000, 18))
    await earnAirdrop.setMerkleRoot(root)

    await expect(earnAirdrop.connect(acc3).claim(proofs[acc1.address], expandDecimals(10, 18))).reverted
  })

  it('Should fail when: acc (not admin) recover token', async () => {
    const {acc1, earnToken, earnAirdrop} = await loadFixture(getFixture)

    await earnToken.transfer(earnAirdrop.address, expandDecimals(25000000000, 18))
    await expect(earnAirdrop.connect(acc1).recoverFungibleTokens(earnToken.address, expandDecimals(10, 18))).reverted
  })

  it('Should fail when: not have token on airdrop contract', async () => {
    const {acc1, acc2, earnAirdrop} = await loadFixture(getFixture)
    const {root, proofs} = genMerkleTree({
      [acc1.address]: expandDecimals(10, 18),
      [acc2.address]: expandDecimals(10, 18)
    })

    await earnAirdrop.setMerkleRoot(root)

    await expect(earnAirdrop.connect(acc1).claim(proofs[acc1.address], expandDecimals(10, 18))).reverted
  })

})
