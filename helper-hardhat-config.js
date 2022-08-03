// if chainId is X use address Y

const networkConfig = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
    137: {
        name: "Polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    // 31337
}

const developmentChain = ["hardhat", "localhost"]
// this is our priceFeed.
const DECIMALS = 8 // We use 8 because in the "mockv3aggregator.sol" have imported a contract that uses uint8.
const INITIAL_ANSWER = 200000000000

module.exports = {
    // <- this does so we can use the file in another file.
    networkConfig,
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
}
