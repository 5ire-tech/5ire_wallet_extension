import Web3 from "web3";
import { isManifestV3 } from "./utils";
import { BigNumber } from "bignumber.js";
import { u8aToHex } from "@polkadot/util";
import Browser from "webextension-polyfill";
import { EventEmitter } from "./eventemitter";
import { TypeRegistry } from "@polkadot/types";
import { HybridKeyring } from "./5ire-keyring";
import { txNotificationStringTemplate } from "./utils";
import { NotificationAndBedgeManager } from "./platform";
import { ExternalConnection, ExternalWindowControl } from "./controller";
import { getDataLocal, ExtensionStorageHandler } from "../Storage/loadstore";
import { INTERNAL_EVENT_LABELS, DECIMALS, MESSAGE_TYPE_LABELS, STATE_CHANGE_ACTIONS, TX_TYPE, STATUS, LABELS, MESSAGE_EVENT_LABELS, AUTO_BALANCE_UPDATE_TIMER, TRANSACTION_STATUS_CHECK_TIMER, ONE_ETH_IN_GWEI, SIGNER_METHODS, TABS_EVENT, VALIDATOR_NOMINATOR_METHOD, STREAM_CHANNELS, LAPSED_TRANSACTION_CHECKER_TIMER, EVM, NATIVE } from "../Constants";
import { hasLength, isNullorUndef, hasProperty, log, isEqual, isString } from "../Utility/utility";
import { HTTP_END_POINTS, API, HTTP_METHODS, EVM_JSON_RPC_METHODS, ERRCODES, ERROR_MESSAGES, ERROR_EVENTS_LABELS } from "../Constants";
import { EVMRPCPayload, EventPayload, TransactionPayload, TransactionProcessingPayload, TabMessagePayload } from "../Utility/network_calls";
import { httpRequest } from "../Utility/network_calls";
import { checkStringInclusionIntoArray, formatNum, numFormatter } from "../Helper/helper";
import { Connection } from "../Helper/connection.helper";
import { Error, ErrorPayload } from "../Utility/error_helper"
import { sendMessageToTab, sendRuntimeMessage } from "../Utility/message_helper";
import { assert, compactToU8a, isHex, u8aConcat, u8aEq, u8aWrapBytes } from "@polkadot/util"
import ValidatorNominatorHandler from "./nativehelper";
import ExtensionPortStream from './extension-port-stream-mod/index';

//for initilization of background events
export class InitBackground {
  //check if there is time interval binded
  static balanceTimer = null;
  static isStatusCheckerRunning = false;
  //background duplex stream for handling the communication between the content-script and background script
  static backgroundStream = null;
  static uiStream = null;

  constructor() {
    ExtensionEventHandle.initEventsAndGetInstance();
    this.injectScriptInTab();
    this.bindAllEvents();
    this.networkHandler = NetworkHandler.getInstance();
    this.rpcRequestProcessor = RpcRequestProcessor.getInstance();
    this.internalHandler = ExternalConnection.getInstance();
    this.keyringHandler = KeyringHandler.getInstance();
    this.externalTaskHandler = new ExternalTxTasks();

    if (!InitBackground.balanceTimer) {
      InitBackground.balanceTimer = this._balanceUpdate();
      this._checkLapsedPendingTransactions();
    }

    
  }

  //init the background events
  static initBackground = () => {
    new InitBackground();
    delete InitBackground.constructor;
  }

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

  /****************** Events Bindings ******************/
  //bind all events
  bindAllEvents = () => {
    this.bindStreamEventAndCreateStreams();
    this.bindInstallandUpdateEvents();
    this.bindExtensionUnmountEvents();
    this.bindBackgroundStartupEvents();
  }

  //bind the runtime message events
  bindStreamEventAndCreateStreams = async () => {
    /**
     * create the duplex stream for bi-directional communication
     * currently only added the streams for extension-ui and content-scirpt
     * communication
     */
    Browser.runtime.onConnect.addListener(async  (port) => {
      // console.log("stream connection: ", port);
      if(isEqual(port.name, STREAM_CHANNELS.CONTENTSCRIPT)) {
        InitBackground.backgroundStream = new ExtensionPortStream(port);
        //bind the stream data event for getting the messages from content-script
        InitBackground.backgroundStream.on('data', externalEventStream);
      }
      else if(isEqual(port.name, STREAM_CHANNELS.EXTENSION_UI)) {
        InitBackground.uiStream = new ExtensionPortStream(port);
        //bind the stream data event for getting the message from extension-ui
        InitBackground.uiStream.on('data', internalEventStream);
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
      }

      //port disconnect event
      port.onDisconnect.addListener((port) => {
        if(isEqual(port.name, STREAM_CHANNELS.CONTENTSCRIPT)) InitBackground.backgroundStream = null;
        else if(isEqual(port.name, STREAM_CHANNELS.EXTENSION_UI)) InitBackground.uiStream = null;
      });
    })
    
    //callbacks for binding messages with stream data event
    //for external streamed messages
    const externalEventStream = async ({message, sender}) => {
      const localData = await getDataLocal(LABELS.STATE);

      
      try {
        //check if message is array or onject
        message.message = hasLength(message.message) ? message.message[0] : message.message;
        
        //data for futher proceeding
        const data = {
          ...message,
          origin: sender.origin,
          tabId: sender.tab?.id
        };
        
        // console.log("external message: ", message, data);
        //check if the app has the permission to access requested method
        if (!checkStringInclusionIntoArray(data?.method)) {
          const { connectedApps } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
          const isHasAccess = connectedApps[data.origin];
          if (!isHasAccess?.isConnected) {
            data?.tabId && sendMessageToTab(data.tabId, new TabMessagePayload(data.id, null, null, null, ERROR_MESSAGES.ACCESS_NOT_GRANTED));
            return;
          }
        }

        //checks for event from injected script
        switch (data.method) {
          case "connect":
          case "eth_requestAccounts":
          case "eth_accounts":
            await this.internalHandler.handleConnect(data, localData);
            break;
          case "disconnect":
            await this.internalHandler.handleDisconnect(data, localData);
            break;
          case "eth_sendTransaction":
            await this.internalHandler.handleEthTransaction(data, localData);
            break;
          case "get_endPoint":
            await this.internalHandler.sendEndPoint(data, localData);
            break;
          case SIGNER_METHODS.SIGN_PAYLOAD:
          case SIGNER_METHODS.SIGN_RAW:
            await this.internalHandler.handleNativeSigner(data, localData);
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
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
          case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
            await this.internalHandler.handleValidatorNominatorTransactions(data, localData);
            break
          default: data?.tabId && sendMessageToTab(data.tabId, new TabMessagePayload(data.message.id, null, null, null, ERROR_MESSAGES.INVALID_METHOD))
        }
      } catch (err) {
        log("err is here: ", err);
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.RUNTIME_MESSAGE_SECTION_ERROR, err.message))
      }
    }

    // for internal extension streamed messages
    /**
     * not using currently but used when we replace the message passing
     * with long-live stream conenction
     */
    const internalEventStream = async ({message}) => {
      
      const localData = await getDataLocal(LABELS.STATE);

      //checks for event from extension ui
      if (isEqual(message?.type, MESSAGE_TYPE_LABELS.INTERNAL_TX) || isEqual(message?.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) 
        await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);
       else if (message?.type === MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL) 
        await this.externalTaskHandler.processExternalTask(message, localData);
       else if (message?.type === MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING) 
        await this.keyringHandler.keyringHelper(message, localData);
       else if (message?.type === MESSAGE_TYPE_LABELS.NETWORK_HANDLER) 
        this.networkHandler.handleNetworkRelatedTasks(message, localData);
    }
    

    Browser.runtime.onMessage.addListener(async (message, sender) => {

      const localData = await getDataLocal(LABELS.STATE);
      //checks for event from extension ui
      if (isEqual(message?.type, MESSAGE_TYPE_LABELS.INTERNAL_TX) || isEqual(message?.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) {
        await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);
        return;
      } else if (message?.type === MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL) {
        await this.externalTaskHandler.processExternalTask(message, localData);
        return;
      } else if (message?.type === MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING) {
        await this.keyringHandler.keyringHelper(message, localData);
        // Promise.resolve(true);

        return;
      } else if (message?.type === MESSAGE_TYPE_LABELS.NETWORK_HANDLER) {
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
  }

  /** Fired when the extension is first installed,
  when the extension is updated to a new version,
  and when Chrome is updated to a new version. */
  bindInstallandUpdateEvents = async () => {
    Browser.runtime.onInstalled.addListener(async (details) => {
      if (isManifestV3) {
        for (const cs of Browser.runtime.getManifest().content_scripts) {
          for (const tab of await Browser.tabs.query({ url: cs.matches })) {
            Browser.scripting.executeScript({
              target: { tabId: tab.id },
              files: cs.js,
            });
          }
        }
      }
    });
  }

  //background startup events binding
  bindBackgroundStartupEvents = async () => {
    Browser.runtime.onStartup.addListener(() => {
    });
  }

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
      await Browser.scripting.unregisterContentScripts({ ids: ["inpage"] })
    });
  }

  /********************************* internal methods ****************************/
  _balanceUpdate = () => {
    return setInterval(() => {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH);
    }, AUTO_BALANCE_UPDATE_TIMER)
  }

  _checkLapsedPendingTransactions = () => {
    return setInterval(() => {
        if(!InitBackground.isStatusCheckerRunning && !TransactionQueue.transactionIntervalId) {
          console.log("running the service for transaction status check");
          ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.LAPSED_TRANSACTION_CHECK);
        }
    }, LAPSED_TRANSACTION_CHECKER_TIMER)
  } 
}


//process the trans 
class RpcRequestProcessor {
  static instance = null;
  static isHttp = true;

  constructor() {
    this.transactionQueue = TransactionQueue.getInstance()
    this.generalWalletRpc = new GeneralWalletRPC();
    this.services = new Services();
    ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
  }

  //access only single instance
  static getInstance = () => {
    if (!RpcRequestProcessor.instance) {
      RpcRequestProcessor.instance = new RpcRequestProcessor();
      delete RpcRequestProcessor.constructor
    }
    return RpcRequestProcessor.instance;
  }


  //rpc calls middleware
  rpcCallsMiddleware = async (message, state) => {
    let rpcResponse = null;
    try {

      if (isEqual(message.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) {
        if (hasProperty(this.generalWalletRpc, message.event)) {
          rpcResponse = await this.generalWalletRpc[message.event](message, state);
          this.parseGeneralRpc(rpcResponse);
        } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();

      } else if (isEqual(message.type, MESSAGE_TYPE_LABELS.INTERNAL_TX)) {
        this.processTransactionRequest(message)
      }
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.INTERNAL, err.message));
    }
  }


  //parse and send the message related to fee and balance
  parseGeneralRpc = async (rpcResponse) => {

    if (!rpcResponse.error) {
      //change the state in local storage
      if (rpcResponse.stateChangeKey) await this.services.updateLocalState(rpcResponse.stateChangeKey, rpcResponse.payload.data, rpcResponse.payload?.options)
      //send the response message to extension ui
      if (rpcResponse.eventEmit) this.services.messageToUI(rpcResponse.eventEmit, rpcResponse.payload.data)
    } else {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, rpcResponse.error);
    }
  }


  //parse the transaction related rpc response
  processTransactionRequest = async (transactionRequest) => {
    try {
      //create a transaction payload
      const { data } = transactionRequest;
      const transactionProcessingPayload = new TransactionProcessingPayload(data, transactionRequest.event, null, data?.data, { ...data?.options });

      //send the transaction into tx queue
      await this.transactionQueue.addNewTransaction(transactionProcessingPayload);

    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.INTERNAL, err.message))
    }
  }
}


//class implementation for transaction queue
class TransactionQueue {
  static instance = null;
  static transactionIntervalId = null;
  static networkTransactionHandler = [];

  constructor() {
    this.services = new Services();
    this.transactionRpc = new TransactionsRPC();
  }

  //give only access to the single instance of class
  static getInstance = () => {
    if (!TransactionQueue.instance) TransactionQueue.instance = new TransactionQueue();
    return TransactionQueue.instance;
  }

  //set the transaction interval id
  static setIntervalId = (transactionIntervalId) => {
    TransactionQueue.transactionIntervalId = transactionIntervalId;
  }

  
  //add new transaction
  addNewTransaction = async (transactionProcessingPayload) => {

    //add the transaction history track
    const { data, options } = transactionProcessingPayload;
    transactionProcessingPayload.transactionHistoryTrack = new TransactionPayload(data?.to || options?.to, data?.value ? parseFloat(Number(data?.value)).toString() : "", options?.isEvm, options?.network, options?.type);

    //insert transaction history with flag "Queued"
    await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY, transactionProcessingPayload.transactionHistoryTrack, transactionProcessingPayload.options);

    //add the new transaction into queue
    await this.services.updateLocalState(STATE_CHANGE_ACTIONS.ADD_NEW_TRANSACTION, transactionProcessingPayload, { localStateKey: LABELS.TRANSACTION_QUEUE, network: transactionProcessingPayload.options?.network.toLowerCase() });

    //update the current transaction pending balance state
    await this.services.updatePendingTransactionBalance(options.network.toLowerCase());
    //emit the event that new transaction is added into queue
    ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE, options.network.toLowerCase());
  }


  //process next queued transaction
  processQueuedTransaction = async (network) => {
    //dequeue next transaction and add it as processing transaction
    await this.services.updateLocalState(STATE_CHANGE_ACTIONS.PROCESS_QUEUE_TRANSACTION, {}, { localStateKey: LABELS.TRANSACTION_QUEUE,network});

    //set the current transaction status to pending
    const allQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
    const {currentTransaction} = allQueues[network];
    if(currentTransaction) await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, currentTransaction.transactionHistoryTrack, currentTransaction.options);
  }


  //perform transaction rpc request
  processTransaction = async (network) => {
    const state = await getDataLocal(LABELS.STATE);
    const allQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
    const {currentTransaction} = allQueues[network];
    try {

      if (hasProperty(this.transactionRpc, currentTransaction.type)) {
        const rpcResponse = await this.transactionRpc[currentTransaction.type](currentTransaction, state);
        return rpcResponse;
      } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();


    } catch (err) {
      log("error while saving the transaction", err)
      const error = new ErrorPayload(ERRCODES.INTERNAL, err.message);
      return new EventPayload(null, null, {data: currentTransaction?.transactionHistoryTrack}, error);
    }
  }


  //parse the response after processing the transaction
  parseTransactionResponse = async (network) => {

    //perform the current active transactions 
    const transactionResponse = await this.processTransaction(network);

    const { txHash } = transactionResponse.payload?.data;

    //check if there is error payload into response
    if (!transactionResponse.error) {
      //if transaction is external then send the response to spefic tab
      if (transactionResponse.payload.options?.externalTransaction && txHash) {
        const {payload:{options:{type}}} = transactionResponse;
        const { externalTransaction } = transactionResponse.payload.options;
        const externalResponse = { method: externalTransaction.method, result: isEqual(type, TX_TYPE.NATIVE_APP) ? {txHash} : txHash }
        sendMessageToTab(externalTransaction?.tabId, new TabMessagePayload(externalTransaction.id, externalResponse));
      }

      await this._updateQueueAndHistory(transactionResponse, network);
    } else {
      //check if txhash is found in payload then update transaction into queue and history
      if (txHash) this._updateQueueAndHistory(transactionResponse, network);
      else {
        transactionResponse?.payload && await this.services.updateLocalState(STATE_CHANGE_ACTIONS.SAVE_ERRORED_FAILED_TRANSACTION, {id: transactionResponse.payload.data?.id}, transactionResponse.payload?.options)

        //set the current errored transaction in queue as null
        await this.services.updateLocalState(STATE_CHANGE_ACTIONS.REMOVE_FAILED_TX, {}, {localStateKey: LABELS.TRANSACTION_QUEUE, network});

        //if transaction is external send the error response back to requester tab
        if(transactionResponse.payload.options?.externalTransaction) {
          const { externalTransaction } = transactionResponse.payload.options;
          const errorMessageForTab = transactionResponse.error?.errMessage?.data || ERROR_MESSAGES.ERROR_WHILE_TRANSACTION;
          sendMessageToTab(externalTransaction?.tabId, new TabMessagePayload(externalTransaction.id, {result: null}, externalTransaction.method, null, errorMessageForTab));
        }

        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, transactionResponse.error);
      }
    }
  }


  //set timer for updating the transaction status
  checkTransactionStatus = async (network) => {
    try {
    //check if current transaction is there or not
    const allQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
    const transactionQueue = allQueues[network];

    const hasPendingTx = transactionQueue.txQueue.length;

    //if the current transaction is null then it is failed and removed
    if(!transactionQueue.currentTransaction) {

      //update the current transaction pending balance state
      await this.services.updatePendingTransactionBalance(network);

      //check if there any pending transaction into queue
      if (!isEqual(hasPendingTx, 0)) {
        await this.processQueuedTransaction(network);
        await this.parseTransactionResponse(network);
        TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)))
      } else {
        TransactionQueue.networkTransactionHandler = TransactionQueue.networkTransactionHandler.filter(item => item !== network);
        //reset the timeout id as null so whenever new transaction made the timeout start again
        TransactionQueue.setIntervalId(null);
      }
      return;
    }

    const { currentTransaction } = transactionQueue;
    const transactionHistoryTrack = { ...currentTransaction.transactionHistoryTrack }


    //check if transaction status is pending then only check the status
    if (currentTransaction && isEqual(currentTransaction.transactionHistoryTrack.status, STATUS.PENDING)) {
      const { transactionHistoryTrack: { txHash, isEvm, chain } } = currentTransaction;
      const transactionStatus = await this.services.getTransactionStatus(txHash, isEvm, chain);

      //if transaction status is found ether Failed or Success
      if (transactionStatus?.status) {

        //update the transaction after getting the confirmation
        transactionHistoryTrack.status = transactionStatus.status;

        //check the transaction type and save the to recipent according to type
        if(isEqual(transactionHistoryTrack?.type, TX_TYPE.NATIVE_APP)) 
          transactionHistoryTrack.to = transactionStatus?.sectionmethod
        else
          transactionHistoryTrack.to = !!transactionHistoryTrack.intermidateHash ? transactionHistoryTrack.to : transactionHistoryTrack.isEvm ? transactionStatus.to || transactionStatus.contractAddress : transactionHistoryTrack.to;
        
        //set the used gas
        transactionHistoryTrack.gasUsed = transactionHistoryTrack.isEvm ? (Number(transactionStatus?.gasUsed) / ONE_ETH_IN_GWEI).toString() : transactionStatus?.txFee

        //set the amount when the method is reward
        if (isEqual(transactionStatus?.sectionmethod, LABELS.STACKING_REWARD)) {
          transactionHistoryTrack.amount = formatNum(Number(Number(transactionStatus?.value).noExponents()) / 10 ** 18, 6);
        }

        //update the transaction status and other details after confirmation
        await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, transactionHistoryTrack, currentTransaction?.options);

        //update the balance after transaction confirmation
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH);

        //dequeue the new transaction and set as active for processing
        await this.processQueuedTransaction(network);

        //show notification of transaction status
        this.services.showNotification(txNotificationStringTemplate(transactionStatus.status, txHash));

        //update the pending transaction balance
        await this.services.updatePendingTransactionBalance(network);

        //check if there any pending transaction into queue
        if (!isEqual(hasPendingTx, 0)) {
          await this.parseTransactionResponse(network);
          TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)))
        } else {
          TransactionQueue.networkTransactionHandler = TransactionQueue.networkTransactionHandler.filter(item => item !== network);
          //reset the timeout id as null so whenever new transaction made the timeout start again
          TransactionQueue.setIntervalId(null);
        }
      }
      //if transaction is still in pending state
      else {
        TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)))
      }
    }
    } catch (err) {
      log("error while transaction processing: ", err)
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION_STATUS_CHECK, ERROR_MESSAGES.ERROR_WHILE_TRANSACTION_STATUS_CHECK));
    }
  }

  /******************************* Event Callbacks *************************/
  //callback for new transaction inserted into queue event
  newTransactionAddedEventCallback = async (network) => {
    log("network here: ", network, !TransactionQueue.networkTransactionHandler.includes(network), TransactionQueue.networkTransactionHandler);
    // isNullorUndef(TransactionQueue.transactionIntervalId) 
    if (!TransactionQueue.networkTransactionHandler.includes(network)) {
      TransactionQueue.networkTransactionHandler.push(network);
      await this.processQueuedTransaction(network);
      await this.parseTransactionResponse(network);
      
      TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus.bind(null, network)))
    }
  }


  //callback for native signer new transaction
  // newNativeSignerTransactionAddedEventCallback = async () => {
  //   if (isNullorUndef(TransactionQueue.transactionIntervalId)) {
  //     await this.processQueuedTransaction();
  //     TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus))
  //   }
  // }


  /******************************** Internal methods ***********************/
  //schedule execution
  _setTimeout = (cb) => {
    return setTimeout(cb, TRANSACTION_STATUS_CHECK_TIMER);
  }

  //update the transaction queue and history
  _updateQueueAndHistory = async (transactionResponse, network) => {
    await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, transactionResponse.payload.data, transactionResponse.payload?.options);

    //update the transaction into active transaction session
    await this.services.updateLocalState(STATE_CHANGE_ACTIONS.UPDATE_HISTORY_TRACK, transactionResponse.payload.data, { localStateKey: LABELS.TRANSACTION_QUEUE, network });
  }
}


export class ExtensionEventHandle {

  static instance = null;
  static eventEmitter = new EventEmitter();
  static TransactionCheckerInterval = null;

  constructor() {
    this.networkHandler = NetworkHandler.getInstance();
    this.bindConnectionEvent();
    this.transactionQueue = TransactionQueue.getInstance();
    this.rpcRequestProcessor = RpcRequestProcessor.getInstance();
    this.bindAllEvents();
    this.services = new Services();
  }


  //return the already initlized instance
  static initEventsAndGetInstance = () => {
    if (!ExtensionEventHandle.instance) {
      ExtensionEventHandle.instance = new ExtensionEventHandle();
      delete ExtensionEventHandle.constructor;
    }

    return ExtensionEventHandle.instance;
  }


  //bind all internal events
  bindAllEvents = () => {
    this.bindAutoBalanceUpdateEvent();
    this.bindTransactionProcessingEvents();
    // this.bindNewNativeSignerTransactionEvents();
    this.bindErrorHandlerEvent();
    this.bindLapsedTransactionCheckingEvent();
  }

  //for creating the instance of native and evm api
  bindConnectionEvent = async () => {
    //handling the connection using the events
    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.CONNECTION, this.networkHandler.initRpcApi);
  }

  //bind the transaction processing related events
  bindTransactionProcessingEvents = async () => {
    //event triggered when new transaction is added into queue
    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE, this.transactionQueue.newTransactionAddedEventCallback);
  }

  // bindNewNativeSignerTransactionEvents = async () => {
  //   ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.NEW_NATIVE_SIGNER_TRANSACTION_INQUEUE, this.transactionQueue.newNativeSignerTransactionAddedEventCallback)
  // }

  //bind auto balance update event
  bindAutoBalanceUpdateEvent = async () => {
    //auto update the balance
    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.BALANCE_FETCH, async () => {
      const state = await getDataLocal(LABELS.STATE);

      //if account is not created
      if (!state.currentAccount.accountName) return;

      await this.rpcRequestProcessor.rpcCallsMiddleware({ event: MESSAGE_EVENT_LABELS.BALANCE, type: MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, data: {} }, state);
    })
  }

  // bind event for lapsed pending transaction updation
  bindLapsedTransactionCheckingEvent = async () => {
    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.LAPSED_TRANSACTION_CHECK, async () => {
      await this.services.checkPendingTransaction();
      //false the lapsed transaction check
      InitBackground.isStatusCheckerRunning = false;
    })
  }

  //bind error handler event
  bindErrorHandlerEvent = async () => {
    /**
     * parse the error and send the error response back to ui
     */
    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.ERROR, async (err) => {
      try {
        log("error catched inside error event handler: ", err);

        //check if there is custom error message in error payload
        const customMessage = err?.errMessage?.data;

        //transaction failed and error message handler
        if(isEqual(err?.errCode, ERRCODES.ERROR_WHILE_TRANSACTION))  this.services.messageToUI(MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, customMessage || ERROR_MESSAGES.ERROR_WHILE_TRANSACTION);

        if(isEqual(err?.errCode, ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE))  this.services.messageToUI(MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, customMessage || ERROR_MESSAGES.ERROR_WHILE_GAS_ESTIMATION);

        if(isEqual(err?.errCode, ERRCODES.FAILED_TO_CONNECT_NETWORK))  this.services.messageToUI(MESSAGE_EVENT_LABELS.NETWORK_CONNECTION_ERROR, customMessage || ERROR_MESSAGES.ERROR_WHILE_NETWORK_CONNECTION);

        if(isEqual(err?.errCode, ERRCODES.INTERNAL))  this.services.messageToUI(MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, customMessage || ERROR_MESSAGES.INTERNAL_ERROR);
      } catch (err) {
        log("Error in error event handler: ", err)
      }
    })
  }
}


//for non rpc tasks
class ExternalTxTasks {

  constructor() {
    this.transactionQueueHandler = TransactionQueue.getInstance();
    this.nativeSignerhandler = new NativeSigner();
    this.validatorNominatorHandler = new ValidatorNominatorHandler();
  }

  //process and check external task (connection, tx approval)
  processExternalTask = async (message, state) => {
    if (isEqual(message.event, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION)) await this.closePopupSession(message, state)
    else if (isEqual(MESSAGE_EVENT_LABELS.EVM_TX, message.event)) await this.externalEvmTransaction(message, state);
    else if (isEqual(MESSAGE_EVENT_LABELS.NATIVE_SIGNER, message.event)) await this.nativeSigner(message, state);
    else if (isEqual(MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_TRANSACTION, message.event)) await this.validatorNominatorTransaction(message, state)

  }

  //handle the evm external transaction
  externalEvmTransaction = async (message) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //process the external evm transactions
    const externalTransactionProcessingPayload = new TransactionProcessingPayload({ ...activeSession.message, options: { ...message?.data.options, externalTransaction: { ...activeSession }}}, message.event, null, activeSession.message?.data, { ...message?.data.options, externalTransaction: { ...activeSession } });

    await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
  }


  //handle the nominator and validator transaction
  nativeSigner = async (message, state) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //check if the requested method is supported by the handler
    if (hasProperty(this.nativeSignerhandler, activeSession?.method)) {
      if (message.data?.approve) {
        const signerRes = await this.nativeSignerhandler[activeSession.method](activeSession.message, state);
        if (!signerRes.error) {
          sendMessageToTab(activeSession.tabId, new TabMessagePayload(activeSession.id, { result: signerRes.payload.data }));

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

        }
        else if (signerRes.error) sendMessageToTab(activeSession.tabId, new TabMessagePayload(activeSession.id, { result: null }, null, null, signerRes.error.errMessage));
      }
    }

    //close the popup
    await this.closePopupSession(message);
  }


  //handle the nominator and validator transaction
  validatorNominatorTransaction = async (message, state) => {

      if (message.data?.approve) {
        const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

        //process the external evm transactions
        const externalTransactionProcessingPayload = new TransactionProcessingPayload({ ...activeSession.message, options: { ...message?.data.options, externalTransaction: { ...activeSession }}}, message.event, null, activeSession.message?.data, { ...message?.data.options, externalTransaction: { ...activeSession } });
    
        await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
      }

      //close the popup
      await this.closePopupSession(message);
  }

  //close the current popup session
  closePopupSession = async (message) => {
    ExternalWindowControl.isApproved = message.data?.approve;
    const externalWindowControl = ExternalWindowControl.getInstance();
    await externalWindowControl.closeActiveSessionPopup();
  }

}


//for extension common service work
export class Services {

  constructor() {
    this.notificationAndBedgeManager = NotificationAndBedgeManager.getInstance();
  }

  /*************************** Service Helpers ********************************/

  //find the native and evm transaction status
  getTransactionStatus = async (txHash, isEvm, network) => {
    //get the url of current network for evm rpc call or native explorer search
    const rpcUrl = isEvm ? HTTP_END_POINTS[network.toUpperCase()] : API[network.toUpperCase()];

    //check if the transaction is still pending or not
    let res = null, txRecipt = null;
    if (isEvm) {
      res = await httpRequest(rpcUrl, HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [txHash])));
      txRecipt = res?.result;

      //parse the hex string into decimal
      if (!isNullorUndef(txRecipt?.status)) txRecipt.status = parseInt(txRecipt.status) ? STATUS.SUCCESS : STATUS.FAILED;

    }
    else {
      res = await httpRequest(rpcUrl + txHash, HTTP_METHODS.GET);
      txRecipt = res?.data?.transaction;


      if (!isNullorUndef(txRecipt?.status)) {
        if (isEqual(txRecipt.status.toLowerCase(), STATUS.SUCCESS.toLowerCase())) txRecipt.status = STATUS.SUCCESS;
        if (isEqual(txRecipt.status.toLowerCase(), STATUS.FAILED.toLowerCase())) txRecipt.status = STATUS.FAILED;
      }
    }

    //transform the evm status to success or fail
    if (isNullorUndef(txRecipt?.status) && isString(txRecipt?.status) && isEqual(txRecipt?.status, STATUS.PENDING.toLowerCase()))
      txRecipt = null;

    return txRecipt;

  }

  //create rpc handler
  createConnection = async (currentNetwork) => {
    const connector = Connection.getInsatnce();
    const apiConn = await connector.initializeApi(currentNetwork)
    return apiConn;
  }

  //pass message to extension ui
  messageToUI = async (event, message) => {
    try {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND, event, message)
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.INTERNAL, err.message))
    }
  }

  //update the local storage data
  updateLocalState = async (key, data, options) => {
    const res = await ExtensionStorageHandler.updateStorage(key, data, options)
    if (res) ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, res);
  }

  //update the pending transaction balance
  updatePendingTransactionBalance = async (network) => {
    const transactionQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
    const {currentTransaction, txQueue} = transactionQueues[network];
    
    const transactionBalance = {evm: 0, native: 0};
 
    //check if there is current transaction under processing
    if(currentTransaction) {
      transactionBalance[currentTransaction?.options?.isEvm ? EVM.toLowerCase() : NATIVE.toLowerCase()] = currentTransaction?.data?.value ? Number(currentTransaction?.data?.value) : 0;
    }
 
    //check if transaction queue is not empty
    if(txQueue.length) {
      for(const txItem of txQueue)
        transactionBalance[txItem.options?.isEvm ? EVM.toLowerCase() : NATIVE.toLowerCase()] += Number(txItem.data?.value);
    }
    log("here is balance pending from main handler: ", transactionBalance);

    await this.updateLocalState(STATE_CHANGE_ACTIONS.UPDATE_PENDING_TRANSACTION_BALANCE, transactionBalance, {network: network});

  }

  /**
   * some transaction are lapsed by the system on a particular case
   * this service run on a certain time period and check if there
   * is any pending transaction if found then check of treansaction status
   * and save status if they whether failed or success
   */
  checkPendingTransaction = async () => {
    try {
      InitBackground.isStatusCheckerRunning = true;
     const localDataState = await getDataLocal(LABELS.STATE);
     const account = localDataState.currentAccount;
     const pendingHistoryItem = localDataState.txHistory[account.evmAddress]?.filter((historyItem) => historyItem.status === STATUS.PENDING);
     
     if(!pendingHistoryItem?.length) return;  

     //check the transaction status and update the status inside local storage
     for(const hItem of pendingHistoryItem) {
        if(hItem?.txHash) {
          const {txHash, isEvm, chain} = hItem;
          const transactionStatus = await  this.getTransactionStatus(txHash, isEvm, chain);

        if(transactionStatus?.status) {
        //update the transaction after getting the confirmation
        hItem.status = transactionStatus.status;
        
        //set the used gas
        hItem.gasUsed = hItem.isEvm ? (Number(transactionStatus?.gasUsed) / ONE_ETH_IN_GWEI).toString() : transactionStatus?.txFee

        //check the transaction type and save the to recipent according to type
        if(isEqual(hItem?.type, TX_TYPE.NATIVE_APP)) 
        hItem.to = transactionStatus?.sectionmethod
        else
        hItem.to = !!hItem.intermidateHash ? hItem.to : hItem.isEvm ? transactionStatus.to || transactionStatus.contractAddress : hItem.to;
        
        await this.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, hItem, {account});
          }
        }
     }

    } catch(err) {
      log("error while checking the lapsed pending transactions: ", err)
    }
  } 

  /*************************** Service Internals ******************************/
  //show browser notification from extension
  showNotification = (message) => {
    if (hasLength(message)) this.notificationAndBedgeManager.showNotification(message);
  }

}


//for transaction realted calls
export class TransactionsRPC {

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
    this.services = new Services();
    this.nominatorValidatorHandler = ValidatorNominatorHandler.getInstance();
  }

  //********************************** Evm ***************************************/
  //evm transfer
  evmTransfer = async (message, state) => {

    //history reference object
    let transactionHistory = {...message?.transactionHistoryTrack}, payload = null;

    try {

      const { data, transactionHistoryTrack, contractBytecode } = message;
      const { options: { account } } = data;
      const network = transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase()
      const { evmApi } = NetworkHandler.api[network];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      // transactionHistory.status = STATUS.PENDING

      const tempAmount = data?.options?.isBig ? (new BigNumber(data.value).dividedBy(DECIMALS)).toString() : data.value;

      if (Number(tempAmount) > (Number(state.balance.evmBalance) - state.pendingTransactionBalance[network].evm)) new Error(new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();


      else {
        const amt = (new BigNumber(data.value).multipliedBy(DECIMALS)).toString();
        const to = Web3.utils.toChecksumAddress(data.to);
        const value = data?.options?.isBig
          ? data.value
          : (Number(amt).noExponents()).toString();

        const nonce = await evmApi.eth.getTransactionCount(
          account.evmAddress,
          STATUS.PENDING.toLowerCase()
        );

        const feeRes = await this._getEvmFee(to, account.evmAddress, value, state, contractBytecode);

        const transactions = {
          to,
          gas: 21000,
          data: contractBytecode ? contractBytecode : "0x",
          value: "0x" + (Number(value).toString(16)),
          nonce: "0x" + (Number(nonce).toString(16)),
          gasLimit: "0x" + (Number(feeRes.gasLimit).toString(16)),
          gasPrice: "0x" + (Number(feeRes.gasPrice).toString(16)),
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
          }

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);

        }
        else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {

      payload = {
        data: null,
        options: {
          ...message.data.options
        },
      }

      //check for the revert case
      const evmRevertedTx = JSON.parse(JSON.stringify(err));
      if (evmRevertedTx?.receipt || transactionHistory.txHash) {
        transactionHistory.txHash = evmRevertedTx.receipt.transactionHash;
        transactionHistory.status = STATUS.PENDING;
        payload.data = transactionHistory;
        return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
      } else {
        transactionHistory.status = STATUS.FAILED;
        payload.data = transactionHistory;
        return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
      }
    }

  };

  //evm to native swap
  evmToNativeSwap = async (message, state) => {

    //history reference object
    let transactionHistory = {...message?.transactionHistoryTrack}, payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const { options: { account } } = data;
      const network = transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const { evmApi, nativeApi } = NetworkHandler.api[network];
      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      // transactionHistory.status = STATUS.PENDING;

      if (Number(data.value) >= (Number(state.balance.evmBalance) - state.pendingTransactionBalance[network].evm))
        new Error(new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();

      else {
        const alice = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
        const to = (u8aToHex(alice.publicKey)).slice(0, 42);
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        const from = account.evmAddress;
        const nonce = await evmApi.eth.getTransactionCount(account.evmAddress);
        const feeRes = await this._getEvmFee(to, from, Math.round(data.value), state);
        const value = (Number(amt).noExponents()).toString();
        const transactions = {
          to,
          gas: 21000,
          nonce: "0x" + (Number(nonce).toString(16)),
          value: "0x" + (Number(value)).toString(16),
          gasLimit: "0x" + (Number(feeRes.gasLimit).toString(16)),
          gasPrice: "0x" + (Number(feeRes.gasPrice).toString(16)),
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
            options: { ...data.options }
          }

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);

        } else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      log("error while evm to native swap: ", err)
      transactionHistory.status = transactionHistory.txHash ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: { ...message.data.options }
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
    }
  };

  //********************************** Native ***************************************/
  //native transfer
  nativeTransfer = async (message, state) => {
    let transactionHistory = {...message?.transactionHistoryTrack}, payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const { options: { account } } = data;
      const network = transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const { nativeApi } = NetworkHandler.api[network];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      if (Number(data.value) >= (Number(state.balance.nativeBalance) - state.pendingTransactionBalance[network].native))
        new Error(new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();
      else {

        //set the status to pending
        // transactionHistory.status = STATUS.PENDING;

        let err;
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

        const transfer = nativeApi.tx.balances.transfer(data.to, (Number(amt).noExponents()).toString());

        if (RpcRequestProcessor.isHttp) {
          const txHash = await transfer.signAndSend(signer)
          if (txHash) {

            if (txHash) {

              const hash = txHash.toHex();
              transactionHistory.txHash = hash;


              payload = {
                data: transactionHistory,
                options: {
                  ...data.options
                }
              }

              return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload);

            } else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();

          } else {
            //Send and sign txn
            const { status, events, txHash } = transfer.signAndSend(signer);

            if (status.isInBlock) {
              const hash = txHash.toHex();
              let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

              //Matching Extrinsic Events for get the status
              phase.forEach(({ event }) => {

                if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {

                  err = false;
                  transactionHistory.status = STATUS.SUCCESS;

                } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {

                  err = false;
                  transactionHistory.status = STATUS.FAILED;

                }
              });

              transactionHistory.txHash = hash ? hash : "";

              if (err) new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
              else {
                return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
              }
            }
          }
        }
      }
    } catch (err) {
      transactionHistory.status = transactionHistory.txHash ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: {
          ...message.data.options
        }
      }

      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
    }
  }

  //native to evm swap
  nativeToEvmSwap = async (message, state) => {
    let transactionHistory = {...message?.transactionHistoryTrack}, payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const { options: { account } } = data;
      const network = transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const { nativeApi } = NetworkHandler.api[network];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      if (Number(data.value) >= (Number(state.balance.nativeBalance) - state.pendingTransactionBalance[network].native))
        new Error(new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)).throw();
      else {
        // transactionHistory.status = STATUS.PENDING;
        let err, evmDepositeHash, signedHash;
        const amt = (new BigNumber(data.value).multipliedBy(DECIMALS)).toString();
        const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

        //Deposite amount
        let deposit = await nativeApi.tx.evm.deposit(
          account?.evmAddress,
          (Number(amt).noExponents()).toString()
        );
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
              options: { ...data.options }
            }

            return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);

          } else {
            new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
          }

        } else {

          //Sign and Send txn for websocket provider
          deposit.signAndSend(signer, ({ status, events, txHash }) => {
            if (status.isInBlock) {

              if (signedHash !== txHash) {

                signedHash = txHash.toHex();
                let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

                //Matching Extrinsic Events for get the status
                phase.forEach(({ event }) => {

                  if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                    err = false;
                    transactionHistory.status = STATUS.SUCCESS;
                  } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                    err = true;
                    transactionHistory.status = STATUS.FAILED;
                  }

                });

                transactionHistory.txHash = signedHash;
                transactionHistory.intermidateHash = evmDepositeHash;

                if (err) {
                  new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
                } else {
                  return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload);
                }
              }
            }
          });
        }

      }
    } catch (err) {
      transactionHistory.status = transactionHistory?.txHash ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: { ...message.data.options }
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
    }
  };


  validatorNominatorTransaction = async (message, state) => {
    try {
      const eventPayload = await this.nominatorValidatorHandler.handleNativeAppsTask(state, message, false);
      return eventPayload;
    } catch (err) {
      const payload = {options: message?.options, data: message?.transactionHistoryTrack};

      return new EventPayload(null, null, payload, new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message));
    }
  }

  /**************************************** Internal Methods *****************************/
  //internal method for getting the evm fee
  _getEvmFee = async (to, from, amount, state, data = "") => {

    const tx = {
      to: to || null,
      from,
      value: amount,
    };

    if (data) tx.data = data;
    const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const gasLimit = await evmApi.eth.estimateGas(tx);
    const gasPrice = await evmApi.eth.getGasPrice();
    const gasFee = (new BigNumber(gasPrice * gasLimit)).dividedBy(DECIMALS).toString();

    return {
      gasLimit,
      gasPrice,
      gasFee,
    }
  }
}

//for balance, fee and other calls
export class GeneralWalletRPC {

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
    this.nominatorValidatorHandler = ValidatorNominatorHandler.getInstance();
  }

  //for fething the balance of both (evm and native)
  getBalance = async (message, state) => {
    try {
      // console.log("network and api: ", NetworkHandler.api, state.currentNetwork);

      if(!NetworkHandler.api[state.currentNetwork.toLowerCase()]?.evmApi) return new EventPayload(STATE_CHANGE_ACTIONS.BALANCE, null, {data: state.balance});

      let nbalance = 0;
      const { evmApi, nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const account = state.currentAccount;

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      // Evm Balance
      const w3balance = await evmApi?.eth?.getBalance(account.evmAddress);

      //Native Balance
      if (RpcRequestProcessor.isHttp) {
        let balance_ = await nativeApi?._query.system.account(account.nativeAddress);
        nbalance = parseFloat(`${balance_.data.free}`) - parseFloat(`${balance_.data.miscFrozen}`);
      } else {
        let balance_ = await nativeApi?.derive.balances.all(account.nativeAddress);
        nbalance = balance_.availableBalance;
      }


      let evmBalance = new BigNumber(w3balance).dividedBy(DECIMALS).toString();
      let nativeBalance = new BigNumber(nbalance).dividedBy(DECIMALS).toString();


      if (Number(nativeBalance) % 1 !== 0) {
        let tempBalance = new BigNumber(nbalance).dividedBy(DECIMALS).toFixed(6, 8).toString();
        if (Number(tempBalance) % 1 === 0)
          nativeBalance = parseInt(tempBalance)
        else
          nativeBalance = tempBalance;
      }


      if (Number(evmBalance) % 1 !== 0) {
        let tempBalance = new BigNumber(w3balance).dividedBy(DECIMALS).toFixed(6, 8).toString();
        if (Number(tempBalance) % 1 === 0)
          evmBalance = parseInt(tempBalance)
        else
          evmBalance = tempBalance;
      }


      let totalBalance = new BigNumber(evmBalance).plus(nativeBalance).toString();
      if (Number(totalBalance) % 1 !== 0)
        totalBalance = new BigNumber(evmBalance).plus(nativeBalance).toFixed(6, 8).toString()


      const payload = {
        data: {
          evmBalance,
          nativeBalance,
          totalBalance
        }
      }

      return new EventPayload(STATE_CHANGE_ACTIONS.BALANCE, null, payload);


    } catch (err) {
      return new EventPayload(null, null, null, new ErrorPayload(ERRCODES.ERROR_WHILE_BALANCE_FETCH, err.message));
    }
  };

  //get the evm fee
  evmFee = async (message, state) => {
    try {
      const { data } = message;
      const { options: { account } } = data;
      const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      let toAddress = data.toAddress ? data.toAddress : data?.data ? account.evmAddress : account.nativeAddress;
      let amount = data?.value;


      if (toAddress?.startsWith("5"))
        toAddress = u8aToHex(toAddress).slice(0, 42);

      if (toAddress?.startsWith("0x")) {
        amount = Math.round(Number(amount));
        Web3.utils.toChecksumAddress(toAddress);
      }

      const tx = {
        to: toAddress,
        from: account.evmAddress,
        value: amount,
      };


      if (data?.data) {
        tx.data = data.data;
      }

      const gasAmount = await evmApi.eth.estimateGas(tx);
      const gasPrice = await evmApi.eth.getGasPrice();
      let fee = (new BigNumber(gasPrice * gasAmount)).dividedBy(DECIMALS).toString();

      const payload = {
        data: { fee }
      }

      return new EventPayload(null, message.event, payload);
    } catch (err) {
      return new EventPayload(null, null, null, new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message));
    }

  };

  //get native gas fee
  nativeFee = async (message, state) => {
    try {
      const { data } = message;
      const { options: { account } } = data;

      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      const toAddress = data.toAddress ? data.toAddress : account.evmAddress;
      let transferTx;

      const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

      if (toAddress?.startsWith("0x")) {
        const amt = BigNumber(data.value).multipliedBy(DECIMALS).toString();
        transferTx = await nativeApi.tx.evm.deposit(toAddress, (Number(amt).noExponents()).toString());
      }
      else if (toAddress?.startsWith("5")) {
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        transferTx = nativeApi.tx.balances.transfer(toAddress, (Number(amt).noExponents()).toString());

      }
      const info = await transferTx?.paymentInfo(signer);
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS)).toString();

      //construct payload
      const payload = { data: { fee } }
      return new EventPayload(null, message.event, payload);
    } catch (err) {
      return new EventPayload(null, null, null, new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message));
    }
  };


  //external native transaction fee
  externalNativeTransactionArgsAndGas = async (message, state) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    const { nativeApi: api } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

    const hex = activeSession.message?.method;

    const DEFAULT_INFO = {
      decoded: null,
      extrinsicCall: null,
      extrinsicError: null,
      extrinsicFn: null,
      extrinsicHex: null,
      extrinsicKey: 'none',
      extrinsicPayload: null,
      isCall: true
    };


    try {
      assert(isHex(hex), 'Expected a hex-encoded call');

      let extrinsicCall, extrinsicPayload = null, decoded = null, isCall = false;

      try {
        // cater for an extrinsic input
        const tx = api.tx(hex);

        // ensure that the full data matches here
        assert(tx.toHex() === hex, 'Cannot decode data as extrinsic, length mismatch');

        decoded = tx;
        extrinsicCall = api.createType('Call', decoded.method);
      } catch (e) {
        try {
          // attempt to decode as Call
          extrinsicCall = api.createType('Call', hex);

          const callHex = extrinsicCall.toHex();

          if (callHex === hex) {
            // all good, we have a call
            isCall = true;
          } else if (hex.startsWith(callHex)) {
            // this could be an un-prefixed payload...
            const prefixed = u8aConcat(compactToU8a(extrinsicCall.encodedLength), hex);

            extrinsicPayload = api.createType('ExtrinsicPayload', prefixed);

            assert(u8aEq(extrinsicPayload.toU8a(), prefixed), 'Unable to decode data as un-prefixed ExtrinsicPayload');

            extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
          } else {
            new Error(new ErrorPayload(ERRCODES.INTERNAL, "Unable to decode data as Call, length mismatch in supplied data")).throw()
          }
        } catch {
          // final attempt, we try this as-is as a (prefixed) payload
          extrinsicPayload = api.createType('ExtrinsicPayload', hex);

          assert(extrinsicPayload.toHex() === hex, 'Unable to decode input data as Call, Extrinsic or ExtrinsicPayload');
          extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
        }
      }

      const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
      const extrinsicFn = api.tx[section][method];
      // const extrinsicKey = extrinsicCall.callIndex.toString();

      if (!decoded) {
        decoded = extrinsicFn(...extrinsicCall.args);
      }

      const info = await decoded?.paymentInfo(this.hybridKeyring.getNativeSignerByAddress(state.currentAccount.nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      const params = decoded.method.toJSON()?.args;

      const payload = {
        method: `${section}.${method}`,
        estimatedGas: fee,
        args: params,
        txHash: decoded.hash.toHex()
      }


      return new EventPayload(null, message.event, { data: payload })

    } catch (err) {
      log("error formatting and getting the native external ", err)
      return new EventPayload(null, message.event, null, new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message))
    }
  }

  //calculate the fee for nominator and validator
  validatorNominatorFee = async (message, state) => {
    try {
        const eventPayload = await this.nominatorValidatorHandler.handleNativeAppsTask(state, message, true);
        return eventPayload;
    } catch (err) {
      return new EventPayload(null, null, null, new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message?.errMessage ? err.message.errMessage : err.message ));
    }
  }

}

//keyring handler
export class KeyringHandler {

  static instance = null;

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
    this.services = new Services();
  }

  //If there is already an instance of this class then it will return this otherwise this will create it.
  static getInstance = () => {
    if (!KeyringHandler.instance) {
      KeyringHandler.instance = new KeyringHandler();
      delete KeyringHandler.constructor;
    }
    return KeyringHandler.instance;
  }


  keyringHelper = async (message) => {
    try {
      if (this.hybridKeyring[message.event]) {
        const keyringResponse = await this._keyringCaller(message);
        this._parseKeyringRes(keyringResponse);

        //handle if the method is not the part of system
      } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.UNDEF_PROPERTY)).throw();
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.INTERNAL, err.message))
    }
  }

  _keyringCaller = async (message) => {
    try {
      const keyResponse = await this.hybridKeyring[message.event](message);
      return keyResponse;
    } catch (err) {
      return new EventPayload(null, message.event, null, new ErrorPayload(err.message.errCode || ERRCODES.KEYRING_SECTION_ERROR, err.message.errMessage || err.message));
    }
  }


  //parse the response recieve from operation and send message accordingly to extension ui
  _parseKeyringRes = async (response) => {
    if (!response.error) {
      //change the state in local storage
      if (response.stateChangeKey) await this.services.updateLocalState(response.stateChangeKey, response.payload, response.payload?.options);
      //send the response message to extension ui
      if (response.eventEmit) this.services.messageToUI(response.eventEmit, response.payload)

    } else {
      if (Number(response?.error?.errCode) === 3) response.eventEmit && this.services.messageToUI(response.eventEmit, response.error)
      else
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.KEYRING_SECTION_ERROR, response.error))
    }
  }
}

//network task handler
export class NetworkHandler {
  static instance = null;
  static api = {};

  constructor() {
    this.services = new Services();
  }

  //get only single instance
  static getInstance = () => {
    if (!NetworkHandler.instance) {
      NetworkHandler.instance = new NetworkHandler();
      NetworkHandler.createNetworkSlots();
      delete NetworkHandler.constructor;
    }
    return NetworkHandler.instance;
  }


  //create network slots
  static createNetworkSlots = () => {
    Object.keys(HTTP_END_POINTS).forEach(key => NetworkHandler.api[key.toLowerCase()] = null)
  }

  //network handler request
  handleNetworkRelatedTasks = async (message, state) => {
    if (!isNullorUndef(message.event) && hasProperty(NetworkHandler.instance, message.event)) {
      const error = await NetworkHandler.instance[message.event](message, state);

      //check for errors while network operations
      if (error) {
        log("Error while performing network operation: ", error);
      }
    }
  }

  //change network handler
  networkChange = async (message, state) => {
    try {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
      return false;
    } catch (err) {
      return true;
    }
  }

  /******************************** connection handlers *********************************/
  initRpcApi = async () => {
    const { currentNetwork } = await getDataLocal(LABELS.STATE);
    const api = await this.services.createConnection(currentNetwork);
    if (api?.error) return;

    //insert connection into its network slot
    NetworkHandler.api[currentNetwork.toLowerCase()] = api;
    log("all api is here: ", NetworkHandler.api);
    await this.checkNetwork();
  }

    //check the network connection
  checkNetwork = async () => {
      try {
        const state = await getDataLocal(LABELS.STATE);
        const connectionApi = NetworkHandler.api[state.currentNetwork.toLowerCase()];
        const chainId = await connectionApi.evmApi.eth.getChainId();
        //send only if the extension opened
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH)
        InitBackground.uiStream && this.services.messageToUI(MESSAGE_EVENT_LABELS.NETWORK_CHECK, {chainId})
      } catch (err) {
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, new ErrorPayload(ERRCODES.FAILED_TO_CONNECT_NETWORK, err.message))
        console.log("Exception in network check handler: ", err);
      }
  }
  
}

//for the nominator and validator and other native transactions
export class NativeSigner {

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
  }

  signPayload = async (payload, state) => {
    try {

      const account = state.currentAccount;
      const pair = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

      let registry;
      const isJsonPayload = (value) => {
        return value?.genesisHash !== undefined;
      }

      if (isJsonPayload(payload)) {
        registry = new TypeRegistry();
        registry.setSignedExtensions(payload.signedExtensions);
        // }
      } else {
        // for non-payload, just create a registry to use
        registry = new TypeRegistry();
      }

      const result = registry.createType('ExtrinsicPayload', payload, { version: payload.version }).sign(pair);
      return new EventPayload(null, null, { data: result });

    } catch (err) {
      log("error while signing the payload: ", err)
      return new EventPayload(null, null, null, ErrorPayload(ERRCODES.SIGNER_ERROR, ERROR_MESSAGES.SINGER_ERROR));
    }
  }

  signRaw = async (payload, state) => {
    try {
      const account = state.currentAccount;
      const pair = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
      const result = { signature: u8aToHex(pair.sign(u8aWrapBytes(payload))) };
      return new EventPayload(null, null, { data: result });

    } catch (err) {
      log("error while signing the raw: ", err)
      return new EventPayload(null, null, null, new ErrorPayload(ERRCODES.SIGNER_ERROR, ERROR_MESSAGES.SINGER_ERROR));
    }
  }

}