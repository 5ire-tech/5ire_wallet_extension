import { WindowPostMessageStream } from "./stream";
import { CONTENT_SCRIPT, INPAGE } from "./constants";
import { FireProvider } from "./5ire-Provider";

const injectedStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
});

injectedStream.write({ method: "keepAlive" });

// const handlers = {};

// let isOpend = false;
// const conntectMethods = ["eth_requestAccounts",
//   "eth_accounts",
//   "connect"];

// const restricted = [
//   "eth_sendTransaction",
//   ...conntectMethods
// ];


// function sendMessage(
//   method,
//   message = "",
//   isCb = false,
//   cb = null,
//   isFull = false
// ) {

//   return new Promise(async (resolve, reject) => {
//     try {


//       const origin = window?.location?.origin;
      
//       if (method === "net_version") {
//         return resolve({ result: 997, method });
//       }

//       if (restricted.indexOf(method) < 0) {
//         const rawResponse = await fetch("https://chain-node.5ire.network", {
//           method: "POST",
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ params: message, jsonrpc: "2.0", id: 1, method }),
//         });
//         const content = await rawResponse.json();
//         if (content.error) {
//           // console.log("issue in this method: ", method, message, content);

//           isCb && cb(content);
//           return reject(content);
//         } else {
//           isCb && cb(isFull ? content : content.result);
//           // console.log("Result of method: ", method, message, content);
//           return resolve(isFull ? content : content.result);
//         }
//       }

//       const id = getId();

//       if (method === "eth_requestAccounts" || method === "eth_accounts" || method === 'connect') {
//         if (isOpend) {
//           return resolve([])
//         } else {
//           message = { origin };
//           isOpend = true;
//         }

//       }

//       handlers[id] = {
//         reject,
//         resolve,
//         id,
//         isCb: isCb,
//         cb: cb,
//         isFull,
//         method,
//         origin,
//       };

//       const transportRequestMessage = {
//         id,
//         message,
//         origin: INPAGE,
//         method,
//       };

//       injectedStream.write(transportRequestMessage);
//     } catch (err) {
//       console.log("Here error got", err);
//       reject(err);
//     }
//   });
// }

// window.fire = {
//   version: "1.0.0",
//   isInstalled: true,
//   isConnected:  () => true,
//   is5ire: true,
//   send(methodOrPayload, callbackOrArgs) {

//     if (
//       typeof methodOrPayload === "string" &&
//       (!callbackOrArgs || Array.isArray(callbackOrArgs))
//     ) {
//       // const payload = { method: methodOrPayload, params: callbackOrArgs };
//       return sendMessage(methodOrPayload, callbackOrArgs, false, null, true);
//     } else if (
//       methodOrPayload &&
//       typeof methodOrPayload === "object" &&
//       typeof callbackOrArgs === "function"
//     ) {
//       return sendMessage(
//         methodOrPayload.method,
//         methodOrPayload.params,
//         true,
//         callbackOrArgs,
//         true
//       );
//     }
//     return sendMessage(
//       methodOrPayload.method,
//       methodOrPayload,
//       false,
//       null,
//       true
//     );
//   },

//   sendAsync: (payload, cb = null) => {
//     return window.fire.send(payload, cb);
//   },

//   connect: () => sendMessage("connect"),
//   request: (method, params = []) => {

//     const isObject = typeof(method) === "object" && method !== undefined;
//     return sendMessage(isObject ? method.method : method, isObject ? method.params : params)
//   },
// };


/**
 * inject the fire provider into current active webpage
 */
const fireProvider = new FireProvider();
window.fire = fireProvider;


//data streams from injected script throught the window messaging api
injectedStream.on("data", (data) => {


  if (data?.method === "keepAlive") {
    setTimeout(() => {
      injectedStream.write({ method: "keepAlive" });
    }, 1000 * 30);
  }


  //get specfic handler using id and resolve or reject it
  if (data.id) {
    console.log("Here is response from extension: ", data);
    const handler = fireProvider.handlers[data.id];


    if (fireProvider.conntectMethods.indexOf(handler?.method) > -1) {
      setTimeout(() => {
        fireProvider.isOpen = false;
      }, 2000)
    }


    //check if the message is related to error
    if (data.error) {
      handler?.isCb && handler.cb(data.error);
      handler?.reject(data.error);
    } else {
      if (handler?.isFull) {
        const res = {
          jsonrpc: "2.0",
          method: handler.method,
          result: data.response,
        };
        handler?.isCb && handler.cb(res);
        handler?.resolve(res);
      } else if(fireProvider.conntectMethods.find(item => item === data?.response?.method)) {
        fireProvider.injectSelectedAccount(data.response)
        handler?.resolve(data.response.result);
      } else {
        handler?.isCb && handler.cb(data.response);
        handler?.resolve(data.response);
      }
    }
    delete fireProvider.handlers[data.id];
  }
});
