const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

developmentChains.includes(network.name)
    ? describe.skip // this just means, "just skip the whole decribe test if.."
    : describe("FundMe", async function () {
          let fundMe
          let deployer

          // We don't need a mockV3aggregator because staging is assuming that we are on a testnet.
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
      })

describe("FundMe", function () {
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = ethers.utils.parseEther("1") //  Here it could have 1 with 18 zeros behind it but "parseEther" helps us with dealing with big numbers. // 1 eth
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // fixture does so we can deploy our deploy folder with as many tags as we want.
        // Whenever we call a function with FundMe, it will auto befrom the deployer account.
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            // getContract is going to get the most recent deployment of whatever contract we tell it. In our case, it give us our most recent FundMe contract.
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if you dont send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("updated the amount funded data structure", async function () {
            // this tests if our data structure is being updated.
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_addressToAmountFunded(deployer) // Remember this is a mapping of each address and how much the actually funded.
            assert.equal(response.toString(), sendValue.toString()) // This is our big number in eth(?) and it should be the same as sendValue. So sendValue = 1 eth and response is 1000000000000000000.
        })
        it("adds funder to array of s_funders", async function () {
            // this tests if the money is coming through
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.s_funders(0) // we want to start 0 in the array because we 0 is always first. then first is second and so on.
            assert.equal(funder, deployer) // this means funder should be the same as deployer.
        })
    })
    describe("withdraw", function () {
        // We tests that only myself can withdraw and reset all of the amount funded.
        beforeEach(async function () {
            // "before we start any tests the contract should be funded"
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            ) // This gets the starting balance of our contract.
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            ) // This gets the starting balance of the deployer. The reason why we do startingBalance is because we want to compare it to our endingBalance.
            // Act
            // gasCost
            const transactionResponse = await fundMe.cheaperWithdraw() // this call the withdraw function
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt // We can get our gas cost in our transactionReceipt. "gasUsed = effectiveGasPrice". With the {}syntax we can pull out an object with another object.
            const gasCost = gasUsed.mul(effectiveGasPrice) // mul() is the same multiply gasUsed and gasPrice together. We do this becuase it's a bigNumber.
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            ) // startingFundMeBalance + startingDeployerBalance = endingDeployerBalance. add() is the same as +
        })

        it("Withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            ) // This gets the starting balance of our contract.
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            ) // This gets the starting balance of the deployer. The reason why we do startingBalance is because we want to compare it to our endingBalance.
            // Act
            // gasCost
            const transactionResponse = await fundMe.withdraw() // this call the withdraw function
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt // We can get our gas cost in our transactionReceipt. "gasUsed = effectiveGasPrice". With the {}syntax we can pull out an object with another object.
            const gasCost = gasUsed.mul(effectiveGasPrice) // mul() is the same multiply gasUsed and gasPrice together. We do this becuase it's a bigNumber.
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            ) // startingFundMeBalance + startingDeployerBalance = endingDeployerBalance. add() is the same as +
        })
        it("cheaperWithdraw testing..", async function () {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                // This is a for loop. We are starting at index = 1, because 0 is the deployer(us)
                const fundMeConnectedContract = await fundMe.connect(
                    // in our code long above, our fundMe contract is connected to our deployer account. We need to create new objects that connects to different accounts
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            ) // This gets the starting balance of our contract.
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act + gasCost
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt // We can get our gas cost in our transactionReceipt. "gasUsed = effectiveGasPrice". With the {}syntax we can pull out an object with another object.
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            ) // startingFundMeBalance + startingDeployerBalance = endingDeployerBalance. add() is the same as +
            // Make sure that the funder are reset properly
            await expect(fundMe.s_funders(0)).to.be.reverted

            // we want to make sure that all these mappings are 0
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1] // attacker = accounts that isnt the deployer.
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner") // when some other account call withdraw it automatically get reverted.
        })
        it("allows us to withdraw with multiple s_funders", async function () {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                // This is a for loop. We are starting at index = 1, because 0 is the deployer(us)
                const fundMeConnectedContract = await fundMe.connect(
                    // in our code long above, our fundMe contract is connected to our deployer account. We need to create new objects that connects to different accounts
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            ) // This gets the starting balance of our contract.
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act + gasCost
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt // We can get our gas cost in our transactionReceipt. "gasUsed = effectiveGasPrice". With the {}syntax we can pull out an object with another object.
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            ) // startingFundMeBalance + startingDeployerBalance = endingDeployerBalance. add() is the same as +
            // Make sure that the funder are reset properly
            await expect(fundMe.s_funders(0)).to.be.reverted

            // we want to make sure that all these mappings are 0
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
    })
})
