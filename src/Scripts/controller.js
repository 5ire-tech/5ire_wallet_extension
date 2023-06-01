import BigNumber from "bignumber.js";
import { isAlreadyConnected } from "./utils";
import { getDataLocal } from "../Storage/loadstore";
import { generateErrorMessage } from "../Helper/helper";
import { isEqual, isNullorUndef, log } from "../Utility/utility";
import { sendMessageToTab } from "../Utility/message_helper";
import { ExtensionStorageHandler } from "../Storage/loadstore";
import WindowManager, { NotificationAndBedgeManager } from "./platform";
import { ExternalAppsRequest, TabMessagePayload } from "../Utility/network_calls";
import {
  LABELS,
  DECIMALS,
  ERROR_MESSAGES,
  HTTP_END_POINTS,
  EVM_JSON_RPC_METHODS,
  STATE_CHANGE_ACTIONS,
  ROUTE_FOR_APPROVAL_WINDOWS
} from "../Constants";
import Browser from "webextension-polyfill";

//control the external connections and window popup creation
export class ExternalWindowControl {
  static instance = null;
  static isApproved = null;
  static currentPopup = null;

  constructor() {
    this.windowManager = WindowManager.getInstance(
      this._handleClose,
      this._handleCreate,
      this._handleWindowFocusChange,
      this._handleTabChange,
      this._handleTabUpdate
    );
    this.notificationAndBedgeHandler = NotificationAndBedgeManager.getInstance();
  }

  /**
   * get the class instance from builder function
   * @returns {ExtensionStorageHandler}
   */
  static getInstance = () => {
    if (!ExternalWindowControl.instance) {
      ExternalWindowControl.instance = new ExternalWindowControl();
      delete ExternalWindowControl.constructor;
    }
    return ExternalWindowControl.instance;
  };

  /**
   * add the new connection request into queue
   * @param {*} data
   * @param {*} state
   * @param {*} externalControlsState
   * @returns
   */
  newConnectionRequest = async (data, externalControlsState) => {
    const isOriginAlreadyExist = this._checkNewRequestOrigin(externalControlsState, data.origin);

    if (isOriginAlreadyExist) {
      sendMessageToTab(
        data.tabId,
        new TabMessagePayload(
          data.id,
          null,
          null,
          null,
          generateErrorMessage(data.method, data.origin)
        )
      );
      return;
    }

    //check if already connected or not
    if (isEqual(data.route, ROUTE_FOR_APPROVAL_WINDOWS.CONNECTION_ROUTE)) {
      const isAlreadyConnected = this._checkAlreadyConnected(externalControlsState, data.origin);
      if (isAlreadyConnected) return;
    }

    const newConnectionRequest = new ExternalAppsRequest(
      data.id,
      data.tabId,
      data.message,
      data.method,
      data.origin,
      data.route,
      null
    );
    await ExtensionStorageHandler.updateStorage(
      STATE_CHANGE_ACTIONS.ADD_NEW_CONNECTION_TASK,
      newConnectionRequest,
      { localStateKey: LABELS.EXTERNAL_CONTROLS }
    );

    //set the pending task icon on chrome extension
    await this._showPendingTaskBedge();

    //check if activeSession is null if yes then set the active session from pending queue
    if (!externalControlsState.activeSession) await this.changeActiveSession();
  };

  /**
   * change the active session
   */
  changeActiveSession = async () => {
    await ExtensionStorageHandler.updateStorage(
      STATE_CHANGE_ACTIONS.CHANGE_ACTIVE_SESSION,
      {},
      { localStateKey: LABELS.EXTERNAL_CONTROLS }
    );

    await this._showPendingTaskBedge();
    //show the popup after changing active session from pending queue
    const externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    // log("change the session: ", externalControlsState);
    if (externalControlsState.activeSession)
      await this.activatePopupSession(externalControlsState.activeSession);
  };

  /**
   * create and show the popup for current active session
   */
  activatePopupSession = async (activeSession) => {
    const popupId = await this.windowManager.showPopup(activeSession.route);
    ExternalWindowControl.currentPopup = popupId;
    await ExtensionStorageHandler.updateStorage(
      STATE_CHANGE_ACTIONS.UPDATE_CURRENT_SESSION,
      { popupId },
      { localStateKey: LABELS.EXTERNAL_CONTROLS }
    );
  };

  /**
   * close the popup of current active session
   */
  closeActiveSessionPopup = async () => {
    const externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    if (externalControlsState.activeSession?.popupId) {
      //check if there is any window opened with popupid
      const window = await this.windowManager.getWindowById(
        externalControlsState.activeSession.popupId
      );
      if (!window) {
        this._sendRejectAndCloseResponse(externalControlsState.activeSession);
        return;
      }

      //if window find then close the window
      await this.windowManager.closePopup(externalControlsState.activeSession.popupId);
    }
  };

  /*********************************** Internal methods ***********************************/

  /**
   * check if the currentSession and pending Tasks have the same origin or not
   * @param {*} externalControlsState
   * @param {*} origin
   */
  _checkNewRequestOrigin = (externalControlsState, origin) => {
    const inCurrent = isEqual(externalControlsState.activeSession?.origin, origin);
    const inPending = externalControlsState.connectionQueue.find((item) => item.origin === origin);

    return inPending || inCurrent;
  };

  _checkAlreadyConnected = (externalControls, origin) => {
    return externalControls.connectedApps[origin]?.isConnected;
  };

  /**
   * callback for window close event
   */
  _handleClose = async (windowId) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    this.windowManager.filterAndRemoveWindows(ExternalWindowControl.currentPopup, false);
    isEqual(windowId, ExternalWindowControl.currentPopup) &&
      this._sendRejectAndCloseResponse(activeSession);
  };

  /**
   * callback for window create event
   */
  _handleCreate = async (windowId) => {
    console.log(windowId);
  };

  /**
   * callback for window focus change
   */
  _handleWindowFocusChange = async (windowId) => {
    try {
      if (windowId !== -1) {
        const windowAndTabState = await getDataLocal(LABELS.WINDOW_AND_TAB_STATE);
        if (windowAndTabState.windowId !== windowId) {
          log("window id: ", windowId);

          const tab = await Browser.tabs.query({ active: true, windowId: windowId });
          const windowAndTabDetails = {
            windowId: windowId,
            tabDetails: {
              tabId: tab[0].id,
              url: tab[0]?.pendingUrl || tab[0].url,
              origin: new URL(tab[0]?.pendingUrl || tab[0].url).origin
            }
          };

          //save the tab details into local store
          await ExtensionStorageHandler.updateStorage(
            STATE_CHANGE_ACTIONS.SAVE_TAB_AND_WINDOW_STATE,
            windowAndTabDetails,
            { localStateKey: LABELS.WINDOW_AND_TAB_STATE }
          );
        }
      }
    } catch (err) {
      log("error while window focus change: ", err);
    }
  };

  /**
   * callback for tab change
   */
  _handleTabChange = async (changePayload) => {
    try {
      const windowAndTabState = await getDataLocal(LABELS.WINDOW_AND_TAB_STATE);
      if (
        windowAndTabState.tabDetails.tabId !== changePayload.tabId &&
        changePayload.tabId !== -1
      ) {
        log("change payload: ", changePayload);

        const tab = await Browser.tabs.get(changePayload.tabId);
        log("tab payload: ", tab);
        const windowAndTabDetails = {
          windowId: changePayload.windowId,
          tabDetails: {
            tabId: changePayload.tabId,
            url: tab?.pendingUrl || tab.url,
            origin: new URL(tab?.pendingUrl || tab.url).origin
          }
        };

        //save the tab details into local store
        await ExtensionStorageHandler.updateStorage(
          STATE_CHANGE_ACTIONS.SAVE_TAB_AND_WINDOW_STATE,
          windowAndTabDetails,
          { localStateKey: LABELS.WINDOW_AND_TAB_STATE }
        );
      }
    } catch (err) {
      log("error while tab changing: ", err.message);
    }
  };

  /**
   * callback for tab updation
   */
  _handleTabUpdate = async (tabId) => {
    try {
      const windowAndTabState = await getDataLocal(LABELS.WINDOW_AND_TAB_STATE);
      if (windowAndTabState.tabDetails.tabId === tabId) {
        const tab = await Browser.tabs.get(tabId);
        if (windowAndTabState.tabDetails.origin !== new URL(tab?.pendingUrl || tab.url).origin) {
          log("changed the url details: ");
          const windowAndTabDetails = {
            windowId: windowAndTabState.windowId,
            tabDetails: {
              tabId: tabId,
              url: tab?.pendingUrl || tab.url,
              origin: new URL(tab?.pendingUrl || tab.url).origin
            }
          };

          //save the tab details into local store
          await ExtensionStorageHandler.updateStorage(
            STATE_CHANGE_ACTIONS.SAVE_TAB_AND_WINDOW_STATE,
            windowAndTabDetails,
            { localStateKey: LABELS.WINDOW_AND_TAB_STATE }
          );
        }
      }
    } catch (err) {
      log("error while tab status updation: ", err.message);
    }
  };

  /**
   * for sending the reject or close response to user
   * @param {*} activeSession
   */
  _sendRejectAndCloseResponse = async (activeSession) => {
    //check if window is closed by close button
    if (
      isNullorUndef(ExternalWindowControl.isApproved) ||
      isEqual(ExternalWindowControl.isApproved, false)
    ) {
      activeSession?.tabId &&
        sendMessageToTab(
          activeSession?.tabId,
          new TabMessagePayload(
            activeSession.id,
            { result: null },
            null,
            null,
            ERROR_MESSAGES.REJECTED_BY_USER
          )
        );
    }

    //set the approve to null for next session
    ExternalWindowControl.isApproved = null;
    ExternalWindowControl.currentPopup = null;

    //change the current popup session
    await this.changeActiveSession();
    await this._showPendingTaskBedge();
  };

  /**
   * show the bedge
   */
  _showPendingTaskBedge = async (externalControlsState = null) => {
    if (!externalControlsState)
      externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //check if there is any pending task if found then show the pending task count in bedge
    let pendingTaskCount = externalControlsState.connectionQueue.length;
    externalControlsState.activeSession && pendingTaskCount++;
    this.notificationAndBedgeHandler.showBedge(pendingTaskCount);
  };
}

//handle the interaction with external dapps and websites
export class ExternalConnection {
  static instance = null;

  constructor() {
    this.externalWindowController = ExternalWindowControl.getInstance();
  }

  //get only singal object
  static getInstance = () => {
    if (!ExternalConnection.instance) {
      ExternalConnection.instance = new ExternalConnection();
      delete ExternalConnection.constructor;
    }
    return ExternalConnection.instance;
  };

  //add the dapp or website to connected list after approval
  async handleConnect(data, state) {
    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    const account = state.currentAccount;
    const isEthReq =
      isEqual(data?.method, EVM_JSON_RPC_METHODS.ETH_REQUEST_ACCOUNT) ||
      isEqual(data?.method, EVM_JSON_RPC_METHODS.ETH_ACCOUNTS);

    const isConnected = isAlreadyConnected(externalControls.connectedApps, data.origin);

    if (isConnected) {
      const res = isEthReq
        ? { method: data?.method, result: [account.evmAddress] }
        : {
            result: {
              evmAddress: account.evmAddress,
              nativeAddress: account.nativeAddress
            }
          };

      //send the message to requester tab
      sendMessageToTab(data.tabId, new TabMessagePayload(data.id, res, data?.method));
    } else {
      await this.externalWindowController.newConnectionRequest(
        { route: ROUTE_FOR_APPROVAL_WINDOWS.CONNECTION_ROUTE, ...data },
        externalControls
      );
    }
  }

  //handle the evm related transactions
  async handleEthTransaction(data, state) {
    //check if the from account is our current account
    if (
      !isEqual(state.currentAccount.evmAddress?.toLowerCase(), data.message?.from?.toLowerCase())
    ) {
      sendMessageToTab(
        data.tabId,
        new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.ACCOUNT_ACCESS_NOT_GRANTED)
      );
      return;
    }

    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //We are divding this value from 18 units to simple integer its handled internally in evmTransfer method
    if (data?.message?.value) {
      const amt = BigNumber(Number(data.message.value)).dividedBy(DECIMALS).toString();

      //invalid amount check
      if (Number(amt) < 0 || isNaN(amt)) {
        sendMessageToTab(
          data.tabId,
          new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.INVALID_AMOUNT)
        );
        return;
      }

      //check the data or to field
      if (isNullorUndef(data.message?.data) && isNullorUndef(data.message?.to)) {
        sendMessageToTab(
          data.tabId,
          new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.AMOUNT_DATA_CHECK)
        );
        return;
      }

      data.message.value = Number(amt).noExponents();
    } else data.message["value"] = "0";

    await this.externalWindowController.newConnectionRequest(
      { route: ROUTE_FOR_APPROVAL_WINDOWS.APPROVE_TX, ...data },
      externalControls
    );
  }

  //handle the validator and nominator related transactions
  async handleValidatorNominatorTransactions(data) {
    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    await this.externalWindowController.newConnectionRequest(
      { route: ROUTE_FOR_APPROVAL_WINDOWS.VALIDATOR_NOMINATOR_TXN, ...data },
      externalControls
    );
  }

  //handle the signing of native transaction
  async handleNativeSigner(data) {
    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    await this.externalWindowController.newConnectionRequest(
      { route: ROUTE_FOR_APPROVAL_WINDOWS.NATIVE_TX, ...data },
      externalControls
    );
  }

  //inject the current net endpoint to injected global
  async sendEndPoint(data, state) {
    try {
      if (data?.tabId) {
        //pass the current network http endpoint
        sendMessageToTab(
          data.tabId,
          new TabMessagePayload(
            data.id,
            { result: HTTP_END_POINTS[state.currentNetwork.toUpperCase()] },
            data.method
          )
        );
      }
    } catch (err) {
      console.log("Error while sending the endpoint: ", err);
    }
  }

  //handle the Disconnection
  async handleDisconnect(data) {
    //disconnect the app
    await ExtensionStorageHandler.updateStorage(
      STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE,
      { connected: false, origin: data.origin },
      { localStateKey: LABELS.EXTERNAL_CONTROLS }
    );
    sendMessageToTab(data.tabId, new TabMessagePayload(data.id, { result: null }), data.method);
  }
}
