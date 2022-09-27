pragma solidity =0.6.6;

import '@hebeswap/v2-core/contracts/interfaces/IHebeswapV2Callee.sol';

import '../libraries/HebeswapV2Library.sol';
import '../interfaces/V1/IHebeswapV1Factory.sol';
import '../interfaces/V1/IHebeswapV1Exchange.sol';
import '../interfaces/IHebeswapV2Router01.sol';
import '../interfaces/IERC20.sol';
import '../interfaces/IWETC.sol';

contract ExampleFlashSwap is IHebeswapV2Callee {
    IHebeswapV1Factory immutable factoryV1;
    address immutable factory;
    IWETC immutable WETC;

    constructor(address _factory, address _factoryV1, address router) public {
        factoryV1 = IHebeswapV1Factory(_factoryV1);
        factory = _factory;
        WETC = IWETC(IHebeswapV2Router01(router).WETC());
    }

    // needs to accept ETC from any V1 exchange and WETC. ideally this could be enforced, as in the router,
    // but it's not possible because it requires a call to the v1 factory, which takes too much gas
    receive() external payable {}

    // gets tokens/WETC via a V2 flash swap, swaps for the ETC/tokens on V1, repays V2, and keeps the rest!
    function hebeswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external override {
        address[] memory path = new address[](2);
        uint amountToken;
        uint amountETC;
        { // scope for token{0,1}, avoids stack too deep errors
        address token0 = IHebeswapV2Pair(msg.sender).token0();
        address token1 = IHebeswapV2Pair(msg.sender).token1();
        assert(msg.sender == HebeswapV2Library.pairFor(factory, token0, token1)); // ensure that msg.sender is actually a V2 pair
        assert(amount0 == 0 || amount1 == 0); // this strategy is unidirectional
        path[0] = amount0 == 0 ? token0 : token1;
        path[1] = amount0 == 0 ? token1 : token0;
        amountToken = token0 == address(WETC) ? amount1 : amount0;
        amountETC = token0 == address(WETC) ? amount0 : amount1;
        }

        assert(path[0] == address(WETC) || path[1] == address(WETC)); // this strategy only works with a V2 WETC pair
        IERC20 token = IERC20(path[0] == address(WETC) ? path[1] : path[0]);
        IHebeswapV1Exchange exchangeV1 = IHebeswapV1Exchange(factoryV1.getExchange(address(token))); // get V1 exchange

        if (amountToken > 0) {
            (uint minETC) = abi.decode(data, (uint)); // slippage parameter for V1, passed in by caller
            token.approve(address(exchangeV1), amountToken);
            uint amountReceived = exchangeV1.tokenToEtcSwapInput(amountToken, minETC, uint(-1));
            uint amountRequired = HebeswapV2Library.getAmountsIn(factory, amountToken, path)[0];
            assert(amountReceived > amountRequired); // fail if we didn't get enough ETC back to repay our flash loan
            WETC.deposit{value: amountRequired}();
            assert(WETC.transfer(msg.sender, amountRequired)); // return WETC to V2 pair
            (bool success,) = sender.call{value: amountReceived - amountRequired}(new bytes(0)); // keep the rest! (ETC)
            assert(success);
        } else {
            (uint minTokens) = abi.decode(data, (uint)); // slippage parameter for V1, passed in by caller
            WETC.withdraw(amountETC);
            uint amountReceived = exchangeV1.etcToTokenSwapInput{value: amountETC}(minTokens, uint(-1));
            uint amountRequired = HebeswapV2Library.getAmountsIn(factory, amountETC, path)[0];
            assert(amountReceived > amountRequired); // fail if we didn't get enough tokens back to repay our flash loan
            assert(token.transfer(msg.sender, amountRequired)); // return tokens to V2 pair
            assert(token.transfer(sender, amountReceived - amountRequired)); // keep the rest! (tokens)
        }
    }
}
