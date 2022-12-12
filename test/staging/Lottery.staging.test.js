const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const {
    developmentNetworks,
    networkConfig,
} = require("../../helper-hardhat-config")

developmentNetworks.includes(network.name)
    ? describe.skip
    : describe("Lottery Staging test", function () {
          let lottery, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              lottery = await ethers.getContract("Lottery", deployer)
          })
          it("works with live Chainlink Keepers and VRFCoordinator, gives a random winner", async function () {
              const startingTimeStamp = await lottery.getLatestTimeStamp()
              const accounts = await ethers.getSigners()

              await new Promise(async (resolve, reject) => {
                  lottery.once("WinnerPicked", async () => {
                      console.log("WinnerPicked event is fired!")
                      try {
                          const recentWinner = await lottery.getRecentWinner()
                          const lotteryState = await lottery.getLotteryState()
                          const winnerEndingBalance =
                              await accounts[0].getBalance()
                          const endingTimeStamp =
                              await lottery.getLatestTimeStamp()

                          await expect(lottery.getPlayer(0)).to.be.reverted
                          assert.equal(
                              recentWinner.toString(),
                              accounts[0].address.toString()
                          )
                          assert.equal(lotteryState.toString(), "0")
                          assert.equal(
                              winnerEndingBalance.toString(),
                              winnerStartingBalance
                                  .add(ethers.utils.parseEther("0.03"))
                                  .toString()
                          )
                          assert(
                              startingTimeStamp.toString() <
                                  endingTimeStamp.toString()
                          )
                          resolve()
                      } catch (error) {
                          reject(error)
                      }
                  })
                  const tx = await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.03"),
                  })
                  await tx.wait(1)
                  const winnerStartingBalance = await accounts[0].getBalance()
              })
          })
      })
