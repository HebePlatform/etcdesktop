import { Wallet, Contract } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import HebeswapV2Factory from '@hebeswap/v2-core/build/HebeswapV2Factory.json'
import IHebeswapV2Pair from '@hebeswap/v2-core/build/IHebeswapV2Pair.json'

import ERC20 from '../../build/ERC20.json'
import WETC9 from '../../build/WETC9.json'
import HebeswapV1Exchange from '../../build/HebeswapV1Exchange.json'
import HebeswapV1Factory from '../../build/HebeswapV1Factory.json'
import HebeswapV2Router01 from '../../build/HebeswapV2Router01.json'
import HebeswapV2Migrator from '../../build/HebeswapV2Migrator.json'
import HebeswapV2Router02 from '../../build/HebeswapV2Router02.json'
import RouterEventEmitter from '../../build/RouterEventEmitter.json'

const overrides = {
  gasLimit: 9999999
}

interface V2Fixture {
  token0: Contract
  token1: Contract
  WETC: Contract
  WETCPartner: Contract
  factoryV1: Contract
  factoryV2: Contract
  router01: Contract
  router02: Contract
  routerEventEmitter: Contract
  router: Contract
  migrator: Contract
  WETCExchangeV1: Contract
  pair: Contract
  WETCPair: Contract
}

export async function v2Fixture(provider: Web3Provider, [wallet]: Wallet[]): Promise<V2Fixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const WETC = await deployContract(wallet, WETC9)
  const WETCPartner = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])

  // deploy V1
  const factoryV1 = await deployContract(wallet, HebeswapV1Factory, [])
  await factoryV1.initializeFactory((await deployContract(wallet, HebeswapV1Exchange, [])).address)

  // deploy V2
  const factoryV2 = await deployContract(wallet, HebeswapV2Factory, [wallet.address])

  // deploy routers
  const router01 = await deployContract(wallet, HebeswapV2Router01, [factoryV2.address, WETC.address], overrides)
  const router02 = await deployContract(wallet, HebeswapV2Router02, [factoryV2.address, WETC.address], overrides)

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, [])

  // deploy migrator
  const migrator = await deployContract(wallet, HebeswapV2Migrator, [factoryV1.address, router01.address], overrides)

  // initialize V1
  await factoryV1.createExchange(WETCPartner.address, overrides)
  const WETCExchangeV1Address = await factoryV1.getExchange(WETCPartner.address)
  const WETCExchangeV1 = new Contract(WETCExchangeV1Address, JSON.stringify(HebeswapV1Exchange.abi), provider).connect(
    wallet
  )

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(IHebeswapV2Pair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WETC.address, WETCPartner.address)
  const WETCPairAddress = await factoryV2.getPair(WETC.address, WETCPartner.address)
  const WETCPair = new Contract(WETCPairAddress, JSON.stringify(IHebeswapV2Pair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    WETC,
    WETCPartner,
    factoryV1,
    factoryV2,
    router01,
    router02,
    router: router02, // the default router, 01 had a minor bug
    routerEventEmitter,
    migrator,
    WETCExchangeV1,
    pair,
    WETCPair
  }
}
