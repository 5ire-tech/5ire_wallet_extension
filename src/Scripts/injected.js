import { WindowPostMessageStream } from "./stream";
import { ACCOUNT_CHANGED_EVENT, CONTENT_SCRIPT, INPAGE } from "./constants";
import { FireProvider } from "./5ire-Provider";
import { TABS_EVENT } from "../Constants";

const injectedStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
});


injectedStream.write({ method: "keepAlive" });

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


  //emit the tab events
  if (data?.event) {
    if (data?.event === TABS_EVENT.NETWORK_CHANGE_EVENT) fireProvider.httpHost = data.response?.result?.url;
    fireProvider.emit(data.event, data.response);
    return;
  }

  //get specfic handler using id and resolve or reject it
  if (data.id) {

    const handler = fireProvider.handlers[data.id];

    //check if the message is related to error
    if (data.error) {
      handler?.isCb && handler.cb(data.error);
      handler?.reject(data.error);

    } else {

      if (fireProvider.conntectMethods.find(item => item === handler?.method)) {
        fireProvider.injectSelectedAccount(data?.response?.evmAddress || (data?.response?.result?.length && data?.response?.result[0]));
        handler?.resolve(data?.response?.result)
        delete fireProvider.handlers[data.id];
        return;
      } else if (handler?.method === "disconnect") {
        fireProvider.injectSelectedAccount(null);
      }


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
        handler?.resolve(data.response?.result);
      }
    }
    delete fireProvider.handlers[data.id];
  }
});
