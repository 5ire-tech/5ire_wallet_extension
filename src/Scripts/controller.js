import Browser from "webextension-polyfill";
import NotificationManager from "./platform";
import { hasLength, isNullorUndef, isString } from "../Utility/utility";
import {setUIdata, toggleSite} from "../Utility/redux_helper";
import { ERRCODES, ERROR_MESSAGES, HTTP_END_POINTS, LABELS, } from "../Constants";
import { ErrorPayload, Error } from "../Utility/error_helper";
import { getDataLocal } from "../Storage/loadstore";


//handle the interaction with external dapps and websites
export class ExternalConnection {

    //add the dapp or website to connected list after approval
    async handleConnect(data) {
      const state = await getDataLocal(LABELS.STATE)
      const account = state.allAccounts[state.currentAccount.index];
      const isEthReq =
        data?.method === "eth_requestAccounts" ||
        data?.method === "eth_accounts";
  
      const isExist = state.connectedSites.find(
        (st) => st.origin === data.message?.origin
      );
  
      // console.log("is Connected Website: ", isExist?.isConnected);
  
      if (isExist?.isConnected) {
        const res = isEthReq
          ? { method: data?.method, result: [account.evmAddress] }
          : {
            result: {
              evmAddress: account.evmAddress,
              nativeAddress: account.nativeAddress,
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

    //handle the evm related transactions
   async handleEthTransaction(data) {

    this.store.dispatch(
      setUIdata({
        ...data,
        message: data?.message[0],
      }));


    await this.notificationManager.showPopup("approveTx");
    }

  //handle the interaction with nominator and validator application
  async handleValidatorNominatorTransactions(data) {
    this.store.dispatch(setUIdata(data));
    await this.notificationManager.showPopup("nativeTx");
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
  
  
    //handle the Disconnection
    async handleDisconnect(data) {
      this.store.dispatch(toggleSite({ origin: data.message?.origin, isConnected: false }))
      Browser.tabs.sendMessage(data.tabId, {
        id: data.id,
        response: "Disconnected successfully",
        error: null,
      });
    }

}


//handle the windows and notifications

export class GUIHandler {
  static instance = null

  constructor() {
    this.notificationManager = NotificationManager.getInstance();
  }


      //maintain only single instance
      static getInstance(store) {
        if(isNullorUndef(GUIHandler.instance)) GUIHandler.instance = new GUIHandler(store)
        delete GUIHandler.constructor
        return GUIHandler.instance
      }
    
      
      //show extension notifications
      showNotification(message, title = "5ire", type = "basic") {
    
        if(!isString(message) && !hasLength(message)) new Error(new ErrorPayload(ERRCODES.CHECK_FAIL, ERROR_MESSAGES.INVALID_TYPE)).throw();
    
        Browser.notifications.create("", {
          iconUrl: Browser.runtime.getURL("logo192.png"),
          message,
          title,
          type,
        });
      }
}