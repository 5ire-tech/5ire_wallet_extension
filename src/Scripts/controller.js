import { configureStore } from "@reduxjs/toolkit";
import { wrapStore } from "./webext-redux/dist/webext-redux";
import Browser from "webextension-polyfill";
// import logger from "redux-logger";
import {
  setUIdata,
  setLogin,
  toggleLoader,
  updateTxHistory,
  toggleSite
} from "../Utility/redux_helper";
import { userState } from "../Store/reducer/auth";
import {mainReducer} from "../Store/reducer/auth"
import NotificationManager from "./platform";
import { isManifestV3 } from "./utils";

import { httpRequest, EVMRPCPayload } from "../Utility/network_calls";
import {isObject, isNullorUndef, isHasLength, log} from "../Utility/utility"
import {HTTP_METHODS, PORT_NAME, EVM_JSON_RPC_METHODS } from "../Constants";
import {Connection} from "../Helper/connection.helper"
import {nativeMethod} from "./nativehelper"



// Initializes the Redux store
function init(preloadedState) {
  return new Promise((resolve, reject) => {


    const store = configureStore({
      reducer: { auth: mainReducer },
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
    this.notificationManager = NotificationManager.getInstance(store);
    
    //maintain only single instance
    this.instance = null
  }

  static getInstance(store) {
    if(isNullorUndef(this.instance)) this.instance = new Controller(store)
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
          response: { result: storage.auth.httpEndPoints[storage.auth.currentNetwork.toLowerCase()] },
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

    // const hereOutput = await Browser.storage.local.get("popupStatus");

    // if (hereOutput.popupStatus) {
    //   Browser.tabs.sendMessage(data.tabId, {
    //     id: data.id,
    //     response: null,
    //     error: "5ire extension transaction approve popup session is already active",
    //   });
    //   return;
    // }

    this.store.dispatch(
      setUIdata({
        ...data,
        message: data?.message[0],
      }));


    await this.notificationManager.showPopup("approveTx");
  }


  //Handle Validator nominator methods
  async handleValidatorNominatorTransactions(data) {

    // const hereOutput = await Browser.storage.local.get("popupStatus");

    // if (hereOutput.popupStatus) {
    //   Browser.tabs.sendMessage(data.tabId, {
    //     id: data.id,
    //     response: null,
    //     error: "5ire extension transaction approve popup session is already active",
    //   });
    //   return;
    // }

    this.store.dispatch(setUIdata(data));
     await this.notificationManager.showPopup("nativeTx");
  }

}

//show browser notification from extension
function showNotification(controller, message) {
  if(!isNullorUndef(controller) && isHasLength(message)) controller.showNotification(message)
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
    const rpcUrl = txData.isEVM ? state.auth.httpEndPoints[txData.chain] || "https://rpc-testnet.5ire.network" : state.auth.api[state.auth.currentNetwork.toLowerCase()];


    //check if the transaction is still pending or not
    let txRecipt;
    if(txData.isEVM) txRecipt = await httpRequest(rpcUrl, HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload( EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [txHash])));
    else txRecipt = await httpRequest(rpcUrl + txHash, HTTP_METHODS.GET)


    //check if the tx is native or evm based
    if (txRecipt?.result) {
      store.dispatch(updateTxHistory({ txHash, accountName, status: Boolean(parseInt(txRecipt.result.status)), isSwap }));
      showNotification(controller ,`Transaction ${Boolean(parseInt(txRecipt.result.status)) ? "success" : "failed"} ${txHash.slice(0, 30)} ...`);
    } else if(txRecipt?.data && txRecipt?.data?.transaction.status !== "pending") {
      store.dispatch(updateTxHistory({ txHash, accountName, status: txRecipt?.data?.transaction.status, isSwap }));
      showNotification(controller ,`Transaction ${txRecipt?.data?.transaction.status} ${txHash.slice(0, 30)} ...`);
    }
    else checkTransactions(txData)

  } catch (err) {
    console.log("Error while checking transaction status: ", err);
  }
}

//create rpc handler
export const apiConnection = async () => {
  try {
    const connector = Connection.getConnector();
    const apiConn = await connector.initializeApi("", "https://qa-http-nodes.5ire.network", "QA")
    console.log("api connection: ", apiConn);
    return apiConn;
  } catch (err) {
    console.log("Error while making the connection to native api: ", err.message);
  }
}


//for validator and nominator transactions
export const nativeFeeCalculator = async (isFee=true) => {
      //get the estimated gas fee

      let feeData, methodName = '';
        try {
          const {
            addNominator,
            reNominate,
            nominatorValidatorPayout,
            stopValidatorNominator,
            unbondNominatorValidator,
            withdrawNominatorValidatorData,
            withdrawNominatorUnbonded,
            addValidator,
            bondMoreFunds,
            restartValidator,
            state
          } = await nativeMethod();

          const api = await apiConnection();

          if(api?.value) return;
          Connection.isExecuting.value = false;

            // await Browser.runtime.sendMessage({ type: "gas", game: "main thread is here"});
            const {auth} = state;
            switch (auth?.uiData?.method) {
                case "native_add_nominator":
                    feeData = await addNominator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Add Nominator";
                    break;
                case "native_renominate":
                    feeData = await reNominate(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Re-Nominate";
                    break;
                case "native_nominator_payout":
                    feeData = await nominatorValidatorPayout(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Nominator Payout";
                    break;
                case "native_validator_payout":
                    feeData = await nominatorValidatorPayout(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Validator Payout";
                    break;
                case "native_stop_validator":
                    feeData = await stopValidatorNominator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Stop Validator";
                    break;

                case "native_stop_nominator":
                    feeData = await stopValidatorNominator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Stop Nominator";
                    break;
                case "native_unbond_validator":
                    feeData = await unbondNominatorValidator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Unbond Validator";
                    break;

                case "native_unbond_nominator":
                    feeData = await unbondNominatorValidator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Unbond Nominator";
                    break;
                case "native_withdraw_nominator":
                    feeData = await withdrawNominatorValidatorData(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Send Funds";
                    break;

                case "native_withdraw_validator":
                    feeData = await withdrawNominatorValidatorData(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Send Funds";
                    break;
                case "native_withdraw_nominator_unbonded":
                    feeData = await withdrawNominatorUnbonded(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Withdraw Nominator Unbonded";
                    break;

                case "native_add_validator":
                    feeData = await addValidator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Add Validator";
                    break;

                case "native_validator_bondmore":
                    feeData = await bondMoreFunds(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Bond More Funds";
                    break;
                case "native_nominator_bondmore":
                    feeData = await bondMoreFunds(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Bond More Funds";
                    break;
                case "native_restart_validator":
                    feeData = await restartValidator(api.nativeApi, auth?.uiData?.message, isFee);
                    methodName = "Restart Validator";
                    break;
                default:

            }

            console.log("the main data is here: ", feeData);


            if (!feeData?.error && methodName && isFee) {
              Browser.runtime.sendMessage({type: "EST_GAS", data: {feeData, methodName}})
            } else if(!feeData?.error && methodName && (!isFee)) {
              Browser.runtime.sendMessage({type: "NATIVE_TX", data: {feeData, methodName}})
            }
            else {
              if(isFee) Browser.runtime.sendMessage({type: "EST_GAS", data: {feeData, methodName}})
              else Browser.runtime.sendMessage({type: "NATIVE_TX", data: {feeData, methodName}})
              
            }
          } catch (err) {
            console.log("Error while getting the fee: ", err);
            if(isFee) Browser.runtime.sendMessage({type: "EST_GAS", data: {feeData: {error: err}, methodName}})
            else Browser.runtime.sendMessage({type: "NATIVE_TX", data: {feeData: {error: err}, methodName}})
        }
}
