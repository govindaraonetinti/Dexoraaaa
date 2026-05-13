// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@pancakeswap/pancake-swap-periphery/contracts/examples/oracles/ExampleOracleSimple.sol";

// This contract needs to be deployed per token pair
contract TokenPriceOracle {
    ExampleOracleSimple public oracle;
    address public token;
    address public stablecoin; // e.g., BUSD or USDT
    
    constructor(address _token, address _stablecoin, address _pair) {
        token = _token;
        stablecoin = _stablecoin;
        
        // Deploy or reference existing oracle for this pair
        oracle = new ExampleOracleSimple(_pair);
    }
    
    // Get token price in stablecoin (e.g., 1 token = X stablecoin)
    function getTokenPrice() external view returns (uint256) {
        // Consult oracle: amount of token (1e18) in stablecoin terms
        return oracle.consult(token, 1 ether);
    }
    
    // Need to call update() regularly (e.g., every 24 hours)
    function updateOracle() external {
        oracle.update();
    }
}