
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { HttpProvider, WsProvider } from "@polkadot/rpc-provider";


// let evmApi = null;
// let nativeApi = null;

// export const initializeApi = async (network) => {
//     try {
//         evmApi = null;
//         nativeApi = null;

//         let provider = new WsProvider(network);
//         nativeApi = await ApiPromise.create({ provider: provider });
//         console.log("native Api : ", nativeApi);

//         let w3options = {
//             reconnect: {
//                 auto: true,
//                 delay: 5000, //ms
//                 maxAttempts: 10,
//                 onTimeout: false
//             }
//         };
//         let web3Provider = new Web3.providers.WebsocketProvider(network, w3options);
//         evmApi = new Web3(web3Provider);

//         console.log("Evm Api : ", nativeApi);

//         web3Provider.on('end', async () => {
//             console.log("Trying to reconnect with Evm api");
//             web3Provider.connect();
//         });
//         web3Provider.on('error', async (e) => {
//             console.log("error occued while making connection with web3 : ", e);
//             web3Provider.connect();
//         });

//         nativeApi.on("disconnected", async () => {
//             nativeApi.connect();
//         });
//         nativeApi.on("error", async (e) => {
//             console.log("rror occued while making connection with native : ", e);
//             nativeApi.connect();
//         });

//         if (nativeApi && evmApi) {
//             return {
//                 error: false,
//                 data: "Connection Successfull."
//             }
//         }

//         console.log("evmApi : ", evmApi);
//     } catch (error) {
//         console.log("Error while making connection with socket api's : ", error);
//         return {
//             error: true,
//             data: "Error while making connection!"
//         }
//     }
// }



// export { evmApi as evm_api, nativeApi as native_api }; 



class Connection {
    static nativeApi;
    static evmApi;
    static endPoint = "";

    initializeApi = async (network, isNative = false) => {

        try {
            console.log("Connection.endpoint : ", Connection.endPoint,"&&  network : ", network);
        
            if (Connection.endpoint !== network || (!Connection.nativeApi && !Connection.evmApi)) {
                Connection.nativeApi = null;
                Connection.evmApi = null;
                Connection.endPoint = network;

                //connection with native (Polkadot)
                let provider = new WsProvider(network);
                Connection.nativeApi = await ApiPromise.create({ provider: provider });
                
                //connection with evm (web3)
                let web3Provider = new Web3.providers.WebsocketProvider(network, {
                    reconnect: {
                        auto: true,
                        delay: 5000, //ms
                        maxAttempts: 10,
                        onTimeout: false
                    }
                });
                Connection.evmApi = new Web3(web3Provider);

                console.log("Evm Api : ", Connection.evmApi);
                console.log("native Api : ", Connection.nativeApi);


                //Listning Events for web3 provider and nativeApi(Polkaot api)
                web3Provider.on('end', async () => {
                    console.log("Trying to reconnect with Evm api");
                    web3Provider.connect();
                });
                web3Provider.on('error', async (e) => {
                    console.log("error occued while making connection with web3 : ", e);
                    web3Provider.connect();
                });
                Connection.nativeApi.on("disconnected", async () => {
                    Connection.nativeApi.connect();
                });
                Connection.nativeApi.on("error", async (e) => {
                    console.log("rror occued while making connection with native : ", e);
                    Connection.nativeApi.connect();
                });

                return {
                    nativeApi: Connection.nativeApi,
                    evmApi: Connection.evmApi
                }
            }
            else {
                return {
                    nativeApi: Connection.nativeApi,
                    evmApi: Connection.evmApi
                }
            }

        } catch (error) {
            console.log("Error while making connection with socket api's : ", error);
        }

    }
}

export const connectionObj = new Connection();