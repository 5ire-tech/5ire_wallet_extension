"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExternalWindowControl = exports.ExternalConnection = void 0;
var _bignumber = _interopRequireDefault(require("bignumber.js"));
var _utils = require("./utils");
var _loadstore = require("../Storage/loadstore");
var _helper = require("../Helper/helper");
var _utility = require("../Utility/utility");
var _message_helper = require("../Utility/message_helper");
var _platform = _interopRequireWildcard(require("./platform"));
var _network_calls = require("../Utility/network_calls");
var _Constants = require("../Constants");
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//control the external connections and window popup creation
class ExternalWindowControl {
  constructor() {
    var _this = this;
    /**
     * add the new connection request into queue
     * @param {*} data
     * @param {*} state
     * @param {*} externalControlsState
     * @returns
     */
    _defineProperty(this, "newConnectionRequest", async (data, externalControlsState) => {
      const isOriginAlreadyExist = this._checkNewRequestOrigin(externalControlsState, data.origin);
      if (isOriginAlreadyExist) {
        (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, null, null, null, (0, _helper.generateErrorMessage)(data.method, data.origin)));
        return;
      }

      //check if already connected or not
      if ((0, _utility.isEqual)(data.route, _Constants.ROUTE_FOR_APPROVAL_WINDOWS.CONNECTION_ROUTE)) {
        const isAlreadyConnected = this._checkAlreadyConnected(externalControlsState, data.origin);
        if (isAlreadyConnected) return;
      }
      const newConnectionRequest = new _network_calls.ExternalAppsRequest(data.id, data.tabId, data.message, data.method, data.origin, data.route, null);
      await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.ADD_NEW_CONNECTION_TASK, newConnectionRequest, {
        localStateKey: _Constants.LABELS.EXTERNAL_CONTROLS
      });

      //set the pending task icon on chrome extension
      await this._showPendingTaskBedge();

      //check if activeSession is null if yes then set the active session from pending queue
      if (!externalControlsState.activeSession) await this.changeActiveSession();
    });
    /**
     * change the active session
     */
    _defineProperty(this, "changeActiveSession", async () => {
      await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.CHANGE_ACTIVE_SESSION, {}, {
        localStateKey: _Constants.LABELS.EXTERNAL_CONTROLS
      });
      await this._showPendingTaskBedge();
      //show the popup after changing active session from pending queue
      const externalControlsState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
      // log("change the session: ", externalControlsState);
      if (externalControlsState.activeSession) await this.activatePopupSession(externalControlsState.activeSession);
    });
    /**
     * create and show the popup for current active session
     */
    _defineProperty(this, "activatePopupSession", async activeSession => {
      const popupId = await this.windowManager.showPopup(activeSession.route);
      ExternalWindowControl.currentPopup = popupId;
      await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.UPDATE_CURRENT_SESSION, {
        popupId
      }, {
        localStateKey: _Constants.LABELS.EXTERNAL_CONTROLS
      });
    });
    /**
     * close the popup of current active session
     */
    _defineProperty(this, "closeActiveSessionPopup", async () => {
      var _externalControlsStat;
      const externalControlsState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
      if ((_externalControlsStat = externalControlsState.activeSession) !== null && _externalControlsStat !== void 0 && _externalControlsStat.popupId) {
        //check if there is any window opened with popupid
        const window = await this.windowManager.getWindowById(externalControlsState.activeSession.popupId);
        if (!window) {
          this._sendRejectAndCloseResponse(externalControlsState.activeSession);
          return;
        }

        //if window find then close the window
        await this.windowManager.closePopup(externalControlsState.activeSession.popupId);
      }
    });
    /*********************************** Internal methods ***********************************/
    /**
     * check if the currentSession and pending Tasks have the same origin or not
     * @param {*} externalControlsState
     * @param {*} origin
     */
    _defineProperty(this, "_checkNewRequestOrigin", (externalControlsState, origin) => {
      var _externalControlsStat2;
      const inCurrent = (0, _utility.isEqual)((_externalControlsStat2 = externalControlsState.activeSession) === null || _externalControlsStat2 === void 0 ? void 0 : _externalControlsStat2.origin, origin);
      const inPending = externalControlsState.connectionQueue.find(item => item.origin === origin);
      return inPending || inCurrent;
    });
    _defineProperty(this, "_checkAlreadyConnected", (externalControls, origin) => {
      var _externalControls$con;
      return (_externalControls$con = externalControls.connectedApps[origin]) === null || _externalControls$con === void 0 ? void 0 : _externalControls$con.isConnected;
    });
    /**
     * callback for window close event
     */
    _defineProperty(this, "_handleClose", async windowId => {
      const {
        activeSession
      } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
      this.windowManager.filterAndRemoveWindows(ExternalWindowControl.currentPopup, false);
      (0, _utility.isEqual)(windowId, ExternalWindowControl.currentPopup) && this._sendRejectAndCloseResponse(activeSession);
    });
    /**
     * callback for window create event
     */
    _defineProperty(this, "_handleCreate", async windowId => {
      console.log(windowId);
    });
    /**
     * callback for window focus change
     */
    _defineProperty(this, "_handleWindowFocusChange", async windowId => {
      try {
        if (windowId !== -1) {
          const windowAndTabState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.WINDOW_AND_TAB_STATE);
          if (windowAndTabState.windowId !== windowId) {
            var _tab$, _tab$2;
            (0, _utility.log)("window id: ", windowId);
            const tab = await _webextensionPolyfill.default.tabs.query({
              active: true,
              windowId: windowId
            });
            const windowAndTabDetails = {
              windowId: windowId,
              tabDetails: {
                tabId: tab[0].id,
                url: ((_tab$ = tab[0]) === null || _tab$ === void 0 ? void 0 : _tab$.pendingUrl) || tab[0].url,
                origin: new URL(((_tab$2 = tab[0]) === null || _tab$2 === void 0 ? void 0 : _tab$2.pendingUrl) || tab[0].url).origin
              }
            };

            //save the tab details into local store
            await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.SAVE_TAB_AND_WINDOW_STATE, windowAndTabDetails, {
              localStateKey: _Constants.LABELS.WINDOW_AND_TAB_STATE
            });
          }
        }
      } catch (err) {
        (0, _utility.log)("error while window focus change: ", err);
      }
    });
    /**
     * callback for tab change
     */
    _defineProperty(this, "_handleTabChange", async changePayload => {
      try {
        const windowAndTabState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.WINDOW_AND_TAB_STATE);
        if (windowAndTabState.tabDetails.tabId !== changePayload.tabId && changePayload.tabId !== -1) {
          (0, _utility.log)("change payload: ", changePayload);
          const tab = await _webextensionPolyfill.default.tabs.get(changePayload.tabId);
          (0, _utility.log)("tab payload: ", tab);
          const windowAndTabDetails = {
            windowId: changePayload.windowId,
            tabDetails: {
              tabId: changePayload.tabId,
              url: (tab === null || tab === void 0 ? void 0 : tab.pendingUrl) || tab.url,
              origin: new URL((tab === null || tab === void 0 ? void 0 : tab.pendingUrl) || tab.url).origin
            }
          };

          //save the tab details into local store
          await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.SAVE_TAB_AND_WINDOW_STATE, windowAndTabDetails, {
            localStateKey: _Constants.LABELS.WINDOW_AND_TAB_STATE
          });
        }
      } catch (err) {
        (0, _utility.log)("error while tab changing: ", err.message);
      }
    });
    /**
     * callback for tab updation
     */
    _defineProperty(this, "_handleTabUpdate", async tabId => {
      try {
        const windowAndTabState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.WINDOW_AND_TAB_STATE);
        if (windowAndTabState.tabDetails.tabId === tabId) {
          const tab = await _webextensionPolyfill.default.tabs.get(tabId);
          if (windowAndTabState.tabDetails.origin !== new URL((tab === null || tab === void 0 ? void 0 : tab.pendingUrl) || tab.url).origin) {
            (0, _utility.log)("changed the url details: ");
            const windowAndTabDetails = {
              windowId: windowAndTabState.windowId,
              tabDetails: {
                tabId: tabId,
                url: (tab === null || tab === void 0 ? void 0 : tab.pendingUrl) || tab.url,
                origin: new URL((tab === null || tab === void 0 ? void 0 : tab.pendingUrl) || tab.url).origin
              }
            };

            //save the tab details into local store
            await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.SAVE_TAB_AND_WINDOW_STATE, windowAndTabDetails, {
              localStateKey: _Constants.LABELS.WINDOW_AND_TAB_STATE
            });
          }
        }
      } catch (err) {
        (0, _utility.log)("error while tab status updation: ", err.message);
      }
    });
    /**
     * for sending the reject or close response to user
     * @param {*} activeSession
     */
    _defineProperty(this, "_sendRejectAndCloseResponse", async activeSession => {
      //check if window is closed by close button
      if ((0, _utility.isNullorUndef)(ExternalWindowControl.isApproved) || (0, _utility.isEqual)(ExternalWindowControl.isApproved, false)) {
        (activeSession === null || activeSession === void 0 ? void 0 : activeSession.tabId) && (0, _message_helper.sendMessageToTab)(activeSession === null || activeSession === void 0 ? void 0 : activeSession.tabId, new _network_calls.TabMessagePayload(activeSession.id, {
          result: null
        }, null, null, _Constants.ERROR_MESSAGES.REJECTED_BY_USER));
      }

      //set the approve to null for next session
      ExternalWindowControl.isApproved = null;
      ExternalWindowControl.currentPopup = null;

      //change the current popup session
      await this.changeActiveSession();
      await this._showPendingTaskBedge();
    });
    /**
     * show the bedge
     */
    _defineProperty(this, "_showPendingTaskBedge", async function () {
      let externalControlsState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!externalControlsState) externalControlsState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);

      //check if there is any pending task if found then show the pending task count in bedge
      let pendingTaskCount = externalControlsState.connectionQueue.length;
      externalControlsState.activeSession && pendingTaskCount++;
      _this.notificationAndBedgeHandler.showBedge(pendingTaskCount);
    });
    this.windowManager = _platform.default.getInstance(this._handleClose, this._handleCreate, this._handleWindowFocusChange, this._handleTabChange, this._handleTabUpdate);
    this.notificationAndBedgeHandler = _platform.NotificationAndBedgeManager.getInstance();
  }

  /**
   * get the class instance from builder function
   * @returns {ExtensionStorageHandler}
   */
}

//handle the interaction with external dapps and websites
exports.ExternalWindowControl = ExternalWindowControl;
_defineProperty(ExternalWindowControl, "instance", null);
_defineProperty(ExternalWindowControl, "isApproved", null);
_defineProperty(ExternalWindowControl, "currentPopup", null);
_defineProperty(ExternalWindowControl, "getInstance", () => {
  if (!ExternalWindowControl.instance) {
    ExternalWindowControl.instance = new ExternalWindowControl();
    delete ExternalWindowControl.constructor;
  }
  return ExternalWindowControl.instance;
});
class ExternalConnection {
  constructor() {
    this.externalWindowController = ExternalWindowControl.getInstance();
  }

  //get only singal object

  //add the dapp or website to connected list after approval
  async handleConnect(data, state) {
    const externalControls = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
    const account = state.currentAccount;
    const isEthReq = (0, _utility.isEqual)(data === null || data === void 0 ? void 0 : data.method, _Constants.EVM_JSON_RPC_METHODS.ETH_REQUEST_ACCOUNT) || (0, _utility.isEqual)(data === null || data === void 0 ? void 0 : data.method, _Constants.EVM_JSON_RPC_METHODS.ETH_ACCOUNTS);
    const isConnected = (0, _utils.isAlreadyConnected)(externalControls.connectedApps, data.origin);
    if (isConnected) {
      const res = isEthReq ? {
        method: data === null || data === void 0 ? void 0 : data.method,
        result: [account.evmAddress]
      } : {
        result: {
          evmAddress: account.evmAddress,
          nativeAddress: account.nativeAddress
        }
      };

      //send the message to requester tab
      (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, res, data === null || data === void 0 ? void 0 : data.method));
    } else {
      await this.externalWindowController.newConnectionRequest({
        route: _Constants.ROUTE_FOR_APPROVAL_WINDOWS.CONNECTION_ROUTE,
        ...data
      }, externalControls);
    }
  }

  //handle the evm related transactions
  async handleEthTransaction(data, state) {
    var _state$currentAccount, _data$message, _data$message$from, _data$message2;
    //check if the from account is our current account
    if (!(0, _utility.isEqual)((_state$currentAccount = state.currentAccount.evmAddress) === null || _state$currentAccount === void 0 ? void 0 : _state$currentAccount.toLowerCase(), (_data$message = data.message) === null || _data$message === void 0 ? void 0 : (_data$message$from = _data$message.from) === null || _data$message$from === void 0 ? void 0 : _data$message$from.toLowerCase())) {
      (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, null, null, null, _Constants.ERROR_MESSAGES.ACCOUNT_ACCESS_NOT_GRANTED));
      return;
    }
    const externalControls = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);

    //We are divding this value from 18 units to simple integer its handled internally in evmTransfer method
    if (data !== null && data !== void 0 && (_data$message2 = data.message) !== null && _data$message2 !== void 0 && _data$message2.value) {
      var _data$message3, _data$message4;
      const amt = (0, _bignumber.default)(Number(data.message.value)).dividedBy(_Constants.DECIMALS).toString();

      //invalid amount check
      if (Number(amt) < 0 || isNaN(amt)) {
        (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, null, null, null, _Constants.ERROR_MESSAGES.INVALID_AMOUNT));
        return;
      }

      //check the data or to field
      if ((0, _utility.isNullorUndef)((_data$message3 = data.message) === null || _data$message3 === void 0 ? void 0 : _data$message3.data) && (0, _utility.isNullorUndef)((_data$message4 = data.message) === null || _data$message4 === void 0 ? void 0 : _data$message4.to)) {
        (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, null, null, null, _Constants.ERROR_MESSAGES.AMOUNT_DATA_CHECK));
        return;
      }
      data.message.value = Number(amt).noExponents();
    } else data.message["value"] = "0";
    await this.externalWindowController.newConnectionRequest({
      route: _Constants.ROUTE_FOR_APPROVAL_WINDOWS.APPROVE_TX,
      ...data
    }, externalControls);
  }

  //handle the validator and nominator related transactions
  async handleValidatorNominatorTransactions(data) {
    const externalControls = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
    await this.externalWindowController.newConnectionRequest({
      route: _Constants.ROUTE_FOR_APPROVAL_WINDOWS.VALIDATOR_NOMINATOR_TXN,
      ...data
    }, externalControls);
  }

  //handle the signing of native transaction
  async handleNativeSigner(data) {
    const externalControls = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
    await this.externalWindowController.newConnectionRequest({
      route: _Constants.ROUTE_FOR_APPROVAL_WINDOWS.NATIVE_TX,
      ...data
    }, externalControls);
  }

  //inject the current net endpoint to injected global
  async sendEndPoint(data, state) {
    try {
      if (data !== null && data !== void 0 && data.tabId) {
        //pass the current network http endpoint
        (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, {
          result: _Constants.HTTP_END_POINTS[state.currentNetwork.toUpperCase()]
        }, data.method));
      }
    } catch (err) {
      console.log("Error while sending the endpoint: ", err);
    }
  }

  //handle the Disconnection
  async handleDisconnect(data) {
    //disconnect the app
    await _loadstore.ExtensionStorageHandler.updateStorage(_Constants.STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE, {
      connected: false,
      origin: data.origin
    }, {
      localStateKey: _Constants.LABELS.EXTERNAL_CONTROLS
    });
    (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, {
      result: null
    }), data.method);
  }
}
exports.ExternalConnection = ExternalConnection;
_defineProperty(ExternalConnection, "instance", null);
_defineProperty(ExternalConnection, "getInstance", () => {
  if (!ExternalConnection.instance) {
    ExternalConnection.instance = new ExternalConnection();
    delete ExternalConnection.constructor;
  }
  return ExternalConnection.instance;
});