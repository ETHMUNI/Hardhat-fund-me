const { run } = require("hardhat") // We do this because we use "run" in our function

const verify = async (contractAddress, args) => {
    // we don't want to use the verify function when we are deploying to a local network.
    console.log("Verifying contract..")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        // <- The "e" means that it's gonna catch any error that this verify function gets.
        if (e.message.toLowerCase().includes("Already verified")) {
            // <- "If this message is already verified then we're just going to continue".
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify } // <- so we can use this file in our 01 deploy contract
