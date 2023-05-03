import { ExtensionStorageHandler } from "../Storage/loadstore";
import WindowManager, { NotificationAndBedgeManager } from "./platform";
import { ExternalAppsRequest, TabMessagePayload } from "../Utility/network_calls";
import { isEqual, log, isNullorUndef } from "../Utility/utility";
import { EVM_JSON_RPC_METHODS, HTTP_END_POINTS, LABELS, ROUTE_FOR_APPROVAL_WINDOWS, STATE_CHANGE_ACTIONS, ERROR_MESSAGES, SUCCESS_MESSAGES, DECIMALS } from "../Constants";
import { getDataLocal } from "../Storage/loadstore";
import { sendMessageToTab } from "../Utility/message_helper";
import { isAlreadyConnected } from "./utils";
import { generateErrorMessage } from "../Helper/helper";
import BigNumber from "bignumber.js";
import { ROUTES } from "../Routes";


//control the external connections and window popup creation
export class ExternalWindowControl {

  static instance = null;
  static isApproved = null;

  constructor() {
    this.windowManager = WindowManager.getInstance(this._handleClose, this._handleCreate);
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
    return ExternalWindowControl.instance
  }


  /**
   * add the new connection request into queue
   * @param {*} data 
   * @param {*} state 
   * @param {*} externalControlsState 
   * @returns
   */
  newConnectionRequest = async (data, externalControlsState) => {

    const isOriginAlreadyExist = this._checkNewRequestOrigin(externalControlsState, data.origin);

    //check if already connected or not
    if (isEqual(data.route, ROUTE_FOR_APPROVAL_WINDOWS.CONNECTION_ROUTE)) {
      const isAlreadyConnected = this._checkAlreadyConnected(externalControlsState, data.origin);
      if (isAlreadyConnected) return;
    }

    if (isOriginAlreadyExist) {
      sendMessageToTab(data.tabId, new TabMessagePayload(data.id, null, null, null, generateErrorMessage(data.method, data.origin)));
      return;
    }

    const newConnectionRequest = new ExternalAppsRequest(data.id, data.tabId, data.message, data.method, data.origin, data.route, null);
    await ExtensionStorageHandler.updateStorage(STATE_CHANGE_ACTIONS.ADD_NEW_CONNECTION_TASK, newConnectionRequest, { localStateKey: LABELS.EXTERNAL_CONTROLS })

    //set the pending task icon on chrome extension
    await this._showPendingTaskBedge();

    //check if activeSession is null if yes then set the active session from pending queue
    if (!externalControlsState.activeSession) await this.changeActiveSession();
  }


  /**
   * change the active session
   */
  changeActiveSession = async () => {
    await ExtensionStorageHandler.updateStorage(STATE_CHANGE_ACTIONS.CHANGE_ACTIVE_SESSION, {}, { localStateKey: LABELS.EXTERNAL_CONTROLS })
    // this.closeActiveSessionPopup();

    await this._showPendingTaskBedge()
    //show the popup after changing active session from pending queue
    const externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    // log("change the session: ", externalControlsState);
    externalControlsState.activeSession && this.activatePopupSession(externalControlsState.activeSession);
  }

  /**
   * create and show the popup for current active session
   */
  activatePopupSession = async (activeSession) => {
    const popupId = await this.windowManager.showPopup(activeSession.route);
    await ExtensionStorageHandler.updateStorage(STATE_CHANGE_ACTIONS.UPDATE_CURRENT_SESSION, {popupId}, {localStateKey: LABELS.EXTERNAL_CONTROLS})
    log("popupid: ", popupId)
  }

  /**
   * close the popup of current active session
   */
  closeActiveSessionPopup = async () => {
    const externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    if (externalControlsState.activeSession?.popupId) {
      //set the pending task icon on chrome extension

      await this._showPendingTaskBedge()

      //check if there is any window opened with popupid
      const window = await this.windowManager.getWindowById(externalControlsState.activeSession.popupId);
      if (!window) {
        this._sendRejectAndCloseResponse(externalControlsState.activeSession);
        return;
      }

      //if window find then close the window
      await this.windowManager.closePopup(externalControlsState.activeSession.popupId);
    }

  }

  /*********************************** Internal methods ***********************************/

  /**
   * check if the currentSession and pending Tasks have the same origin or not
   * @param {*} externalControlsState 
   * @param {*} origin 
   */
  _checkNewRequestOrigin = (externalControlsState, origin) => {
    const inCurrent = isEqual(externalControlsState.activeSession?.origin, origin)
    const inPending = externalControlsState.connectionQueue.find(item => item.origin === origin);

    return inPending || inCurrent
  }


  _checkAlreadyConnected = (externalControls, origin) => {
    return externalControls.connectedApps[origin]?.isConnected;
  }

  /**
   * callback for window close event
   */
  _handleClose = async (windowId) => {

    const {activeSession} = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    await this.windowManager.filterAndRemoveWindows(null, true);

    if(!isEqual(activeSession?.popupId, windowId)) {
      log("not match the current task: ", activeSession?.popupId, windowId);
      return;
    }
    
    this._sendRejectAndCloseResponse(activeSession);
  }

/**
 * callback for window create event
 */
  _handleCreate = async (windowId) => {
  }

  /**
   * for sending the reject or close response to user
   * @param {*} activeSession 
   */
  _sendRejectAndCloseResponse = async (activeSession) => {

    log("here is status: ", ExternalWindowControl.isApproved);

        //check if window is closed by close button
        if(isNullorUndef(ExternalWindowControl.isApproved) || isEqual(ExternalWindowControl.isApproved, false)) {
          activeSession?.tabId && sendMessageToTab(activeSession?.tabId, new TabMessagePayload(activeSession.id, {result: null}, null, null, ERROR_MESSAGES.REJECTED_BY_USER))
        }
    
        
       //set the approve to null for next session
       ExternalWindowControl.isApproved = null;
        //change the current popup session
        await this.changeActiveSession();
        await this._showPendingTaskBedge();
  }

  /**
   * show the bedge
   */
  _showPendingTaskBedge = async (externalControlsState=null) => {
    if(!externalControlsState) externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    // log("here is pending task: ", externalControlsState.activeSession)

    //check if there is any pending task if found then show the pending task count in bedge
    let pendingTaskCount = externalControlsState.connectionQueue.length;
    externalControlsState.activeSession && pendingTaskCount++;
    this.notificationAndBedgeHandler.showBedge(pendingTaskCount);
  }
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
    return ExternalConnection.instance
  }


  //add the dapp or website to connected list after approval
  async handleConnect(data, state) {
    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    const account = state.currentAccount;
    const isEthReq = isEqual(data?.method, EVM_JSON_RPC_METHODS.ETH_REQUEST_ACCOUNT) || isEqual(data?.method, EVM_JSON_RPC_METHODS.ETH_ACCOUNTS);

    const isConnected = isAlreadyConnected(externalControls.connectedApps, data.origin)

    if (isConnected) {
      const res = isEthReq ? { method: data?.method, result: [account.evmAddress] }
        : {
          result: {
            evmAddress: account.evmAddress,
            nativeAddress: account.nativeAddress,
          }
        };

      //send the message to requester tab
      sendMessageToTab(data.tabId, new TabMessagePayload(data.id, res));

    } else {
      await this.externalWindowController.newConnectionRequest({ route: ROUTE_FOR_APPROVAL_WINDOWS.CONNECTION_ROUTE, ...data }, externalControls);
    }

  }

  //handle the evm related transactions
  async handleEthTransaction(data, state) {

    //check if the from account is our current account
    if (!isEqual(state.currentAccount.evmAddress?.toLowerCase(), data.message?.from)) {
      sendMessageToTab(data.tabId, new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.ACCOUNT_ACCESS_NOT_GRANTED));
      return;
    }

    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //We are divding this value from 18 units to simple integer its handled internally in evmTransfer method
    if (data?.message?.value) {
      const amt = BigNumber(Number(data.message.value)).dividedBy(DECIMALS).toString();
      data.message.value = Number(amt).noExponents()
    }
    await this.externalWindowController.newConnectionRequest({ route: ROUTE_FOR_APPROVAL_WINDOWS.APPROVE_TX, ...data }, externalControls);

  }



  //handle the validator and nominator related transactions
  async handleValidatorNominatorTransactions(data, state) {
    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    await this.externalWindowController.newConnectionRequest({ route: ROUTE_FOR_APPROVAL_WINDOWS.VALIDATOR_NOMINATOR_TXN, ...data }, externalControls);
  }

  //handle the signing of native transaction
  async handleNativeSigner(data, state) {
    const externalControls = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    await this.externalWindowController.newConnectionRequest({ route: ROUTE_FOR_APPROVAL_WINDOWS.NATIVE_TX, ...data }, externalControls);
  }


  //inject the current net endpoint to injected global
  async sendEndPoint(data, state) {
    try {

      if (data?.tabId) {
        //pass the current network http endpoint
        sendMessageToTab(data.tabId, new TabMessagePayload(data.id, { result: HTTP_END_POINTS[state.currentNetwork.toUpperCase()] }))
      }
    } catch (err) {
      console.log("Error while sending the endpoint: ", err);
    }
  }


  //handle the Disconnection
  async handleDisconnect(data) {
    //disconnect the app
    await ExtensionStorageHandler.updateStorage(STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE, { connected: false, origin: data.origin }, { localStateKey: LABELS.EXTERNAL_CONTROLS });
    sendMessageToTab(data.tabId, new TabMessagePayload(data.id, { result: [] }));
  }
}