const { Token } = require("@uniswap/sdk-core");
const { ethers, JsonRpcProvider } = require("ethers");

module.exports.PROVIDER = new JsonRpcProvider(
 "https://eth-goerli.g.alchemy.com/v2/mIZDoDhki34XOzZnu0uUl0JRZ1LD3MXz"
);

module.exports.SIGNER = new ethers.Wallet(
 "caa7ac47c09ca084a92b175857b647ba0deca5983f4904021105d3402f203a90",
 this.PROVIDER
);

module.exports.CHAIN_ID = 5;
module.exports.POOL_FEE = 3000;

module.exports.MAX_FEE_PER_GAS = "100000000000";
module.exports.MAX_PRIORITY_FEE_PER_GAS = "100000000000";

module.exports.ERC20_TOKEN_ADDRESS =
 "0xE6E7eFd7d5398bfa432a583785684c0Ef44B23Cc";
module.exports.ERC20_TOKEN = new Token(
 this.CHAIN_ID,
 this.ERC20_TOKEN_ADDRESS,
 18,
 "SERC",
 "Sample Token"
);
module.exports.ERC20_AMOUNT = 1000000000000000;

module.exports.WETH_TOKEN_ADDRESS =
 "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
module.exports.WETH_TOKEN = new Token(
 this.CHAIN_ID,
 this.WETH_TOKEN_ADDRESS,
 18,
 "WETH",
 "Wrapped Ether"
);
module.exports.WETH_AMOUNT = 100000000;

module.exports.UNISWAP_V3_FACTORY_CONTRACT_ADDRESS =
 "0x1F98431c8aD98523631AE4a59f267346ea31F984";
module.exports.NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS =
 "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
