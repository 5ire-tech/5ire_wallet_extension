import logger from "redux-logger";
import { isManifestV3 } from "./utils";
import { localStorage } from "../Storage";
import Browser from "webextension-polyfill";
import NotificationManager from "./platform";
import {userState} from "../Store/initialState";
// import { configureStore } from "@reduxjs/toolkit";
// import { mainReducer } from "../Store/reducer/auth";
// import { wrapStore } from "./webext-redux/dist/webext-redux";
import { httpRequest, EVMRPCPayload } from "../Utility/network_calls";
import { isObject, isNullorUndef, isHasLength } from "../Utility/utility";
import {
  setUIdata,
  toggleSite,
  toggleLoader,
  updateTxHistory,
} from "../Utility/redux_helper";
import {
  API,
  STATUS,
  PORT_NAME,
  HTTP_METHODS,
  HTTP_END_POINTS,
  EVM_JSON_RPC_METHODS,
} from "../Constants";




// Initializes the Redux store
// function init(preloadedState) {
//   return new Promise((resolve, reject) => {


//     const store = configureStore({
//       reducer: { auth: mainReducer },
//       preloadedState,
//       // middleware: [logger],
//     });

//     wrapStore(store, { portName: PORT_NAME });

//     // Subscribes to the redux store changes. For each state
//     // change, we want to store the new state to the storage.
//     store.subscribe(() => {
//       Browser.storage.local.set({ state: store.getState() });

//       // Optional: other things we want to do on state change
//       // Here we update the badge text with the counter value.
//       //    Browser.action.setBadgeText({ text: `${store.getState().counter?.value}` });
//     });
//     if (isManifestV3) {
//       Browser.storage.session
//         .get(["login"])
//         .then((res) => {
//           store.dispatch(setLogin(res?.login ? res.login : false));
//           resolve(store);
//         })
//         .catch(reject);
//     } else {
//       Browser.storage.local
//         .get(["login"])
//         .then((res) => {

//           store.dispatch(setLogin(res?.login ? res.login : false));
//           resolve(store);
//         })
//         .catch(reject);
//     }
//   });
// }

export const init = (sendStoreMessage = true) => {
  return new Promise((resolve, reject) => {

    getData().then(data => {
      sendStoreMessage &&
        Browser.runtime.sendMessage({ type: "STORE_INITIALIZED", data: data });
      resolve(data);
    }).catch(e => {
      console.log("Error : ", e);
      reject(e);
    })
  })



}

const getData = () => {
  return new Promise((resolve, reject) => {

    localStorage.get("state")
      .then(res => {
        console.log("Data from local storage : ",res);

        if (!res) {
          localStorage.set({ state: userState });
          resolve({ state: userState });
        } else {
          resolve(res);
        }

      })
      .catch(err => {
        console.log("error : ", err);
        reject(err);
      });
  })
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
      // console.log("Here error in store", err);
      //error while loading the store
    }
  });
}

//inject the script on current webpage
export async function initScript() {
  try {


    await Browser.scripting.registerContentScripts([
      {
        id: "inpage",
        matches: ["http://*/*", "https://*/*"],
        js: ["./static/js/injected.js"],
        runAt: "document_start",
        world: "MAIN",
      },
    ])

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

    //maintain only single instance
    this.instance = null
  }

  static getInstance(store) {
    if (isNullorUndef(this.instance)) this.instance = new Controller(store)
    return this.instance
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

  //inject the current net endpoint to injected global
  async sendEndPoint(data) {
    try {
      const storage = this.store.getState();

      if (data.tabId) {
        //pass the current network http endpoint
        Browser.tabs.sendMessage(data.tabId, {
          id: data.id,
          response: { result: HTTP_END_POINTS[storage.auth.currentNetwork.toUpperCase()] },
          error: null,
        });
      }
    } catch (err) {
      //  console.log("Error while sending the endpoint for injection");
      //handle the error message passing also
    }
  }


  //for connecting the accounts to a specfic webpage
  async handleConnect(data) {
    const state = this.store.getState();

    const hereOutput = await Browser.storage.local.get("popupStatus");

    if (hereOutput.popupStatus) {
      Browser.tabs.sendMessage(data.tabId, {
        id: data.id,
        response: null,
        error: "5ire extension transaction approve popup session is already active",
      });
      return;
    }


    const isEthReq =
      data?.method === "eth_requestAccounts" ||
      data?.method === "eth_accounts";

    const isExist = state.auth.connectedSites.find(
      (st) => st.origin === data.message?.origin
    );

    // console.log("is Connected Website: ", isExist?.isConnected);

    if (isExist?.isConnected) {
      const res = isEthReq
        ? { method: data?.method, result: [state.auth.currentAccount.evmAddress] }
        : {
          result: {
            evmAddress: state.auth.currentAccount.evmAddress,
            nativeAddress: state.auth.currentAccount.nativeAddress,
          }
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

  //handle the Disconnection
  async handleDisconnect(data) {
    this.store.dispatch(toggleSite({ origin: data.message?.origin, isConnected: false }))
    Browser.tabs.sendMessage(data.tabId, {
      id: data.id,
      response: "Disconnected successfully",
      error: null,
    });
  }


  //for transaction from connected website
  async handleEthTransaction(data) {

    const hereOutput = await Browser.storage.local.get("popupStatus");

    if (hereOutput.popupStatus) {
      Browser.tabs.sendMessage(data.tabId, {
        id: data.id,
        response: null,
        error: "5ire extension transaction approve popup session is already active",
      });
      return;
    }

    this.store.dispatch(
      setUIdata({
        ...data,
        message: data?.message[0],
      }));


    await this.notificationManager.showPopup("approveTx");
  }


  //Handle Validator nominator methods
  async handleValidatorNominatorTransactions(data) {

    const hereOutput = await Browser.storage.local.get("popupStatus");

    if (hereOutput.popupStatus) {
      Browser.tabs.sendMessage(data.tabId, {
        id: data.id,
        response: null,
        error: "5ire extension transaction approve popup session is already active",
      });
      return;
    }

    this.store.dispatch(setUIdata(data));
    await this.notificationManager.showPopup("nativeTx");
  }

}

//show browser notification from extension
function showNotification(controller, message) {
  if (!isNullorUndef(controller) && isHasLength(message)) controller.showNotification(message)
}

// check if transaction status and inform user using browser notification
export async function checkTransactions(txData) {

  try {
    const store = await loadStore(false);
    const controller = Controller.getInstance(store);
    const txHash = isObject(txData.txHash) ? txData.txHash.mainHash : txData.txHash;


    if (txData.statusCheck.isFound) {
      showNotification(controller, `Transaction ${txData.statusCheck.status} ${txHash.slice(0, 30)} ...`)
      return;
    }

    //get the current redux state of application
    const state = await store.getState();
    const accountName = state.auth.currentAccount.accountName;


    //check if transaction is swap or not
    const isSwap = txData.type.toLowerCase() === "swap";

    //check if the current tx is evm tx or native tx
    const rpcUrl = txData.isEVM ? HTTP_END_POINTS[txData.chain.toUpperCase()] || "https://rpc-testnet.5ire.network" : API[state.auth.currentNetwork.toUpperCase()];


    //check if the transaction is still pending or not
    let txRecipt;
    if (txData.isEVM) txRecipt = await httpRequest(rpcUrl, HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [txHash])));
    else txRecipt = await httpRequest(rpcUrl + txHash, HTTP_METHODS.GET)

    //check if the tx is native or evm based
    if (txRecipt?.result) {
      store.dispatch(updateTxHistory({ txHash, accountName, status: Boolean(parseInt(txRecipt.result.status)), isSwap }));
      showNotification(controller, `Transaction ${Boolean(parseInt(txRecipt.result.status)) ? STATUS.SUCCESS.toLowerCase() : STATUS.FAILED.toLowerCase()} ${txHash.slice(0, 30)} ...`);
    } else if (txRecipt?.data && txRecipt?.data?.transaction.status.toLowerCase() !== STATUS.PENDING.toLowerCase()) {
      store.dispatch(updateTxHistory({ txHash, accountName, status: txRecipt?.data?.transaction.status, isSwap }));
      showNotification(controller, `Transaction ${txRecipt?.data?.transaction.status} ${txHash.slice(0, 30)} ...`);
    }
    else if (!txRecipt?.internalServer) checkTransactions(txData)

  } catch (err) {
    console.log("Error while checking transaction status: ", err);
  }
}





