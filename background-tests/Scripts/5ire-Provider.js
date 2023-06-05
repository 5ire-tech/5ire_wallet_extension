"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FireProvider = void 0;
var _constants = require("./constants");
var _injectedHelper = require("./injected-helper");
var _safeEventEmitter = _interopRequireDefault(require("@metamask/safe-event-emitter"));
var _Constants = require("../Constants");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
Custom Web3 provider for interacting with the 5ire browser extension and pass to
5ire extension to handle the json-rpc request and send the response back
*/
class FireProvider extends _safeEventEmitter.default {
  constructor() {
    super();
    this.httpHost = "";
    this.selectedAddress = null;
    this.chainId = "";
    this.version = _Constants.VERSION;
    this.connected = false;

    //only max 10 listner is attached with particular event
    this.setMaxListeners(10);
  }
  connect() {
    return this.passReq("connect", null);
  }
  disconnect() {
    return this.passReq("disconnect", null);
  }

  //for sending some payload with json rpc request
  async send(method, payload) {
    return this.passReq(method, payload);
  }

  //passing callback for async operations
  sendAsync(payload, cb) {
    this.passReq(payload).then(res => cb(res, null)).catch(err => cb(null, err));
  }

  //requesting some data from chain
  async request(method, payload) {
    return await this.passReq(method, payload);
  }

  /*********************************** Native Signer Handlers **********************************/
  /**
   * for sign transaction payload
   * @param {object} payload
   */
  async signPayload(payload) {
    return await this.passReq(_Constants.SIGNER_METHODS.SIGN_PAYLOAD, payload);
  }

  /**
   * for sign raw transaction
   * @param {object} payload
   */
  async signRaw(payload) {
    return await this.passReq(_Constants.SIGNER_METHODS.SIGN_RAW, payload);
  }

  //for checking JSON-RPC headers
  async passReq(method, payload) {
    let id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (method === undefined && method.trim() === "") return Error("invalid method");

    //pass the request to extension
    const isObject = typeof method === "object" && method !== undefined;
    const res = await this.sendJsonRpc(isObject ? method.method : method, !payload && isObject ? method.params : payload, id);
    return res;
  }

  //pass request to extension for processing the jsonrpc request
  //if request is not related to connection and transaction processing
  //then it is processed in inject content script in current webpage
  sendJsonRpc(method) {
    let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let id = arguments.length > 2 ? arguments[2] : undefined;
    return new Promise(async (resolve, reject) => {
      try {
        if (_Constants.RESTRICTED_METHODS.indexOf(method) < 0 && this.httpHost) {
          const rawResponse = await fetch(this.httpHost, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method,
              params: message
            })
          });
          const content = await rawResponse.json();
          if (content.error) {
            return reject(content);
          } else {
            return resolve(content.result);
          }
        }
        if (method === "eth_requestAccounts" || method === "eth_accounts" || method === "connect" || method === "disconnect") message = {
          method
        };

        //get a unique if for specfic handler
        const requestId = id || (0, _constants.getId)();

        // save checking the request response
        const request = {
          reject,
          resolve,
          id: requestId,
          method
        };

        // for sending over the stream to extension background
        const requestForStream = {
          id: requestId,
          message,
          origin: _constants.INPAGE,
          method
        };

        //add the request to response helper
        _injectedHelper.InjectedScript.handleStreamToContent(request, requestForStream);
      } catch (err) {
        reject(err);
      }
    });
  }
}
exports.FireProvider = FireProvider;