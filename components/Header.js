import { ConnectButton } from "web3uikit"
//moralisAuth={false} is just to be super explicit and say, I don't want to connect to the server

export default function Header() {
    return (
        <div className="p-5 border-b-2 flex flex-row items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">
                Decentralized Lottery
            </h1>
            <div className="ml-auto">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    )
}
