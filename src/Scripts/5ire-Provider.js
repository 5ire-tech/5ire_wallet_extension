import { CONTENT_SCRIPT, INPAGE, getId } from "./constants";
import { WindowPostMessageStream } from "./stream";
import SafeEventEmitter from "@metamask/safe-event-emitter"
import { HTTP_END_POINTS, SIGNER_METHODS } from "../Constants";
//stream for in-window communication
const injectedStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
});

/*
Custom Web3 provider for interacting with the 5ire browser extension and pass to
5ire extension to handle the json-rpc request and send the response back
*/
export class FireProvider extends SafeEventEmitter {

  constructor() {
    super();
    this.httpHost = HTTP_END_POINTS.QA;
    this.selectedAddress = null;
    this.chainId = "0x3e5";
    this.networkVersion = 997;
    this.version = "1.4.0";
    this.is5ire = true
    this.connected = true;

    //for handling the different Promise handlers
    this.handlers = {};

    this.conntectMethods = [
      "eth_requestAccounts",
      "eth_accounts",
      "connect"];

    this.stakingMethods = [
      "native_add_nominator",
      "native_renominate",
      "native_nominator_payout",
      "native_validator_payout",
      "native_stop_validator",
      "native_stop_nominator",
      "native_unbond_validator",
      "native_unbond_nominator",
      "native_withdraw_nominator",
      "native_withdraw_validator",
      "native_withdraw_nominator_unbonded",
      "native_add_validator",
      "native_validator_bondmore",
      "native_restart_validator",
      "native_nominator_bondmore"
    ]

    this.restricted = [
      "get_endPoint",
      "eth_sendTransaction",
      "disconnect",
      ...this.conntectMethods,
      ...this.stakingMethods,
      ...Object.values(SIGNER_METHODS)
    ];


    //inject the endpoint
    this.injectHttpProvider()
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
    this.passReq(payload)
      .then((res) => cb(res, null))
      .catch((err) => cb(null, err))
  }


  //requesting some data from chain
  async request(method, payload) {
    // console.log("here it is inside injected script: ", method, payload);
    return await this.passReq(method, payload);
  }

  /*********************************** Native Signer Handlers **********************************/
    /**
   * for sign transaction payload
   * @param {object} payload 
   */
    async signPayload(payload) {
      return await this.passReq(SIGNER_METHODS.SIGN_PAYLOAD, payload);
    }
  
    /**
   * for sign raw transaction
   * @param {object} payload 
   */
    async signRaw(payload) {
      return await this.passReq(SIGNER_METHODS.SIGN_RAW, payload);
  
    }


  //for checking JSON-RPC headers
  async passReq(method, payload) {
    if (method === undefined && method.trim() === "") return Error("invalid method");

    //pass the request to extension
    const isObject = typeof (method) === "object" && method !== undefined;

    const res = await this.sendJsonRpc(isObject ? method.method : method, !payload && isObject ? method.params : payload);
    return res;
  }


  //inject the http endpoint for specfic network
  async injectHttpProvider() {
    const result = await this.passReq("get_endPoint", null)
    console.log("here is endpoint: ", result);
    if (result) this.httpHost = result;
  }


  //inject accounts into provider
  injectSelectedAccount(address) {
    this.selectedAddress = address
  }


  //pass request to extension for processing the jsonrpc request
  //if request is not related to connection and transaction processing
  //then it is processed in inject content script in current webpage
  sendJsonRpc(
    method,
    message = [],
    isCb = false,
    cb = null,
    isFull = false
  ) {

    return new Promise(async (resolve, reject) => {
      try {


        if (this.restricted.indexOf(method) < 0) {
          const rawResponse = await fetch(((this.httpHost?.includes("http://") || this.httpHost?.includes("https://"))) ? this.httpHost : "https://rpc-testnet.5ire.network", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: message }),
          });

          const content = await rawResponse.json();
          if (content.error) {
            isCb && cb(content);
            return reject(content);
          } else {
            isCb && cb(isFull ? content : content.result);

            return resolve(isFull ? content : content.result);
          }
        }


        if (method === "eth_requestAccounts" || method === "eth_accounts" || method === 'connect' || method === "disconnect") message = { method }

        //get a unique if for specfic handler
        const id = getId();

        this.handlers[id] = {
          reject,
          resolve,
          id,
          isCb: isCb,
          cb: cb,
          isFull,
          method
        };

        // if (method === "eth_requestAccounts" || method === "eth_accounts" || method === "disconnect") {
        //   message = { origin, method };
        // }
        
        const transportRequestMessage = {
          id,
          message,
          origin: INPAGE,
          method,
        };

        injectedStream.write(transportRequestMessage);
      } catch (err) {
        // console.log("error in calling this method: ", method, message);
        // console.log("Error in handle json-rpc request handler in injected section: ", err);
        reject(err);
      }
    });
  }
}