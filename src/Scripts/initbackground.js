import Browser from "webextension-polyfill";
import { ErrorPayload } from "../Utility/error_helper";
import ExtensionPortStream from "./extension-port-stream-mod/index";
import { ExternalConnection } from "./controller";
import { getDataLocal } from "../Storage/loadstore";
import { sendMessageToTab } from "../Utility/message_helper";
import { isManifestV3 } from "./utils";
import { checkStringInclusionIntoArray } from "../Helper/helper";
import {
  LABELS,
  NETWORK,
  ERRCODES,
  WALLET_METHODS,
  ERROR_MESSAGES,
  SIGNER_METHODS,
  STREAM_CHANNELS,
  CONNECTION_METHODS,
  MESSAGE_TYPE_LABELS,
  STATE_CHANGE_ACTIONS,
  INTERNAL_EVENT_LABELS,
  AUTO_BALANCE_UPDATE_TIMER,
  VALIDATOR_NOMINATOR_METHOD,
  LAPSED_TRANSACTION_CHECKER_TIMER,
  RESTRICTED_ETHEREUM_METHODS
} from "../Constants";
import { log, isEqual, hasLength } from "../Utility/utility";
import { TabMessagePayload } from "../Utility/network_calls";
import { clearAllStorage } from "../Storage";
import { NetworkHandler } from "./NetworkHandler";
import { ContractHandler } from "./ContractHandler";
import { RpcRequestProcessor } from "./RpcRequestProcessor";
import { KeyringHandler } from "./KeyringHandler";
import { ExternalTxTasks } from "./ExternalTxTasks";
import { Services } from "./Services";
import { TransactionQueue } from "./TransactionQueue";
import { ExtensionEventHandle } from "./ExtensionEventHandle";

//for initilization of background events
export class InitBackground {
  //check if there is time interval binded
  static balanceTimer = null;
  static tokenBalanceTimer = null;
  static isStatusCheckerRunning = false;
  //background duplex stream for handling the communication between the content-script and background script
  static backgroundStream = null;
  static uiStream = null;

  constructor() {
    ExtensionEventHandle.initEventsAndGetInstance();
    this.injectScriptInTab();
    this.bindAllEvents();
    this.networkHandler = NetworkHandler.getInstance();
    this.contractHandler = ContractHandler.getInstance();
    this.rpcRequestProcessor = RpcRequestProcessor.getInstance();
    this.internalHandler = ExternalConnection.getInstance();
    this.keyringHandler = KeyringHandler.getInstance();
    this.externalTaskHandler = new ExternalTxTasks();

    if (!InitBackground.balanceTimer) {
      InitBackground.balanceTimer = this._balanceUpdate();
      InitBackground.tokenBalanceTimer = this._tokenBalanceUpdate();
      this._checkLapsedPendingTransactions();
    }
  }

  //init the background events
  static initBackground = () => {
    try {
      new InitBackground();
      delete InitBackground.constructor;
    } catch {
      console.log("Error while initializing background ");
    }
  };

  /****************** Inject the script into current active tabs ******************/
  //inject the script on current webpage
  injectScriptInTab = async () => {
    try {
      await Browser.scripting.registerContentScripts([
        {
          id: "inpage",
          matches: ["http://*/*", "https://*/*"],
          js: ["./static/js/injected.js"],
          runAt: "document_start",
          world: "MAIN"
        }
      ]);
    } catch (err) {
      /**
       * An error occurs when app-init.js is reloaded. Attempts to avoid the duplicate script error:
       * 1. registeringContentScripts inside runtime.onInstalled - This caused a race condition
       *    in which the provider might not be loaded in time.
       * 2. await chrome.scripting.getRegisteredContentScripts() to check for an existing
       *    inpage script before registering - The provider is not loaded on time.
       */
    }
  };

  /****************** Events Bindings ******************/
  //bind all events
  bindAllEvents = () => {
    this.bindStreamEventAndCreateStreams();
    this.bindInstallandUpdateEvents();
    this.bindExtensionUnmountEvents();
    this.bindBackgroundStartupEvents();
  };

  //bind the runtime message events
  bindStreamEventAndCreateStreams = async () => {
    /**
     * create the duplex stream for bi-directional communication
     * currently only added the streams for extension-ui and content-scirpt
     * communication
     */
    Browser.runtime.onConnect.addListener(async (port) => {
      if (isEqual(port.name, STREAM_CHANNELS.CONTENTSCRIPT)) {
        InitBackground.backgroundStream = new ExtensionPortStream(port);
        //bind the stream data event for getting the messages from content-script
        InitBackground.backgroundStream.on("data", externalEventStream);
      } else if (isEqual(port.name, STREAM_CHANNELS.EXTENSION_UI)) {
        InitBackground.uiStream = new ExtensionPortStream(port);
        //bind the stream data event for getting the message from extension-ui
        InitBackground.uiStream.on("data", internalEventStream);

        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
      }

      //port disconnect event
      port.onDisconnect.addListener((port) => {
        if (isEqual(port.name, STREAM_CHANNELS.CONTENTSCRIPT))
          InitBackground.backgroundStream = null;
        else if (isEqual(port.name, STREAM_CHANNELS.EXTENSION_UI)) InitBackground.uiStream = null;
      });
    });

    //callbacks for binding messages with stream data event
    //for external streamed messages
    const externalEventStream = async ({ message, sender }) => {
      const localData = await getDataLocal(LABELS.STATE);

      try {
        //check if message is array or onject
        message.message = hasLength(message.message) ? message.message[0] : message.message;

        //data for futher proceeding
        const data = {
          ...message,
          //for firefox and chrome tab origin
          origin: sender?.origin || new URL(sender?.url).origin,
          tabId: sender.tab?.id
        };

        // console.log("external message: ", message, data);
        //check if the app has the permission to access requested method
        if (!checkStringInclusionIntoArray(data?.method)) {
          const { connectedApps } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
          const isHasAccess = connectedApps[data.origin];
          if (!isHasAccess?.isConnected) {
            data?.tabId &&
              sendMessageToTab(
                data.tabId,
                new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.ACCESS_NOT_GRANTED)
              );
            return;
          }
        }

        //checks for event from injected script
        switch (data.method) {
          case CONNECTION_METHODS.CONNECT:
          case CONNECTION_METHODS.ETH_REQUEST_ACCOUNTS:
          case CONNECTION_METHODS.ETH_ACCOUNTS:
            await this.internalHandler.handleConnect(data, localData);
            break;
          case WALLET_METHODS.DISCONNECT:
            await this.internalHandler.handleDisconnect(data, localData);
            break;
          case RESTRICTED_ETHEREUM_METHODS.ETH_SEND_TRANSACTION:
            await this.internalHandler.handleEthTransaction(data, localData);
            break;
          case WALLET_METHODS.GET_END_POINT:
            await this.internalHandler.sendEndPoint(data, localData);
            break;
          case SIGNER_METHODS.SIGN_PAYLOAD:
          case SIGNER_METHODS.SIGN_RAW:
            await this.internalHandler.handleNativeSigner(data);
            break;
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
            await this.internalHandler.handleValidatorNominatorTransactions(data);
            break;
          default:
            data?.tabId &&
              sendMessageToTab(
                data.tabId,
                new TabMessagePayload(
                  data.message.id,
                  null,
                  null,
                  null,
                  ERROR_MESSAGES.INVALID_METHOD
                )
              );
        }
      } catch (err) {
        log("error in externalEventStream : ", err);
        ExtensionEventHandle.eventEmitter.emit(
          INTERNAL_EVENT_LABELS.ERROR,
          new ErrorPayload(ERRCODES.RUNTIME_MESSAGE_SECTION_ERROR, err.message)
        );
      }
    };

    // for internal extension streamed messages
    /**
     * not using currently but used when we replace the message passing
     * with long-live stream conenction
     */
    const internalEventStream = async ({ message }) => {
      const localData = await getDataLocal(LABELS.STATE);
      //checks for event from extension ui
      if (
        isEqual(message?.type, MESSAGE_TYPE_LABELS.INTERNAL_TX) ||
        isEqual(message?.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)
      )
        await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);
      else if (message?.type === MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL)
        await this.externalTaskHandler.processExternalTask(message, localData);
      else if (message?.type === MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING)
        await this.keyringHandler.keyringHelper(message, localData);
      else if (message?.type === MESSAGE_TYPE_LABELS.NETWORK_HANDLER)
        this.networkHandler.handleNetworkRelatedTasks(message, localData);
    };

    Browser.runtime.onMessage.addListener(async (message) => {
      const localData = await getDataLocal(LABELS.STATE);
      //checks for event from extension ui
      if (
        isEqual(message?.type, MESSAGE_TYPE_LABELS.INTERNAL_TX) ||
        isEqual(message?.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)
      ) {
        await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);
      } else if (message?.type === MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL) {
        await this.externalTaskHandler.processExternalTask(message, localData);
      } else if (message?.type === MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING) {
        await this.keyringHandler.keyringHelper(message, localData);
      } else if (message?.type === MESSAGE_TYPE_LABELS.NETWORK_HANDLER) {
        this.networkHandler.handleNetworkRelatedTasks(message, localData);
      } else if (message?.type === MESSAGE_TYPE_LABELS.CONTRACT) {
        this.contractHandler.handleContractRelatedTasks(message, localData);
      }
    });
  };

  /** Fired when the extension is first installed,
  when the extension is updated to a new version,
  and when Chrome is updated to a new version. */
  bindInstallandUpdateEvents = async () => {
    Browser.runtime.onInstalled.addListener(async () => {
      const services = new Services();
      const state = await getDataLocal(LABELS.STATE);
      const pendingTxBalance = state.pendingTransactionBalance;

      // clear the pending transaction balance
      const transactionBalance = { evm: 0 };
      for (const account of Object.keys(pendingTxBalance)) {
        for (const network of Object.values(NETWORK)) {
          await services.updateLocalState(
            STATE_CHANGE_ACTIONS.UPDATE_PENDING_TRANSACTION_BALANCE,
            transactionBalance,
            { network: network.toLowerCase(), address: account }
          );
        }
      }

      // await services.updateLocalState("lock", { isLogin: false });

      //clear the all pending request from local store when extension updated or refreshed
      await services.updateLocalState(STATE_CHANGE_ACTIONS.CLEAR_ALL_EXTERNAL_REQUESTS, {});
      //clear the transaction queue when refreshed
      await services.updateLocalState(STATE_CHANGE_ACTIONS.CLEAR_TRANSACTION_QUEUE, {});

      if (isManifestV3) {
        for (const cs of Browser.runtime.getManifest().content_scripts) {
          for (const tab of await Browser.tabs.query({ url: cs.matches })) {
            Browser.scripting.executeScript({
              target: { tabId: tab.id },
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
  };

  //background startup events binding
  bindBackgroundStartupEvents = async () => {
    Browser.runtime.onStartup.addListener(async () => {});
    Browser.management.onDisabled.addListener(async () => {
      const services = new Services();
      await services.updateLocalState("lock", { isLogin: false });
    });
    Browser.management.onEnabled.addListener(async () => {
      const services = new Services();
      await services.updateLocalState("lock", { isLogin: false });
    });
    Browser.management.onUninstalled.addListener(async () => {
      await clearAllStorage();
    });
  };

  //event called when extension is suspended or closed
  bindExtensionUnmountEvents = async () => {
    /**
     *  Sent to the event page just before it is unloaded.
     *  This gives the extension opportunity to do some clean up.
     *  Note that since the page is unloading,
     *  any asynchronous operations started while handling this event
     *  are not guaranteed to complete.
     *  If more activity for the event page occurs before it gets
     *  unloaded the onSuspendCanceled event will
     *  be sent and the page won't be unloaded. */
    Browser.runtime.onSuspend.addListener(async () => {
      await Browser.scripting.unregisterContentScripts({ ids: ["inpage"] });
    });
  };

  /********************************* internal methods ****************************/
  _balanceUpdate = () => {
    return setInterval(() => {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH);
    }, AUTO_BALANCE_UPDATE_TIMER);
  };

  _tokenBalanceUpdate = () => {
    return setInterval(
      () => {
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.TOKEN_BALANCE_FETCH);
      },
      // 20000
      AUTO_BALANCE_UPDATE_TIMER
    );
  };

  _checkLapsedPendingTransactions = () => {
    return setInterval(() => {
      if (!InitBackground.isStatusCheckerRunning && !TransactionQueue.transactionIntervalId) {
        // console.log("running the service for transaction status check");
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.LAPSED_TRANSACTION_CHECK);
      }
    }, LAPSED_TRANSACTION_CHECKER_TIMER);
  };
}
