const { ethers, MaxUint256 } = require("ethers");
const { CurrencyAmount, Percent } = require("@uniswap/sdk-core");
const {
 computePoolAddress,
 Pool,
 Position,
 NonfungiblePositionManager,
 nearestUsableTick,
} = require("@uniswap/v3-sdk");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const {
 NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
 POOL_FEE,
 WETH_TOKEN,
 ERC20_AMOUNT,
 WETH_AMOUNT,
 SIGNER,
 ERC20_TOKEN,
 UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
 MAX_FEE_PER_GAS,
 MAX_PRIORITY_FEE_PER_GAS,
} = require("./constants");

/*

*/
const getTokenTransferApproval = async (token) => {
 const tokenContract = new ethers.Contract(
  token.address,
  ["function approve(address spender, uint256 amount) public returns (bool)"],
  SIGNER
 );
 const tokenApproveTx = await tokenContract.approve(
  NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
  MaxUint256
 );
 await tokenApproveTx.wait();
 console.log("TokenApproveTx Hash", tokenApproveTx.hash);
};

const getPoolInfo = async () => {
 const currentPoolAddress = computePoolAddress({
  factoryAddress: UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
  tokenA: ERC20_TOKEN,
  tokenB: WETH_TOKEN,
  fee: POOL_FEE,
 });

 const poolContract = new ethers.Contract(
  currentPoolAddress,
  IUniswapV3PoolABI.abi,
  SIGNER
 );

 const [token0, token1, fee, tickSpacing, liquidity, slot0] = await Promise.all(
  [
   poolContract.token0(),
   poolContract.token1(),
   poolContract.fee(),
   poolContract.tickSpacing(),
   poolContract.liquidity(),
   poolContract.slot0(),
  ]
 );

 return {
  token0,
  token1,
  fee,
  tickSpacing,
  liquidity,
  sqrtPriceX96: slot0[0],
  tick: slot0[1],
 };
};

const constructPosition = async (token0Amount, token1Amount) => {
 const poolInfo = await getPoolInfo();

 poolInfo.fee = Number(poolInfo.fee);
 poolInfo.tick = Number(poolInfo.tick);
 poolInfo.tickSpacing = Number(poolInfo.tickSpacing);

 const configuredPool = new Pool(
  token0Amount.currency,
  token1Amount.currency,
  poolInfo.fee,
  poolInfo.sqrtPriceX96.toString(),
  poolInfo.liquidity.toString(),
  poolInfo.tick
 );

 return Position.fromAmounts({
  pool: configuredPool,
  tickLower:
   nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) -
   poolInfo.tickSpacing * 2,
  tickUpper:
   nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) +
   poolInfo.tickSpacing * 2,
  amount0: token0Amount.quotient,
  amount1: token1Amount.quotient,
  useFullPrecision: true,
 });
};

const mintPosition = async () => {
 // await getTokenTransferApproval(ERC20_TOKEN);
 // await getTokenTransferApproval(WETH_TOKEN);

 const positionToMint = await constructPosition(
  CurrencyAmount.fromRawAmount(ERC20_TOKEN, ERC20_AMOUNT),
  CurrencyAmount.fromRawAmount(WETH_TOKEN, WETH_AMOUNT)
 );

 const mintOptions = {
  recipient: SIGNER.address,
  deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  slippageTolerance: new Percent(50, 10_000),
 };

 const { calldata, value } = NonfungiblePositionManager.addCallParameters(
  positionToMint,
  mintOptions
 );

 const transaction = {
  data: calldata,
  to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
  value: value,
  from: SIGNER.address,
  maxFeePerGas: MAX_FEE_PER_GAS,
  maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
 };

 const tx = await SIGNER.sendTransaction(transaction);
 await tx.wait();

 console.log("MintPositionTx Hash", tx.hash);
};

mintPosition();
