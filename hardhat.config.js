/** @type import('hardhat/config').HardhatUserConfig */
require("hardhat-deploy")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-ethers")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("ethereum-waffle")
require("@nomiclabs/hardhat-waffle")

const GOERLI_URL = process.env.GOERLI_URL
const GOERLI_ACCOUNT = process.env.GOERLI_ACCOUNT
const ETHERSCAN_API = process.env.ETHERSCAN_API
const COINMARKETCAP_API = process.env.COINMARKETCAP_API

module.exports = {
    solidity: "0.8.7",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
        },
        goerli: {
            url: GOERLI_URL,
            accounts: [GOERLI_ACCOUNT],
            chainId: 5,
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "usd",
        //coinmarketcap: COINMARKETCAP_API,
    },
    mocha: {
        timeout: 500000, //500 seconds
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API,
        },
    },
}
