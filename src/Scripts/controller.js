import { configureStore } from "@reduxjs/toolkit";
import { wrapStore } from "webext-redux";
import Browser from "webextension-polyfill";
import { PORT_NAME } from "../Constants";
import logger from "redux-logger";
import authReducer, {
  userState,
  setUIdata,
  setLogin,
  toggleLoader,
} from "../Store/reducer/auth";
import NotificationManager from "./platform";

// Initializes the Redux store
function init(preloadedState) {
  return new Promise((resolve, reject) => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState,
      middleware: [logger],
    });

    wrapStore(store, { portName: PORT_NAME });

    // Subscribes to the redux store changes. For each state
    // change, we want to store the new state to the storage.
    store.subscribe(() => {
      Browser.storage.local.set({ state: store.getState() });

      // Optional: other things we want to do on state change
      // Here we update the badge text with the counter value.
      //    Browser.action.setBadgeText({ text: `${store.getState().counter?.value}` });
    });
    Browser.storage.session
      .get(["login"])
      .then((res) => {
        store.dispatch(setLogin(res?.login ? res.login : false));
        resolve(store);
      })
      .catch(reject);
  });
}

// let ports = {};

export function loadStore(sendStoreMessage = true) {
  return new Promise(async (resolve) => {
    try {
      Browser.storage.local.get("state").then(async (storage) => {
        // 1. Initializes the redux store and the message passing.
        const store = await init(storage.state || { auth: userState });
        // store.dispatch(toggleLoader(false));

        // 2. Sends a message to notify that the store is ready.
        sendStoreMessage &&
          Browser.runtime.sendMessage({ type: "STORE_INITIALIZED" });
        resolve(store);
      });
    } catch (err) {
      console.log("Here error in store", err);
    }
  });
}

export async function initScript() {
  try {
    await Browser.scripting.registerContentScripts([
      {
        id: "inpage",
        matches: ["file://*/*", "http://*/*", "https://*/*"],
        js: ["./static/js/injected.js"],
        runAt: "document_start",
        world: "MAIN",
      },
    ]);
  } catch (err) {
    /**
     * An error occurs when app-init.js is reloaded. Attempts to avoid the duplicate script error:
     * 1. registeringContentScripts inside runtime.onInstalled - This caused a race condition
     *    in which the provider might not be loaded in time.
     * 2. await chrome.scripting.getRegisteredContentScripts() to check for an existing
     *    inpage script before registering - The provider is not loaded on time.
     */
    console.log(`Dropped attempt to register inpage content script. ${err}`);
  }
}

export class Controller {
  constructor(store) {
    this.store = store;
    this.notificationManager = new NotificationManager(store);

  }
  showNotification(
    message = "",
    title = "Fire Notification",
    type = "basic"
  ) {
    Browser.notifications.create("", {
      iconUrl: Browser.runtime.getURL("logo192.png"),
      message,
      title,
      type,
    });
  }


  async handleConnect(data) {
    const state = this.store.getState();

    const isEthReq =
      data?.message?.method === "eth_requestAccounts" ||
      data?.message?.method === "eth_accounts";
    const isExist = state.auth.connectedSites.find(
      (st) => st.origin === data.message?.origin
    );
    // console.log("HERE ALLL", state.auth.uiData.message?.origin, data.message?.origin)
    // if (state.auth.uiData.message?.origin === data.message?.origin) {
    //   return;
    // }
    if (isExist?.isConnected) {
      const res = isEthReq
        ? [state.auth.currentAccount.evmAddress]
        : {
          evmAddress: state.auth.currentAccount.evmAddress,
          nativeAddress: state.auth.currentAccount.nativeAddress,
        };
      Browser.tabs.sendMessage(data.tabId, {
        id: data.id,
        response: res,
        error: null,
      });
    } else {

      this.store.dispatch(setUIdata(data));
      await this.notificationManager.showPopup("loginApprove");

    }
  }

  async handleEthTransaction(data) {
    this.store.dispatch(
      setUIdata({
        ...data,
        message: data?.message?.params[0],
      })
    );
    await this.notificationManager.showPopup("approveTx");
  }

}








