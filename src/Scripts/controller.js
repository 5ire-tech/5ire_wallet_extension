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
import {mainReducer} from "../Store/reducer/auth"

import {
  API,
  STATUS,
  PORT_NAME, 
  HTTP_METHODS, 
  HTTP_END_POINTS,
  EVM_JSON_RPC_METHODS,  
 } from "../Constants";
import {Connection} from "../Helper/connection.helper"
import {nativeMethod} from "./nativehelper"


export const init = (sendStoreMessage = true) => {
  return new Promise((resolve, reject) => {

    getData().then(data => {
      sendStoreMessage &&
        // Browser.runtime.sendMessage({ type: "APP_READY", data: data });
      resolve(data);
    }).catch(e => {
      console.log("Error when init the app: ", e);
      reject(e);
    })
  })
}

//get the data from local storage
export const getData = () => {
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
    const store = await getData();
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
