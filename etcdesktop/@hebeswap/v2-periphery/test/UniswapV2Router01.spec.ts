import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { AddressZero, Zero, MaxUint256 } from 'ethers/constants'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'

import { expandTo18Decimals, getApprovalDigest, mineBlock, MINIMUM_LIQUIDITY } from './shared/utilities'
import { v2Fixture } from './shared/fixtures'

chai.use(solidity)

const overrides = {
  gasLimit: 9999999
}

enum RouterVersion {
  HebeswapV2Router01 = 'HebeswapV2Router01',
  HebeswapV2Router02 = 'HebeswapV2Router02'
}

describe('HebeswapV2Router{01,02}', () => {
  for (const routerVersion of Object.keys(RouterVersion)) {
    const provider = new MockProvider({
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999
    })
    const [wallet] = provider.getWallets()
    const loadFixture = createFixtureLoader(provider, [wallet])

    let token0: Contract
    let token1: Contract
    let WETC: Contract
    let WETCPartner: Contract
    let factory: Contract
    let router: Contract
    let pair: Contract
    let WETCPair: Contract
    let routerEventEmitter: Contract
    beforeEach(async function() {
      const fixture = await loadFixture(v2Fixture)
      token0 = fixture.token0
      token1 = fixture.token1
      WETC = fixture.WETC
      WETCPartner = fixture.WETCPartner
      factory = fixture.factoryV2
      router = {
        [RouterVersion.HebeswapV2Router01]: fixture.router01,
        [RouterVersion.HebeswapV2Router02]: fixture.router02
      }[routerVersion as RouterVersion]
      pair = fixture.pair
      WETCPair = fixture.WETCPair
      routerEventEmitter = fixture.routerEventEmitter
    })

    afterEach(async function() {
      expect(await provider.getBalance(router.address)).to.eq(Zero)
    })

    describe(routerVersion, () => {
      it('factory, WETC', async () => {
        expect(await router.factory()).to.eq(factory.address)
        expect(await router.WETC()).to.eq(WETC.address)
      })

      it('addLiquidity', async () => {
        const token0Amount = expandTo18Decimals(1)
        const token1Amount = expandTo18Decimals(4)

        const expectedLiquidity = expandTo18Decimals(2)
        await token0.approve(router.address, MaxUint256)
        await token1.approve(router.address, MaxUint256)
        await expect(
          router.addLiquidity(
            token0.address,
            token1.address,
            token0Amount,
            token1Amount,
            0,
            0,
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(token0, 'Transfer')
          .withArgs(wallet.address, pair.address, token0Amount)
          .to.emit(token1, 'Transfer')
          .withArgs(wallet.address, pair.address, token1Amount)
          .to.emit(pair, 'Transfer')
          .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
          .to.emit(pair, 'Transfer')
          .withArgs(AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
          .to.emit(pair, 'Sync')
          .withArgs(token0Amount, token1Amount)
          .to.emit(pair, 'Mint')
          .withArgs(router.address, token0Amount, token1Amount)

        expect(await pair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      })

      it('addLiquidityETC', async () => {
        const WETCPartnerAmount = expandTo18Decimals(1)
        const ETCAmount = expandTo18Decimals(4)

        const expectedLiquidity = expandTo18Decimals(2)
        const WETCPairToken0 = await WETCPair.token0()
        await WETCPartner.approve(router.address, MaxUint256)
        await expect(
          router.addLiquidityETC(
            WETCPartner.address,
            WETCPartnerAmount,
            WETCPartnerAmount,
            ETCAmount,
            wallet.address,
            MaxUint256,
            { ...overrides, value: ETCAmount }
          )
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

      async function addLiquidity(token0Amount: BigNumber, token1Amount: BigNumber) {
        await token0.transfer(pair.address, token0Amount)
        await token1.transfer(pair.address, token1Amount)
        await pair.mint(wallet.address, overrides)
      }
      it('removeLiquidity', async () => {
        const token0Amount = expandTo18Decimals(1)
        const token1Amount = expandTo18Decimals(4)
        await addLiquidity(token0Amount, token1Amount)

        const expectedLiquidity = expandTo18Decimals(2)
        await pair.approve(router.address, MaxUint256)
        await expect(
          router.removeLiquidity(
            token0.address,
            token1.address,
            expectedLiquidity.sub(MINIMUM_LIQUIDITY),
            0,
            0,
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(pair, 'Transfer')
          .withArgs(wallet.address, pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
          .to.emit(pair, 'Transfer')
          .withArgs(pair.address, AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
          .to.emit(token0, 'Transfer')
          .withArgs(pair.address, wallet.address, token0Amount.sub(500))
          .to.emit(token1, 'Transfer')
          .withArgs(pair.address, wallet.address, token1Amount.sub(2000))
          .to.emit(pair, 'Sync')
          .withArgs(500, 2000)
          .to.emit(pair, 'Burn')
          .withArgs(router.address, token0Amount.sub(500), token1Amount.sub(2000), wallet.address)

        expect(await pair.balanceOf(wallet.address)).to.eq(0)
        const totalSupplyToken0 = await token0.totalSupply()
        const totalSupplyToken1 = await token1.totalSupply()
        expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(500))
        expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(2000))
      })

      it('removeLiquidityETC', async () => {
        const WETCPartnerAmount = expandTo18Decimals(1)
        const ETCAmount = expandTo18Decimals(4)
        await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
        await WETC.deposit({ value: ETCAmount })
        await WETC.transfer(WETCPair.address, ETCAmount)
        await WETCPair.mint(wallet.address, overrides)

        const expectedLiquidity = expandTo18Decimals(2)
        const WETCPairToken0 = await WETCPair.token0()
        await WETCPair.approve(router.address, MaxUint256)
        await expect(
          router.removeLiquidityETC(
            WETCPartner.address,
            expectedLiquidity.sub(MINIMUM_LIQUIDITY),
            0,
            0,
            wallet.address,
            MaxUint256,
            overrides
          )
        )
          .to.emit(WETCPair, 'Transfer')
          .withArgs(wallet.address, WETCPair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
          .to.emit(WETCPair, 'Transfer')
          .withArgs(WETCPair.address, AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
          .to.emit(WETC, 'Transfer')
          .withArgs(WETCPair.address, router.address, ETCAmount.sub(2000))
          .to.emit(WETCPartner, 'Transfer')
          .withArgs(WETCPair.address, router.address, WETCPartnerAmount.sub(500))
          .to.emit(WETCPartner, 'Transfer')
          .withArgs(router.address, wallet.address, WETCPartnerAmount.sub(500))
          .to.emit(WETCPair, 'Sync')
          .withArgs(
            WETCPairToken0 === WETCPartner.address ? 500 : 2000,
            WETCPairToken0 === WETCPartner.address ? 2000 : 500
          )
          .to.emit(WETCPair, 'Burn')
          .withArgs(
            router.address,
            WETCPairToken0 === WETCPartner.address ? WETCPartnerAmount.sub(500) : ETCAmount.sub(2000),
            WETCPairToken0 === WETCPartner.address ? ETCAmount.sub(2000) : WETCPartnerAmount.sub(500),
            router.address
          )

        expect(await WETCPair.balanceOf(wallet.address)).to.eq(0)
        const totalSupplyWETCPartner = await WETCPartner.totalSupply()
        const totalSupplyWETC = await WETC.totalSupply()
        expect(await WETCPartner.balanceOf(wallet.address)).to.eq(totalSupplyWETCPartner.sub(500))
        expect(await WETC.balanceOf(wallet.address)).to.eq(totalSupplyWETC.sub(2000))
      })

      it('removeLiquidityWithPermit', async () => {
        const token0Amount = expandTo18Decimals(1)
        const token1Amount = expandTo18Decimals(4)
        await addLiquidity(token0Amount, token1Amount)

        const expectedLiquidity = expandTo18Decimals(2)

        const nonce = await pair.nonces(wallet.address)
        const digest = await getApprovalDigest(
          pair,
          { owner: wallet.address, spender: router.address, value: expectedLiquidity.sub(MINIMUM_LIQUIDITY) },
          nonce,
          MaxUint256
        )

        const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

        await router.removeLiquidityWithPermit(
          token0.address,
          token1.address,
          expectedLiquidity.sub(MINIMUM_LIQUIDITY),
          0,
          0,
          wallet.address,
          MaxUint256,
          false,
          v,
          r,
          s,
          overrides
        )
      })

      it('removeLiquidityETCWithPermit', async () => {
        const WETCPartnerAmount = expandTo18Decimals(1)
        const ETCAmount = expandTo18Decimals(4)
        await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
        await WETC.deposit({ value: ETCAmount })
        await WETC.transfer(WETCPair.address, ETCAmount)
        await WETCPair.mint(wallet.address, overrides)

        const expectedLiquidity = expandTo18Decimals(2)

        const nonce = await WETCPair.nonces(wallet.address)
        const digest = await getApprovalDigest(
          WETCPair,
          { owner: wallet.address, spender: router.address, value: expectedLiquidity.sub(MINIMUM_LIQUIDITY) },
          nonce,
          MaxUint256
        )

        const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

        await router.removeLiquidityETCWithPermit(
          WETCPartner.address,
          expectedLiquidity.sub(MINIMUM_LIQUIDITY),
          0,
          0,
          wallet.address,
          MaxUint256,
          false,
          v,
          r,
          s,
          overrides
        )
      })

      describe('swapExactTokensForTokens', () => {
        const token0Amount = expandTo18Decimals(5)
        const token1Amount = expandTo18Decimals(10)
        const swapAmount = expandTo18Decimals(1)
        const expectedOutputAmount = bigNumberify('1662497915624478906')

        beforeEach(async () => {
          await addLiquidity(token0Amount, token1Amount)
          await token0.approve(router.address, MaxUint256)
        })

        it('happy path', async () => {
          await expect(
            router.swapExactTokensForTokens(
              swapAmount,
              0,
              [token0.address, token1.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(token0, 'Transfer')
            .withArgs(wallet.address, pair.address, swapAmount)
            .to.emit(token1, 'Transfer')
            .withArgs(pair.address, wallet.address, expectedOutputAmount)
            .to.emit(pair, 'Sync')
            .withArgs(token0Amount.add(swapAmount), token1Amount.sub(expectedOutputAmount))
            .to.emit(pair, 'Swap')
            .withArgs(router.address, swapAmount, 0, 0, expectedOutputAmount, wallet.address)
        })

        it('amounts', async () => {
          await token0.approve(routerEventEmitter.address, MaxUint256)
          await expect(
            routerEventEmitter.swapExactTokensForTokens(
              router.address,
              swapAmount,
              0,
              [token0.address, token1.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(routerEventEmitter, 'Amounts')
            .withArgs([swapAmount, expectedOutputAmount])
        })

        it('gas', async () => {
          // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
          await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
          await pair.sync(overrides)

          await token0.approve(router.address, MaxUint256)
          await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
          const tx = await router.swapExactTokensForTokens(
            swapAmount,
            0,
            [token0.address, token1.address],
            wallet.address,
            MaxUint256,
            overrides
          )
          const receipt = await tx.wait()
          expect(receipt.gasUsed).to.eq(
            {
              [RouterVersion.HebeswapV2Router01]: 101876,
              [RouterVersion.HebeswapV2Router02]: 101898
            }[routerVersion as RouterVersion]
          )
        }).retries(3)
      })

      describe('swapTokensForExactTokens', () => {
        const token0Amount = expandTo18Decimals(5)
        const token1Amount = expandTo18Decimals(10)
        const expectedSwapAmount = bigNumberify('557227237267357629')
        const outputAmount = expandTo18Decimals(1)

        beforeEach(async () => {
          await addLiquidity(token0Amount, token1Amount)
        })

        it('happy path', async () => {
          await token0.approve(router.address, MaxUint256)
          await expect(
            router.swapTokensForExactTokens(
              outputAmount,
              MaxUint256,
              [token0.address, token1.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(token0, 'Transfer')
            .withArgs(wallet.address, pair.address, expectedSwapAmount)
            .to.emit(token1, 'Transfer')
            .withArgs(pair.address, wallet.address, outputAmount)
            .to.emit(pair, 'Sync')
            .withArgs(token0Amount.add(expectedSwapAmount), token1Amount.sub(outputAmount))
            .to.emit(pair, 'Swap')
            .withArgs(router.address, expectedSwapAmount, 0, 0, outputAmount, wallet.address)
        })

        it('amounts', async () => {
          await token0.approve(routerEventEmitter.address, MaxUint256)
          await expect(
            routerEventEmitter.swapTokensForExactTokens(
              router.address,
              outputAmount,
              MaxUint256,
              [token0.address, token1.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(routerEventEmitter, 'Amounts')
            .withArgs([expectedSwapAmount, outputAmount])
        })
      })

      describe('swapExactETCForTokens', () => {
        const WETCPartnerAmount = expandTo18Decimals(10)
        const ETCAmount = expandTo18Decimals(5)
        const swapAmount = expandTo18Decimals(1)
        const expectedOutputAmount = bigNumberify('1662497915624478906')

        beforeEach(async () => {
          await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
          await WETC.deposit({ value: ETCAmount })
          await WETC.transfer(WETCPair.address, ETCAmount)
          await WETCPair.mint(wallet.address, overrides)

          await token0.approve(router.address, MaxUint256)
        })

        it('happy path', async () => {
          const WETCPairToken0 = await WETCPair.token0()
          await expect(
            router.swapExactETCForTokens(0, [WETC.address, WETCPartner.address], wallet.address, MaxUint256, {
              ...overrides,
              value: swapAmount
            })
          )
            .to.emit(WETC, 'Transfer')
            .withArgs(router.address, WETCPair.address, swapAmount)
            .to.emit(WETCPartner, 'Transfer')
            .withArgs(WETCPair.address, wallet.address, expectedOutputAmount)
            .to.emit(WETCPair, 'Sync')
            .withArgs(
              WETCPairToken0 === WETCPartner.address
                ? WETCPartnerAmount.sub(expectedOutputAmount)
                : ETCAmount.add(swapAmount),
              WETCPairToken0 === WETCPartner.address
                ? ETCAmount.add(swapAmount)
                : WETCPartnerAmount.sub(expectedOutputAmount)
            )
            .to.emit(WETCPair, 'Swap')
            .withArgs(
              router.address,
              WETCPairToken0 === WETCPartner.address ? 0 : swapAmount,
              WETCPairToken0 === WETCPartner.address ? swapAmount : 0,
              WETCPairToken0 === WETCPartner.address ? expectedOutputAmount : 0,
              WETCPairToken0 === WETCPartner.address ? 0 : expectedOutputAmount,
              wallet.address
            )
        })

        it('amounts', async () => {
          await expect(
            routerEventEmitter.swapExactETCForTokens(
              router.address,
              0,
              [WETC.address, WETCPartner.address],
              wallet.address,
              MaxUint256,
              {
                ...overrides,
                value: swapAmount
              }
            )
          )
            .to.emit(routerEventEmitter, 'Amounts')
            .withArgs([swapAmount, expectedOutputAmount])
        })

        it('gas', async () => {
          const WETCPartnerAmount = expandTo18Decimals(10)
          const ETCAmount = expandTo18Decimals(5)
          await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
          await WETC.deposit({ value: ETCAmount })
          await WETC.transfer(WETCPair.address, ETCAmount)
          await WETCPair.mint(wallet.address, overrides)

          // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
          await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
          await pair.sync(overrides)

          const swapAmount = expandTo18Decimals(1)
          await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
          const tx = await router.swapExactETCForTokens(
            0,
            [WETC.address, WETCPartner.address],
            wallet.address,
            MaxUint256,
            {
              ...overrides,
              value: swapAmount
            }
          )
          const receipt = await tx.wait()
          expect(receipt.gasUsed).to.eq(
            {
              [RouterVersion.HebeswapV2Router01]: 138770,
              [RouterVersion.HebeswapV2Router02]: 138770
            }[routerVersion as RouterVersion]
          )
        }).retries(3)
      })

      describe('swapTokensForExactETC', () => {
        const WETCPartnerAmount = expandTo18Decimals(5)
        const ETCAmount = expandTo18Decimals(10)
        const expectedSwapAmount = bigNumberify('557227237267357629')
        const outputAmount = expandTo18Decimals(1)

        beforeEach(async () => {
          await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
          await WETC.deposit({ value: ETCAmount })
          await WETC.transfer(WETCPair.address, ETCAmount)
          await WETCPair.mint(wallet.address, overrides)
        })

        it('happy path', async () => {
          await WETCPartner.approve(router.address, MaxUint256)
          const WETCPairToken0 = await WETCPair.token0()
          await expect(
            router.swapTokensForExactETC(
              outputAmount,
              MaxUint256,
              [WETCPartner.address, WETC.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(WETCPartner, 'Transfer')
            .withArgs(wallet.address, WETCPair.address, expectedSwapAmount)
            .to.emit(WETC, 'Transfer')
            .withArgs(WETCPair.address, router.address, outputAmount)
            .to.emit(WETCPair, 'Sync')
            .withArgs(
              WETCPairToken0 === WETCPartner.address
                ? WETCPartnerAmount.add(expectedSwapAmount)
                : ETCAmount.sub(outputAmount),
              WETCPairToken0 === WETCPartner.address
                ? ETCAmount.sub(outputAmount)
                : WETCPartnerAmount.add(expectedSwapAmount)
            )
            .to.emit(WETCPair, 'Swap')
            .withArgs(
              router.address,
              WETCPairToken0 === WETCPartner.address ? expectedSwapAmount : 0,
              WETCPairToken0 === WETCPartner.address ? 0 : expectedSwapAmount,
              WETCPairToken0 === WETCPartner.address ? 0 : outputAmount,
              WETCPairToken0 === WETCPartner.address ? outputAmount : 0,
              router.address
            )
        })

        it('amounts', async () => {
          await WETCPartner.approve(routerEventEmitter.address, MaxUint256)
          await expect(
            routerEventEmitter.swapTokensForExactETC(
              router.address,
              outputAmount,
              MaxUint256,
              [WETCPartner.address, WETC.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(routerEventEmitter, 'Amounts')
            .withArgs([expectedSwapAmount, outputAmount])
        })
      })

      describe('swapExactTokensForETC', () => {
        const WETCPartnerAmount = expandTo18Decimals(5)
        const ETCAmount = expandTo18Decimals(10)
        const swapAmount = expandTo18Decimals(1)
        const expectedOutputAmount = bigNumberify('1662497915624478906')

        beforeEach(async () => {
          await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
          await WETC.deposit({ value: ETCAmount })
          await WETC.transfer(WETCPair.address, ETCAmount)
          await WETCPair.mint(wallet.address, overrides)
        })

        it('happy path', async () => {
          await WETCPartner.approve(router.address, MaxUint256)
          const WETCPairToken0 = await WETCPair.token0()
          await expect(
            router.swapExactTokensForETC(
              swapAmount,
              0,
              [WETCPartner.address, WETC.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(WETCPartner, 'Transfer')
            .withArgs(wallet.address, WETCPair.address, swapAmount)
            .to.emit(WETC, 'Transfer')
            .withArgs(WETCPair.address, router.address, expectedOutputAmount)
            .to.emit(WETCPair, 'Sync')
            .withArgs(
              WETCPairToken0 === WETCPartner.address
                ? WETCPartnerAmount.add(swapAmount)
                : ETCAmount.sub(expectedOutputAmount),
              WETCPairToken0 === WETCPartner.address
                ? ETCAmount.sub(expectedOutputAmount)
                : WETCPartnerAmount.add(swapAmount)
            )
            .to.emit(WETCPair, 'Swap')
            .withArgs(
              router.address,
              WETCPairToken0 === WETCPartner.address ? swapAmount : 0,
              WETCPairToken0 === WETCPartner.address ? 0 : swapAmount,
              WETCPairToken0 === WETCPartner.address ? 0 : expectedOutputAmount,
              WETCPairToken0 === WETCPartner.address ? expectedOutputAmount : 0,
              router.address
            )
        })

        it('amounts', async () => {
          await WETCPartner.approve(routerEventEmitter.address, MaxUint256)
          await expect(
            routerEventEmitter.swapExactTokensForETC(
              router.address,
              swapAmount,
              0,
              [WETCPartner.address, WETC.address],
              wallet.address,
              MaxUint256,
              overrides
            )
          )
            .to.emit(routerEventEmitter, 'Amounts')
            .withArgs([swapAmount, expectedOutputAmount])
        })
      })

      describe('swapETCForExactTokens', () => {
        const WETCPartnerAmount = expandTo18Decimals(10)
        const ETCAmount = expandTo18Decimals(5)
        const expectedSwapAmount = bigNumberify('557227237267357629')
        const outputAmount = expandTo18Decimals(1)

        beforeEach(async () => {
          await WETCPartner.transfer(WETCPair.address, WETCPartnerAmount)
          await WETC.deposit({ value: ETCAmount })
          await WETC.transfer(WETCPair.address, ETCAmount)
          await WETCPair.mint(wallet.address, overrides)
        })

        it('happy path', async () => {
          const WETCPairToken0 = await WETCPair.token0()
          await expect(
            router.swapETCForExactTokens(
              outputAmount,
              [WETC.address, WETCPartner.address],
              wallet.address,
              MaxUint256,
              {
                ...overrides,
                value: expectedSwapAmount
              }
            )
          )
            .to.emit(WETC, 'Transfer')
            .withArgs(router.address, WETCPair.address, expectedSwapAmount)
            .to.emit(WETCPartner, 'Transfer')
            .withArgs(WETCPair.address, wallet.address, outputAmount)
            .to.emit(WETCPair, 'Sync')
            .withArgs(
              WETCPairToken0 === WETCPartner.address
                ? WETCPartnerAmount.sub(outputAmount)
                : ETCAmount.add(expectedSwapAmount),
              WETCPairToken0 === WETCPartner.address
                ? ETCAmount.add(expectedSwapAmount)
                : WETCPartnerAmount.sub(outputAmount)
            )
            .to.emit(WETCPair, 'Swap')
            .withArgs(
              router.address,
              WETCPairToken0 === WETCPartner.address ? 0 : expectedSwapAmount,
              WETCPairToken0 === WETCPartner.address ? expectedSwapAmount : 0,
              WETCPairToken0 === WETCPartner.address ? outputAmount : 0,
              WETCPairToken0 === WETCPartner.address ? 0 : outputAmount,
              wallet.address
            )
        })

        it('amounts', async () => {
          await expect(
            routerEventEmitter.swapETCForExactTokens(
              router.address,
              outputAmount,
              [WETC.address, WETCPartner.address],
              wallet.address,
              MaxUint256,
              {
                ...overrides,
                value: expectedSwapAmount
              }
            )
          )
            .to.emit(routerEventEmitter, 'Amounts')
            .withArgs([expectedSwapAmount, outputAmount])
        })
      })
    })
  }
})
