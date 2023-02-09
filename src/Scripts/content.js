import Browser from "webextension-polyfill";
import { WindowPostMessageStream } from "./stream";
import { CONTENT_SCRIPT, INPAGE } from "./constants";

const contentStream = new WindowPostMessageStream({
  name: CONTENT_SCRIPT,
  target: INPAGE,
});

contentStream.on("data", async (data) => {

  // console.log("here is data in content: ", data);

  try {
    switch (data.method) {
      case "request":
        contentStream.write({
          id: data.id,
          response: "I return back result to you",
          error: null,
        });
        break;
      case "connect":
      case "eth_requestAccounts":
      case "eth_accounts":
        Browser.runtime.sendMessage(data);
        break;

      case "eth_sendTransaction":
        if (
          data.method !== "eth_sendTransaction" ||
          data.message?.length < 0
        ) {
          contentStream.write({
            id: data.id,
            error: "Invalid Transaction Request",
          });
        } else {
          Browser.runtime.sendMessage(data);
        }
        break;
      case "get_endPoint": 
      Browser.runtime.sendMessage(data);
      break;
      case "keepAlive":
        setTimeout(() => {
          contentStream.write({
            method: "keepAlive",
          });
        }, 1000 * 30);
        break;
      default:
        contentStream.write({
          id: data.id,
          error: "Invalid request method",
        });
    }
  } catch (err) {
    console.log("Error under content script", err);
  }
});

const messageFromExtensionUI = (message, sender, cb) => {
  if (message?.id) {

    contentStream.write(message);
    cb("I Recevie and ack");
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
Browser.runtime.onMessage.addListener(messageFromExtensionUI);
