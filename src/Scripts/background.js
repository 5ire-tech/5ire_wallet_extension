import { CONNECTION_NAME } from "../Constants";
import {
  Controller,
  initScript,
  loadStore,
  checkTransactions
} from "./controller";
import Browser from "webextension-polyfill";

try {

  //background globals
  let isInitialized = false,
    store,
    intervalId = null;

  Browser.runtime.onConnect.addListener(async (port) => {
    if (port.name === CONNECTION_NAME) {
      store = await loadStore();
      isInitialized = true;
    }
  });

  /** Fired when the extension is first installed,
   *  when the extension is updated to a new version,
   *  and when Chrome is updated to a new version. */
  Browser.runtime.onInstalled.addListener(async (details) => {
    console.log("[background.js] onInstalled", details);

    for (const cs of Browser.runtime.getManifest().content_scripts) {
      for (const tab of await Browser.tabs.query({ url: cs.matches })) {
        Browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: cs.js,
        });
      }
    }
  });

  Browser.runtime.onStartup.addListener(() => {
    console.log("[background.js] onStartup");
  });

  Browser.runtime.onMessage.addListener(async function (message, sender, cb) {

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
      case "eth_sendTransaction":
        await controller.handleEthTransaction(data);
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
    console.log("[background.js] onSuspend");
    isInitialized = false;
    //clear the transactions checker interval
    if(intervalId) clearInterval(intervalId);
  });


  //init the scripts (inject the script into current webpage)
  initScript();

  //check the pending transaction status and update status and send notification
  intervalId = checkTransactions();

} catch (err) {
  console.log("BACKGROUND FILE TRY CATCH:", err)
}
