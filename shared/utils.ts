import { ethers } from "hardhat";
import { BN } from "bn.js";
import {MerkleTree} from "merkletreejs";
import {BigNumber} from "ethers";

const  keccak256 = require('keccak256')

async function deployContract(name, args) {
    const contractFactory = await ethers.getContractFactory(name)
    return await contractFactory.deploy(...args)
}

function bigNumberify(n) {
    return ethers.BigNumber.from(n)
}

function expandDecimals(n, decimals) {
    return bigNumberify(n).mul(bigNumberify(10).pow(decimals))
}

export const weiToNumber = (wei, decimal = 18) => {
    if (!wei || !Number(wei)) return '0'
    wei = wei.toString()
    return ethers.utils.formatUnits(wei, decimal)
}

export const numberToWei = (number, decimal = 18) => {
    number = number.toString()

    const arr = number.split('.')
    if (arr[1] && arr[1].length > decimal) {
        arr[1] = arr[1].slice(0, decimal)
        number = arr.join('.')
    }

    return ethers.utils.parseUnits(number, decimal)
}

function getPriceBits(prices) {
    if (prices.length > 8) {
        throw new Error("max prices.length exceeded")
    }

    let priceBits = new BN('0')

    for (let j = 0; j < 8; j++) {
        let index = j
        if (index >= prices.length) {
            break
        }

        const price = new BN(prices[index])
        if (price.gt(new BN("2147483648"))) { // 2^31
            throw new Error(`price exceeds bit limit ${price.toString()}`)
        }

        priceBits = priceBits.or(price.shln(j * 32))
    }

    return priceBits.toString()
}

function getExpandedPrice(price, precision) {
    return bigNumberify(price).mul(expandDecimals(1, 30)).div(precision)
}

async function getBlockTime(provider) {
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)
    return block.timestamp
}

function toUsd(value: number) {
    const normalizedValue = Math.floor(value * Math.pow(10, 10))
    return ethers.BigNumber.from(normalizedValue).mul(ethers.BigNumber.from(10).pow(20))
}

async function send(provider, method, params = []) {
    await provider.send(method, params)
}

async function mineBlock(provider) {
    await send(provider, "evm_mine")
}

async function increaseTime(provider, seconds) {
    await send(provider, "evm_increaseTime", [seconds])
}


async function priceUpdateAndExcute(provider, positionRouter, fastPriceFeed, keeper, wethPrice, wbtcPrice, opPrice, usdcPrice) {
    let blockTime = await getBlockTime(provider);

    let priceBits = getPriceBits([wethPrice, wbtcPrice, opPrice, usdcPrice]);

    let requestQue = await positionRouter.getRequestQueueLengths();
    // console.log(requestQue[1]);
    await fastPriceFeed.connect(keeper).setPricesWithBitsAndExecute(priceBits, blockTime, 0, requestQue[3]);
    await fastPriceFeed.connect(keeper).setPricesWithBitsAndExecute(priceBits, blockTime, requestQue[1], 0);
}

function encode(types: string[], params: string[]) {
    const iface = new ethers.utils.AbiCoder();
    const bytes = iface.encode(types, params);
    return bytes;
}

async function sendTxn(txnPromise: Promise<any>, label: string) {
    try {
        const txn = await txnPromise
        console.info(`Sending ${label}...`)
        await txn.wait()
        console.info(`... Sent! ${txn.hash}`)
        return txn
    } catch (e) {
        console.info(`FAIL: Sending ${label}...`)
        console.log(e.toString())
        return null
    }
}

async function contractAt(name: string, address: string, provider: any) {
    let contractFactory = await ethers.getContractFactory(name)
    if (provider) {
        contractFactory = contractFactory.connect(provider)
    }
    return await contractFactory.attach(address)
}

const genMerkleTree = (whitelistAddress: string[]) => {
    const leaves = whitelistAddress.map((x) =>
      ethers.utils.solidityKeccak256(
        ["address"],
        [x]
      )
    );

    const tree = new MerkleTree(leaves, keccak256, { sort: true });

    const result = {}

    leaves.forEach((leaf, key)=> {
        return result[whitelistAddress[key]] = tree.getHexProof(leaf)
    })
    const root = tree.getHexRoot();

    return {
        root,
        proofs: result
    }
}

export const parseSqrtX96 = (price: BigNumber, baseToken: {decimal: number}, quoteToken: {decimal: number}) => {
    return weiToNumber(
      price
        .mul(price)
        .mul(numberToWei(1, baseToken.decimal + 18))
        .shr(192),
      quoteToken.decimal + 18,
    )
}

export { sendTxn, contractAt, deployContract, expandDecimals, bigNumberify, getPriceBits, getExpandedPrice, getBlockTime, toUsd, mineBlock, increaseTime, priceUpdateAndExcute, encode, genMerkleTree }
