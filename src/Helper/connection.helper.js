import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { HttpProvider, WsProvider } from "@polkadot/rpc-provider";
import { ERRCODES, HTTP_END_POINTS, INTERNAL_EVENT_LABELS } from "../Constants";
import { ExtensionEventHandle } from "../Scripts/initbackground";
import { ErrorPayload } from "../Utility/error_helper";

export class Connection {
  static nativeApi = {};
  static evmApi = {};
  static instance = null;

  //get only a single instance of class
  static getInsatnce() {
    if (!Connection.instance) Connection.instance = new Connection();
    delete Connection.constructor;
    return Connection.instance;
  }

  //initialize and get Api
  initializeApi = async (networkMode) => {
    try {
      //create the connection
      if (!Connection.nativeApi[networkMode])
        Connection.nativeApi[networkMode] = await this.createNativeConnection(
          HTTP_END_POINTS[networkMode.toUpperCase()]
        );
      if (!Connection.evmApi[networkMode])
        Connection.evmApi[networkMode] = this.createEvmConnection(
          HTTP_END_POINTS[networkMode.toUpperCase()]
        );

      return {
        nativeApi: Connection.nativeApi[networkMode],
        evmApi: Connection.evmApi[networkMode]
      };
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.FAILED_TO_CONNECT_NETWORK, err.message)
      );
      return { error: err };
    }
  };

  //create native connection
  createNativeConnection = async (networkEndpoint) => {
    let connection = null;

    //connection with native (Polkadot)
    if (networkEndpoint?.startsWith("ws")) {
      connection = await ApiPromise.create({
        provider: new WsProvider(networkEndpoint),
        noInitWarn: true
      });
    } else if (networkEndpoint?.startsWith("http")) {
      connection = await ApiPromise.create({
        provider: new HttpProvider(networkEndpoint),
        noInitWarn: true,
        throwOnConnect: true,
        throwOnUnknown: true
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
  };

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

    if (networkEndpoint?.startsWith("http")) {
      //Http connection Web3 (evm)
      web3Provider = new Web3.providers.HttpProvider(networkEndpoint, options);
    } else if (networkEndpoint?.startsWith("ws")) {
      //WebSocket connection Web3 (evm)
      web3Provider = new Web3.providers.WebsocketProvider(networkEndpoint, options);

      //bind event for failure for reconnect
      web3Provider.on("end", async () => {
        // console.log("Trying to reconnect with Evm api");
        web3Provider.connect();
      });
      web3Provider.on("error", async (err) => {
        console.log("error while making connection with evm: ", err);
        web3Provider.connect();
      });
    }

    const connection = new Web3(web3Provider);

    return connection;
  };
}
