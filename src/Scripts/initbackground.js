import Browser from "webextension-polyfill";
import { ExternalConnection, ExternalWindowControl } from "./controller";
import {NotificationAndBedgeManager} from "./platform";
import { getDataLocal, ExtensionStorageHandler } from "../Storage/loadstore";
import { CONNECTION_NAME, INTERNAL_EVENT_LABELS, DECIMALS, MESSAGE_TYPE_LABELS, STATE_CHANGE_ACTIONS, TX_TYPE, STATUS, LABELS, MESSAGE_EVENT_LABELS, AUTO_BALANCE_UPDATE_TIMER, TRANSACTION_STATUS_CHECK_TIMER, ONE_ETH_IN_GWEI } from "../Constants";
import { isManifestV3 } from "./utils";
import { hasLength, isObject, isNullorUndef, hasProperty, getKey, log, isEqual, isString } from "../Utility/utility";
import { HTTP_END_POINTS, API, HTTP_METHODS, EVM_JSON_RPC_METHODS, ERRCODES, ERROR_MESSAGES, ERROR_EVENTS_LABELS } from "../Constants";
import { EVMRPCPayload, EventPayload, TransactionPayload, TransactionProcessingPayload, TabMessagePayload } from "../Utility/network_calls";
import { httpRequest } from "../Utility/network_calls";
import Web3 from "web3";
import { BigNumber } from "bignumber.js";
import { u8aToHex } from "@polkadot/util";
// import Keyring from "@polkadot/keyring";
import { HybridKeyring } from "./5ire-keyring";
import { nativeMethod } from "./nativehelper";
import { EventEmitter } from "./eventemitter";
import { numFormatter } from "../Helper/helper";
import { txNotificationStringTemplate } from "./utils";
import { Connection } from "../Helper/connection.helper";
import { Error, ErrorPayload } from "../Utility/error_helper";
import Keyring from "@polkadot/keyring";
import { decryptor } from "../Helper/CryptoHelper";
import { ed25519PairFromSeed, mnemonicToMiniSecret } from "@polkadot/util-crypto";
import { sendMessageToTab, sendRuntimeMessage } from "../Utility/message_helper";


//for initilization of background events
export class InitBackground {
  //check if there is time interval binded
  static balanceTimer = null;

  constructor() {
    ExtensionEventHandle.initEventsAndGetInstance();
    this.networkHandler = NetworkHandler.getInstance();
    this.injectScriptInTab();
    this.bindAllEvents();
    this.rpcRequestProcessor = RpcRequestProcessor.getInstance();
    this.internalHandler = ExternalConnection.getInstance();
    this.externalTaskHandler = new ExternalTxTasks();
    this.keyringHandler = new KeyringHandler();
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
    this.bindRuntimeMessageEvents();
    this.bindPopupEvents();
    this.bindInstallandUpdateEvents();
    this.bindBackgroundStartupEvents();
    this.bindExtensionUnmountEvents();
    // this.bindBrowserCloseEvent();
  }

  //bind the runtime message events
  bindRuntimeMessageEvents = async () => {
    Browser.runtime.onMessage.addListener(async (message, sender) => {

      const localData = await getDataLocal("state");

      //checks for event from extension ui
       if(isEqual(message?.type, MESSAGE_TYPE_LABELS.INTERNAL_TX) || isEqual(message?.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE)) {
        await this.rpcRequestProcessor.rpcCallsMiddleware(message, localData);
        return;
      } else if(message?.type === MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL) {
        await this.externalTaskHandler.processExternalTask(message, localData);
        return;
      } else if (message?.type === MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING) {
        await this.keyringHandler.keyringHelper(message);
        return;
      } else if(message?.type === MESSAGE_TYPE_LABELS.NETWORK_HANDLER) {
        this.networkHandler.handleNetworkRelatedTasks(message, localData);
      }

      //check if message is array or onject
      message.message = hasLength(message.message) ? message.message[0] : message.message;

      //data for futher proceeding
      const data = {
        ...message,
        origin: sender.origin,
        tabId: sender.tab.id
      };

      //checks for event from injected script
      try {
        
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
  
          case "native_add_nominator":
          case "native_renominate":
          case "native_nominator_payout":
          case "native_validator_payout":
          case "native_stop_validator":
          case "native_stop_nominator":
          case "native_unbond_validator":
          case "native_unbond_nominator":
          case "native_withdraw_nominator":
          case "native_withdraw_validator":
          case "native_withdraw_nominator_unbonded":
          case "native_add_validator":
          case "native_validator_bondmore":
          case "native_restart_validator":
          case "native_nominator_bondmore":
            await this.internalHandler.handleValidatorNominatorTransactions(data, localData);
            break;
          default: sendMessageToTab(data.tabId, new TabMessagePayload(data.message.id, null, ERROR_MESSAGES.INVALID_METHOD))
        }

      } catch (err) {
        console.log("Error while external operation: ", err);
      }
    });
  }

  //listen for the popup close and open events
  bindPopupEvents = async () => {
    Browser.runtime.onConnect.addListener(async (port) => {

      //perform according to the port name
      if (port.name === CONNECTION_NAME) {
        //todo
        // this.services.messageToUI("accounts", this.hybridKeyring.getAccounts());

        //handle the connection emit the connection event
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);

        //auto update the balance
        if (!isNullorUndef(InitBackground.balanceTimer)) clearInterval(InitBackground.balanceTimer)
        InitBackground.balanceTimer = this._balanceUpdate();

        //handle the popup close event
        port?.onDisconnect.addListener(() => {
          //clear the Interval on popup close
          if (!isNullorUndef(InitBackground.balanceTimer)) {
            clearInterval(InitBackground.balanceTimer)
            InitBackground.balanceTimer = null;
          }
        });
      }
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
      if(!RpcRequestProcessor.instance) {
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
              if(hasProperty(this.generalWalletRpc, message.event)) {
                rpcResponse = await this.generalWalletRpc[message.event](message, state);
                this.parseGeneralRpc(rpcResponse);
              } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();
          
            } else if(isEqual(message?.type, MESSAGE_TYPE_LABELS.INTERNAL_TX)) {
             this.processTransactionRequest(message)
          }
        } catch (err) {
          log("error while processing the gas and balance request: ", err);
          rpcResponse = new EventPayload(null, null, null, [], new ErrorPayload(err.message?.errCode || ERRCODES.INTERNAL, err.message?.errMessage || err.message));
          this.parseGeneralRpc(rpcResponse)
        }
    }
  

    //parse and send the message related to fee and balance
    parseGeneralRpc = async (rpcResponse) => {
        if(!rpcResponse.error) {
          //change the state in local storage
          if (!isNullorUndef(rpcResponse.stateChangeKey)) await this.services.updateLocalState(rpcResponse.stateChangeKey, rpcResponse.payload.data, rpcResponse.payload?.options)
          //send the response message to extension ui
          if (rpcResponse.eventEmit) this.services.messageToUI(rpcResponse.eventEmit, rpcResponse.payload.data)
        } else {
          //handle the balance fetch and fee rpc errors
        }
    }

  
    //parse the transaction related rpc response
    processTransactionRequest = async (transactionRequest) => {
      try {


          //create a transaction payload
          const { data } = transactionRequest;
          const transactionProcessingPayload = new TransactionProcessingPayload(data, transactionRequest.event, null, data?.data, {...data?.options});
          
          //send the transaction into tx queue
          await this.transactionQueue.addNewTransaction(transactionProcessingPayload);

      } catch (err) {
        console.log("error while processing the transaction: ", err);
      }
    }
}



//class implementation for transaction queue
class TransactionQueue {
    static instance = null;
    static transactionIntervalId = null;

    constructor() {
      this.services = new Services();
      this.transactionRpc = new TransactionsRPC();
    }

    //give only access to the single instance of class
    static getInstance = () => {
        if(!TransactionQueue.instance) TransactionQueue.instance = new TransactionQueue();
        return TransactionQueue.instance;
    }

    //set the transaction interval id
    static setIntervalId = (transactionIntervalId) => {
      TransactionQueue.transactionIntervalId = transactionIntervalId;
    }

    
    //add new transaction
    addNewTransaction = async (transactionProcessingPayload) => {
        //add the transaction history track
        if(transactionProcessingPayload.type !== MESSAGE_EVENT_LABELS.NV_TX) {
          const state = await getDataLocal(LABELS.STATE);
          const {data} = transactionProcessingPayload;
          transactionProcessingPayload.transactionHistoryTrack = new TransactionPayload(data?.to, data?.value ? parseFloat(data?.value).toString(): "", null, state.currentNetwork);

          //insert transaction history with flag "Queued"
          await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY, transactionProcessingPayload.transactionHistoryTrack, transactionProcessingPayload.options);
        }

        //add the new transaction into queue
        await this.services.updateLocalState(STATE_CHANGE_ACTIONS.ADD_NEW_TRANSACTION, transactionProcessingPayload, {localStateKey: LABELS.TRANSACTION_QUEUE});

        //emit the event that new transaction is added into queue
        ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE);
    }


    //process next queued transaction
    processQueuedTransaction = () => {
        //dequeue next transaction and add it as processing transaction
        this.services.updateLocalState(STATE_CHANGE_ACTIONS.PROCESS_QUEUE_TRANSACTION, {}, {localStateKey: LABELS.TRANSACTION_QUEUE})
    }


    //perform transaction rpc request
    processTransaction = async () => {
      const state = await getDataLocal(LABELS.STATE);
      const {currentTransaction} = await getDataLocal(LABELS.TRANSACTION_QUEUE);
      try {

          if(hasProperty(this.transactionRpc, currentTransaction.type)) {
            const rpcResponse = await this.transactionRpc[currentTransaction.type](currentTransaction, state);
            return rpcResponse;
          } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();


      } catch (err) {
       return new EventPayload(null, null, null, [], new ErrorPayload(err.message?.errCode || ERRCODES.INTERNAL, err.message?.errMessage || err.message));
      }
    }

    
    //parse the response after processing the transaction
    parseTransactionResponse = async () => {
      //perform the current active transactions 
      const transactionResponse = await this.processTransaction();
      const {txHash} = transactionResponse.payload?.data;

      //check if there is error payload into response
      if(!transactionResponse.error) {
        
        
        //if transaction is external then send the response to spefic tab
        if(transactionResponse.payload.options?.externalTransaction && txHash) {
          const {externalTransaction} = transactionResponse.payload.options;
          const externalResponse = {method: externalTransaction.method, result: txHash}

          sendMessageToTab(externalTransaction?.tabId, new TabMessagePayload(externalTransaction.id, externalResponse));
        }
        
        await this._updateQueueAndHistory(transactionResponse);
      } else {
        //check for error after transaction
        //check if txhash is found in payload then update transaction into queue and history
        if(txHash) this._updateQueueAndHistory(transactionResponse);
      }
    }


    //set timer for updating the transaction status
    checkTransactionStatus = async () => {
        const {currentTransaction, txQueue} = await getDataLocal(LABELS.TRANSACTION_QUEUE);
        const transactionHistoryTrack = {...currentTransaction.transactionHistoryTrack}


        //check if transaction status is pending then only check the status
        if(currentTransaction && isEqual(currentTransaction.transactionHistoryTrack.status, STATUS.PENDING)) {
          const {transactionHistoryTrack: {txHash, isEvm, chain}} = currentTransaction;
          const transactionStatus = await this.services.getTransactionStatus(txHash, isEvm, chain);

          //if transaction status is found ether Failed or Success
          if(transactionStatus?.status) {
            const hasPendingTx = txQueue.length;

           //update the transaction after getting the confirmation
           transactionHistoryTrack.status = transactionStatus.status;
           transactionHistoryTrack.to = !!transactionHistoryTrack.intermidateHash ? transactionHistoryTrack.to : transactionHistoryTrack.isEvm ? transactionStatus.to || transactionStatus.contractAddress: transactionHistoryTrack.to ;
           transactionHistoryTrack.gasUsed = transactionHistoryTrack.isEvm ? (Number(transactionStatus?.gasUsed)/ONE_ETH_IN_GWEI).toString() : transactionStatus?.txFee
          
          //update the transaction status and other details after confirmation
           await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, transactionHistoryTrack, currentTransaction?.options);

            //dequeue the new transaction and set as active for processing
            await this.processQueuedTransaction();

            //show notification of transaction status
            this.services.showNotification(txNotificationStringTemplate(transactionStatus.status, txHash));

            //check if there any pending transaction into queue
            if(!isEqual(hasPendingTx, 0)) {
              await this.parseTransactionResponse();
              TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus))
            } else {
              //reset the timeout id as null so whenever new transaction made the timeout start again
              TransactionQueue.setIntervalId(null);
            }
          } 
          //if transaction is still in pending state
          else {
            TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus))
          }
        }
    }

    /******************************* Event Callbacks *************************/
    //callback for new transaction inserted into queue event
    newTransactionAddedEventCallback = async () => {
      if(isNullorUndef(TransactionQueue.transactionIntervalId)) {
        await this.processQueuedTransaction();
        await this.parseTransactionResponse();

        TransactionQueue.setIntervalId(this._setTimeout(this.checkTransactionStatus))
      }
    }


    /******************************** Internal methods ***********************/
    //schedule execution
    _setTimeout = (cb) => {
      return setTimeout(cb, TRANSACTION_STATUS_CHECK_TIMER);
    }

    //update the transaction queue and history
    _updateQueueAndHistory = async (transactionResponse) => {
      await this.services.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, transactionResponse.payload.data, transactionResponse.payload?.options);
          
      //update the transaction into active transaction session
      await this.services.updateLocalState(STATE_CHANGE_ACTIONS.UPDATE_HISTORY_TRACK, transactionResponse.payload.data, {localStateKey: LABELS.TRANSACTION_QUEUE});
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
  }


  //return the already initlized instance
  static initEventsAndGetInstance = () => {
  if(!ExtensionEventHandle.instance) {
    ExtensionEventHandle.instance = new ExtensionEventHandle();
    delete ExtensionEventHandle.constructor;
  }

  return ExtensionEventHandle.instance;
  }


  //bind all internal events
  bindAllEvents = () => {
    this.bindAutoBalanceUpdateEvent();
    this.bindTransactionProcessingEvents();
    this.bindErrorHandlerEvent();
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

  //bind auto balance update event
  bindAutoBalanceUpdateEvent = async () => {
      //auto update the balance
      ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.BALANCE_FETCH, async () => {
        const state = await getDataLocal(LABELS.STATE);
  
        //if account is not created
        if(!state.currentAccount) return;
  
        await this.rpcRequestProcessor.rpcCallsMiddleware({ event: MESSAGE_EVENT_LABELS.BALANCE, type: MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, data: {}}, state);
       })
    }

  //bind error handler event
  bindErrorHandlerEvent = async () => {
    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.ERROR, async (err) => {
      try {
        log("error catched: ", err)
      } catch(err) {
        log("Error in error event handler: ", err)
      }
    })
  }
}


//for non rpc tasks
class ExternalTxTasks {

  constructor() {
    this.transactionQueueHandler = TransactionQueue.getInstance();
  }

  //process and check external task (connection, tx approval)
  processExternalTask = async (message, localState) => {
      if(isEqual(message.event, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION)) await this.closePopupSession(message, localState)
      else {
        if(isEqual(MESSAGE_EVENT_LABELS.EVM_TX, message.event)) await this.externalEvmTransaction(message, localState)
      }
  }

  //handle the evm external transaction
  externalEvmTransaction = async (message) => {
    const {activeSession} = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //process the external evm transactions
    const externalTransactionProcessingPayload = new TransactionProcessingPayload({...activeSession.message, options: {...message?.data.options, externalTransaction: {...activeSession}}}, message.event, null, activeSession.message?.data, {...message?.data.options, externalTransaction: {...activeSession}});

    await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
  }


  //handle the nominator and validator transaction
  nominatorAndValidatorTransactions = async () => {
    //PENDING
  }

  //close the current popup session
  closePopupSession = async (message, localState) => {
    log("into the popup close session: ", message)
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
        if(!isNullorUndef(txRecipt?.status)) txRecipt.status = parseInt(txRecipt.status) ? STATUS.SUCCESS : STATUS.FAILED;

      }
      else {
        res = await httpRequest(rpcUrl + txHash, HTTP_METHODS.GET);
        txRecipt = res?.data?.transaction;


        if(!isNullorUndef(txRecipt?.status)) {
          if(isEqual(txRecipt.status.toLowerCase(), STATUS.SUCCESS.toLowerCase())) txRecipt.status = STATUS.SUCCESS;
          if(isEqual(txRecipt.status.toLowerCase(), STATUS.FAILED.toLowerCase())) txRecipt.status = STATUS.FAILED;
        }
      }
  
      //transform the evm status to success or fail
      if(isNullorUndef(txRecipt?.status) && isString(txRecipt?.status) && isEqual(txRecipt?.status, STATUS.PENDING.toLowerCase()))
      txRecipt = null;
  
      return txRecipt;
  
    }

  // check if transaction status and inform user using browser notification
  checkTransactions = async (txData) => {
    try {
      const txHash = isObject(txData.data.txHash) ? txData.data.txHash.mainHash : txData.data.txHash;

      //check if transaction status is already updated
      if (isEqual(txData.data.status, STATUS.SUCCESS) || isEqual(txData.data.status, STATUS.FAILED)) {
        this._showNotification(txNotificationStringTemplate(txData.data.status, txHash))
        return null;
      }

      const isSwap = txData.data.type.toLowerCase() === TX_TYPE.SWAP.toLowerCase();
      const txRecipt = await this._findTxStatus(txHash, txData.data.isEvm, txData.data.chain)

      //check if the tx is native or evm based
      if (txRecipt?.status) {
        await this.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, { txHash, status: txRecipt.status, isSwap }, { account: txData.account });
        this._showNotification(txNotificationStringTemplate(txRecipt.status, txHash));
      }
      else this.checkTransactions(txData);

      return null;
    } catch (err) {
      console.log("Error while checking transaction status: ", err);
      return ErrorPayload(ERRCODES.INTERNAL, err.message);
    }
  }

  //create rpc handler
  createConnection = async (currentNetwork) => {
    try {
      const connector = Connection.getInsatnce();
      const apiConn = await connector.initializeApi(currentNetwork)
      return apiConn;
    } catch (err) {
      console.log("Error while making the connection to native api: ", err.message);
    }
  }

  //pass message to extension ui
  messageToUI = async (event, message) => {
    try {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND, event, message)
    } catch (err) {
      console.log("Error while sending the message to extension ui: ", err);
    }
  }

  //pass error related messaged to extension ui
  //PENDING
  errorMessageToUI = async () => {

  }

  //update the local storage data
  updateLocalState = async (key, data, options) => {
    try {
      await ExtensionStorageHandler.updateStorage(key, data, options)
    } catch (err) {
      log("Error while updating the local state: ", err)
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
    this.hybridKeyring = new HybridKeyring();
    this.services = new Services();

  }

  /************************* Validator and Nominator ****************************/
  //for validator and nominator transactions
  //PENDING
  nvTx = async (message, state) => {

    let feeData, methodName = '';
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
      restartValidator
    } = await nativeMethod();

    const api = NetworkHandler.api[state.currentNetwork.toLowerCase()];

    const { uiData } = state;
    switch (uiData?.method) {
      case "native_add_nominator":
        feeData = await addNominator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Add Nominator";
        break;
      case "native_renominate":
        feeData = await reNominate(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Re-Nominate";
        break;
      case "native_nominator_payout":
        feeData = await nominatorValidatorPayout(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Nominator Payout";
        break;
      case "native_validator_payout":
        feeData = await nominatorValidatorPayout(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Validator Payout";
        break;
      case "native_stop_validator":
        feeData = await stopValidatorNominator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Stop Validator";
        break;

      case "native_stop_nominator":
        feeData = await stopValidatorNominator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Stop Nominator";
        break;
      case "native_unbond_validator":
        feeData = await unbondNominatorValidator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Unbond Validator";
        break;

      case "native_unbond_nominator":
        feeData = await unbondNominatorValidator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Unbond Nominator";
        break;
      case "native_withdraw_nominator":
        feeData = await withdrawNominatorValidatorData(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Send Funds";
        break;

      case "native_withdraw_validator":
        feeData = await withdrawNominatorValidatorData(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Send Funds";
        break;
      case "native_withdraw_nominator_unbonded":
        feeData = await withdrawNominatorUnbonded(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Withdraw Nominator Unbonded";
        break;

      case "native_add_validator":
        feeData = await addValidator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Add Validator";
        break;

      case "native_validator_bondmore":
      case "native_nominator_bondmore":
        feeData = await bondMoreFunds(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Bond More Funds";
        break;
      case "native_restart_validator":
        feeData = await restartValidator(api.nativeApi, uiData?.message, message.data.isFee);
        methodName = "Restart Validator";
        break;
      default:

    }


    if ((!feeData?.error) && methodName) {
      if (feeData.error?.errCode) return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, message.event, null, [], feeData?.error);
    } else {
      return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, null, [], null);

    }


  }

  //********************************** Evm ***************************************/
  //evm transfer
  evmTransfer = async (message, state) => {

    //history reference object
    let transactionHistory = null, payload = null;

    log("here is the data: ", message);

    try {
      const { data, transactionHistoryTrack, contractBytecode } = message;
      const {options:{account}} = data;
      const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      transactionHistory = {
        ...transactionHistoryTrack,
        isEvm: true,
        type: contractBytecode ? data.to ? TX_TYPE.CONTRACT_EXECUTION : TX_TYPE.CONTRACT_DEPLOYMENT :  TX_TYPE.SEND,
        status: STATUS.PENDING
      };

      const tempAmount = data.isBig ? (new BigNumber(data.value).dividedBy(DECIMALS)).toString() : data.value;

      if (
        (Number(tempAmount) > (Number(state.balance.evmBalance))
          &&
          data.value !== '0x0')
        ||
        Number(state.balance.evmBalance) <= 0
      ) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      }
      else {
        const amt = (new BigNumber(data.value).multipliedBy(DECIMALS)).toString();
        const to = Web3.utils.toChecksumAddress(data.to);
        const value = data.isBig
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

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);

        }
        else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      log("Error in EVM Transfer: ", err)
      transactionHistory.status = transactionHistory.txHash ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: {
          ...message.data.options
        },
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }

  };

  //evm to native swap
  evmToNativeSwap = async (message, state) => {

    //history reference object
    let transactionHistory = null, payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const {options: {account}} = data;
      const { evmApi, nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      transactionHistory = {
        ...transactionHistoryTrack
      }

      if (Number(data.value) >= Number(state.balance.evmBalance) || Number(data.value) <= 0) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {

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

          //withdraw amount
          const withdraw = await nativeApi.tx.evm.withdraw(to, (Number(amt).noExponents()).toString());
          const signRes = await withdraw.signAndSend(alice);

          transactionHistory.txHash = signHash;
          transactionHistory.intermidateHash = signRes.toHex();

          payload = {
            data: transactionHistory,
            options: { ...data.options }
          }

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);

        } else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      log("Error in EvmtoNative Swap: ", err)
      transactionHistory.status = (transactionHistory.txHash && transactionHistory.intermidateHash) ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: {...message.data.options}
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }
  };

  //********************************** Native ***************************************/
  //native transfer
  nativeTransfer = async (message, state) => {
    let transactionHistory = null, payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const {options: {account}} = data;
      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      if (Number(data.value) >= Number(state.balance.nativeBalance)) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {

        transactionHistory = {
          ...transactionHistoryTrack,
          isEvm: false,
          type:  TX_TYPE.SEND,
          status: STATUS.PENDING
        };

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

            return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload, [], null);

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
                return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);
              }
            }
          }
      }
    } }catch (err) {
      log("Error while native transfer: ", err);
      transactionHistory.status = isEqual(transactionHistory.txHash, "") ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: {
          ...message.data.options
        }
      }

      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }
  }

  //native to evm swap
  nativeToEvmSwap = async (message, state) => {
    let transactionHistory = null, payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const {options: {account}} = data;
      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      if (Number(data.value) >= Number(state.balance.nativeBalance)) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {

        transactionHistory = {
          ...transactionHistoryTrack,
          isEvm: false,
          type:  TX_TYPE.SWAP,
          status: STATUS.PENDING,
          to: "Native to Evm"
        };


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

            return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);

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
                  return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload, [], null);
                }
              }
            }
          });
        }

      }
    } catch (err) {
      console.log("Error occured while swapping native to evm : ", err);

      transactionHistory.status = (transactionHistory.txHash && transactionHistory.intermidateHash) ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: {...message.data.options}
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }
  };

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
    this.hybridKeyring = new HybridKeyring();
  }

    //for fething the balance of both (evm and native)
    getBalance = async (message, state) => {

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
  
      return new EventPayload(STATE_CHANGE_ACTIONS.BALANCE, null, payload, [], null);
  
    };

    //get the evm fee
    evmFee = async (message, state) => {

    const { data } = message;
    const {options: {account}} = data;

    const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

    if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

    let toAddress = data.toAddress ? data.toAddress : account.nativeAddress;
    let amount = data.value;

    if (toAddress?.startsWith("5"))
      toAddress = u8aToHex(toAddress).slice(0, 42);

    if (toAddress?.startsWith("0x")) {
      try {
        amount = Math.round(Number(amount));
        Web3.utils.toChecksumAddress(toAddress);
      } catch (error) {

      }
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

    return new EventPayload(null, message.event, payload, [], null);

    };

    //get native gas fee
    nativeFee = async (message, state) => {

    const { data } = message;
    const {options: {account}} = data;

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
    return new EventPayload(null, message.event, payload, [], null);


    };
}

//keyring handler
export class KeyringHandler {
  constructor() {
    this.hybridKeyring = new HybridKeyring();
    this.services = new Services();
  }

  keyringHelper = async (message) => {
    try {

      if (this.hybridKeyring[message.event]) {
        const keyringResponse = await this._keyringCaller(message);
        this._parseKeyringRes(keyringResponse);

      } else {
        //handle if the method is not the part of system
        new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();
      }
    } catch (err) {
      console.log("Error in _keyringMiddleware: ", err);
    }
  }

  _keyringCaller = async (message) => {
    try {
      const keyResponse = await this.hybridKeyring[message.event](message);
      return keyResponse;

    } catch (err) {
      console.log("Error in _errorCheckForKeyring ", err);
      if (err.message?.errCode) return new EventPayload(null, message.event, null, [], err.message);

      else return new EventPayload(null, message.event, null, [], new ErrorPayload(ERRCODES.INTERNAL, err.message));
    }
  }


  //parse the response recieve from operation and send message accordingly to extension ui
  _parseKeyringRes = async (response) => {
    try {

      if (!response.error) {

        //change the state in local storage
        if (response.stateChangeKey) {

          await this.services.updateLocalState(response.stateChangeKey, response.payload, response.payload?.options);

        }

        //send the response message to extension ui
        if (response.eventEmit) this.services.messageToUI(response.eventEmit, response.payload)

      } else {
        console.log("in the processing the unit, error section: ", response);

        if (Number(response?.error?.errCode) === 3) {
          if (response.eventEmit) this.services.messageToUI(response.eventEmit, response.error)
        }
      }
    } catch (err) {
      console.log("Error in parsing the rpc response: ", err);
    }
  }
}


//network task handler
class NetworkHandler {
  static instance = null;
  static api = {};

  constructor() {
     this.services = new Services();
  }

  //get only single instance
  static getInstance = () => {
    if(!NetworkHandler.instance) {
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
    if(!isNullorUndef(message.event) && hasProperty(NetworkHandler.instance, message.event)) {
        const isDone = await NetworkHandler.instance[message.event](message, state);
    }
  }

  //change network handler
  networkChange = async (message, state) => {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
      setTimeout(() => ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH), 1000)
  }

  /******************************** create connection *********************************/
  initRpcApi = async () => {
    const {currentNetwork} = await getDataLocal(LABELS.STATE);
    const api = await this.services.createConnection(currentNetwork);
    if (api?.value) return;

    //insert connection into its network slot
    NetworkHandler.api[currentNetwork.toLowerCase()] = api;
    log("all api is here: ", NetworkHandler.api);
  }
}