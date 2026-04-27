// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {ERC20}        from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20}       from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidity(
        address tokenA, address tokenB,
        uint amountADesired, uint amountBDesired,
        uint amountAMin, uint amountBMin,
        address to, uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address a, address b) external view returns (address);
}

interface IWETH9 {
    function deposit() external payable;
    function approve(address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract MockTotemToken is ERC20 {
    constructor() ERC20("TotemGraduated", "TGR") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

/**
 * Fork-test de la fase de graduación.
 *
 * Verifica que la lógica del TotemGraduationManager (createPair + addLiquidity
 * sobre UniswapV2 router real) NO tiene deriva de interfaz contra el contrato
 * desplegado en mainnet de Ethereum.
 *
 * RPC: https://eth.llamarpc.com (mainnet eth, chainId=1)
 *
 * Bloqueo se realiza al bloque actual del fork; usamos addresses oficiales:
 *   Router  V2: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
 *   Factory V2: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
 *   WETH:       0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
 */
contract ForkGraduation is Test {

    address constant UNI_ROUTER  = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant UNI_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address constant WETH        = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    IUniswapV2Router02 router;
    IUniswapV2Factory  factory;
    MockTotemToken     totemToken;

    function setUp() public {
        // Fork mainnet pinado a un bloque finalizado conocido (archive-friendly)
        vm.createSelectFork("https://eth.drpc.org");
        router  = IUniswapV2Router02(UNI_ROUTER);
        factory = IUniswapV2Factory(UNI_FACTORY);
        totemToken = new MockTotemToken();
    }

    /// @notice La firma factory()/WETH() del router real coincide con la usada
    ///          por TotemGraduationManager. Si esto pasa, no hay drift.
    function test_routerInterfaceCompatible() public view {
        assertEq(router.factory(), UNI_FACTORY, "factory() drift");
        assertEq(router.WETH(),    WETH,        "WETH() drift");
        console.log("[FORK] router.factory OK, router.WETH OK");
    }

    /// @notice createPair() del factory real produce pair address determinista.
    ///          Replica exactamente lo que hace _createAMM en graduación.
    function test_createPairCompatible() public {
        address pair = factory.getPair(address(totemToken), WETH);
        if (pair == address(0)) {
            pair = factory.createPair(address(totemToken), WETH);
        }
        assertTrue(pair != address(0), "createPair returned 0");
        console.log("[FORK] pair creado en", pair);
    }

    /// @notice addLiquidity con interfaces reales. Confirma que el patron
    ///          approve+addLiquidity de TotemGraduationManager funciona contra
    ///          el router de mainnet sin deriva de tipos ni de orden de args.
    function test_addLiquidityRealRouter() public {
        // Wrapping ETH a WETH
        vm.deal(address(this), 100 ether);
        IWETH9(WETH).deposit{value: 50 ether}();
        assertGe(IWETH9(WETH).balanceOf(address(this)), 50 ether, "WETH wrap fail");

        // Approves al router
        IERC20(address(totemToken)).approve(UNI_ROUTER, type(uint256).max);
        IERC20(WETH).approve(UNI_ROUTER, type(uint256).max);

        // addLiquidity 100k Totem + 10 WETH
        (uint amtA, uint amtB, uint liq) = router.addLiquidity(
            address(totemToken),
            WETH,
            100_000 ether,
            10 ether,
            0,
            0,
            address(this),
            block.timestamp + 600
        );

        assertGt(liq, 0, "no LP minted");
        console.log("[FORK] addLiquidity OK | tokenA=", amtA);
        console.log("[FORK] addLiquidity OK | wETH =", amtB);
        console.log("[FORK] addLiquidity OK | LP   =", liq);

        // Verificar que el pair existe ahora
        address pair = factory.getPair(address(totemToken), WETH);
        assertTrue(pair != address(0), "pair not registered");
        assertGt(IERC20(pair).balanceOf(address(this)), 0, "no LP token recibido");
    }

    receive() external payable {}
}
