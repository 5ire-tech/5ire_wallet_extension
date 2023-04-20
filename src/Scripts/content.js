import Browser from "webextension-polyfill";
import { WindowPostMessageStream } from "./stream";
import { CONTENT_SCRIPT, INPAGE } from "./constants";
import { isManifestV3 } from "./utils";
import { SIGNER_METHODS } from "../Constants";


const contentStream = new WindowPostMessageStream({
  name: CONTENT_SCRIPT,
  target: INPAGE,
});



contentStream.on("data", async (data) => {

  if(!data?.method) return;

  try {
    switch (data.method) {
      case "connect":
      case "eth_requestAccounts":
      case "eth_accounts":
      case "disconnect":
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
      case SIGNER_METHODS.SIGN_PAYLOAD:
      case SIGNER_METHODS.SIGN_RAW:
        Browser.runtime.sendMessage(data);
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
    console.log("Error in Content Script: ", err);
  }
});


const messageFromExtensionUI = (message, sender, cb) => {
  if (message?.id) {
    contentStream.write(message);
    cb("I Receive and ack");
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
Browser.runtime.onMessage.addListener(messageFromExtensionUI);


//firefox injection
function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    // scriptTag.textContent = content;
    scriptTag.setAttribute('src', Browser.runtime.getURL('static/js/injected.js'));

    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error('5ire: Provider injection failed.', error);
  }
}

if (!isManifestV3) {
  injectScript()
}