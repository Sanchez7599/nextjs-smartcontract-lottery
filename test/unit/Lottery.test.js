const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const {
    developmentNetworks,
    networkConfig,
} = require("../../helper-hardhat-config")

!developmentNetworks.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit testing", function () {
          let lottery, vrfCoordinatorV2Mock, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              lottery = await ethers.getContract("Lottery", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer
              )
              interval = await lottery.getInterval()
          })

          describe("Constructor", function () {
              it("initializes lottery correcly", async function () {
                  const lotteryState = await lottery.getLotteryState()
                  //checking if the state of lottery is OPEN
                  assert.equal(lotteryState.toString(), "0")
                  assert.equal(
                      interval.toString(),
                      networkConfig[chainId]["interval"]
                  )
              })
          })
          describe("enterRaffle", function () {
              it("reverts if you don't pay enough", async function () {
                  await expect(lottery.enterLottery()).to.be.revertedWith(
                      "Lottery__NotEnoughEth"
                  )
              })
              it("saves player into array", async function () {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  const playerAdded = await lottery.getPlayer(0)
                  assert.equal(playerAdded, deployer)
              })
              it("emits an event", async function () {
                  //to.emit() taket contract name and the event that should be emited
                  await expect(
                      lottery.enterLottery({
                          value: ethers.utils.parseEther("0.15"),
                      })
                  ).to.emit(lottery, "LotteryEnter")
              })
              it("should revert if lottery state is not OPEN", async function () {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  //.send(evm_increaseTime or evm_mine) are hardhat built in functions
                  //they require the function name and arguments
                  //and we do this to be able to call performUpkeep to get lottery status calculating
                  //we need to increase time and to mine one block in order for this to work
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])
                  //now we entered the lottery
                  //we have a player, balance, it's open and time has passed
                  //we can call performUpkeep
                  //we put empty args for that bytes calldata thing
                  await lottery.performUpkeep([])
                  await expect(
                      lottery.enterLottery({
                          value: ethers.utils.parseEther("0.15"),
                      })
                  ).to.be.revertedWith("Lottery__NotOpen")
              })
          })
          describe("checkUpkeep", function () {
              it("returns false if balance is 0", async function () {
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])
                  // this is a method to simulate transaction and see how will it respond
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep(
                      []
                  )
                  assert(!upkeepNeeded)
              })
              it("returns false if state is not open", async function () {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])
                  //another way to send a blank bytes object is to type "0x"
                  await lottery.performUpkeep("0x")
                  const lotteryState = await lottery.getLotteryState()
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep(
                      []
                  )
                  assert.equal(lotteryState.toString(), "1")
                  assert.equal(upkeepNeeded, false)
              })
              it("returns false if enough time hasn't passed", async () => {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() - 5,
                  ]) // use a higher number here if this test fails
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep(
                      "0x"
                  ) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep(
                      "0x"
                  ) // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded)
              })
          })
          describe("performUpkeep", function () {
              it("can only run if checkUpkeep is true", async function () {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])
                  const tx = await lottery.performUpkeep("0x")
                  assert(tx)
              })
              it("should revert if checkUpkeep is not true", async function () {
                  await expect(lottery.performUpkeep([])).to.be.revertedWith(
                      "Lottery__UpkeepNotNeeded"
                  )
              })
              it("updates state, emits an event, call the vrfCoordinator", async function () {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await lottery.performUpkeep([])
                  const txReceipt = await txResponse.wait(1)
                  //requestRandomWords emits an event by default and it has requestId
                  //so our event WinnerRequest is not needed, but this is just practice
                  //basicly, our txReceipt will have this requestId
                  //we can pull it eather from requestRandomWords or WinnerRequest
                  //meaning performUpkeep fires two events
                  //requestRandomWords(0) and WinnerRequest(1)
                  const requestId = txReceipt.events[1].args.requestId
                  const lotteryState = await lottery.getLotteryState()
                  assert(requestId.toNumber() > 0)
                  assert(lotteryState.toString() == "1")
              })
          })
          describe("fulfillRandomWords", function () {
              beforeEach(async function () {
                  await lottery.enterLottery({
                      value: ethers.utils.parseEther("0.15"),
                  })
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ])
                  await network.provider.send("evm_mine", [])
              })
              it("can be called only after performUpkeep", async function () {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(
                          0,
                          lottery.address
                      )
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(
                          1,
                          lottery.address
                      )
                  ).to.be.revertedWith("nonexistent request")
              })
              it("picks a winner, resets the lottery, sends the money", async function () {
                  //we are connecting three new accounts and entering the lottery
                  const additionalEntrances = 3
                  const startingIndex = 1
                  const accounts = await ethers.getSigners()
                  for (
                      let i = startingIndex;
                      i < startingIndex + additionalEntrances;
                      i++
                  ) {
                      const accountsConnected = await lottery.connect(
                          accounts[i]
                      )
                      await accountsConnected.enterLottery({
                          value: ethers.utils.parseEther("0.15"),
                      })
                  }
                  const startingTimeStamp = await lottery.getLatestTimeStamp()
                  //we want to simulate waiting for event WinnerPicked to be emited
                  //all the code must be inside of a Promise because it's waiting for WinnerPicked
                  //if function fulfillRandomWords is outside of a Promise, Promise will never see WinnerPicked and it can't be resolved
                  //timeout is set in hardhat config to 200 seconds
                  await new Promise(async (resolve, reject) => {
                      lottery.once("WinnerPicked", async () => {
                          try {
                              const recentWinner =
                                  await lottery.getRecentWinner()
                              const lotteryState =
                                  await lottery.getLotteryState()
                              const endingTimeStamp =
                                  await lottery.getLatestTimeStamp()
                              const numOfPlayers =
                                  await lottery.getNumOfPlayers()
                              assert.equal(numOfPlayers.toString(), "0")
                              assert.equal(lotteryState.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)
                          } catch (e) {
                              reject(e)
                          }
                          resolve()
                      })
                      const tx = await lottery.performUpkeep([])
                      const txReceipt = await tx.wait(1)
                      //extract requestId event that is emited by performUpkeep
                      //vrfMock takes requestId and consumer address
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          lottery.address
                      )
                  })
              })
          })
      })
