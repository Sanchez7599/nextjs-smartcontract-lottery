import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddress } from "../constants"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    //chainId from useMoralis gives a hex version of chainid
    //to get a number you do parseInt()
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const lotteryAddress =
        chainId in contractAddress ? contractAddress[chainId][0] : null
    //we can also save entranceFee as a simple let variable but then it wouldn't rerender when entranceFee is assigned
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    //dispatch is the pop-up that useNotification will give you
    //notifications come with diferrent states, such as onSuccess, onError...
    //and you can put them as a function input parametar
    const dispatch = useNotification()

    //runContractFunction can both, send transactions and read state
    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })

    //here you enable LotteryEntrance to call getEntranceFee function
    //you need this for msgValue: in enterLottery
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numOfPlayersFromCall = (await getNumOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numOfPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    //you need useEffect to call getEntranceFee function
    //getEntranceFee need to be an async function, but you can't use await in useEffect
    //so you need to make a new async function inside useEffect
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    //for onSuccess you will make handleSuccess function and save it as a const variale
    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "success",
            message: "Transaction Complete.",
            title: "Notification",
            position: "topR",
        })
    }

    return (
        <div className="p-5 ml-5">
            {/* You need to check if lottery address exists on the network that metamask is connected to
            if not, you obviously can't enter the lottery*/}
            {lotteryAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async function () {
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Lottery</div>
                        )}
                    </button>
                    <div>
                        Entrance fee is{" "}
                        {ethers.utils.formatUnits(entranceFee, "ether")} ETH.
                    </div>
                    <div>Number of players is {numPlayers}.</div>
                    <div>Recent winner is {recentWinner}.</div>
                </div>
            ) : (
                <div>No Lottery address detected!</div>
            )}
        </div>
    )
}
