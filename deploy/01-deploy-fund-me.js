// function deployFunc() { // <-
// console.log("hi")
//hre.getNamedAccounts()
// hre.deployments()
// }

// module.exports.defualt = deployFunc

// // module.exports = async (hre) => { // <- hre is hardhat runtime enviroment, whenever we run a deploy script, hardhat passes the function automatically into hardhat.
// //     const { getNamedAccounts, deployments } = hre
// }

const { networkConfig, developmentChain } = require("../helper-hardhat-config") // <- Here we just exports the file from "helper-hardhat-config.js" to this file.
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    // the "=>" means it is a nameless function
    const { deploy, log, get } = deployments // <- this means that we pulls out these 2 function from the deployment object.
    const { deployer } = await getNamedAccounts() // <- We are grabbing the deployer function from the getNamedAccounts function.
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] // this does that no mather what chain we are on, it is gonna use the chains that we configed in "helper-hardhat-config.js"
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        // This allow us to flip to a local dev chain
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] // // This allow us to flip to a testnet chain
    }

    log("-----------------------------------------------------------")
    // when going for localhost or hardhat network we want to use a mock.
    const args = [ethUsdPriceFeedAddress] // <- So that hardhat knows we args is ethUsdPriceFeedAddress
    const fundMe = await deploy("FundMe", {
        // <- here we make a list of overrides that we want to add in our contructor in "FundMe.sol"
        from: deployer, // <- Who is deploying this?
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, // <- if we have not specified how many block it should wait, then wait 1 block. The reason why we want to wait 6 blocks is we want to give etherscan a chance to index our transactions.
    })
    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // ! means "not". && means "and".
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"] // <- Does so that we can use --tags in our terminal and either run "all" or "mocks". So we can choose that we only would run our mocks contract or them all.
