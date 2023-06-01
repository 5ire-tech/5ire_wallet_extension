import Browser from "webextension-polyfill";
import { CONTENT_SCRIPT, INPAGE } from "./constants";
import { WindowPostMessageStream } from "./stream";
import { SIGNER_METHODS, STREAM_CHANNELS, VALIDATOR_NOMINATOR_METHOD } from "../Constants";
import ExtensionPostStream from "./extension-port-stream-mod/index";

// for content script
export class ContentJS {
  static pageStream = null;
  static instance = null;
  static postStreamForBackground = null;

  constructor() {
    //create a page stream to get and pass the message to content script
    ContentJS.pageStream = new WindowPostMessageStream({
      name: CONTENT_SCRIPT,
      target: INPAGE
    });

    //inject the injected-script into firefox
    this.injectScript();

    //bind the data event on page stream
    this.bindDataFromPageStream();

    //connect to background worker using port stream
    this.connectPortStream();

    //bind message event from extension side
    this.bindMessageFromBackgroundWorker();
  }

  static initContentScript() {
    if (!ContentJS.instance) {
      ContentJS.instance = new ContentJS();
      delete ContentJS.constructor;
    }
    return ContentJS.instance;
  }

  //connet the port stream to background worker
  connectPortStream() {
    const portConnection = Browser.runtime.connect({
      name: STREAM_CHANNELS.CONTENTSCRIPT
    });
    ContentJS.postStreamForBackground = new ExtensionPostStream(portConnection);
  }

  //bind the data event on window post message stream from injected script
  bindDataFromPageStream() {
    ContentJS.pageStream.on("data", async (data) => {
      if (!data?.method) return;

      try {
        switch (data.method) {
          case "connect":
          case "eth_requestAccounts":
          case "eth_accounts":
          case "disconnect":
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
            ContentJS.postStreamForBackground.write(data);
            break;

          case "eth_sendTransaction":
            if (data.method !== "eth_sendTransaction" || data.message?.length < 0) {
              ContentJS.pageStream.write({
                id: data.id,
                error: "Invalid Transaction Request"
              });
            } else {
              ContentJS.postStreamForBackground.write(data);
            }
            break;
          case SIGNER_METHODS.SIGN_PAYLOAD:
          case SIGNER_METHODS.SIGN_RAW:
            ContentJS.postStreamForBackground.write(data);
            break;
          case "get_endPoint":
            ContentJS.postStreamForBackground.write(data);
            break;
          default:
            ContentJS.pageStream.write({
              id: data.id,
              error: "Invalid request method"
            });
        }
      } catch (err) {
        console.log("Error in Content Script: ", err);
        ContentJS.pageStream.write({
          id: data.id,
          error: "Error while performing the operation"
        });
      }
    });
  }

  //bind message event from background script
  bindMessageFromBackgroundWorker() {
    /**
     * Fired when there is runtime message from extension side
     */
    Browser.runtime.onMessage.addListener((message) => {
      if (message?.id) {
        ContentJS.pageStream.write(message);
      }
    });
  }

  //inject into firefox web page
  injectScript() {
    try {
      const container = document.head || document.documentElement;
      const scriptTag = document.createElement("script");
      scriptTag.setAttribute("async", "false");
      // scriptTag.textContent = content;
      scriptTag.setAttribute("src", Browser.runtime.getURL("static/js/injected.js"));

      container.insertBefore(scriptTag, container.children[0]);
      container.removeChild(scriptTag);
    } catch (error) {
      console.error("failed to inject the inpage script", error);
    }
  }
}
