import Browser from "webextension-polyfill";
import NotificationManager from "./platform";
import { isNullorUndef } from "../Utility/utility";
import {setUIdata, toggleSite} from "../Utility/redux_helper";
import { HTTP_END_POINTS, } from "../Constants";


//controller class for permission related methods
export class Controller {
    //maintain only single instance
    static instance = null

  constructor(store) {
    this.store = store;
    this.notificationManager = NotificationManager.getInstance(store);
  }

  static getInstance(store) {
    if(isNullorUndef(Controller.instance)) Controller.instance = new Controller(store)
    delete Controller.constructor
    return Controller.instance
  }

  //show extension notifications
  showNotification(message = "", title = "5ire", type = "basic") {
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