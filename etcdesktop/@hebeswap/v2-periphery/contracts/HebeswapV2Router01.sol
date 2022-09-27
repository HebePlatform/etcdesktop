pragma solidity =0.6.6;

import '@hebeswap/v2-core/contracts/interfaces/IHebeswapV2Factory.sol';
import '@hebeswap/lib/contracts/libraries/TransferHelper.sol';

import './libraries/HebeswapV2Library.sol';
import './interfaces/IHebeswapV2Router01.sol';
import './interfaces/IERC20.sol';
import './interfaces/IWETC.sol';

contract HebeswapV2Router01 is IHebeswapV2Router01 {
    address public immutable override factory;
    address public immutable override WETC;

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'HebeswapV2Router: EXPIRED');
        _;
    }

    constructor(address _factory, address _WETC) public {
        factory = _factory;
        WETC = _WETC;
    }

    receive() external payable {
        assert(msg.sender == WETC); // only accept ETC via fallback from the WETC contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) private returns (uint amountA, uint amountB) {
        // create the pair if it doesn't exist yet
        if (IHebeswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
            IHebeswapV2Factory(factory).createPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = HebeswapV2Library.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = HebeswapV2Library.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, 'HebeswapV2Router: INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = HebeswapV2Library.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, 'HebeswapV2Router: INSUFFICIENT_A_AMOUNT');
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = HebeswapV2Library.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IHebeswapV2Pair(pair).mint(to);
    }
    function addLiquidityETC(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETCMin,
        address to,
        uint deadline
    ) external override payable ensure(deadline) returns (uint amountToken, uint amountETC, uint liquidity) {
        (amountToken, amountETC) = _addLiquidity(
            token,
            WETC,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETCMin
        );
        address pair = HebeswapV2Library.pairFor(factory, token, WETC);
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
        IWETC(WETC).deposit{value: amountETC}();
        assert(IWETC(WETC).transfer(pair, amountETC));
        liquidity = IHebeswapV2Pair(pair).mint(to);
        if (msg.value > amountETC) TransferHelper.safeTransferETC(msg.sender, msg.value - amountETC); // refund dust etc, if any
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public override ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = HebeswapV2Library.pairFor(factory, tokenA, tokenB);
        IHebeswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = IHebeswapV2Pair(pair).burn(to);
        (address token0,) = HebeswapV2Library.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, 'HebeswapV2Router: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'HebeswapV2Router: INSUFFICIENT_B_AMOUNT');
    }
    function removeLiquidityETC(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETCMin,
        address to,
        uint deadline
    ) public override ensure(deadline) returns (uint amountToken, uint amountETC) {
        (amountToken, amountETC) = removeLiquidity(
            token,
            WETC,
            liquidity,
            amountTokenMin,
            amountETCMin,
            address(this),
            deadline
        );
        TransferHelper.safeTransfer(token, to, amountToken);
        IWETC(WETC).withdraw(amountETC);
        TransferHelper.safeTransferETC(to, amountETC);
    }
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external override returns (uint amountA, uint amountB) {
        address pair = HebeswapV2Library.pairFor(factory, tokenA, tokenB);
        uint value = approveMax ? uint(-1) : liquidity;
        IHebeswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        (amountA, amountB) = removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
    }
    function removeLiquidityETCWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETCMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external override returns (uint amountToken, uint amountETC) {
        address pair = HebeswapV2Library.pairFor(factory, token, WETC);
        uint value = approveMax ? uint(-1) : liquidity;
        IHebeswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
        (amountToken, amountETC) = removeLiquidityETC(token, liquidity, amountTokenMin, amountETCMin, to, deadline);
    }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address _to) private {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = HebeswapV2Library.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? HebeswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            IHebeswapV2Pair(HebeswapV2Library.pairFor(factory, input, output)).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external override ensure(deadline) returns (uint[] memory amounts) {
        amounts = HebeswapV2Library.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'HebeswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(path[0], msg.sender, HebeswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external override ensure(deadline) returns (uint[] memory amounts) {
        amounts = HebeswapV2Library.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, 'HebeswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(path[0], msg.sender, HebeswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }
    function swapExactETCForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[0] == WETC, 'HebeswapV2Router: INVALID_PATH');
        amounts = HebeswapV2Library.getAmountsOut(factory, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'HebeswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETC(WETC).deposit{value: amounts[0]}();
        assert(IWETC(WETC).transfer(HebeswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }
    function swapTokensForExactETC(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[path.length - 1] == WETC, 'HebeswapV2Router: INVALID_PATH');
        amounts = HebeswapV2Library.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, 'HebeswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(path[0], msg.sender, HebeswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWETC(WETC).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETC(to, amounts[amounts.length - 1]);
    }
    function swapExactTokensForETC(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[path.length - 1] == WETC, 'HebeswapV2Router: INVALID_PATH');
        amounts = HebeswapV2Library.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'HebeswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(path[0], msg.sender, HebeswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWETC(WETC).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETC(to, amounts[amounts.length - 1]);
    }
    function swapETCForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[0] == WETC, 'HebeswapV2Router: INVALID_PATH');
        amounts = HebeswapV2Library.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= msg.value, 'HebeswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        IWETC(WETC).deposit{value: amounts[0]}();
        assert(IWETC(WETC).transfer(HebeswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
        if (msg.value > amounts[0]) TransferHelper.safeTransferETC(msg.sender, msg.value - amounts[0]); // refund dust etc, if any
    }

    function quote(uint amountA, uint reserveA, uint reserveB) public pure override returns (uint amountB) {
        return HebeswapV2Library.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure override returns (uint amountOut) {
        return HebeswapV2Library.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) public pure override returns (uint amountIn) {
        return HebeswapV2Library.getAmountOut(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint amountIn, address[] memory path) public view override returns (uint[] memory amounts) {
        return HebeswapV2Library.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint amountOut, address[] memory path) public view override returns (uint[] memory amounts) {
        return HebeswapV2Library.getAmountsIn(factory, amountOut, path);
    }
}
