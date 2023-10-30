// SPDX-License-Identifier: BSL-1.1
pragma solidity ^0.8.0;

import "./libs/FullMath.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IUniswapV3Factory.sol";
import "./interfaces/IUniswapV3Pool.sol";
import "./interfaces/IUniswapV2Pair.sol";

import "hardhat/console.sol";

contract TokenPriceByRoute {

    struct Route {
        address uniPool;
        uint version;
    }

    function fetchMarket(
        address tokenBase,
        address tokenQuote,
        Route[] calldata routes
    ) public view returns (uint sqrtPriceX96) {
        uint price = 1 << 96;

        address token = tokenBase;

        for(uint i; i < routes.length; i++) {
            if(routes[i].version == 2) {
                (price, token) = _getTokenPriceV2(token, routes[i].uniPool);
                price = price >> 96;
            }
        }
    }

    function _getTokenPriceV2(address pool, address token) internal view returns (uint sqrtPriceX96, address nextToken) {
        (uint r0, uint r1,) = IUniswapV2Pair(pool).getReserves();
        address _token0 = IUniswapV2Pair(pool).token0();
        nextToken = IUniswapV2Pair(pool).token1();

        sqrtPriceX96 = _sqrtPriceX96(r0, r1);
        if (token != _token0) {
            sqrtPriceX96 = (1 << 192) / sqrtPriceX96;
            nextToken = _token0;
        }
    }

    function _getTokenPriceV3(address pool, address token, address otherToken) internal view returns (uint sqrtPriceX96) {
        (uint160 price,,,,,,) = IUniswapV3Pool(pool).slot0();

        sqrtPriceX96 = uint(price);
        if (token > otherToken) {
            sqrtPriceX96 = (1 << 192) / sqrtPriceX96;

        }
    }

    function _sqrtPriceX96(uint amount0, uint amount1) internal pure returns (uint) {
        return _sqrt((amount1 << 96) / amount0) << 48;
    }

    function _sqrt(uint x) internal pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
