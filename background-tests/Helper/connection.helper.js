"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Connection = void 0;
var _web = _interopRequireDefault(require("web3"));
var _api = require("@polkadot/api");
var _rpcProvider = require("@polkadot/rpc-provider");
var _Constants = require("../Constants");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class Connection {
  constructor() {
    //initialize and get Api
    _defineProperty(this, "initializeApi", async networkMode => {
      try {
        //create the connection
        if (!Connection.nativeApi[networkMode]) Connection.nativeApi[networkMode] = await this.createNativeConnection(_Constants.HTTP_END_POINTS[networkMode.toUpperCase()]);
        if (!Connection.evmApi[networkMode]) Connection.evmApi[networkMode] = this.createEvmConnection(_Constants.HTTP_END_POINTS[networkMode.toUpperCase()]);
        return {
          nativeApi: Connection.nativeApi[networkMode],
          evmApi: Connection.evmApi[networkMode]
        };
      } catch (err) {
        return {
          error: err
        };
      }
    });
    //create native connection
    _defineProperty(this, "createNativeConnection", async networkEndpoint => {
      let connection = null;

      //connection with native (Polkadot)
      if (networkEndpoint !== null && networkEndpoint !== void 0 && networkEndpoint.startsWith("ws")) {
        connection = await _api.ApiPromise.create({
          provider: new _rpcProvider.WsProvider(networkEndpoint),
          noInitWarn: true
        });
      } else if (networkEndpoint !== null && networkEndpoint !== void 0 && networkEndpoint.startsWith("http")) {
        connection = await _api.ApiPromise.create({
          provider: new _rpcProvider.HttpProvider(networkEndpoint),
          noInitWarn: true,
          throwOnConnect: true,
          throwOnUnknown: true
        });
      }

      //bind events for failure and reconnection
      connection.on("disconnected", async () => {
        connection.connect();
      });
      connection.on("error", async err => {
        console.log("error occued while making connection with native : ", err);
        connection.connect();
      });
      return connection;
    });
    //create evm connection
    _defineProperty(this, "createEvmConnection", networkEndpoint => {
      let web3Provider;
      let options = {
        reconnect: {
          auto: true,
          delay: 5000,
          //ms
          maxAttempts: 10,
          onTimeout: false
        }
      };
      if (networkEndpoint !== null && networkEndpoint !== void 0 && networkEndpoint.startsWith("http")) {
        //Http connection Web3 (evm)
        web3Provider = new _web.default.providers.HttpProvider(networkEndpoint, options);
      } else if (networkEndpoint !== null && networkEndpoint !== void 0 && networkEndpoint.startsWith("ws")) {
        //WebSocket connection Web3 (evm)
        web3Provider = new _web.default.providers.WebsocketProvider(networkEndpoint, options);

        //bind event for failure for reconnect
        web3Provider.on("end", async () => {
          web3Provider.connect();
        });
        web3Provider.on("error", async err => {
          console.log("error while making connection with evm: ", err);
          web3Provider.connect();
        });
      }
      const connection = new _web.default(web3Provider);
      return connection;
    });
  }
  //get only a single instance of class
  static getInsatnce() {
    if (!Connection.instance) Connection.instance = new Connection();
    delete Connection.constructor;
    return Connection.instance;
  }
}
exports.Connection = Connection;
_defineProperty(Connection, "nativeApi", {});
_defineProperty(Connection, "evmApi", {});
_defineProperty(Connection, "instance", null);