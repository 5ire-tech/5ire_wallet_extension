import { WindowPostMessageStream } from "./stream";
import { CONTENT_SCRIPT, INPAGE, getId } from "./constants";

const injectedStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
});

const handlers = {};

let isOpend = false;

injectedStream.write({ method: "keepAlive" });
const conntectMethods = ["eth_requestAccounts",
  "eth_accounts",
  "connect"];
const restricted = [
  "eth_sendTransaction",
  ...conntectMethods
];
function sendMessage(
  method,
  message = "",
  isCb = false,
  cb = null,
  isFull = false
) {
  return new Promise(async (resolve, reject) => {
    try {


      const origin = window?.location?.origin;


      if (method === 'eth_sendTransaction') {
        console.log("HERE MESSSFE AND METHOD", method, message);
      }
      if (method === "net_version") {
        return resolve({ result: 0x3e5, method });
      }
      if (restricted.indexOf(method) < 0) {
        const rawResponse = await fetch("https://chain-node.5ire.network", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...message, jsonrpc: "2.0", id: 1 }),
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

      if (method === "eth_requestAccounts" || method === "eth_accounts" || method === 'connect') {
        if (isOpend) {
          return resolve([])
        } else {
          message = { origin, method };
          isOpend = true;
        }

      }

      handlers[id] = {
        reject,
        resolve,
        id,
        isCb: isCb,
        cb: cb,
        isFull,
        method,
        origin,
      };

      const transportRequestMessage = {
        id,
        message,
        origin: INPAGE,
        method,
      };

      injectedStream.write(transportRequestMessage);
    } catch (err) {
      console.log("Here error got", err);
      reject(err);
    }
  });
}

window.fire = {
  version: "1.0.0",
  isInstalled: true,
  connected: true,
  send(methodOrPayload, callbackOrArgs) {
    if (
      typeof methodOrPayload === "string" &&
      (!callbackOrArgs || Array.isArray(callbackOrArgs))
    ) {
      const payload = { method: methodOrPayload, params: callbackOrArgs };
      return sendMessage(payload.method, payload, false, null, true);
    } else if (
      methodOrPayload &&
      typeof methodOrPayload === "object" &&
      typeof callbackOrArgs === "function"
    ) {
      return sendMessage(
        methodOrPayload.method,
        methodOrPayload,
        true,
        callbackOrArgs,
        true
      );
    }
    return sendMessage(
      methodOrPayload.method,
      methodOrPayload,
      false,
      null,
      true
    );
  },
  sendAsync: (payload, cb = null) => {
    return this.send(payload, cb);
  },

  connect: () => sendMessage("connect"),
  request: (params) => sendMessage(params.method, params),
};

injectedStream.on("data", (data) => {
  if (data?.method === "keepAlive") {
    setTimeout(() => {
      injectedStream.write({ method: "keepAlive" });
    }, 1000 * 30);
  }
  if (data.id) {
    console.log("HERE HANDLERS", handlers);
    const handler = handlers[data.id];

    if (conntectMethods.indexOf(handler?.method) > -1) {
      setTimeout(() => {
        isOpend = false;
      }, 2000)
    }
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
      } else {
        handler?.isCb && handler.cb(data.response);
        handler?.resolve(data.response);
      }
    }
    delete handlers[data.id];
  }
});
