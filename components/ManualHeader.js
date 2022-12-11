import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    /*useMoralis is a hook that enables web page to rerender depending on current state
    for this app, it's going to recognize if I am connected to the wallet or not
    depending on that, the page is going to look different
    enableWeb3() is a function that will anble that */

    /*useEffect is a hook that takes a function as a first parametar and 
    dependancy array as a second.
    and if anything in dependacy array changes, it calls a function and rerender
    isWeb3Enabled is a boolian
    you can also set useEffect without dependecy array and it will auto run every time something rerenders
    or you can set it as blank array and it will rerender only once
    */

    const {
        enableWeb3,
        account,
        isWeb3Enabled,
        Moralis,
        deactivateWeb3,
        isWeb3EnableLoading,
    } = useMoralis()

    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    }, [])

    return (
        <div>
            {/* in raw html (fundMe frontend project), you couldn't write javaScript instide html 
            so defining button functionality was done in a separete .js file
            in React you can do javaScript inside html
            */}
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...
                    {account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        //this "if" line is needed because some versions of nextjs has a hard time finding window variable
                        if (typeof window !== "undefined")
                            window.localStorage.setItem("connected", "injected")
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
