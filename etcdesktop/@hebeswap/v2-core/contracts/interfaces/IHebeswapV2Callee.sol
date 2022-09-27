pragma solidity >=0.5.0;

interface IHebeswapV2Callee {
    function hebeswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external;
}
