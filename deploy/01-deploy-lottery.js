const { network, ethers } = require("hardhat")
const {
    developmentNetworks,
    networkConfig,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const SUB_ID_VALUE = ethers.utils.parseEther("3")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { log, get, deploy } = deployments
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId

    if (developmentNetworks.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        // createSunbscription function comes from VRFCoordinatorV2Mock
        // it also emits an event with subscriptionId and msg.sender
        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        //to fund the subscription  we just use fundSubscription function
        //it doesn't require real test link on a local network
        await vrfCoordinatorV2Mock.fundSubscription(
            subscriptionId,
            SUB_ID_VALUE
        )
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    log("Deploying lottery...")
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("Deployed!")
    log("________________________________________________________________")

    if (
        !developmentNetworks.includes(network.name) &&
        process.env.ETHERSCAN_API
    ) {
        await verify(lottery.address, args)
    }
    log("________________________________________________________________")
}

module.exports.tags = ["all", "lottery"]
