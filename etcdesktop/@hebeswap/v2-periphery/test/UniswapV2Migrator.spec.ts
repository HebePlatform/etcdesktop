import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { AddressZero, MaxUint256 } from 'ethers/constants'
import { bigNumberify } from 'ethers/utils'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'

import { v2Fixture } from './shared/fixtures'
import { expandTo18Decimals, MINIMUM_LIQUIDITY } from './shared/utilities'

chai.use(solidity)

const overrides = {
  gasLimit: 9999999
}

describe('HebeswapV2Migrator', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet] = provider.getWallets()
  const loadFixture = createFixtureLoader(provider, [wallet])

  let WETCPartner: Contract
  let WETCPair: Contract
  let router: Contract
  let migrator: Contract
  let WETCExchangeV1: Contract
  beforeEach(async function() {
    const fixture = await loadFixture(v2Fixture)
    WETCPartner = fixture.WETCPartner
    WETCPair = fixture.WETCPair
    router = fixture.router01 // we used router01 for this contract
    migrator = fixture.migrator
    WETCExchangeV1 = fixture.WETCExchangeV1
  })

  it('migrate', async () => {
    const WETCPartnerAmount = expandTo18Decimals(1)
    const ETCAmount = expandTo18Decimals(4)
    await WETCPartner.approve(WETCExchangeV1.address, MaxUint256)
    await WETCExchangeV1.addLiquidity(bigNumberify(1), WETCPartnerAmount, MaxUint256, {
      ...overrides,
      value: ETCAmount
    })
    await WETCExchangeV1.approve(migrator.address, MaxUint256)
    const expectedLiquidity = expandTo18Decimals(2)
    const WETCPairToken0 = await WETCPair.token0()
    await expect(
      migrator.migrate(WETCPartner.address, WETCPartnerAmount, ETCAmount, wallet.address, MaxUint256, overrides)
    )
      .to.emit(WETCPair, 'Transfer')
      .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
      .to.emit(WETCPair, 'Transfer')
      .withArgs(AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      .to.emit(WETCPair, 'Sync')
      .withArgs(
        WETCPairToken0 === WETCPartner.address ? WETCPartnerAmount : ETCAmount,
        WETCPairToken0 === WETCPartner.address ? ETCAmount : WETCPartnerAmount
      )
      .to.emit(WETCPair, 'Mint')
      .withArgs(
        router.address,
        WETCPairToken0 === WETCPartner.address ? WETCPartnerAmount : ETCAmount,
        WETCPairToken0 === WETCPartner.address ? ETCAmount : WETCPartnerAmount
      )
    expect(await WETCPair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
  })
})
