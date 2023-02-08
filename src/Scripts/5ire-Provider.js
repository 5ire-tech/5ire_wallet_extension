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

    constructor(httpHost = "https://chain-node.5ire.network") {
        this.httpHost = httpHost;
        this.selectedAddress = null;
        this.chainId = "0x3e5";
        this.networkVersion = 997;
        this.version = "1.0.0";
        this.is5ire = true

        //for handling the different Promise handlers
        this.handlers  = {};
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

        console.log("here it is inside injected script: ", method, payload);

        return this.passReq(method, payload);
    }


    //for checking JSON-RPC headers
    async passReq(method, payload) {
        if (method === undefined && method.trim() === "") return Error("invalid method");

        //pass the request to extension
        const isObject = typeof(method) === "object" && method !== undefined;

        //check if request for network version and eth_accounts
        const networkIdRes = {
            "jsonrpc": "2.0",
            "result": this.networkVersion
        }
        if(isObject && !payload && method.method === "net_version") return networkIdRes;
        else if(method === "net_version") return networkIdRes; 
        if(isObject && !payload && method.method === "eth_accounts") return networkIdRes.result = []
        else if(method === "eth_accounts") return networkIdRes.result = []


        console.log("just before json rpc request: ", method, payload);

        
        const res  = await this.sendJsonRpc(isObject ? method.method : method, !payload && isObject ? method.params : payload);
        if(res.method !== undefined && res.method === "eth_requestAccounts") this.injectSelectedAccount(res);

        return res;
    }



    //internal function used to pass request to extension
    sendMessage(method, payload={}) {

        return new Promise((resolve, reject) => {
          try {
            //check for if payload is passed us null
            if(typeof(payload) !== Object || payload ===  undefined || payload ===  undefined) payload = {};
            const id = getId();

            //handler added with a random id and promise reject and resolve functionss
            this.handlers[id] = { reject, resolve, id };
      
            if (method === "eth_requestAccounts") {
                payload["origin"] = window.location.origin;
            }


            //object to send over window data stream
            const transportRequestMessage = {
              id,
              payload,
              origin: INPAGE,
              method,
            };
      
            injectedStream.write(transportRequestMessage);
      
          } catch (err) {
            console.log("Error in send message while passing request to the extension ", err);
            reject(err);
          }
        });
      }
      
      //inject accounts into provider
      injectSelectedAccount(res) {
        this.selectedAddress = res.result[0]
      }


      sendJsonRpc(
        method,
        message = {},
        isCb = false,
        cb = null,
        isFull = false
      ) {

        const restricted = [
          "eth_sendTransaction",
          "eth_requestAccounts",
          "eth_accounts",
          "connect",
        ];

        return new Promise(async (resolve, reject) => {
          try {
            const origin = window?.location.origin;
            console.log("Method and Message: ", method, message);
            // if (method === "net_version") {
            //   return resolve({ result: 0x3e5, method });
            // }
            if (restricted.indexOf(method) < 0) {
              const rawResponse = await fetch((this.httpHost && (!this.httpHost.includes("http://") || !this.httpHost.includes("https://"))) || "https://chain-node.5ire.network", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({jsonrpc: "2.0", id: 1, method, params: [message]}),
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
            console.log("Error in handle json-rpc request handler in injected section: ", err);
            reject(err);
          }
        });
      }
}