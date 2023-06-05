"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransactionsRPC = exports.Services = exports.NetworkHandler = exports.NativeSigner = exports.KeyringHandler = exports.InitBackground = exports.GeneralWalletRPC = exports.ExtensionEventHandle = void 0;
var _web = _interopRequireDefault(require("web3"));
var _bignumber = require("bignumber.js");
var _util = require("@polkadot/util");
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _eventemitter = require("./eventemitter");
var _types = require("@polkadot/types");
var _ireKeyring = require("./5ire-keyring");
var _utils = require("./utils");
var _nativehelper = _interopRequireDefault(require("./nativehelper"));
var _network_calls = require("../Utility/network_calls");
var _connection = require("../Helper/connection.helper");
var _platform = require("./platform");
var _error_helper = require("../Utility/error_helper");
var _index = _interopRequireDefault(require("./extension-port-stream-mod/index"));
var _controller = require("./controller");
var _loadstore = require("../Storage/loadstore");
var _message_helper = require("../Utility/message_helper");
var _helper = require("../Helper/helper");
var _Constants = require("../Constants");
var _utility = require("../Utility/utility");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let tester = 0;

//for initilization of background events
class InitBackground {
  constructor() {
    /****************** Inject the script into current active tabs ******************/
    //inject the script on current webpage
    _defineProperty(this, "injectScriptInTab", async () => {
      try {
        await _webextensionPolyfill.default.scripting.registerContentScripts([{
          id: "inpage",
          matches: ["http://*/*", "https://*/*"],
          js: ["./static/js/injected.js"],
          runAt: "document_start",
          world: "MAIN"
        }]);
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
    });
    /****************** Events Bindings ******************/
    //bind all events
    _defineProperty(this, "bindAllEvents", () => {
      this.bindStreamEventAndCreateStreams();
      this.bindInstallandUpdateEvents();
      this.bindExtensionUnmountEvents();
      this.bindBackgroundStartupEvents();
    });
    //bind the runtime message events
    _defineProperty(this, "bindStreamEventAndCreateStreams", async () => {
      /**
       * create the duplex stream for bi-directional communication
       * currently only added the streams for extension-ui and content-scirpt
       * communication
       */
      _webextensionPolyfill.default.runtime.onConnect.addListener(async port => {
        // console.log("stream connection: ", port);
        if ((0, _utility.isEqual)(port.name, _Constants.STREAM_CHANNELS.CONTENTSCRIPT)) {
          InitBackground.backgroundStream = new _index.default(port);
          //bind the stream data event for getting the messages from content-script
          InitBackground.backgroundStream.on("data", externalEventStream);
        } else if ((0, _utility.isEqual)(port.name, _Constants.STREAM_CHANNELS.EXTENSION_UI)) {
          InitBackground.uiStream = new _index.default(port);
          //bind the stream data event for getting the message from extension-ui
          InitBackground.uiStream.on("data", internalEventStream);
          ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.CONNECTION);
        }

        //port disconnect event
        port.onDisconnect.addListener(port => {
          if ((0, _utility.isEqual)(port.name, _Constants.STREAM_CHANNELS.CONTENTSCRIPT)) InitBackground.backgroundStream = null;else if ((0, _utility.isEqual)(port.name, _Constants.STREAM_CHANNELS.EXTENSION_UI)) InitBackground.uiStream = null;
        });
      });

      //callbacks for binding messages with stream data event
      //for external streamed messages
      const externalEventStream = async _ref => {
        let {
          message,
          sender
        } = _ref;
        const localData = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
        try {
          var _sender$tab;
          //check if message is array or onject
          message.message = (0, _utility.hasLength)(message.message) ? message.message[0] : message.message;

          //data for futher proceeding
          const data = {
            ...message,
            //for firefox and chrome tab origin
            origin: (sender === null || sender === void 0 ? void 0 : sender.origin) || new URL(sender === null || sender === void 0 ? void 0 : sender.url).origin,
            tabId: (_sender$tab = sender.tab) === null || _sender$tab === void 0 ? void 0 : _sender$tab.id
          };

          // console.log("external message: ", message, data);
          //check if the app has the permission to access requested method
          if (!(0, _helper.checkStringInclusionIntoArray)(data === null || data === void 0 ? void 0 : data.method)) {
            const {
              connectedApps
            } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
            const isHasAccess = connectedApps[data.origin];
            if (!(isHasAccess !== null && isHasAccess !== void 0 && isHasAccess.isConnected)) {
              (data === null || data === void 0 ? void 0 : data.tabId) && (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.id, null, null, null, _Constants.ERROR_MESSAGES.ACCESS_NOT_GRANTED));
              return;
            }
          }

          //checks for event from injected script
          switch (data.method) {
            case _Constants.CONNECTION_METHODS.CONNECT:
            case _Constants.CONNECTION_METHODS.ETH_REQUEST_ACCOUNTS:
            case _Constants.CONNECTION_METHODS.ETH_ACCOUNTS:
              await this.internalHandler.handleConnect(data, localData);
              break;
            case _Constants.WALLET_METHODS.DISCONNECT:
              await this.internalHandler.handleDisconnect(data, localData);
              break;
            case _Constants.RESTRICTED_ETHEREUM_METHODS.ETH_SEND_TRANSACTION:
              await this.internalHandler.handleEthTransaction(data, localData);
              break;
            case _Constants.WALLET_METHODS.GET_END_POINT:
              await this.internalHandler.sendEndPoint(data, localData);
              break;
            case _Constants.SIGNER_METHODS.SIGN_PAYLOAD:
            case _Constants.SIGNER_METHODS.SIGN_RAW:
              await this.internalHandler.handleNativeSigner(data);
              break;
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
            case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
              await this.internalHandler.handleValidatorNominatorTransactions(data);
              break;
            default:
              (data === null || data === void 0 ? void 0 : data.tabId) && (0, _message_helper.sendMessageToTab)(data.tabId, new _network_calls.TabMessagePayload(data.message.id, null, null, null, _Constants.ERROR_MESSAGES.INVALID_METHOD));
          }
        } catch (err) {
          (0, _utility.log)("error in externalEventStream : ", err);
          ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.RUNTIME_MESSAGE_SECTION_ERROR, err.message));
        }
      };

      // for internal extension streamed messages
      /**
       * not using currently but used when we replace the message passing
       * with long-live stream conenction
       */
      const internalEventStream = async _ref2 => {
        let {
          message
        } = _ref2;
        const localData = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);

        //checks for event from extension ui
        if ((0, _utility.isEqual)(message === null || message === void 0 ? void 0 : message.type, _Constants.MESSAGE_TYPE_LABELS.INTERNAL_TX) || (0, _utility.isEqual)(message === null || message === void 0 ? void 0 : message.type, _Constants.MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);else if ((message === null || message === void 0 ? void 0 : message.type) === _Constants.MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL) await this.externalTaskHandler.processExternalTask(message, localData);else if ((message === null || message === void 0 ? void 0 : message.type) === _Constants.MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING) await this.keyringHandler.keyringHelper(message, localData);else if ((message === null || message === void 0 ? void 0 : message.type) === _Constants.MESSAGE_TYPE_LABELS.NETWORK_HANDLER) this.networkHandler.handleNetworkRelatedTasks(message, localData);
      };
      _webextensionPolyfill.default.runtime.onMessage.addListener(async message => {
        const localData = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
        //checks for event from extension ui
        if ((0, _utility.isEqual)(message === null || message === void 0 ? void 0 : message.type, _Constants.MESSAGE_TYPE_LABELS.INTERNAL_TX) || (0, _utility.isEqual)(message === null || message === void 0 ? void 0 : message.type, _Constants.MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) {
          await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);
          return;
        } else if ((message === null || message === void 0 ? void 0 : message.type) === _Constants.MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL) {
          await this.externalTaskHandler.processExternalTask(message, localData);
          return;
        } else if ((message === null || message === void 0 ? void 0 : message.type) === _Constants.MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING) {
          await this.keyringHandler.keyringHelper(message, localData);
          // Promise.resolve(true);

          return;
        } else if ((message === null || message === void 0 ? void 0 : message.type) === _Constants.MESSAGE_TYPE_LABELS.NETWORK_HANDLER) {
          this.networkHandler.handleNetworkRelatedTasks(message, localData);
          return;
        }

        // try {
        //   //check if message is array or onject
        //   message.message = hasLength(message.message) ? message.message[0] : message.message;

        //   //data for futher proceeding
        //   const data = {
        //     ...message,
        //     origin: sender.origin,
        //     tabId: sender?.tab?.id
        //   };

        //   console.log("data is here: ", data);
        //   //check if the app has the permission to access requested method
        //   if (!checkStringInclusionIntoArray(data?.method)) {
        //     const { connectedApps } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
        //     const isHasAccess = connectedApps[data.origin];
        //     if (!isHasAccess?.isConnected) {
        //       data?.tabId && sendMessageToTab(data.tabId, new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.ACCESS_NOT_GRANTED));
        //       return;
        //     }
        //   }

        //   //checks for event from injected script
        //   switch (data.method) {
        //     case "connect":
        //     case "eth_requestAccounts":
        //     case "eth_accounts":
        //       await this.internalHandler.handleConnect(data, localData);
        //       break;
        //     case "disconnect":
        //       await this.internalHandler.handleDisconnect(data, localData);
        //       break;
        //     case "eth_sendTransaction":
        //       await this.internalHandler.handleEthTransaction(data, localData);
        //       break;
        //     case "get_endPoint":
        //       await this.internalHandler.sendEndPoint(data, localData);
        //       break;
        //     case SIGNER_METHODS.SIGN_PAYLOAD:
        //     case SIGNER_METHODS.SIGN_RAW:
        //       await this.internalHandler.handleNativeSigner(data, localData);
        //       break;
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
        //     case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
        //       await this.internalHandler.handleValidatorNominatorTransactions(data, localData);
        //       break
        //     default: data?.tabId && sendMessageToTab(data.tabId, new TabMessagePayload(data.message.id, null, null, null, ERROR_MESSAGES.INVALID_METHOD))
        //   }
        // } catch (err) {
        //   ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.RUNTIME_MESSAGE_SECTION_ERROR, err.message))
        // }
      });
    });
    /** Fired when the extension is first installed,
    when the extension is updated to a new version,
    and when Chrome is updated to a new version. */
    _defineProperty(this, "bindInstallandUpdateEvents", async () => {
      _webextensionPolyfill.default.runtime.onInstalled.addListener(async () => {
        const services = new Services();
        const state = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
        const pendingTxBalance = state.pendingTransactionBalance;

        // clear the pending transaction balance
        const transactionBalance = {
          evm: 0,
          native: 0
        };
        for (const account of Object.keys(pendingTxBalance)) {
          for (const network of Object.values(_Constants.NETWORK)) {
            await services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.UPDATE_PENDING_TRANSACTION_BALANCE, transactionBalance, {
              network: network.toLowerCase(),
              address: account
            });
          }
        }

        //clear the all pending request from local store when extension updated or refreshed
        await services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.CLEAR_ALL_EXTERNAL_REQUESTS, {});
        //clear the transaction queue when refreshed
        await services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.CLEAR_TRANSACTION_QUEUE, {});
        if (_utils.isManifestV3) {
          for (const cs of _webextensionPolyfill.default.runtime.getManifest().content_scripts) {
            for (const tab of await _webextensionPolyfill.default.tabs.query({
              url: cs.matches
            })) {
              _webextensionPolyfill.default.scripting.executeScript({
                target: {
                  tabId: tab.id
                },
                files: cs.js
              });
            }
          }
        }

        // //clear the already injected script
        // await Browser.scripting.unregisterContentScripts({ ids: ["inpage"] });

        // //inject the script on refresh
        // await Browser.scripting.registerContentScripts([
        //   {
        //     id: "inpage",
        //     matches: ["http://*/*", "https://*/*"],
        //     js: ["./static/js/injected.js"],
        //     runAt: "document_start",
        //     world: "MAIN",
        //   },
        // ]);
      });
    });
    //background startup events binding
    _defineProperty(this, "bindBackgroundStartupEvents", async () => {
      _webextensionPolyfill.default.runtime.onStartup.addListener(() => {});
    });
    //event called when extension is suspended or closed
    _defineProperty(this, "bindExtensionUnmountEvents", async () => {
      /**
       *  Sent to the event page just before it is unloaded.
       *  This gives the extension opportunity to do some clean up.
       *  Note that since the page is unloading,
       *  any asynchronous operations started while handling this event
       *  are not guaranteed to complete.
       *  If more activity for the event page occurs before it gets
       *  unloaded the onSuspendCanceled event will
       *  be sent and the page won't be unloaded. */
      _webextensionPolyfill.default.runtime.onSuspend.addListener(async () => {
        await _webextensionPolyfill.default.scripting.unregisterContentScripts({
          ids: ["inpage"]
        });
      });
    });
    /********************************* internal methods ****************************/
    _defineProperty(this, "_balanceUpdate", () => {
      return setInterval(() => {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.BALANCE_FETCH);
      }, _Constants.AUTO_BALANCE_UPDATE_TIMER);
    });
    _defineProperty(this, "_checkLapsedPendingTransactions", () => {
      return setInterval(() => {
        if (!InitBackground.isStatusCheckerRunning && !TransactionQueue.transactionIntervalId) {
          // console.log("running the service for transaction status check");
          ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.LAPSED_TRANSACTION_CHECK);
        }
      }, _Constants.LAPSED_TRANSACTION_CHECKER_TIMER);
    });
    ExtensionEventHandle.initEventsAndGetInstance();
    this.injectScriptInTab();
    this.bindAllEvents();
    this.networkHandler = NetworkHandler.getInstance();
    this.rpcRequestProcessor = RpcRequestProcessor.getInstance();
    this.internalHandler = _controller.ExternalConnection.getInstance();
    this.keyringHandler = KeyringHandler.getInstance();
    this.externalTaskHandler = new ExternalTxTasks();
    if (!InitBackground.balanceTimer) {
      InitBackground.balanceTimer = this._balanceUpdate();
      this._checkLapsedPendingTransactions();
    }
  }

  //init the background events
}

//process the trans
exports.InitBackground = InitBackground;
//check if there is time interval binded
_defineProperty(InitBackground, "balanceTimer", null);
_defineProperty(InitBackground, "isStatusCheckerRunning", false);
//background duplex stream for handling the communication between the content-script and background script
_defineProperty(InitBackground, "backgroundStream", null);
_defineProperty(InitBackground, "uiStream", null);
_defineProperty(InitBackground, "initBackground", () => {
  new InitBackground();
  delete InitBackground.constructor;
});
class RpcRequestProcessor {
  constructor() {
    //rpc calls middleware
    _defineProperty(this, "rpcCallsMiddleware", async (message, state) => {
      let rpcResponse = null;
      try {
        if ((0, _utility.isEqual)(message.type, _Constants.MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) {
          if ((0, _utility.hasProperty)(this.generalWalletRpc, message.event)) {
            rpcResponse = await this.generalWalletRpc[message.event](message, state);
            this.parseGeneralRpc(rpcResponse);
          } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, _Constants.ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();
        } else if ((0, _utility.isEqual)(message.type, _Constants.MESSAGE_TYPE_LABELS.INTERNAL_TX)) {
          this.processTransactionRequest(message);
        }
      } catch (err) {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, err.message));
      }
    });
    //parse and send the message related to fee and balance
    _defineProperty(this, "parseGeneralRpc", async rpcResponse => {
      if (!rpcResponse.error) {
        var _rpcResponse$payload;
        //change the state in local storage
        if (rpcResponse.stateChangeKey) await this.services.updateLocalState(rpcResponse.stateChangeKey, rpcResponse.payload.data, (_rpcResponse$payload = rpcResponse.payload) === null || _rpcResponse$payload === void 0 ? void 0 : _rpcResponse$payload.options);
        //send the response message to extension ui
        if (rpcResponse.eventEmit) this.services.messageToUI(rpcResponse.eventEmit, rpcResponse.payload.data);
      } else {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, rpcResponse.error);
      }
    });
    //parse the transaction related rpc response
    _defineProperty(this, "processTransactionRequest", async transactionRequest => {
      try {
        //create a transaction payload
        const {
          data
        } = transactionRequest;
        const transactionProcessingPayload = new _network_calls.TransactionProcessingPayload(data, transactionRequest.event, null, data === null || data === void 0 ? void 0 : data.data, {
          ...(data === null || data === void 0 ? void 0 : data.options)
        });

        //send the transaction into tx queue
        await this.transactionQueue.addNewTransaction(transactionProcessingPayload);
      } catch (err) {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, err.message));
      }
    });
    this.transactionQueue = TransactionQueue.getInstance();
    this.generalWalletRpc = new GeneralWalletRPC();
    this.services = new Services();
    ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.CONNECTION);
  }

  //access only single instance
}

//class implementation for transaction queue
_defineProperty(RpcRequestProcessor, "instance", null);
_defineProperty(RpcRequestProcessor, "isHttp", true);
_defineProperty(RpcRequestProcessor, "getInstance", () => {
  if (!RpcRequestProcessor.instance) {
    RpcRequestProcessor.instance = new RpcRequestProcessor();
    delete RpcRequestProcessor.constructor;
  }
  return RpcRequestProcessor.instance;
});
class TransactionQueue {
  constructor() {
    //set the block container network slots
    _defineProperty(this, "injectNetworkSlots", () => {
      const tempBlockSlots = {};
      Object.values(_Constants.NETWORK).forEach(item => tempBlockSlots[item.toLowerCase()] = 0);
      TransactionQueue.blockSlots = tempBlockSlots;
    });
    //add new transaction
    _defineProperty(this, "addNewTransaction", async transactionProcessingPayload => {
      var _transactionProcessin;
      //add the transaction history track
      const {
        data,
        options
      } = transactionProcessingPayload;
      transactionProcessingPayload.transactionHistoryTrack = new _network_calls.TransactionPayload((data === null || data === void 0 ? void 0 : data.to) || (options === null || options === void 0 ? void 0 : options.to), data !== null && data !== void 0 && data.value ? Number(data === null || data === void 0 ? void 0 : data.value).toString() : "0", options === null || options === void 0 ? void 0 : options.isEvm, options === null || options === void 0 ? void 0 : options.network, options === null || options === void 0 ? void 0 : options.type);

      //check if there is method inside tx payload (only nominator and validator transactions case)
      transactionProcessingPayload.transactionHistoryTrack.method = (options === null || options === void 0 ? void 0 : options.method) || null;

      //insert transaction history with flag "Queued"
      await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, transactionProcessingPayload.transactionHistoryTrack, transactionProcessingPayload.options);

      //add the new transaction into queue
      await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.ADD_NEW_TRANSACTION, transactionProcessingPayload, {
        localStateKey: _Constants.LABELS.TRANSACTION_QUEUE,
        network: (_transactionProcessin = transactionProcessingPayload.options) === null || _transactionProcessin === void 0 ? void 0 : _transactionProcessin.network.toLowerCase()
      });

      //update the current transaction pending balance state
      await this.services.updatePendingTransactionBalance(options.network.toLowerCase(), options.account.evmAddress, isNaN(Number(data === null || data === void 0 ? void 0 : data.value)) ? 0 + Number(options === null || options === void 0 ? void 0 : options.fee) : Number(data === null || data === void 0 ? void 0 : data.value) + Number(options === null || options === void 0 ? void 0 : options.fee), options === null || options === void 0 ? void 0 : options.isEvm, true);
      //emit the event that new transaction is added into queue
      ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE, options.network.toLowerCase());
    });
    //process next queued transaction
    _defineProperty(this, "processQueuedTransaction", async network => {
      //dequeue next transaction and add it as processing transaction
      await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.PROCESS_QUEUE_TRANSACTION, {}, {
        localStateKey: _Constants.LABELS.TRANSACTION_QUEUE,
        network
      });

      //set the current transaction status to pending
      const allQueues = await (0, _loadstore.getDataLocal)(_Constants.LABELS.TRANSACTION_QUEUE);
      const {
        currentTransaction
      } = allQueues[network];
      if (currentTransaction) await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, currentTransaction.transactionHistoryTrack, currentTransaction.options);
    });
    //perform transaction rpc request
    _defineProperty(this, "processTransaction", async network => {
      const state = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
      const allQueues = await (0, _loadstore.getDataLocal)(_Constants.LABELS.TRANSACTION_QUEUE);
      const {
        currentTransaction
      } = allQueues[network];
      (0, _utility.log)("current transaction inside the process transaction: ", currentTransaction);
      try {
        if ((0, _utility.hasProperty)(this.transactionRpc, currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.type)) {
          const rpcResponse = await this.transactionRpc[currentTransaction.type](currentTransaction, state);
          return rpcResponse;
        } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, _Constants.ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();
      } catch (err) {
        (0, _utility.log)("error while saving the transaction", err);
        const error = new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, err.message);
        return new _network_calls.EventPayload(null, null, {
          data: currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.transactionHistoryTrack
        }, error);
      }
    });
    //parse the response after processing the transaction
    _defineProperty(this, "parseTransactionResponse", async network => {
      var _transactionResponse$, _transactionResponse$2;
      //perform the current active transactions
      tester++;
      const transactionResponse = await this.processTransaction(network);
      const txHash = (_transactionResponse$ = transactionResponse.payload) === null || _transactionResponse$ === void 0 ? void 0 : (_transactionResponse$2 = _transactionResponse$.data) === null || _transactionResponse$2 === void 0 ? void 0 : _transactionResponse$2.txHash;

      //check if there is error payload into response
      if (!transactionResponse.error) {
        var _transactionResponse$3;
        //if transaction is external then send the response to spefic tab
        if ((_transactionResponse$3 = transactionResponse.payload.options) !== null && _transactionResponse$3 !== void 0 && _transactionResponse$3.externalTransaction && txHash) {
          const {
            payload: {
              options: {
                type
              }
            }
          } = transactionResponse;
          const {
            externalTransaction
          } = transactionResponse.payload.options;
          const externalResponse = {
            method: externalTransaction.method,
            result: (0, _utility.isEqual)(type, _Constants.TX_TYPE.NATIVE_APP) ? {
              txHash
            } : txHash
          };
          (0, _message_helper.sendMessageToTab)(externalTransaction === null || externalTransaction === void 0 ? void 0 : externalTransaction.tabId, new _network_calls.TabMessagePayload(externalTransaction.id, externalResponse));
        }
        await this._updateQueueAndHistory(transactionResponse, network);
      } else {
        //check if txhash is found in payload then update transaction into queue and history
        if (txHash) this._updateQueueAndHistory(transactionResponse, network);else {
          var _transactionResponse$4, _transactionResponse$5, _transactionResponse$6;
          (transactionResponse === null || transactionResponse === void 0 ? void 0 : transactionResponse.payload) && (await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.SAVE_ERRORED_FAILED_TRANSACTION, {
            id: (_transactionResponse$4 = transactionResponse.payload.data) === null || _transactionResponse$4 === void 0 ? void 0 : _transactionResponse$4.id
          }, (_transactionResponse$5 = transactionResponse.payload) === null || _transactionResponse$5 === void 0 ? void 0 : _transactionResponse$5.options));

          //set the current errored transaction in queue as null
          await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.REMOVE_FAILED_TX, {}, {
            localStateKey: _Constants.LABELS.TRANSACTION_QUEUE,
            network
          });

          //if transaction is external send the error response back to requester tab
          if ((_transactionResponse$6 = transactionResponse.payload.options) !== null && _transactionResponse$6 !== void 0 && _transactionResponse$6.externalTransaction) {
            var _transactionResponse$7, _transactionResponse$8;
            const {
              externalTransaction
            } = transactionResponse.payload.options;
            const errorMessageForTab = ((_transactionResponse$7 = transactionResponse.error) === null || _transactionResponse$7 === void 0 ? void 0 : (_transactionResponse$8 = _transactionResponse$7.errMessage) === null || _transactionResponse$8 === void 0 ? void 0 : _transactionResponse$8.data) || _Constants.ERROR_MESSAGES.ERROR_WHILE_TRANSACTION;
            (0, _message_helper.sendMessageToTab)(externalTransaction === null || externalTransaction === void 0 ? void 0 : externalTransaction.tabId, new _network_calls.TabMessagePayload(externalTransaction.id, {
              result: null
            }, externalTransaction.method, null, errorMessageForTab));
          }
          ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, transactionResponse.error);
        }
      }
    });
    //set timer for updating the transaction status
    _defineProperty(this, "checkTransactionStatus", async network => {
      try {
        var _transactionQueue$cur, _currentTransaction$t;
        //check if current transaction is there or not
        const allQueues = await (0, _loadstore.getDataLocal)(_Constants.LABELS.TRANSACTION_QUEUE);
        const transactionQueue = allQueues[network];
        const hasPendingTx = transactionQueue.txQueue.length;

        //if the current transaction is null then it is failed and removed
        if (!((_transactionQueue$cur = transactionQueue.currentTransaction) !== null && _transactionQueue$cur !== void 0 && _transactionQueue$cur.transactionHistoryTrack)) {
          const {
            options,
            data
          } = transactionQueue.currentTransaction;
          //update the current transaction pending balance state
          await this.services.updatePendingTransactionBalance(network, options.account.evmAddress, isNaN(Number(data === null || data === void 0 ? void 0 : data.value)) ? 0 + Number(options === null || options === void 0 ? void 0 : options.fee) : Number(data === null || data === void 0 ? void 0 : data.value) + Number(options === null || options === void 0 ? void 0 : options.fee), options.isEvm);

          //check if there any pending transaction into queue
          if (!(0, _utility.isEqual)(hasPendingTx, 0)) {
            await this.processQueuedTransaction(network);
            await this.parseTransactionResponse(network);
            TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)));
          } else {
            await this.processQueuedTransaction(network);
            TransactionQueue.networkTransactionHandler = TransactionQueue.networkTransactionHandler.filter(item => item !== network);
            //reset the timeout id as null so whenever new transaction made the timeout start again
            TransactionQueue.setIntervalId(null);
          }
          return;
        }
        const {
          currentTransaction
        } = transactionQueue;
        const transactionHistoryTrack = {
          ...currentTransaction.transactionHistoryTrack
        };

        //check if transaction status is pending then only check the status
        if (currentTransaction && (0, _utility.isEqual)(currentTransaction.transactionHistoryTrack.status, _Constants.STATUS.PENDING) && (_currentTransaction$t = currentTransaction.transactionHistoryTrack) !== null && _currentTransaction$t !== void 0 && _currentTransaction$t.txHash) {
          const {
            transactionHistoryTrack: {
              txHash,
              isEvm,
              chain
            }
          } = currentTransaction;
          const transactionStatus = await this.services.getTransactionStatus(txHash, isEvm, chain);

          //if transaction status is found ether Failed or Success
          if (transactionStatus !== null && transactionStatus !== void 0 && transactionStatus.status) {
            var _currentTransaction$o, _currentTransaction$d, _currentTransaction$d2;
            //update the transaction after getting the confirmation
            transactionHistoryTrack.status = transactionStatus.status;

            //check the transaction type and save the to recipent according to type
            if ((0, _utility.isEqual)(transactionHistoryTrack === null || transactionHistoryTrack === void 0 ? void 0 : transactionHistoryTrack.type, _Constants.TX_TYPE.NATIVE_APP)) transactionHistoryTrack.to = transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.sectionmethod;else transactionHistoryTrack.to = transactionHistoryTrack.intermidateHash ? transactionHistoryTrack.to : transactionHistoryTrack.isEvm ? transactionStatus.to || transactionStatus.contractAddress : transactionHistoryTrack.to;

            //set the used gas
            transactionHistoryTrack.gasUsed = transactionHistoryTrack.isEvm ? (Number(transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.gasUsed) / _Constants.ONE_ETH_IN_GWEI).toString() : transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.txFee;

            //set the amount when the method is reward
            if ((0, _utility.isEqual)(transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.sectionmethod, _Constants.LABELS.STACKING_REWARD)) {
              transactionHistoryTrack.amount = (0, _helper.formatNumUptoSpecificDecimal)(Number(Number(transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.value).noExponents()) / 10 ** 18, 6);
            }

            //update the transaction status and other details after confirmation
            await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, transactionHistoryTrack, currentTransaction === null || currentTransaction === void 0 ? void 0 : currentTransaction.options);

            //update the balance after transaction confirmation
            ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.BALANCE_FETCH);

            //show notification of transaction status
            this.services.showNotification((0, _utils.txNotificationStringTemplate)(transactionStatus.status, txHash));

            //update the pending transaction balance
            await this.services.updatePendingTransactionBalance(network, (_currentTransaction$o = currentTransaction.options) === null || _currentTransaction$o === void 0 ? void 0 : _currentTransaction$o.account.evmAddress, isNaN(Number((_currentTransaction$d = currentTransaction.data) === null || _currentTransaction$d === void 0 ? void 0 : _currentTransaction$d.value)) ? 0 + Number(currentTransaction.options.fee) : Number((_currentTransaction$d2 = currentTransaction.data) === null || _currentTransaction$d2 === void 0 ? void 0 : _currentTransaction$d2.value) + Number(currentTransaction.options.fee), currentTransaction.options.isEvm);

            /***********************************Test */
            console.log("length of pending in upper: ", hasPendingTx);
            console.log("here is tx count: ", tester);
            const tempTxQueues = await (0, _loadstore.getDataLocal)(_Constants.LABELS.TRANSACTION_QUEUE);
            const tempQueue = tempTxQueues[network];
            const tempTxQueueLenght = tempQueue.txQueue.length;
            console.log("here is queue tx: ", tempTxQueueLenght);

            //check if there any pending transaction into queue
            if (!(0, _utility.isEqual)(tempTxQueueLenght, 0)) {
              //dequeue the new transaction and set as active for processing
              await this.processQueuedTransaction(network);
              await this.parseTransactionResponse(network);
              TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)));
            } else {
              //dequeue the new transaction and set as active for processing
              await this.processQueuedTransaction(network);
              TransactionQueue.networkTransactionHandler = TransactionQueue.networkTransactionHandler.filter(item => item !== network);
              //reset the timeout id as null so whenever new transaction made the timeout start again
              TransactionQueue.setIntervalId(null);
            }
          }
          //if transaction is still in pending state
          else {
            TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)));
          }
        } else {
          (0, _utility.log)("transaction not processed: ", currentTransaction);
        }
      } catch (err) {
        (0, _utility.log)("error while transaction processing: ", err);
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION_STATUS_CHECK, _Constants.ERROR_MESSAGES.ERROR_WHILE_TRANSACTION_STATUS_CHECK));
        const tempTxQueues = await (0, _loadstore.getDataLocal)(_Constants.LABELS.TRANSACTION_QUEUE);
        const tempQueue = tempTxQueues[network];
        const tempTxQueueLenght = tempQueue.txQueue.length;

        //check if there any pending transaction into queue
        if (!(0, _utility.isEqual)(tempTxQueueLenght, 0)) {
          //dequeue the new transaction and set as active for processing
          await this.processQueuedTransaction(network);
          await this.parseTransactionResponse(network);
          TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)));
        } else {
          //dequeue the new transaction and set as active for processing
          await this.processQueuedTransaction(network);
          TransactionQueue.networkTransactionHandler = TransactionQueue.networkTransactionHandler.filter(item => item !== network);
          //reset the timeout id as null so whenever new transaction made the timeout start again
          TransactionQueue.setIntervalId(null);
        }
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION_STATUS_CHECK, _Constants.ERROR_MESSAGES.ERROR_WHILE_TRANSACTION_STATUS_CHECK));
      }
    });
    /******************************* Event Callbacks *************************/
    //callback for new transaction inserted into queue event
    _defineProperty(this, "newTransactionAddedEventCallback", async network => {
      // isNullorUndef(TransactionQueue.transactionIntervalId)
      if (!TransactionQueue.networkTransactionHandler.includes(network)) {
        TransactionQueue.networkTransactionHandler.push(network);
        await this.processQueuedTransaction(network);
        await this.parseTransactionResponse(network);
        TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)));
      }
    });
    //callback for native signer new transaction
    // newNativeSignerTransactionAddedEventCallback = async () => {
    //   if (isNullorUndef(TransactionQueue.transactionIntervalId)) {
    //     await this.processQueuedTransaction();
    //     TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus))
    //   }
    // }
    /******************************** Internal methods ***********************/
    //schedule execution
    _defineProperty(this, "_setTimeout", cb => {
      return setTimeout(cb, _Constants.TRANSACTION_STATUS_CHECK_TIMER);
    });
    //update the transaction queue and history
    _defineProperty(this, "_updateQueueAndHistory", async (transactionResponse, network) => {
      var _transactionResponse$9;
      await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, transactionResponse.payload.data, (_transactionResponse$9 = transactionResponse.payload) === null || _transactionResponse$9 === void 0 ? void 0 : _transactionResponse$9.options);

      //update the transaction into active transaction session
      await this.services.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.UPDATE_HISTORY_TRACK, transactionResponse.payload.data, {
        localStateKey: _Constants.LABELS.TRANSACTION_QUEUE,
        network
      });
    });
    this.injectNetworkSlots();
    this.services = new Services();
    this.transactionRpc = new TransactionsRPC();
  }

  //give only access to the single instance of class
}
_defineProperty(TransactionQueue, "instance", null);
_defineProperty(TransactionQueue, "transactionIntervalId", null);
_defineProperty(TransactionQueue, "networkTransactionHandler", []);
_defineProperty(TransactionQueue, "blockSlots", {});
_defineProperty(TransactionQueue, "getInstance", () => {
  if (!TransactionQueue.instance) {
    TransactionQueue.instance = new TransactionQueue();
    delete TransactionQueue.constructor;
  }
  return TransactionQueue.instance;
});
//set the transaction interval id
_defineProperty(TransactionQueue, "setIntervalId", transactionIntervalId => {
  TransactionQueue.transactionIntervalId = transactionIntervalId;
});
class ExtensionEventHandle {
  constructor() {
    //bind all internal events
    _defineProperty(this, "bindAllEvents", () => {
      this.bindAutoBalanceUpdateEvent();
      this.bindTransactionProcessingEvents();
      // this.bindNewNativeSignerTransactionEvents();
      this.bindErrorHandlerEvent();
      this.bindLapsedTransactionCheckingEvent();
    });
    //for creating the instance of native and evm api
    _defineProperty(this, "bindConnectionEvent", async () => {
      //handling the connection using the events
      ExtensionEventHandle.eventEmitter.on(_Constants.INTERNAL_EVENT_LABELS.CONNECTION, this.networkHandler.initRpcApi);
    });
    //bind the transaction processing related events
    _defineProperty(this, "bindTransactionProcessingEvents", async () => {
      //event triggered when new transaction is added into queue
      ExtensionEventHandle.eventEmitter.on(_Constants.INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE, this.transactionQueue.newTransactionAddedEventCallback);
    });
    // bindNewNativeSignerTransactionEvents = async () => {
    //   ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.NEW_NATIVE_SIGNER_TRANSACTION_INQUEUE, this.transactionQueue.newNativeSignerTransactionAddedEventCallback)
    // }
    //bind auto balance update event
    _defineProperty(this, "bindAutoBalanceUpdateEvent", async () => {
      //auto update the balance
      ExtensionEventHandle.eventEmitter.on(_Constants.INTERNAL_EVENT_LABELS.BALANCE_FETCH, async () => {
        const state = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);

        //if account is not created
        if (!state.currentAccount.accountName) return;
        await this.rpcRequestProcessor.rpcCallsMiddleware({
          event: _Constants.MESSAGE_EVENT_LABELS.BALANCE,
          type: _Constants.MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
          data: {}
        }, state);
      });
    });
    // bind event for lapsed pending transaction updation
    _defineProperty(this, "bindLapsedTransactionCheckingEvent", async () => {
      ExtensionEventHandle.eventEmitter.on(_Constants.INTERNAL_EVENT_LABELS.LAPSED_TRANSACTION_CHECK, async () => {
        await this.services.checkPendingTransaction();
        //false the lapsed transaction check
        InitBackground.isStatusCheckerRunning = false;
      });
    });
    //bind error handler event
    _defineProperty(this, "bindErrorHandlerEvent", async () => {
      /**
       * parse the error and send the error response back to ui
       */
      ExtensionEventHandle.eventEmitter.on(_Constants.INTERNAL_EVENT_LABELS.ERROR, async err => {
        try {
          var _err$errMessage;
          (0, _utility.log)("error catched inside error event handler: ", err);

          //check if there is custom error message in error payload
          const customMessage = err === null || err === void 0 ? void 0 : (_err$errMessage = err.errMessage) === null || _err$errMessage === void 0 ? void 0 : _err$errMessage.data;

          //transaction failed and error message handler
          if ((0, _utility.isEqual)(err === null || err === void 0 ? void 0 : err.errCode, _Constants.ERRCODES.ERROR_WHILE_TRANSACTION)) this.services.messageToUI(_Constants.MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, customMessage || _Constants.ERROR_MESSAGES.ERROR_WHILE_TRANSACTION);
          if ((0, _utility.isEqual)(err === null || err === void 0 ? void 0 : err.errCode, _Constants.ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE)) this.services.messageToUI(_Constants.MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, customMessage || _Constants.ERROR_MESSAGES.ERROR_WHILE_GAS_ESTIMATION);
          if ((0, _utility.isEqual)(err === null || err === void 0 ? void 0 : err.errCode, _Constants.ERRCODES.FAILED_TO_CONNECT_NETWORK)) this.services.messageToUI(_Constants.MESSAGE_EVENT_LABELS.NETWORK_CONNECTION_ERROR, customMessage || _Constants.ERROR_MESSAGES.ERROR_WHILE_NETWORK_CONNECTION);
          if ((0, _utility.isEqual)(err === null || err === void 0 ? void 0 : err.errCode, _Constants.ERRCODES.INTERNAL)) this.services.messageToUI(_Constants.MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, customMessage || _Constants.ERROR_MESSAGES.INTERNAL_ERROR);
        } catch (err) {
          (0, _utility.log)("Error in error event handler: ", err);
        }
      });
    });
    this.networkHandler = NetworkHandler.getInstance();
    this.bindConnectionEvent();
    this.transactionQueue = TransactionQueue.getInstance();
    this.rpcRequestProcessor = RpcRequestProcessor.getInstance();
    this.bindAllEvents();
    this.services = new Services();
  }

  //return the already initlized instance
}

//for non rpc tasks
exports.ExtensionEventHandle = ExtensionEventHandle;
_defineProperty(ExtensionEventHandle, "instance", null);
_defineProperty(ExtensionEventHandle, "eventEmitter", new _eventemitter.EventEmitter());
_defineProperty(ExtensionEventHandle, "TransactionCheckerInterval", null);
_defineProperty(ExtensionEventHandle, "initEventsAndGetInstance", () => {
  if (!ExtensionEventHandle.instance) {
    ExtensionEventHandle.instance = new ExtensionEventHandle();
    delete ExtensionEventHandle.constructor;
  }
  return ExtensionEventHandle.instance;
});
class ExternalTxTasks {
  constructor() {
    //process and check external task (connection, tx approval)
    _defineProperty(this, "processExternalTask", async (message, state) => {
      if ((0, _utility.isEqual)(message.event, _Constants.MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION)) await this.closePopupSession(message, state);else if ((0, _utility.isEqual)(_Constants.MESSAGE_EVENT_LABELS.EVM_TX, message.event)) await this.externalEvmTransaction(message, state);else if ((0, _utility.isEqual)(_Constants.MESSAGE_EVENT_LABELS.NATIVE_SIGNER, message.event)) await this.nativeSigner(message, state);else if ((0, _utility.isEqual)(_Constants.MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_TRANSACTION, message.event)) await this.validatorNominatorTransaction(message, state);
    });
    //handle the evm external transaction
    _defineProperty(this, "externalEvmTransaction", async message => {
      var _activeSession$messag;
      const {
        activeSession
      } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);

      //process the external evm transactions
      const externalTransactionProcessingPayload = new _network_calls.TransactionProcessingPayload({
        ...activeSession.message,
        options: {
          ...(message === null || message === void 0 ? void 0 : message.data.options),
          externalTransaction: {
            ...activeSession
          }
        }
      }, message.event, null, (_activeSession$messag = activeSession.message) === null || _activeSession$messag === void 0 ? void 0 : _activeSession$messag.data, {
        ...(message === null || message === void 0 ? void 0 : message.data.options),
        externalTransaction: {
          ...activeSession
        }
      });
      await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
    });
    //handle the nominator and validator transaction
    _defineProperty(this, "nativeSigner", async (message, state) => {
      const {
        activeSession
      } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);

      //check if the requested method is supported by the handler
      if ((0, _utility.hasProperty)(this.nativeSignerhandler, activeSession === null || activeSession === void 0 ? void 0 : activeSession.method)) {
        var _message$data;
        if ((_message$data = message.data) !== null && _message$data !== void 0 && _message$data.approve) {
          const signerRes = await this.nativeSignerhandler[activeSession.method](activeSession.message, state);
          if (!signerRes.error) {
            (0, _message_helper.sendMessageToTab)(activeSession.tabId, new _network_calls.TabMessagePayload(activeSession.id, {
              result: signerRes.payload.data
            }));

            // const network = message.data.options?.network || state.currentNetwork;
            // const {data} = message;

            // //create the Transaction processing payload
            // const transactionProcessingPayload = new TransactionProcessingPayload(data, MESSAGE_EVENT_LABELS.NATIVE_SIGNER, null, null, { ...data?.options });

            // //create transaction payload
            // transactionProcessingPayload.transactionHistoryTrack = new TransactionPayload(null, "", false, network, TX_TYPE.NATIVE_SIGNER, data.txHash, STATUS.PENDING, null, data.estimatedGas, data.estimatedGas, data.method);

            // //insert transaction history with flag
            // await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY, transactionProcessingPayload.transactionHistoryTrack, transactionProcessingPayload.options);

            // //add the new transaction into queue
            // await this.services.updateLocalState(STATE_CHANGE_ACTIONS.ADD_NEW_TRANSACTION, transactionProcessingPayload, {
            //   localStateKey: LABELS.TRANSACTION_QUEUE });

            //   log("saved the tx", transactionProcessingPayload)

            //   //emit the new native signer transaction event
            //   ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.NEW_NATIVE_SIGNER_TRANSACTION_INQUEUE);
          } else if (signerRes.error) (0, _message_helper.sendMessageToTab)(activeSession.tabId, new _network_calls.TabMessagePayload(activeSession.id, {
            result: null
          }, null, null, signerRes.error.errMessage));
        }
      }

      //close the popup
      await this.closePopupSession(message);
    });
    //handle the nominator and validator transaction
    // eslint-disable-next-line no-unused-vars
    _defineProperty(this, "validatorNominatorTransaction", async (message, state) => {
      var _message$data2;
      if ((_message$data2 = message.data) !== null && _message$data2 !== void 0 && _message$data2.approve) {
        var _activeSession$messag2;
        const {
          activeSession
        } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);

        //get the method and amount
        const methodDetails = (0, _utils.getFormattedMethod)(activeSession === null || activeSession === void 0 ? void 0 : activeSession.method, activeSession === null || activeSession === void 0 ? void 0 : activeSession.message);

        //process the external evm transactions
        const externalTransactionProcessingPayload = new _network_calls.TransactionProcessingPayload({
          ...activeSession.message,
          value: methodDetails === null || methodDetails === void 0 ? void 0 : methodDetails.amount,
          options: {
            ...(message === null || message === void 0 ? void 0 : message.data.options),
            externalTransaction: {
              ...activeSession
            }
          }
        }, message.event, null, (_activeSession$messag2 = activeSession.message) === null || _activeSession$messag2 === void 0 ? void 0 : _activeSession$messag2.data, {
          ...(message === null || message === void 0 ? void 0 : message.data.options),
          externalTransaction: {
            ...activeSession
          },
          method: methodDetails === null || methodDetails === void 0 ? void 0 : methodDetails.methodName
        });
        await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
      }

      //close the popup
      await this.closePopupSession(message);
    });
    //close the current popup session
    _defineProperty(this, "closePopupSession", async message => {
      var _message$data3;
      _controller.ExternalWindowControl.isApproved = (_message$data3 = message.data) === null || _message$data3 === void 0 ? void 0 : _message$data3.approve;
      const externalWindowControl = _controller.ExternalWindowControl.getInstance();
      await externalWindowControl.closeActiveSessionPopup();
    });
    this.transactionQueueHandler = TransactionQueue.getInstance();
    this.nativeSignerhandler = new NativeSigner();
  }
}

//for extension common service work
class Services {
  constructor() {
    var _this = this;
    /*************************** Service Helpers ********************************/
    //get the transaction details from chain side
    _defineProperty(this, "getBlockInsideDetails", async (network, txHash) => {
      try {
        var _NetworkHandler$api$n;
        (0, _utility.log)("here is the network: ", network);

        //return if the node connection is null
        if (!((_NetworkHandler$api$n = NetworkHandler.api[network]) !== null && _NetworkHandler$api$n !== void 0 && _NetworkHandler$api$n.nativeApi)) return null;
        const {
          nativeApi
        } = NetworkHandler.api[network];
        const blockNumber = TransactionQueue.blockSlots[network];
        if (blockNumber === 0) return null;
        const blockHash = await nativeApi.rpc.chain.getBlockHash(blockNumber);
        const signedBlock = await nativeApi.rpc.chain.getBlock(blockHash);
        const allRecords = await nativeApi.query.system.events.at(signedBlock.block.header.hash);
        const date = new Date();
        const transactionObj = {};

        //index handler and filtered event records
        let index = 0;
        const filter = index => {
          return allRecords.filter(e => e.phase.isApplyExtrinsic && e.phase.asApplyExtrinsic.eq(index));
        };

        //traverse the block extrinsics
        for (const extrinsics of signedBlock.block.extrinsics) {
          const {
            method: {
              method,
              section
            }
          } = extrinsics;
          // let eraIndex = null;

          const filteredExt = filter(index);

          //traverse the event records
          for (const storageEvents of filteredExt) {
            const {
              event
            } = storageEvents;
            (0, _utility.log)("here is main: ", event.toHuman(), "extrinscs: ", method, section);
            let transactionData;
            if (event.method.toLowerCase() === "extrinsicfailed") {
              var _transactionObj$hash, _data$signature, _data$signature$signe, _data$method, _data$method$args, _data$method$args$des, _data$method2, _data$method2$args;
              const [dispatchError] = event.data;
              let errorInfo;
              if (dispatchError.isModule) {
                const decoded = NetworkHandler.api[network].nativeApi.registry.findMetaError(dispatchError.asModule);
                errorInfo = `${decoded.section}.${decoded.name}`;
              } else {
                errorInfo = dispatchError.toString();
              }
              const data = JSON.parse(signedBlock.block.extrinsics[index].toString());
              const hash = signedBlock.block.extrinsics[index].hash.toString();
              const txFee = (_transactionObj$hash = transactionObj[hash]) !== null && _transactionObj$hash !== void 0 && _transactionObj$hash.txFee ? transactionObj[hash].txFee : 0;
              const from = data === null || data === void 0 ? void 0 : (_data$signature = data.signature) === null || _data$signature === void 0 ? void 0 : (_data$signature$signe = _data$signature.signer) === null || _data$signature$signe === void 0 ? void 0 : _data$signature$signe.id.toString();
              const to = data === null || data === void 0 ? void 0 : (_data$method = data.method) === null || _data$method === void 0 ? void 0 : (_data$method$args = _data$method.args) === null || _data$method$args === void 0 ? void 0 : (_data$method$args$des = _data$method$args.dest) === null || _data$method$args$des === void 0 ? void 0 : _data$method$args$des.id.toString();
              const value = Number(data === null || data === void 0 ? void 0 : (_data$method2 = data.method) === null || _data$method2 === void 0 ? void 0 : (_data$method2$args = _data$method2.args) === null || _data$method2$args === void 0 ? void 0 : _data$method2$args.value).toString();
              transactionData = {
                from_address: from,
                to_address: to,
                value: value,
                txhash: hash,
                reason: event.method.toLowerCase(),
                sectionmethod: errorInfo,
                status: "failed",
                txFee: txFee,
                timestamp: date.toString(),
                blocknumber: signedBlock.block.header.number.toString()
              };
              transactionObj[hash] = transactionData;
            } else if (event.method.toLowerCase() === "withdraw" && event.section === "balances") {
              var _data$signature2, _data$signature2$sign, _data$method3, _data$method3$args, _data$method3$args$de, _data$method4, _data$method4$args, _transactionObj$hash2;
              const hash = signedBlock.block.extrinsics[index].hash.toString();
              const data = JSON.parse(signedBlock.block.extrinsics[index].toString());
              const from = data === null || data === void 0 ? void 0 : (_data$signature2 = data.signature) === null || _data$signature2 === void 0 ? void 0 : (_data$signature2$sign = _data$signature2.signer) === null || _data$signature2$sign === void 0 ? void 0 : _data$signature2$sign.id.toString();
              const to = data === null || data === void 0 ? void 0 : (_data$method3 = data.method) === null || _data$method3 === void 0 ? void 0 : (_data$method3$args = _data$method3.args) === null || _data$method3$args === void 0 ? void 0 : (_data$method3$args$de = _data$method3$args.dest) === null || _data$method3$args$de === void 0 ? void 0 : _data$method3$args$de.id.toString();
              const value = Number(data === null || data === void 0 ? void 0 : (_data$method4 = data.method) === null || _data$method4 === void 0 ? void 0 : (_data$method4$args = _data$method4.args) === null || _data$method4$args === void 0 ? void 0 : _data$method4$args.value).toString();
              transactionObj[hash] = ((_transactionObj$hash2 = transactionObj[hash]) === null || _transactionObj$hash2 === void 0 ? void 0 : _transactionObj$hash2.sectionmethod) !== "staking.Bonded" ? {} : transactionObj[hash];
              transactionObj[hash].txFee = Number(event.data[1]) / Math.pow(10, 18);
              if (from === to) {
                transactionData = {
                  from_address: from,
                  to_address: to,
                  value: value,
                  txhash: hash,
                  reason: event.method.toLowerCase(),
                  sectionmethod: `${section}.${method}`,
                  status: "success",
                  txFee: transactionObj[hash].txFee,
                  timestamp: date.toString(),
                  blocknumber: signedBlock.block.header.number.toString()
                };
                transactionObj[hash] = transactionData;
              }
            } else {
              if (event.method.toLowerCase() === "transfer" && event.section === "balances") {
                var _transactionObj$signe, _transactionObj$signe2;
                let txFee = (_transactionObj$signe = transactionObj[signedBlock.block.extrinsics[index].hash.toString()]) !== null && _transactionObj$signe !== void 0 && _transactionObj$signe.txFee ? (_transactionObj$signe2 = transactionObj[signedBlock.block.extrinsics[index].hash.toString()]) === null || _transactionObj$signe2 === void 0 ? void 0 : _transactionObj$signe2.txFee : 0;
                transactionData = {
                  from_address: event.data[0].toString(),
                  to_address: event.data[1].toString(),
                  value: event.data[2] ? event.data[2].toString() : "N/A",
                  txhash: signedBlock.block.extrinsics[index].hash.toString(),
                  reason: event.method.toLowerCase(),
                  sectionmethod: `${section}.${method}`,
                  status: "success",
                  txFee: txFee,
                  timestamp: date.toString(),
                  blocknumber: signedBlock.block.header.number.toString()
                };
                /* @ts-ignore */
                // @ts-nocheck
                transactionObj[signedBlock.block.extrinsics[index].hash.toString()] = transactionData;
              } else if (event.method.toLowerCase() === "bonded" && event.section === "staking" || event.method.toLowerCase() === "unbonded" && event.section === "staking" || event.method.toLowerCase() === "chilled" && event.section === "staking" || event.method.toLowerCase() === "validatorprefsset" && event.section === "staking" || event.method.toLowerCase() === "nominatorprefsset" && event.section === "staking" || event.method.toLowerCase() === "withdrawn" && event.section === "staking") {
                const hash = signedBlock.block.extrinsics[index].hash.toString();
                let txFee = transactionObj[hash].txFee ? transactionObj[hash].txFee : 0;
                if (event.method.toLowerCase() === "validatorprefsset" && event.section === "staking" || event.method.toLowerCase() === "nominatorprefsset" && event.section === "staking") {
                  var _transactionObj$hash3;
                  if (((_transactionObj$hash3 = transactionObj[hash]) === null || _transactionObj$hash3 === void 0 ? void 0 : _transactionObj$hash3.sectionmethod) !== "staking.Bonded") {
                    transactionData = {
                      from_address: event.data[0].toString(),
                      to_address: "N/A",
                      value: "0",
                      txhash: hash,
                      reason: event.method.toLowerCase(),
                      sectionmethod: event.method.toLowerCase() === "validatorprefsset" ? "staking.revalidated" : "staking.renominated",
                      status: "success",
                      txFee: txFee,
                      timestamp: date.toString(),
                      blocknumber: signedBlock.block.header.number.toString()
                    };
                  }
                } else {
                  transactionData = {
                    from_address: event.data[0].toString(),
                    to_address: "N/A",
                    value: event.data[1] ? event.data[1].toString() : "N/A",
                    txhash: hash,
                    reason: event.method.toLowerCase(),
                    sectionmethod: `${event.section}.${event.method}`,
                    status: "success",
                    txFee: txFee,
                    timestamp: date.toString(),
                    blocknumber: signedBlock.block.header.number.toString()
                  };
                }
                transactionObj[hash] = transactionData === undefined ? transactionObj[hash] : transactionData;
              }
              // else if (
              //   event.section === "staking" &&
              //   event.method.toLowerCase() === "payoutstarted"
              // ) {
              //   eraIndex = `${event.data[0]}`;
              // }
              else if (event.section === "staking" && event.method.toLowerCase() === "rewarded") {
                var _transactionObj$hash4, _data$signature3, _data$signature3$sign, _transactionObj$hash5;
                const data = JSON.parse(signedBlock.block.extrinsics[index].toString());
                const hash = signedBlock.block.extrinsics[index].hash.toString();
                let txFee = (_transactionObj$hash4 = transactionObj[hash]) !== null && _transactionObj$hash4 !== void 0 && _transactionObj$hash4.txFee ? transactionObj[hash].txFee : 0;
                transactionData = {
                  from_address: data === null || data === void 0 ? void 0 : (_data$signature3 = data.signature) === null || _data$signature3 === void 0 ? void 0 : (_data$signature3$sign = _data$signature3.signer) === null || _data$signature3$sign === void 0 ? void 0 : _data$signature3$sign.id.toString(),
                  to_address: "N/A",
                  value: (_transactionObj$hash5 = transactionObj[hash]) !== null && _transactionObj$hash5 !== void 0 && _transactionObj$hash5.value ? (Number(transactionObj[hash].value) + Number(event.data[1])).toString() : 0 + Number(event.data[1]),
                  txhash: hash,
                  reason: event.method.toLowerCase(),
                  sectionmethod: `${event.section}.${event.method}`,
                  status: "success",
                  txFee: txFee,
                  timestamp: date.toString(),
                  blocknumber: signedBlock.block.header.number.toString()
                };
                transactionObj[hash] = transactionData;
              } else {
                (0, _utility.log)("it can't run man");
              }
            }
          }
          index++;
          TransactionQueue.blockSlots[network] = blockNumber + 1;
        }
        (0, _utility.log)("transaction object: ", transactionObj);
        return transactionObj[txHash];
      } catch (err) {
        console.log("Error while getting transaction details: ", err);
        return null;
      }
    });
    //find the native and evm transaction status
    _defineProperty(this, "getTransactionStatus", async (txHash, isEvm, network) => {
      var _txRecipt3, _txRecipt4, _txRecipt5;
      //get the url of current network for evm rpc call or native explorer search
      const rpcUrl = isEvm ? _Constants.HTTP_END_POINTS[network.toUpperCase()] : _Constants.API[network.toUpperCase()];

      //check if the transaction is still pending or not
      let res = null,
        txRecipt = null;
      if (isEvm) {
        var _res, _txRecipt;
        res = await (0, _network_calls.httpRequest)(rpcUrl, _Constants.HTTP_METHODS.POST, JSON.stringify(new _network_calls.EVMRPCPayload(_Constants.EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [txHash])));
        txRecipt = (_res = res) === null || _res === void 0 ? void 0 : _res.result;

        //parse the hex string into decimal
        if (!(0, _utility.isNullorUndef)((_txRecipt = txRecipt) === null || _txRecipt === void 0 ? void 0 : _txRecipt.status)) txRecipt.status = parseInt(txRecipt.status) ? _Constants.STATUS.SUCCESS : _Constants.STATUS.FAILED;
      } else {
        var _txRecipt2;
        res = await this.getBlockInsideDetails(network.toLowerCase(), txHash);
        txRecipt = res;
        (0, _utility.log)("here is the txHash: ", txRecipt);

        //check the transaction on explorer api if not found in current block
        if (!txRecipt) {
          var _res2, _res2$data;
          (0, _utility.log)("api called for searching the tx: ", txHash);
          res = await (0, _network_calls.httpRequest)(rpcUrl + txHash, _Constants.HTTP_METHODS.GET);
          txRecipt = (_res2 = res) === null || _res2 === void 0 ? void 0 : (_res2$data = _res2.data) === null || _res2$data === void 0 ? void 0 : _res2$data.transaction;
        }
        if (!(0, _utility.isNullorUndef)((_txRecipt2 = txRecipt) === null || _txRecipt2 === void 0 ? void 0 : _txRecipt2.status)) {
          if ((0, _utility.isEqual)(txRecipt.status.toLowerCase(), _Constants.STATUS.SUCCESS.toLowerCase())) txRecipt.status = _Constants.STATUS.SUCCESS;
          if ((0, _utility.isEqual)(txRecipt.status.toLowerCase(), _Constants.STATUS.FAILED.toLowerCase())) txRecipt.status = _Constants.STATUS.FAILED;
        }
      }

      //transform the evm status to success or fail
      if ((0, _utility.isNullorUndef)((_txRecipt3 = txRecipt) === null || _txRecipt3 === void 0 ? void 0 : _txRecipt3.status) && (0, _utility.isString)((_txRecipt4 = txRecipt) === null || _txRecipt4 === void 0 ? void 0 : _txRecipt4.status) && (0, _utility.isEqual)((_txRecipt5 = txRecipt) === null || _txRecipt5 === void 0 ? void 0 : _txRecipt5.status, _Constants.STATUS.PENDING.toLowerCase())) txRecipt = null;
      return txRecipt;
    });
    //assign the latest block to blockSlots
    _defineProperty(this, "getCurrentBlockNumber", async network => {
      try {
        const {
          nativeApi
        } = NetworkHandler.api[network];
        const blockHeader = await nativeApi.rpc.chain.getHeader();
        TransactionQueue.blockSlots[network] = Number(blockHeader === null || blockHeader === void 0 ? void 0 : blockHeader.number) || 0;
        (0, _utility.log)("blockheader: ", TransactionQueue.blockSlots[network]);
      } catch (err) {
        (0, _utility.log)("error while saving the latest block: ", err);
      }
    });
    //create rpc handler
    _defineProperty(this, "createConnection", async currentNetwork => {
      const connector = _connection.Connection.getInsatnce();
      const apiConn = await connector.initializeApi(currentNetwork);

      //check if there is error property connection payload
      if (apiConn !== null && apiConn !== void 0 && apiConn.error) {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.FAILED_TO_CONNECT_NETWORK, apiConn === null || apiConn === void 0 ? void 0 : apiConn.error.message));
        return {
          error: apiConn === null || apiConn === void 0 ? void 0 : apiConn.error
        };
      }
      return apiConn;
    });
    //pass message to extension ui
    _defineProperty(this, "messageToUI", async (event, message) => {
      try {
        (0, _message_helper.sendRuntimeMessage)(_Constants.MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND, event, message);
      } catch (err) {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, err.message));
      }
    });
    //update the local storage data
    _defineProperty(this, "updateLocalState", async (key, data, options) => {
      const res = await _loadstore.ExtensionStorageHandler.updateStorage(key, data, options);
      if (res) ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, res);
    });
    //update the pending transaction balance
    _defineProperty(this, "updatePendingTransactionBalance", async function (network, address, value, isEvm) {
      let isInc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      const transactionBalance = {
        evm: 0,
        native: 0
      };
      const state = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
      const accountBalance = state.pendingTransactionBalance[address][network];
      if (isInc) {
        if (isEvm) transactionBalance.evm = accountBalance.evm + value;else transactionBalance.native = accountBalance.native + value;
      } else {
        if (isEvm) transactionBalance.evm = accountBalance.evm - value;else transactionBalance.native = accountBalance.native - value;
      }

      // log(`Here is the Balance: evm: ${transactionBalance.evm} native: ${transactionBalance.native} for acc ${address} and network ${network} or chain is evm (true/false): ${isEvm}`);

      await _this.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.UPDATE_PENDING_TRANSACTION_BALANCE, transactionBalance, {
        network,
        address
      });
    });
    /**
     * some transaction are lapsed by the system on a particular case
     * this service run on a certain time period and check if there
     * is any pending transaction if found then check of treansaction status
     * and save status if they whether failed or success
     */
    _defineProperty(this, "checkPendingTransaction", async () => {
      try {
        var _localDataState$txHis;
        InitBackground.isStatusCheckerRunning = true;
        const localDataState = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
        const account = localDataState.currentAccount;
        const pendingHistoryItem = (_localDataState$txHis = localDataState.txHistory[account.evmAddress]) === null || _localDataState$txHis === void 0 ? void 0 : _localDataState$txHis.filter(historyItem => historyItem.status === _Constants.STATUS.PENDING);
        if (!(pendingHistoryItem !== null && pendingHistoryItem !== void 0 && pendingHistoryItem.length)) return;

        //check the transaction status and update the status inside local storage
        for (const hItem of pendingHistoryItem) {
          if (hItem !== null && hItem !== void 0 && hItem.txHash) {
            const {
              txHash,
              isEvm,
              chain
            } = hItem;
            const transactionStatus = await this.getTransactionStatus(txHash, isEvm, chain);
            if (transactionStatus !== null && transactionStatus !== void 0 && transactionStatus.status) {
              //update the transaction after getting the confirmation
              hItem.status = transactionStatus.status;

              //set the used gas
              hItem.gasUsed = hItem.isEvm ? (Number(transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.gasUsed) / _Constants.ONE_ETH_IN_GWEI).toString() : transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.txFee;

              //check the transaction type and save the to recipent according to type
              if ((0, _utility.isEqual)(hItem === null || hItem === void 0 ? void 0 : hItem.type, _Constants.TX_TYPE.NATIVE_APP)) hItem.to = transactionStatus === null || transactionStatus === void 0 ? void 0 : transactionStatus.sectionmethod;else hItem.to = hItem.intermidateHash ? hItem.to : hItem.isEvm ? transactionStatus.to || transactionStatus.contractAddress : hItem.to;
              await this.updateLocalState(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, hItem, {
                account
              });
            }
          }
        }
      } catch (err) {
        (0, _utility.log)("error while checking the lapsed pending transactions: ", err);
      }
    });
    /*************************** Service Internals ******************************/
    //show browser notification from extension
    _defineProperty(this, "showNotification", message => {
      if ((0, _utility.hasLength)(message)) this.notificationAndBedgeManager.showNotification(message);
    });
    this.notificationAndBedgeManager = _platform.NotificationAndBedgeManager.getInstance();
  }
}

//for transaction realted calls
exports.Services = Services;
class TransactionsRPC {
  constructor() {
    //********************************** Evm ***************************************/
    //evm transfer
    _defineProperty(this, "evmTransfer", async (message, state) => {
      //history reference object
      let transactionHistory = {
          ...(message === null || message === void 0 ? void 0 : message.transactionHistoryTrack)
        },
        payload = null;
      try {
        var _transactionHistoryTr, _data$options;
        const {
          data,
          transactionHistoryTrack,
          contractBytecode
        } = message;
        const {
          options: {
            account,
            fee
          }
        } = data;
        const network = ((_transactionHistoryTr = transactionHistoryTrack.chain) === null || _transactionHistoryTr === void 0 ? void 0 : _transactionHistoryTr.toLowerCase()) || state.currentNetwork.toLowerCase();
        const {
          evmApi
        } = NetworkHandler.api[network];
        const balance = state.allAccountsBalance[account === null || account === void 0 ? void 0 : account.evmAddress][network];
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();

        // transactionHistory.status = STATUS.PENDING

        const tempAmount = data !== null && data !== void 0 && (_data$options = data.options) !== null && _data$options !== void 0 && _data$options.isBig ? new _bignumber.BigNumber(data.value).dividedBy(_Constants.DECIMALS).toString() : data.value;
        const balanceWithFee = Number(tempAmount) + Number(fee);
        if (balanceWithFee > Number(balance.evmBalance) - (state.pendingTransactionBalance[account.evmAddress][network].evm - balanceWithFee)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INSUFFICENT_BALANCE, _Constants.ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();else {
          var _data$options2;
          const amt = new _bignumber.BigNumber(data.value).multipliedBy(_Constants.DECIMALS).toString();
          const to = _web.default.utils.toChecksumAddress(data.to);
          const value = data !== null && data !== void 0 && (_data$options2 = data.options) !== null && _data$options2 !== void 0 && _data$options2.isBig ? data.value : Number(amt).noExponents().toString();
          const nonce = await evmApi.eth.getTransactionCount(account.evmAddress, _Constants.STATUS.PENDING.toLowerCase());
          const feeRes = await this._getEvmFee(to, account.evmAddress, value, state, contractBytecode);
          const transactions = {
            to,
            gas: 21000,
            data: contractBytecode ? contractBytecode : "0x",
            value: "0x" + Number(value).toString(16),
            nonce: "0x" + Number(nonce).toString(16),
            gasLimit: "0x" + Number(feeRes.gasLimit).toString(16),
            gasPrice: "0x" + Number(feeRes.gasPrice).toString(16)
          };
          const signedTx = await this.hybridKeyring.signEthTx(account.evmAddress, transactions);

          //Sign And Send Transaction
          const txInfo = await evmApi.eth.sendSignedTransaction(signedTx);
          const hash = txInfo.transactionHash;
          if (hash) {
            transactionHistory.txHash = hash;

            //return the payload
            payload = {
              data: transactionHistory,
              options: {
                ...data.options
              }
            };
            return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
          } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NETWORK_REQUEST, _Constants.ERROR_MESSAGES.TX_FAILED)).throw();
        }
      } catch (err) {
        payload = {
          data: null,
          options: {
            ...message.data.options
          }
        };

        //check for the revert case
        const evmRevertedTx = JSON.parse(JSON.stringify(err));
        if (evmRevertedTx !== null && evmRevertedTx !== void 0 && evmRevertedTx.receipt || transactionHistory.txHash) {
          transactionHistory.txHash = evmRevertedTx.receipt.transactionHash;
          transactionHistory.status = _Constants.STATUS.PENDING;
          payload.data = transactionHistory;
          return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
        } else {
          transactionHistory.status = _Constants.STATUS.FAILED;
          payload.data = transactionHistory;
          return new _network_calls.EventPayload(null, _Constants.ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
        }
      }
    });
    //evm to native swap
    _defineProperty(this, "evmToNativeSwap", async (message, state) => {
      //history reference object
      let transactionHistory = {
          ...(message === null || message === void 0 ? void 0 : message.transactionHistoryTrack)
        },
        payload = null;
      try {
        var _transactionHistoryTr2;
        const {
          data,
          transactionHistoryTrack
        } = message;
        const {
          options: {
            account,
            fee
          }
        } = data;
        const network = ((_transactionHistoryTr2 = transactionHistoryTrack.chain) === null || _transactionHistoryTr2 === void 0 ? void 0 : _transactionHistoryTr2.toLowerCase()) || state.currentNetwork.toLowerCase();
        const {
          evmApi,
          nativeApi
        } = NetworkHandler.api[network];
        const balance = state.allAccountsBalance[account === null || account === void 0 ? void 0 : account.evmAddress][network];
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();

        // transactionHistory.status = STATUS.PENDING;

        const balanceWithFee = Number(data.value) + Number(fee);
        if (balanceWithFee >= Number(balance === null || balance === void 0 ? void 0 : balance.evmBalance) - (state.pendingTransactionBalance[account.evmAddress][network].evm - balanceWithFee)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INSUFFICENT_BALANCE, _Constants.ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();else {
          const alice = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
          const to = (0, _util.u8aToHex)(alice.publicKey).slice(0, 42);
          const amt = new _bignumber.BigNumber(data.value).multipliedBy(_Constants.DECIMALS).toString();
          const from = account.evmAddress;
          const nonce = await evmApi.eth.getTransactionCount(account.evmAddress);
          const feeRes = await this._getEvmFee(to, from, Math.round(data.value), state);
          const value = Number(amt).noExponents().toString();
          const transactions = {
            to,
            gas: 21000,
            nonce: "0x" + Number(nonce).toString(16),
            value: "0x" + Number(value).toString(16),
            gasLimit: "0x" + Number(feeRes.gasLimit).toString(16),
            gasPrice: "0x" + Number(feeRes.gasPrice).toString(16)
          };
          const signedTx = await this.hybridKeyring.signEthTx(account.evmAddress, transactions);

          //sign and send
          const txInfo = await evmApi.eth.sendSignedTransaction(signedTx);
          const signHash = txInfo.transactionHash;
          if (signHash) {
            //withdraw amount from middle account
            const bal = await evmApi.eth.getBalance(to);
            const withdraw = await nativeApi.tx.evm.withdraw(to, bal);
            const signRes = await withdraw.signAndSend(alice);
            transactionHistory.txHash = signHash;
            transactionHistory.intermidateHash = signRes.toHex();
            payload = {
              data: transactionHistory,
              options: {
                ...data.options
              }
            };
            return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
          } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NETWORK_REQUEST, _Constants.ERROR_MESSAGES.TX_FAILED)).throw();
        }
      } catch (err) {
        (0, _utility.log)("error while evm to native swap: ", err);
        transactionHistory.status = transactionHistory.txHash ? _Constants.STATUS.PENDING : _Constants.STATUS.FAILED;
        payload = {
          data: transactionHistory,
          options: {
            ...message.data.options
          }
        };
        return new _network_calls.EventPayload(null, _Constants.ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
      }
    });
    //********************************** Native ***************************************/
    //native transfer
    _defineProperty(this, "nativeTransfer", async (message, state) => {
      let transactionHistory = {
          ...(message === null || message === void 0 ? void 0 : message.transactionHistoryTrack)
        },
        payload = null;
      try {
        var _transactionHistoryTr3;
        const {
          data,
          transactionHistoryTrack
        } = message;
        const {
          options: {
            account,
            fee
          },
          isEd
        } = data;
        const network = ((_transactionHistoryTr3 = transactionHistoryTrack.chain) === null || _transactionHistoryTr3 === void 0 ? void 0 : _transactionHistoryTr3.toLowerCase()) || state.currentNetwork.toLowerCase();
        const {
          nativeApi
        } = NetworkHandler.api[network];
        const balance = state.allAccountsBalance[account === null || account === void 0 ? void 0 : account.evmAddress][network];
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
        const balanceWithFee = Number(data.value) + Number(fee);
        if (balanceWithFee >= Number(balance === null || balance === void 0 ? void 0 : balance.nativeBalance) - (state.pendingTransactionBalance[account.evmAddress][network].native - balanceWithFee)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INSUFFICENT_BALANCE, _Constants.ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();else {
          //set the status to pending
          // transactionHistory.status = STATUS.PENDING;

          let err;
          const amt = new _bignumber.BigNumber(data.value).multipliedBy(_Constants.DECIMALS).toString();
          const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
          let transfer;
          if (isEd) transfer = nativeApi.tx.balances.transferKeepAlive(data.to, Number(amt).noExponents().toString());else transfer = nativeApi.tx.balances.transfer(data.to, Number(amt).noExponents().toString());

          //save the current block number
          await this.services.getCurrentBlockNumber(network);
          if (RpcRequestProcessor.isHttp) {
            const txHash = await transfer.signAndSend(signer);
            if (txHash) {
              if (txHash) {
                const hash = txHash.toHex();
                transactionHistory.txHash = hash;
                payload = {
                  data: transactionHistory,
                  options: {
                    ...data.options
                  }
                };
                return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload);
              } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NETWORK_REQUEST, _Constants.ERROR_MESSAGES.TX_FAILED)).throw();
            } else {
              //Send and sign txn
              const {
                status,
                events,
                txHash
              } = transfer.signAndSend(signer);
              if (status.isInBlock) {
                const hash = txHash.toHex();
                let phase = events.filter(_ref3 => {
                  let {
                    phase
                  } = _ref3;
                  return phase.isApplyExtrinsic;
                });

                //Matching Extrinsic Events for get the status
                phase.forEach(_ref4 => {
                  let {
                    event
                  } = _ref4;
                  if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                    err = false;
                    transactionHistory.status = _Constants.STATUS.SUCCESS;
                  } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                    err = false;
                    transactionHistory.status = _Constants.STATUS.FAILED;
                  }
                });
                transactionHistory.txHash = hash ? hash : "";
                if (err) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NETWORK_REQUEST, _Constants.ERROR_MESSAGES.TX_FAILED)).throw();else {
                  return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
                }
              }
            }
          }
        }
      } catch (err) {
        transactionHistory.status = transactionHistory.txHash ? _Constants.STATUS.PENDING : _Constants.STATUS.FAILED;
        payload = {
          data: transactionHistory,
          options: {
            ...message.data.options
          }
        };
        return new _network_calls.EventPayload(null, _Constants.ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
      }
    });
    //native to evm swap
    _defineProperty(this, "nativeToEvmSwap", async (message, state) => {
      let transactionHistory = {
          ...(message === null || message === void 0 ? void 0 : message.transactionHistoryTrack)
        },
        payload = null;
      try {
        var _transactionHistoryTr4;
        const {
          data,
          transactionHistoryTrack
        } = message;
        const {
          options: {
            account,
            fee
          }
        } = data;
        const network = ((_transactionHistoryTr4 = transactionHistoryTrack.chain) === null || _transactionHistoryTr4 === void 0 ? void 0 : _transactionHistoryTr4.toLowerCase()) || state.currentNetwork.toLowerCase();
        const {
          nativeApi
        } = NetworkHandler.api[network];
        const balance = state.allAccountsBalance[account.evmAddress][network];
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
        const balanceWithFee = Number(data.value) + Number(fee);
        if (balanceWithFee >= Number(balance === null || balance === void 0 ? void 0 : balance.nativeBalance) - (state.pendingTransactionBalance[account.evmAddress][network].native - balanceWithFee)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INSUFFICENT_BALANCE, _Constants.ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();else {
          // transactionHistory.status = STATUS.PENDING;
          let err, evmDepositeHash, signedHash;
          const amt = new _bignumber.BigNumber(data.value).multipliedBy(_Constants.DECIMALS).toString();
          const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

          //Deposite amount
          let deposit = await nativeApi.tx.evm.deposit(account === null || account === void 0 ? void 0 : account.evmAddress, Number(amt).noExponents().toString());

          //save the current block number
          await this.services.getCurrentBlockNumber(network);
          evmDepositeHash = deposit.hash.toHex();
          if (RpcRequestProcessor.isHttp) {
            //Sign and Send txn for http provider
            const txHash = await deposit.signAndSend(signer);
            if (txHash) {
              const hash = txHash.toHex();
              transactionHistory.txHash = hash;
              transactionHistory.intermidateHash = evmDepositeHash;
              payload = {
                data: transactionHistory,
                options: {
                  ...data.options
                }
              };
              return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
            } else {
              new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NETWORK_REQUEST, _Constants.ERROR_MESSAGES.TX_FAILED)).throw();
            }
          } else {
            //Sign and Send txn for websocket provider
            deposit.signAndSend(signer, _ref5 => {
              let {
                status,
                events,
                txHash
              } = _ref5;
              if (status.isInBlock) {
                if (signedHash !== txHash) {
                  signedHash = txHash.toHex();
                  let phase = events.filter(_ref6 => {
                    let {
                      phase
                    } = _ref6;
                    return phase.isApplyExtrinsic;
                  });

                  //Matching Extrinsic Events for get the status
                  phase.forEach(_ref7 => {
                    let {
                      event
                    } = _ref7;
                    if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                      err = false;
                      transactionHistory.status = _Constants.STATUS.SUCCESS;
                    } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                      err = true;
                      transactionHistory.status = _Constants.STATUS.FAILED;
                    }
                  });
                  transactionHistory.txHash = signedHash;
                  transactionHistory.intermidateHash = evmDepositeHash;
                  if (err) {
                    new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NETWORK_REQUEST, _Constants.ERROR_MESSAGES.TX_FAILED)).throw();
                  } else {
                    return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload);
                  }
                }
              }
            });
          }
        }
      } catch (err) {
        transactionHistory.status = transactionHistory !== null && transactionHistory !== void 0 && transactionHistory.txHash ? _Constants.STATUS.PENDING : _Constants.STATUS.FAILED;
        payload = {
          data: transactionHistory,
          options: {
            ...message.data.options
          }
        };
        return new _network_calls.EventPayload(null, _Constants.ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
      }
    });
    _defineProperty(this, "validatorNominatorTransaction", async (message, state) => {
      try {
        //save the current block
        await this.services.getCurrentBlockNumber(message.options.network);
        const eventPayload = await this.nominatorValidatorHandler.handleNativeAppsTask(state, message, false);
        return eventPayload;
      } catch (err) {
        const payload = {
          options: message === null || message === void 0 ? void 0 : message.options,
          data: message === null || message === void 0 ? void 0 : message.transactionHistoryTrack
        };
        return new _network_calls.EventPayload(null, null, payload, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
      }
    });
    /**************************************** Internal Methods *****************************/
    //internal method for getting the evm fee
    _defineProperty(this, "_getEvmFee", async function (to, from, amount, state) {
      let data = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
      const tx = {
        to: to || null,
        from,
        value: amount
      };
      if (data) tx.data = data;
      (0, _utility.log)("here is address: ", tx);
      const {
        evmApi
      } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const gasLimit = await evmApi.eth.estimateGas(tx);
      const gasPrice = await evmApi.eth.getGasPrice();
      const gasFee = new _bignumber.BigNumber(gasPrice * gasLimit).dividedBy(_Constants.DECIMALS).toString();
      return {
        gasLimit,
        gasPrice,
        gasFee
      };
    });
    this.hybridKeyring = _ireKeyring.HybridKeyring.getInstance();
    this.services = new Services();
    this.nominatorValidatorHandler = _nativehelper.default.getInstance();
  }
}

//for balance, fee and other calls
exports.TransactionsRPC = TransactionsRPC;
class GeneralWalletRPC {
  constructor() {
    //for fething the balance of both (evm and native)
    _defineProperty(this, "getBalance", async (message, state) => {
      try {
        var _state$currentAccount, _NetworkHandler$api$s, _evmApi$eth;
        // console.log("network and api: ", NetworkHandler.api, state.currentNetwork);
        const balance = state.allAccountsBalance[(_state$currentAccount = state.currentAccount) === null || _state$currentAccount === void 0 ? void 0 : _state$currentAccount.evmAddress][state.currentNetwork.toLowerCase()];
        if (!((_NetworkHandler$api$s = NetworkHandler.api[state.currentNetwork.toLowerCase()]) !== null && _NetworkHandler$api$s !== void 0 && _NetworkHandler$api$s.evmApi)) return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.BALANCE, null, {
          data: balance
        });
        let nbalance = 0;
        const {
          evmApi,
          nativeApi
        } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
        const account = state.currentAccount;
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();

        // Evm Balance
        const w3balance = await (evmApi === null || evmApi === void 0 ? void 0 : (_evmApi$eth = evmApi.eth) === null || _evmApi$eth === void 0 ? void 0 : _evmApi$eth.getBalance(account.evmAddress));

        //Native Balance
        if (RpcRequestProcessor.isHttp) {
          let balance_ = await (nativeApi === null || nativeApi === void 0 ? void 0 : nativeApi._query.system.account(account.nativeAddress));
          nbalance = parseFloat(`${balance_.data.free}`) - parseFloat(`${balance_.data.miscFrozen}`);
        } else {
          let balance_ = await (nativeApi === null || nativeApi === void 0 ? void 0 : nativeApi.derive.balances.all(account.nativeAddress));
          nbalance = balance_.availableBalance;
        }
        let evmBalance = new _bignumber.BigNumber(w3balance).dividedBy(_Constants.DECIMALS).toString();
        let nativeBalance = new _bignumber.BigNumber(nbalance).dividedBy(_Constants.DECIMALS).toString();
        if (Number(nativeBalance) % 1 !== 0) {
          let tempBalance = new _bignumber.BigNumber(nbalance).dividedBy(_Constants.DECIMALS).toFixed(6, 8).toString();
          if (Number(tempBalance) % 1 === 0) nativeBalance = parseInt(tempBalance);else nativeBalance = tempBalance;
        }
        if (Number(evmBalance) % 1 !== 0) {
          let tempBalance = new _bignumber.BigNumber(w3balance).dividedBy(_Constants.DECIMALS).toFixed(6, 8).toString();
          if (Number(tempBalance) % 1 === 0) evmBalance = parseInt(tempBalance);else evmBalance = tempBalance;
        }
        let totalBalance = new _bignumber.BigNumber(evmBalance).plus(nativeBalance).toString();
        if (Number(totalBalance) % 1 !== 0) totalBalance = new _bignumber.BigNumber(evmBalance).plus(nativeBalance).toFixed(6, 8).toString();
        const payload = {
          data: {
            evmBalance,
            nativeBalance,
            totalBalance
          }
        };
        return new _network_calls.EventPayload(_Constants.STATE_CHANGE_ACTIONS.BALANCE, null, payload);
      } catch (err) {
        return new _network_calls.EventPayload(null, null, null, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_BALANCE_FETCH, err.message));
      }
    });
    //get the evm fee
    _defineProperty(this, "evmFee", async (message, state) => {
      try {
        var _toAddress, _toAddress2;
        const {
          data
        } = message;
        const {
          options: {
            account
          }
        } = data;
        const {
          evmApi
        } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
        let toAddress = data.toAddress ? data.toAddress : data !== null && data !== void 0 && data.data ? null : account.nativeAddress;
        let amount = data === null || data === void 0 ? void 0 : data.value;
        if ((_toAddress = toAddress) !== null && _toAddress !== void 0 && _toAddress.startsWith("5")) {
          toAddress = (0, _util.u8aToHex)(toAddress).slice(0, 42);
        }
        if ((_toAddress2 = toAddress) !== null && _toAddress2 !== void 0 && _toAddress2.startsWith("0x")) {
          amount = Math.round(Number(amount));
          toAddress && _web.default.utils.toChecksumAddress(toAddress);
        }
        const tx = {
          to: toAddress,
          from: account.evmAddress,
          value: amount
        };
        if (data !== null && data !== void 0 && data.data) {
          tx.data = data.data;
        }
        (0, _utility.log)("here is address: ", tx);
        const gasAmount = await evmApi.eth.estimateGas(tx);
        const gasPrice = await evmApi.eth.getGasPrice();
        const fee = new _bignumber.BigNumber(gasPrice * gasAmount).dividedBy(_Constants.DECIMALS).toString();
        const payload = {
          data: {
            fee
          }
        };
        return new _network_calls.EventPayload(null, message.event, payload);
      } catch (err) {
        return new _network_calls.EventPayload(null, null, null, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message));
      }
    });
    //get native gas fee
    _defineProperty(this, "nativeFee", async (message, state) => {
      try {
        var _transferTx;
        const {
          data
        } = message;
        const {
          options: {
            account
          },
          isEd
        } = data;
        const {
          nativeApi
        } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
        if ((0, _utility.isNullorUndef)(account)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
        const toAddress = data.toAddress ? data.toAddress : account.evmAddress;
        let transferTx;
        const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
        if (toAddress !== null && toAddress !== void 0 && toAddress.startsWith("0x")) {
          const amt = (0, _bignumber.BigNumber)(data.value).multipliedBy(_Constants.DECIMALS).toString();
          transferTx = await nativeApi.tx.evm.deposit(toAddress, Number(amt).noExponents().toString());
        } else if (toAddress !== null && toAddress !== void 0 && toAddress.startsWith("5")) {
          const amt = new _bignumber.BigNumber(data.value).multipliedBy(_Constants.DECIMALS).toString();
          if (isEd) transferTx = nativeApi.tx.balances.transferKeepAlive(toAddress, Number(amt).noExponents().toString());else transferTx = nativeApi.tx.balances.transfer(toAddress, Number(amt).noExponents().toString());
        }
        const info = await ((_transferTx = transferTx) === null || _transferTx === void 0 ? void 0 : _transferTx.paymentInfo(signer));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toString();

        //construct payload
        const payload = {
          data: {
            fee
          }
        };
        return new _network_calls.EventPayload(null, message.event, payload);
      } catch (err) {
        return new _network_calls.EventPayload(null, null, null, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message));
      }
    });
    //external native transaction fee
    _defineProperty(this, "externalNativeTransactionArgsAndGas", async (message, state) => {
      var _activeSession$messag3;
      const {
        activeSession
      } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
      const {
        nativeApi: api
      } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const hex = (_activeSession$messag3 = activeSession.message) === null || _activeSession$messag3 === void 0 ? void 0 : _activeSession$messag3.method;

      // const DEFAULT_INFO = {
      //   decoded: null,
      //   extrinsicCall: null,
      //   extrinsicError: null,
      //   extrinsicFn: null,
      //   extrinsicHex: null,
      //   extrinsicKey: 'none',
      //   extrinsicPayload: null,
      //   isCall: true
      // };

      try {
        var _decoded, _decoded$method$toJSO;
        (0, _util.assert)((0, _util.isHex)(hex), "Expected a hex-encoded call");
        let extrinsicCall,
          extrinsicPayload = null,
          decoded = null;
        // let isCall = false;

        try {
          // cater for an extrinsic input
          const tx = api.tx(hex);

          // ensure that the full data matches here
          (0, _util.assert)(tx.toHex() === hex, "Cannot decode data as extrinsic, length mismatch");
          decoded = tx;
          extrinsicCall = api.createType("Call", decoded.method);
        } catch (e) {
          try {
            // attempt to decode as Call
            extrinsicCall = api.createType("Call", hex);
            const callHex = extrinsicCall.toHex();
            if (callHex === hex) {
              // all good, we have a call
              // isCall = true;
            } else if (hex.startsWith(callHex)) {
              // this could be an un-prefixed payload...
              const prefixed = (0, _util.u8aConcat)((0, _util.compactToU8a)(extrinsicCall.encodedLength), hex);
              extrinsicPayload = api.createType("ExtrinsicPayload", prefixed);
              (0, _util.assert)((0, _util.u8aEq)(extrinsicPayload.toU8a(), prefixed), "Unable to decode data as un-prefixed ExtrinsicPayload");
              extrinsicCall = api.createType("Call", extrinsicPayload.method.toHex());
            } else {
              new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, "Unable to decode data as Call, length mismatch in supplied data")).throw();
            }
          } catch {
            // final attempt, we try this as-is as a (prefixed) payload
            extrinsicPayload = api.createType("ExtrinsicPayload", hex);
            (0, _util.assert)(extrinsicPayload.toHex() === hex, "Unable to decode input data as Call, Extrinsic or ExtrinsicPayload");
            extrinsicCall = api.createType("Call", extrinsicPayload.method.toHex());
          }
        }
        const {
          method,
          section
        } = api.registry.findMetaCall(extrinsicCall.callIndex);
        const extrinsicFn = api.tx[section][method];
        // const extrinsicKey = extrinsicCall.callIndex.toString();

        if (!decoded) {
          decoded = extrinsicFn(...extrinsicCall.args);
        }
        const info = await ((_decoded = decoded) === null || _decoded === void 0 ? void 0 : _decoded.paymentInfo(this.hybridKeyring.getNativeSignerByAddress(state.currentAccount.nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        const params = (_decoded$method$toJSO = decoded.method.toJSON()) === null || _decoded$method$toJSO === void 0 ? void 0 : _decoded$method$toJSO.args;
        const payload = {
          method: `${section}.${method}`,
          estimatedGas: fee,
          args: params,
          txHash: decoded.hash.toHex()
        };
        return new _network_calls.EventPayload(null, message.event, {
          data: payload
        });
      } catch (err) {
        (0, _utility.log)("error formatting and getting the native external ", err);
        return new _network_calls.EventPayload(null, message.event, null, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message));
      }
    });
    //calculate the fee for nominator and validator
    _defineProperty(this, "validatorNominatorFee", async (message, state) => {
      try {
        const eventPayload = await this.nominatorValidatorHandler.handleNativeAppsTask(state, message, true);
        return eventPayload;
      } catch (err) {
        var _err$message;
        (0, _utility.log)("here is error: ", err);
        return new _network_calls.EventPayload(null, null, null, new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, (_err$message = err.message) !== null && _err$message !== void 0 && _err$message.errMessage ? err.message.errMessage : err.message));
      }
    });
    this.hybridKeyring = _ireKeyring.HybridKeyring.getInstance();
    this.nominatorValidatorHandler = _nativehelper.default.getInstance();
  }
}

//keyring handler
exports.GeneralWalletRPC = GeneralWalletRPC;
class KeyringHandler {
  constructor() {
    _defineProperty(this, "keyringHelper", async message => {
      try {
        if (this.hybridKeyring[message.event]) {
          const keyringResponse = await this._keyringCaller(message);
          this._parseKeyringRes(keyringResponse);

          //handle if the method is not the part of system
        } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, _Constants.ERROR_MESSAGES.UNDEF_PROPERTY)).throw();
      } catch (err) {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, err.message));
      }
    });
    _defineProperty(this, "_keyringCaller", async message => {
      try {
        const keyResponse = await this.hybridKeyring[message.event](message);
        return keyResponse;
      } catch (err) {
        return new _network_calls.EventPayload(null, message.event, null, new _error_helper.ErrorPayload(err.message.errCode || _Constants.ERRCODES.KEYRING_SECTION_ERROR, err.message.errMessage || err.message));
      }
    });
    //parse the response recieve from operation and send message accordingly to extension ui
    _defineProperty(this, "_parseKeyringRes", async response => {
      if (!response.error) {
        var _response$payload;
        //change the state in local storage
        if (response.stateChangeKey) await this.services.updateLocalState(response.stateChangeKey, response.payload, (_response$payload = response.payload) === null || _response$payload === void 0 ? void 0 : _response$payload.options);
        //send the response message to extension ui
        if (response.eventEmit) this.services.messageToUI(response.eventEmit, response.payload);
      } else {
        var _response$error;
        if (Number(response === null || response === void 0 ? void 0 : (_response$error = response.error) === null || _response$error === void 0 ? void 0 : _response$error.errCode) === 3) response.eventEmit && this.services.messageToUI(response.eventEmit, response.error);else ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.KEYRING_SECTION_ERROR, response.error));
      }
    });
    this.hybridKeyring = _ireKeyring.HybridKeyring.getInstance();
    this.services = new Services();
  }

  //If there is already an instance of this class then it will return this otherwise this will create it.
}

//network task handler
exports.KeyringHandler = KeyringHandler;
_defineProperty(KeyringHandler, "instance", null);
_defineProperty(KeyringHandler, "getInstance", () => {
  if (!KeyringHandler.instance) {
    KeyringHandler.instance = new KeyringHandler();
    delete KeyringHandler.constructor;
  }
  return KeyringHandler.instance;
});
class NetworkHandler {
  constructor() {
    //network handler request
    _defineProperty(this, "handleNetworkRelatedTasks", async (message, state) => {
      if (!(0, _utility.isNullorUndef)(message.event) && (0, _utility.hasProperty)(NetworkHandler.instance, message.event)) {
        const error = await NetworkHandler.instance[message.event](message, state);

        //check for errors while network operations
        if (error) {
          (0, _utility.log)("Error while performing network operation: ", error);
        }
      }
    });
    //change network handler
    // eslint-disable-next-line no-unused-vars
    _defineProperty(this, "networkChange", async (message, state) => {
      try {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.CONNECTION);
        return false;
      } catch (err) {
        return true;
      }
    });
    /******************************** connection handlers *********************************/
    _defineProperty(this, "initRpcApi", async () => {
      const {
        currentNetwork
      } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
      const api = await this.services.createConnection(currentNetwork);
      if (api !== null && api !== void 0 && api.error) return;

      //insert connection into its network slot
      NetworkHandler.api[currentNetwork.toLowerCase()] = api;
      (0, _utility.log)("all api is here: ", NetworkHandler.api);
      await this.checkNetwork();
    });
    //check the network connection
    _defineProperty(this, "checkNetwork", async () => {
      try {
        const state = await (0, _loadstore.getDataLocal)(_Constants.LABELS.STATE);
        const connectionApi = NetworkHandler.api[state.currentNetwork.toLowerCase()];
        const chainId = await connectionApi.evmApi.eth.getChainId();
        //send only if the extension opened
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.BALANCE_FETCH);
        InitBackground.uiStream && this.services.messageToUI(_Constants.MESSAGE_EVENT_LABELS.NETWORK_CHECK, {
          chainId
        });
      } catch (err) {
        ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.FAILED_TO_CONNECT_NETWORK, err.message));
        console.log("Exception in network check handler: ", err);
      }
    });
    this.services = new Services();
  }

  //get only single instance
}

//for the nominator and validator and other native transactions
exports.NetworkHandler = NetworkHandler;
_defineProperty(NetworkHandler, "instance", null);
_defineProperty(NetworkHandler, "api", {});
_defineProperty(NetworkHandler, "getInstance", () => {
  if (!NetworkHandler.instance) {
    NetworkHandler.instance = new NetworkHandler();
    NetworkHandler.createNetworkSlots();
    delete NetworkHandler.constructor;
  }
  return NetworkHandler.instance;
});
//create network slots
_defineProperty(NetworkHandler, "createNetworkSlots", () => {
  Object.keys(_Constants.HTTP_END_POINTS).forEach(key => NetworkHandler.api[key.toLowerCase()] = null);
});
class NativeSigner {
  constructor() {
    _defineProperty(this, "signPayload", async (payload, state) => {
      try {
        const account = state.currentAccount;
        const pair = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
        let registry;
        const isJsonPayload = value => {
          return (value === null || value === void 0 ? void 0 : value.genesisHash) !== undefined;
        };
        if (isJsonPayload(payload)) {
          registry = new _types.TypeRegistry();
          registry.setSignedExtensions(payload.signedExtensions);
          // }
        } else {
          // for non-payload, just create a registry to use
          registry = new _types.TypeRegistry();
        }
        const result = registry.createType("ExtrinsicPayload", payload, {
          version: payload.version
        }).sign(pair);
        return new _network_calls.EventPayload(null, null, {
          data: result
        });
      } catch (err) {
        (0, _utility.log)("error while signing the payload: ", err);
        return new _network_calls.EventPayload(null, null, null, (0, _error_helper.ErrorPayload)(_Constants.ERRCODES.SIGNER_ERROR, _Constants.ERROR_MESSAGES.SINGER_ERROR));
      }
    });
    _defineProperty(this, "signRaw", async (payload, state) => {
      try {
        const account = state.currentAccount;
        const pair = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
        const result = {
          signature: (0, _util.u8aToHex)(pair.sign((0, _util.u8aWrapBytes)(payload)))
        };
        return new _network_calls.EventPayload(null, null, {
          data: result
        });
      } catch (err) {
        (0, _utility.log)("error while signing the raw: ", err);
        return new _network_calls.EventPayload(null, null, null, new _error_helper.ErrorPayload(_Constants.ERRCODES.SIGNER_ERROR, _Constants.ERROR_MESSAGES.SINGER_ERROR));
      }
    });
    this.hybridKeyring = _ireKeyring.HybridKeyring.getInstance();
  }
}
exports.NativeSigner = NativeSigner;