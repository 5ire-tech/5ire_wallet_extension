import Browser from "webextension-polyfill";
import { WindowPostMessageStream } from "./stream";
import { CONTENT_SCRIPT, INPAGE } from "./constants";
import { isManifestV3 } from "./utils";
import { RESTRICTED_FOR_CONTENT_SCRIPT, SIGNER_METHODS, STREAM_CHANNELS, VALIDATOR_NOMINATOR_METHOD } from "../Constants";
import ExtensionPostStream from "./extension-port-stream-mod/index"
import { log } from "../Utility/utility";

  (async () => {

      /**
   * content-script is injected inside the extension popup also and it subscribe to all event
   * eg window.onMessage events throw WindowPostMessageStream and when someone opned the main
   * extension popup and perform some operation that include approval window then the extension event handler
   * and the page event handler both send the same message to background due to this background open
   * open double popup approval window that cause some unwanted bugs inside extension
   */
   if(window.location.origin.includes(RESTRICTED_FOR_CONTENT_SCRIPT)) return;

    const pageStream = new WindowPostMessageStream({
      name: CONTENT_SCRIPT,
      target: INPAGE,
    });


  //create the port stream for streaming the messages to content script
  const portConnection = Browser.runtime.connect({name: STREAM_CHANNELS.CONTENTSCRIPT});
  const postStreamForBackground = new ExtensionPostStream(portConnection);

    
    pageStream.on("data", async (data) => {
      
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
            postStreamForBackground.write(data);
            break;
    
          case "eth_sendTransaction":
            if (
              data.method !== "eth_sendTransaction" ||
              data.message?.length < 0
            ) {
              pageStream.write({
                id: data.id,
                error: "Invalid Transaction Request",
              });
            } else {
              postStreamForBackground.write(data);
            }
            break;
          case SIGNER_METHODS.SIGN_PAYLOAD:
          case SIGNER_METHODS.SIGN_RAW:
            postStreamForBackground.write(data);
            break;
          case "get_endPoint":
            postStreamForBackground.write(data);
            break;
          default:
            pageStream.write({
              id: data.id,
              error: "Invalid request method",
            });
        }
      } catch (err) {
        console.log("Error in Content Script: ", err);
      }
    });
    
    
    const messageFromExtensionUI = (message) => {
      if (message?.id) {
        pageStream.write(message);
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

  })();