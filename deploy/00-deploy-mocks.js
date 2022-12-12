const { developmentNetworks } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")

//"base fee" refers to Premium fee in chainlink docs
// it is a price for reqesting random number (0.25 LINK)
const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9 //link per gas

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentNetworks.includes(network.name)) {
        log("Local network detected. Deploying Mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            //VRFCoordinatorV2Mock takes two params in the constructor (_baseFee, _gasPriceLink)
            args: args,
        })
        log("Mocks deployed!")
        log(
            "_____________________________________________________________________________________"
        )
    }
}

module.exports.tags = ["all", "mocks"]
