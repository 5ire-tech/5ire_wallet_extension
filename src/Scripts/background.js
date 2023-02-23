import { CONNECTION_NAME } from "../Constants";
import {
  Controller,
  initScript,
  loadStore,
  checkTransactions
} from "./controller";
// import { setNewAccount } from "../Store/reducer/auth";
import Browser from "webextension-polyfill";
import { isManifestV3 } from "./utils";

try {

  //background globals
  let isInitialized = false;
  let store = null;

  Browser.runtime.onConnect.addListener(async (port) => {
    if (port.name === CONNECTION_NAME) {
      store = await loadStore();
      isInitialized = true;

      port.onDisconnect.addListener(function () {
        //handle popup close actions
        // store.dispatch(setNewAccount(null));
      });

    }
  });

  /** Fired when the extension is first installed,
   *  when the extension is updated to a new version,
   *  and when Chrome is updated to a new version. */
  Browser.runtime.onInstalled.addListener(async (details) => {
    //on install of extension
    // console.log("[background.js] onInstalled", details);
    // store.dispatch(setApiReady(false));
    if (isManifestV3) {
      for (const cs of Browser.runtime.getManifest().content_scripts) {
        for (const tab of await Browser.tabs.query({ url: cs.matches })) {
          Browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: cs.js,
          });
        }
      }
    }
  });

  Browser.runtime.onStartup.addListener(() => {
    //on background script startup
    // store.dispatch(setApiReady(false));
    // console.log("[background.js] onStartup");
  });

  Browser.runtime.onMessage.addListener(async function (message, sender, cb) {


    //check if the current event is transactions
    if (message?.type === "tx") txNotification(message);


    if (!isInitialized) {
      store = await loadStore(false);
      isInitialized = true;
    }

    const controller = new Controller(store);
    const data = {
      ...message,
      tabId: sender?.tab?.id,
    };
    switch (data?.method) {
      case "connect":
      case "eth_requestAccounts":
      case "eth_accounts":
        await controller.handleConnect(data);
        break;
      case "disconnect":
        await controller.handleDisconnect(data);
        break;
      case "eth_sendTransaction":
        await controller.handleEthTransaction(data);
        break;
      case "get_endPoint":
        await controller.sendEndPoint(data);
        break;

      case "native_add_nominator":
      case "native_renominate":
      case "native_nominator_payout":
      case "native_validator_payout":
      case "native_stop_validator":
      case "native_stop_nominator":
      case "native_unbond_validator":
      case "native_unbond_nominator":
      case "native_withdraw_nominator":
      case "native_withdraw_validator":
      case "native_withdraw_nominator_unbonded":
      case "native_add_validator":
      case "native_validator_bondmore":
      case "native_restart_validator":
      case "native_nominator_bondmore":
        await controller.handleValidatorNominatorTransactions(data);
        break;
      default:
    }
  });

  /**
   *  Sent to the event page just before it is unloaded.
   *  This gives the extension opportunity to do some clean up.
   *  Note that since the page is unloading,
   *  any asynchronous operations started while handling this event
   *  are not guaranteed to complete.
   *  If more activity for the event page occurs before it gets
   *  unloaded the onSuspendCanceled event will
   *  be sent and the page won't be unloaded. */
  Browser.runtime.onSuspend.addListener(() => {
    //event called when extension is suspended or closed
    // console.log("[background.js] onSuspend");
    isInitialized = false;
  });


  //init the scripts (inject the script into current webpage)
  initScript();

  //send the Notification if transaction is confirmed
  function txNotification(txData) {
    checkTransactions(txData.data);
  }

} catch (err) {
  console.log("Error: ", err)
}
