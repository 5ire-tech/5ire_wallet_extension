import { WindowPostMessageStream } from "./stream";
import { CONTENT_SCRIPT, INPAGE } from "./constants";
import { FireProvider } from "./5ire-Provider";

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

  // console.log("Here is response from extension: ", data);

  //get specfic handler using id and resolve or reject it
  if (data.id) {
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
