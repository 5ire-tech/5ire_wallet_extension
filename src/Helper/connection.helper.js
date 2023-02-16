
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { HttpProvider, WsProvider } from "@polkadot/rpc-provider";

let i =0
export class Connection {

    //for testnet connection
    static nativeApiTestnet=null;
    static evmApiTestnet=null;

    //for qa connection
    static nativeApiQA=null;
    static evmApiQA=null;


    //previous endpoints
    static endPointTestnet = "";
    static endPointQA = "";

    //execution controlling
    static isExecuting = {value: false}
    static instanceConn = null;


    //get only a single instance of class
    static getConnector() {
        if(!Connection.instanceConn) Connection.instanceConn = new Connection();
        return Connection.instanceConn;
    }


    //initialize and get Api
    initializeApi = async (networkTest, networkQA, networkMode, bothInit=false) => {
        i++;
        console.log("call number: ", i, Connection.isExecuting.value);
        
        try {

            if(Connection.isExecuting.value) return {error: "Already in execution.", value: true}

            console.log("is first init: ", bothInit);

            Connection.isExecuting.value = true;
            //create the Testnet Connection
            if(networkMode === "Testnet" ||  bothInit) {
                if(!Connection.evmApiTestnet) Connection.evmApiTestnet = this.createEvmConnection(networkTest)
                if(!Connection.nativeApiTestnet) Connection.nativeApiTestnet = await this.createNativeConnection(networkTest)

                //set the execution true
                // Connection.isExecuting.value = true;
                Connection.endPointTestnet = networkTest;
            }


            //create qa connection
            if(networkMode === "QA" || bothInit) {
                if(!Connection.evmApiQA) Connection.evmApiQA = this.createEvmConnection(networkQA)
                if(!Connection.nativeApiQA) Connection.nativeApiQA = await this.createNativeConnection(networkQA)

                //set the execution true
                // Connection.isExecuting.value = true;
                Connection.endPointQA = networkQA;
            }


            if(networkMode === "QA") {
                return {
                    nativeApi: Connection.nativeApiQA,
                    evmApi: Connection.evmApiQA
                } 
            } else if(networkMode === "Testnet") {
                return {
                    nativeApi: Connection.nativeApiTestnet,
                    evmApi: Connection.evmApiTestnet
                } 
            }

            // if (!Connection.isExecuting.value || (!Connection.nativeApiTestnet || !Connection.evmApiTestnet)) {

            //     console.log("|| Connection Endpoint is here ||: ", networkTest);
                
            //     //set the endpoint current endpoint for further connection

            //     Connection.endPointQA = networkQA;
                
            //     return {
            //         nativeApi: Connection.nativeApi,
            //         evmApi: Connection.evmApi
            //     }
                
            // }
            // else {
            //     Connection.isExecuting.value = true;
            //     return {
            //         nativeApi: Connection.nativeApi,
            //         evmApi: Connection.evmApi
            //     }
            // }

        } catch (err) {
            console.log("Error while making connection with socket api's : ", err);
            return {error: err, value: true}
        }
    }

    //create native connection
    createNativeConnection = async (networkEndpoint) => {
        //connection with native (Polkadot)
        const connection = await ApiPromise.create({ provider: new WsProvider(networkEndpoint)});


        //bind events for failure and reconnection
        connection.on("disconnected", async () => {
            connection.connect();
        });
        connection.on("error", async (err) => {
            console.log("rror occued while making connection with native : ", err);
            connection.connect();
        });

        return connection;

    }

    //create evm connection
    createEvmConnection = (networkEndpoint) => {

                //connection with evm (web3)
                const web3Provider = new Web3.providers.WebsocketProvider(networkEndpoint, {
                            reconnect: {
                                auto: true,
                                delay: 5000, //ms
                                maxAttempts: 10,
                                onTimeout: false
                            }
                        });

                const connection = new Web3(web3Provider);


                //bind event for failure for reconnect
                web3Provider.on('end', async () => {
                console.log("Trying to reconnect with Evm api");
                web3Provider.connect();
                });
                web3Provider.on('error', async (e) => {
                        console.log("error occued while making connection with web3 : ", e);
                        web3Provider.connect();
                });

                return connection;

    }
}

export const connectionObj = new Connection.getConnector();