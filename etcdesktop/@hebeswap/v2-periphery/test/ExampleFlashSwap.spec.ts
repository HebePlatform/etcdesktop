import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from 'ethers/constants'
import { BigNumber, bigNumberify, defaultAbiCoder, formatEther } from 'ethers/utils'
import { solidity, MockProvider, createFixtureLoader, deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './shared/utilities'
import { v2Fixture } from './shared/fixtures'

import ExampleFlashSwap from '../build/ExampleFlashSwap.json'

chai.use(solidity)

const overrides = {
  gasLimit: 9999999,
  gasPrice: 0
}

describe('ExampleFlashSwap', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet] = provider.getWallets()
  const loadFixture = createFixtureLoader(provider, [wallet])

  let WETC: Contract
  let WETCPartner: Contract
  let WETCExchangeV1: Contract
  let WETCPair: Contract
  let flashSwapExample: Contract
  beforeEach(async function() {
    const fixture = await loadFixture(v2Fixture)

    WETC = fixture.WETC
    WETCPartner = fixture.WETCPartner
    WETCExchangeV1 = fixture.WETCExchangeV1
    WETCPair = fixture.WETCPair
    flashSwapExample = await deployContract(
      wallet,
      ExampleFlashSwap,
      [fixture.factoryV2.address, fixture.factoryV1.address, fixture.router.address],
      overrides
    )
  })

  it('HebeswapV2Call:0', async () => {
    // add liquidity to V1 at a rate of 1 ETC / 200 X
    const WETCPartnerAmountV1 = expandTo18Decimals(2000)
    const ETCAmountV1 = expandTo18Decimals(10)
    await WETCPartner.approve(WETCExchangeV1.address, WETCPartnerAmountV1)
    await WETCExchangeV1.addLiquidity(bigNumberify(1), WETCPartnerAmountV1, MaxUint256, {
      ...overrides,
      value: ETCAmountV1
    })

    // add liquidity to V2 at a rate of 1 ETC / 100 X
    const WETCPartnerAmountV2 = expandTo18Decimals(1000)
    const ETCAmountV2 = expandTo18Decimals(10)
    await WETCPartner.transfer(WETCPair.address, WETCPartnerAmountV2)
    await WETC.deposit({ value: ETCAmountV2 })
    await WETC.transfer(WETCPair.address, ETCAmountV2)
    await WETCPair.mint(wallet.address, overrides)

    const balanceBefore = await WETCPartner.balanceOf(wallet.address)

    // now, execute arbitrage via HebeswapV2Call:
    // receive 1 ETC from V2, get as much X from V1 as we can, repay V2 with minimum X, keep the rest!
    const arbitrageAmount = expandTo18Decimals(1)
    // instead of being 'hard-coded', the above value could be calculated optimally off-chain. this would be
    // better, but it'd be better yet to calculate the amount at runtime, on-chain. unfortunately, this requires a
    // swap-to-price calculation, which is a little tricky, and out of scope for the moment
    const WETCPairToken0 = await WETCPair.token0()
    const amount0 = WETCPairToken0 === WETCPartner.address ? bigNumberify(0) : arbitrageAmount
    const amount1 = WETCPairToken0 === WETCPartner.address ? arbitrageAmount : bigNumberify(0)
    await WETCPair.swap(
      amount0,
      amount1,
      flashSwapExample.address,
      defaultAbiCoder.encode(['uint'], [bigNumberify(1)]),
      overrides
    )

    const balanceAfter = await WETCPartner.balanceOf(wallet.address)
    const profit = balanceAfter.sub(balanceBefore).div(expandTo18Decimals(1))
    const reservesV1 = [
      await WETCPartner.balanceOf(WETCExchangeV1.address),
      await provider.getBalance(WETCExchangeV1.address)
    ]
    const priceV1 = reservesV1[0].div(reservesV1[1])
    const reservesV2 = (await WETCPair.getReserves()).slice(0, 2)
    const priceV2 =
      WETCPairToken0 === WETCPartner.address ? reservesV2[0].div(reservesV2[1]) : reservesV2[1].div(reservesV2[0])

    expect(profit.toString()).to.eq('69') // our profit is ~69 tokens
    expect(priceV1.toString()).to.eq('165') // we pushed the v1 price down to ~165
    expect(priceV2.toString()).to.eq('123') // we pushed the v2 price up to ~123
  })

  it('HebeswapV2Call:1', async () => {
    // add liquidity to V1 at a rate of 1 ETC / 100 X
    const WETCPartnerAmountV1 = expandTo18Decimals(1000)
    const ETCAmountV1 = expandTo18Decimals(10)
    await WETCPartner.approve(WETCExchangeV1.address, WETCPartnerAmountV1)
    await WETCExchangeV1.addLiquidity(bigNumberify(1), WETCPartnerAmountV1, MaxUint256, {
      ...overrides,
      value: ETCAmountV1
    })

    // add liquidity to V2 at a rate of 1 ETC / 200 X
    const WETCPartnerAmountV2 = expandTo18Decimals(2000)
    const ETCAmountV2 = expandTo18Decimals(10)
    await WETCPartner.transfer(WETCPair.address, WETCPartnerAmountV2)
    await WETC.deposit({ value: ETCAmountV2 })
    await WETC.transfer(WETCPair.address, ETCAmountV2)
    await WETCPair.mint(wallet.address, overrides)

    const balanceBefore = await provider.getBalance(wallet.address)

    // now, execute arbitrage via HebeswapV2Call:
    // receive 200 X from V2, get as much ETC from V1 as we can, repay V2 with minimum ETC, keep the rest!
    const arbitrageAmount = expandTo18Decimals(200)
    // instead of being 'hard-coded', the above value could be calculated optimally off-chain. this would be
    // better, but it'd be better yet to calculate the amount at runtime, on-chain. unfortunately, this requires a
    // swap-to-price calculation, which is a little tricky, and out of scope for the moment
    const WETCPairToken0 = await WETCPair.token0()
    const amount0 = WETCPairToken0 === WETCPartner.address ? arbitrageAmount : bigNumberify(0)
    const amount1 = WETCPairToken0 === WETCPartner.address ? bigNumberify(0) : arbitrageAmount
    await WETCPair.swap(
      amount0,
      amount1,
      flashSwapExample.address,
      defaultAbiCoder.encode(['uint'], [bigNumberify(1)]),
      overrides
    )

    const balanceAfter = await provider.getBalance(wallet.address)
    const profit = balanceAfter.sub(balanceBefore)
    const reservesV1 = [
      await WETCPartner.balanceOf(WETCExchangeV1.address),
      await provider.getBalance(WETCExchangeV1.address)
    ]
    const priceV1 = reservesV1[0].div(reservesV1[1])
    const reservesV2 = (await WETCPair.getReserves()).slice(0, 2)
    const priceV2 =
      WETCPairToken0 === WETCPartner.address ? reservesV2[0].div(reservesV2[1]) : reservesV2[1].div(reservesV2[0])

    expect(formatEther(profit)).to.eq('0.548043441089763649') // our profit is ~.5 ETC
    expect(priceV1.toString()).to.eq('143') // we pushed the v1 price up to ~143
    expect(priceV2.toString()).to.eq('161') // we pushed the v2 price down to ~161
  })
})
