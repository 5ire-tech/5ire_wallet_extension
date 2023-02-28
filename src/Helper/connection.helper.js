
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { HttpProvider, WsProvider } from "@polkadot/rpc-provider";

let i = 0
export class Connection {

    //for testnet connection
    static nativeApiTestnet = null;
    static evmApiTestnet = null;

    //for qa connection
    static nativeApiQA = null;
    static evmApiQA = null;


    //previous endpoints
    static endPointTestnet = "";
    static endPointQA = "";

    //execution controlling
    static isExecuting = { value: false }
    static instanceConn = null;


    //get only a single instance of class
    static getConnector() {
        if (!Connection.instanceConn) Connection.instanceConn = new Connection();
        return Connection.instanceConn;
    }


    //initialize and get Api
    initializeApi = async (networkTest, networkQA, networkMode, bothInit = false) => {
        i++;
        // console.log("call number: ", i, Connection.isExecuting.value);

        try {

            if (Connection.isExecuting.value) return { error: "Already in execution.", value: true }

            // console.log("is first init: ", bothInit);

            Connection.isExecuting.value = true;
            //create the Testnet Connection
            if (networkMode === "Testnet" || bothInit) {
                if (!Connection.nativeApiTestnet) Connection.nativeApiTestnet = await this.createNativeConnection(networkTest);
                if (!Connection.evmApiTestnet) Connection.evmApiTestnet = this.createEvmConnection(networkTest);

                //set the execution true
                // Connection.isExecuting.value = true;
                Connection.endPointTestnet = networkTest;
            }


            //create qa connection
            if (networkMode === "QA" || bothInit) {
                if (!Connection.nativeApiQA) Connection.nativeApiQA = await this.createNativeConnection(networkQA)
                if (!Connection.evmApiQA) Connection.evmApiQA = this.createEvmConnection(networkQA)

                //set the execution true
                // Connection.isExecuting.value = true;
                Connection.endPointQA = networkQA;
            }


            if (networkMode === "QA") {
                // this.changeExecution();
                return {
                    nativeApi: Connection.nativeApiQA,
                    evmApi: Connection.evmApiQA
                }
            } else if (networkMode === "Testnet") {
                // this.changeExecution();
                return {
                    nativeApi: Connection.nativeApiTestnet,
                    evmApi: Connection.evmApiTestnet
                }
            }

        } catch (err) {
            console.log("Error while making connection with socket api's : ", err);
            return { error: err, value: true }
        }
    }

    //create native connection
    createNativeConnection = async (networkEndpoint) => {
        let connection;

        //connection with native (Polkadot)
        if (networkEndpoint.startsWith("ws")) {
            connection = await ApiPromise.create({ provider: new WsProvider(networkEndpoint),
                noInitWarn: true
            });
        }
        else if (networkEndpoint.startsWith("http")) {
            connection = await ApiPromise.create({ provider: new HttpProvider(networkEndpoint),
            noInitWarn: true
            });
        }

        //bind events for failure and reconnection
        connection.on("disconnected", async () => {
            connection.connect();
        });
        connection.on("error", async (err) => {
            console.log("error occued while making connection with native : ", err);
            connection.connect();
        });

        return connection;

    }

    //create evm connection
    createEvmConnection = (networkEndpoint) => {

        let web3Provider;
        let options = {
            reconnect: {
                auto: true,
                delay: 5000, //ms
                maxAttempts: 10,
                onTimeout: false
            }
        };

        if (networkEndpoint.startsWith("http")) {
            //Http connection Web3 (evm)
            web3Provider = new Web3.providers.HttpProvider(networkEndpoint, options);

        } else if (networkEndpoint.startsWith("ws")) {
            //WebSocket connection Web3 (evm)
            web3Provider = new Web3.providers.WebsocketProvider(networkEndpoint, options);

            //bind event for failure for reconnect
            web3Provider.on('end', async () => {
                // console.log("Trying to reconnect with Evm api");
                web3Provider.connect();
            });
            web3Provider.on('error', async (err) => {
                // console.log("error while making connection with evm: ", err);
                web3Provider.connect();
            });
        }


        const connection = new Web3(web3Provider);

        return connection;

    }
}

export const connectionObj = Connection.getConnector();