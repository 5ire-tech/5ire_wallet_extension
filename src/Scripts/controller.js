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
  updateTxHistory
} from "../Store/reducer/auth";
import NotificationManager from "./platform";
import { isManifestV3 } from "./utils";


// Initializes the Redux store
function init(preloadedState) {
  return new Promise((resolve, reject) => {


    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState,
      // middleware: [logger],
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
    if (isManifestV3) {
      Browser.storage.session
        .get(["login"])
        .then((res) => {
          store.dispatch(setLogin(res?.login ? res.login : false));
          resolve(store);
        })
        .catch(reject);
    } else {
      Browser.storage.local
        .get(["login"])
        .then((res) => {

          store.dispatch(setLogin(res?.login ? res.login : false));
          resolve(store);
        })
        .catch(reject);
    }
  });
}


//Load the redux store
export function loadStore(sendStoreMessage = true) {
  return new Promise(async (resolve) => {
    try {
      Browser.storage.local.get("state").then(async (storage) => {
        // 1. Initializes the redux store and the message passing.
        const store = await init(storage.state || { auth: userState });
        store.dispatch(toggleLoader(false));

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

//inject the script on current webpage
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
    // console.log(`Dropped attempt to register inpage content script. ${err}`);
  }
}


//controller class for permission related methods
export class Controller {
  constructor(store) {
    this.store = store;
    this.notificationManager = new NotificationManager(store);
  }

  //show extension notifications
  showNotification(
    message = "",
    title = "5ire",
    type = "basic"
  ) {
    Browser.notifications.create("", {
      iconUrl: Browser.runtime.getURL("logo192.png"),
      message,
      title,
      type,
    });
  }

 async sendEndPoint(data) {
    try {
      const storage = this.store.getState();

      //pass the current network http endpoint
      Browser.tabs.sendMessage(data.tabId, {
        id: data.id,
        response: {result: storage.auth.httpEndPoints[storage.auth.currentNetwork.toLowerCase()]},
        error: null,
      });
    } catch (err) {
     console.log("error while sending the endpoint for injection"); 
    }
  }

  //for connecting the accounts to a specfic webpage
  async handleConnect(data) {
    const state = this.store.getState();

    const isEthReq =
      data?.method === "eth_requestAccounts" ||
      data?.method === "eth_accounts";
    const isExist = state.auth.connectedSites.find(
      (st) => st.origin === data.message?.origin
    );

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



  //for transaction from connected website
  async handleEthTransaction(data) {

    this.store.dispatch(
      setUIdata({
        ...data,
        message: data?.message[0],
      }));
      

    await this.notificationManager.showPopup("approveTx");
  }

}


//for http-requests
export async function httpRequest(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: payload
    });
    const data = await res.json();
    return data;
}


//set interval for 20sec to check pending transaction status
export function checkTransactions() {
    const id = setInterval(() => {
        checkAndUpdateTx();
    }, 20000);
    return id;
}

// check if transaction is success or failed and update it into storage
async function checkAndUpdateTx() {
  try {
    const store = await loadStore(false);
    const state = await store.getState();

    const noti = new Controller(store)
    const rpcUrl = "https://chain-node.5ire.network";
    const transactions = state.auth.currentAccount.txHistory.filter(item => item.status === "Pending" && item.isEvm);
    const accountName = state.auth.currentAccount.accountName;

    console.log("Here is the Transaction state: ", transactions);
    if(transactions.length < 0) return;


    /*
    check for every pending transactions and if they success or fail update it into storage
    and send the success notification
    */ 
    for(const item of transactions) {
      const txHash = item.txHash;
      const txRecipt = await httpRequest(rpcUrl, JSON.stringify({jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [item.txHash], id: 1}));

      console.log("tx status: ", txRecipt.result.status, txRecipt);

      if(txRecipt) {
        store.dispatch(updateTxHistory({txHash, accountName, status: Boolean(parseInt(txRecipt.result.status))}));
        noti.showNotification(`Transaction ${Boolean(parseInt(txRecipt.result.status)) ? "Success" : "Failed"} ${txHash.slice(0, 30)} ...`)
      }

    }



  } catch (err) {
    console.log("Error while updating the transaction: ", err);
  }
}





