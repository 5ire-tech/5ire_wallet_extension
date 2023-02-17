import { CONTENT_SCRIPT, INPAGE, getId } from "./constants";
import { WindowPostMessageStream } from "./stream";

//stream for in-window communication
const injectedStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
});

/*
Custom Web3 provider for interacting with the 5ire browser extension and pass to
5ire extension to handle the json-rpc request and send the response back
*/
export class FireProvider {

  constructor(httpHost = "https://rpc-testnet.5ire.network") {
    this.httpHost = httpHost;
    this.selectedAddress = null;
    this.chainId = "0x3e5";
    this.networkVersion = 997;
    this.version = "1.0.0";
    this.is5ire = true

    //for handling the different Promise handlers
    this.handlers = {};
    this.isOpen = false;

    this.conntectMethods = ["eth_requestAccounts",
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
    ]
    this.restricted = [
      "get_endPoint",
      "eth_sendTransaction",
      ...this.conntectMethods,
      this.stakingMethods
    ];


    //inject the endpoint
    this.injectHttpProvider()
  }

  connect() {
    return this.passReq("connect", null);
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
    return this.passReq(method, payload);
  }


  //for checking JSON-RPC headers
  async passReq(method, payload) {
    if (method === undefined && method.trim() === "") return Error("invalid method");

    //pass the request to extension
    const isObject = typeof (method) === "object" && method !== undefined;

    //check if request for network version and eth_accounts
    const networkIdRes = {
      "jsonrpc": "2.0",
      "result": this.networkVersion
    }
    if (isObject && !payload && method.method === "net_version") return networkIdRes;
    else if (method === "net_version") return networkIdRes;


    const res = await this.sendJsonRpc(isObject ? method.method : method, !payload && isObject ? method.params : payload);

    return res;
  }


  //inject the http endpoint for specfic network
  async injectHttpProvider() {

    const res = await this.passReq("get_endPoint", null)
    if (res) this.httpHost = res.result;
  }


  //inject accounts into provider
  injectSelectedAccount(res) {

    console.log("here is comes: ", res);

    if (res?.result && res?.result?.length) this.selectedAddress = res.result[0]
    else if (!res?.result) this.selectedAddress = null;
  }


  sendJsonRpc(
    method,
    message = [],
    isCb = false,
    cb = null,
    isFull = false
  ) {
    //false the isOpen so we can proceded with requested connection
    if (message?.length && message[0]?.isRequested) {
      this.isOpen = false;
    }

    console.log("method and params: ", method, message);

    return new Promise(async (resolve, reject) => {
      try {
        const origin = window?.location.origin;
        // console.log("Method and Message: ", method, message);
        // if (method === "net_version") {
        //   return resolve({ result: 0x3e5, method });
        // }


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


        if (method === "eth_requestAccounts" || method === "eth_accounts" || method === 'connect') {
          if (this.isOpen) {
            return resolve([])
          } else {
            message = { origin, method };
            this.isOpen = true;
          }
        }

        //get a unique if for specfic handler
        const id = getId();

        this.handlers[id] = {
          reject,
          resolve,
          id,
          isCb: isCb,
          cb: cb,
          isFull,
          method,
          origin,
        };

        if (method === "eth_requestAccounts" || method === "eth_accounts") {
          message.origin = origin;
        }
        const transportRequestMessage = {
          id,
          message,
          origin: INPAGE,
          method,
        };

        injectedStream.write(transportRequestMessage);
      } catch (err) {
        console.log("error in calling this method: ", method, message);
        console.log("Error in handle json-rpc request handler in injected section: ", err);
        reject(err);
      }
    });
  }
}