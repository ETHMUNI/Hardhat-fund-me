// This is the last step before deploying to a main net
// Here we want to make sure that everythings works even with a price feed on a real testnet
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")
// let variable = true
// let someVar = variable ? "yes" : "no"

developmentChains.includes(network.name)
    ? describe.skip // this just means, "just skip the whole decribe test if.."
    : describe("FundMe Staging Tests", async function () {
          let deployer
          let fundMe
          // We don't need a mockV3aggregator because staging is assuming that we are on a testnet.
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
