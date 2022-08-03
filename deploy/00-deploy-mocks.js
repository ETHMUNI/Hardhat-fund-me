// this is what we are going in mocks:
// if the contract doesn't exist, we deploy a-
// minimal version for our local testing
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    // the "=>" means it is a nameless function
    const { deploy, log } = deployments // <- this means that we pulls out these 2 function from the deployment object.
    const { deployer } = await getNamedAccounts() // <- We are grabbing the deployer function from the getNamedAccounts function.
    const chainId = network.config.chainId

    if (chainId == 31337) {
        // <- This says, "if chainId 31337 is false then run..."
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("-----------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"] // <- Does so that we can use --tags in our terminal and either run "all" or "mocks". So we can choose that we only would run our mocks contract or them all.
