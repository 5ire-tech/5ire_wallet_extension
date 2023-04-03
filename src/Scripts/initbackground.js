import Browser from "webextension-polyfill";
import { numFormatter } from "../Helper/helper";
import { GUIHandler, ExternalConnection } from "./controller";
import { getDataLocal, ExtensionStorageHandler } from "../Storage/loadstore";
import { CONNECTION_NAME, INTERNAL_EVENT_LABELS, DECIMALS, MESSAGE_TYPE_LABELS, STATE_CHANGE_ACTIONS, TX_TYPE, STATUS, LABELS, MESSAGE_EVENT_LABELS, AUTO_BALANCE_UPDATE_TIMER } from "../Constants";
import { isManifestV3 } from "./utils";
import { hasLength, isObject, isNullorUndef, hasProperty, getKey, log, isEqual, isString } from "../Utility/utility";
import { HTTP_END_POINTS, API, HTTP_METHODS, EVM_JSON_RPC_METHODS, ERRCODES, ERROR_MESSAGES, ERROR_EVENTS_LABELS } from "../Constants";
import { EVMRPCPayload, EventPayload } from "../Utility/network_calls";
import { httpRequest } from "../Utility/network_calls";
import { nativeMethod } from "./nativehelper";
import { Connection } from "../Helper/connection.helper";
import { EventEmitter } from "./eventemitter";
import { BigNumber } from "bignumber.js";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { u8aToHex } from "@polkadot/util";
import Web3 from "web3";
import Keyring from "@polkadot/keyring";
import { decryptor } from "../Helper/CryptoHelper";
import { ed25519PairFromSeed, mnemonicToMiniSecret } from "@polkadot/util-crypto";
import { sendRuntimeMessage } from "../Utility/message_helper";
import { txNotificationStringTemplate } from "./utils";


const eventEmitter = new EventEmitter();
//handling the connection using the events
eventEmitter.on(INTERNAL_EVENT_LABELS.CONNECTION, async () => {
  const services = new Services();
  const api = await services.apiConnection();
  if (api?.value) return;
  RPCCalls.api = api

  log("Here is the api after init: ", api);
})


//for initilization of background events
export class InitBackground {
  //check if there is time interval binded
  static balanceTimer = null;
  constructor() {
    this.injectScriptInTab();
    this.bindAllEvents();
    this.services = new Services();
    this.rpcCalls = new RPCCalls();
  }

  //init the background events
  static initBackground = () => {
    new InitBackground();
    delete InitBackground.constructor
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
    this.bindPopupEvents();
    this.bindRuntimeMessageEvents();
    this.bindInstallandUpdateEvents();
    this.bindBackgroundStartupEvents();
    this.bindExtensionUnmountEvents();
  }

  //bind the runtime message events
  bindRuntimeMessageEvents = async () => {
    Browser.runtime.onMessage.addListener(async (message, sender) => {

      const localData = await getDataLocal("state");

      //checks for event from extension ui
      if (message?.type === MESSAGE_TYPE_LABELS.EXTENSION_UI) {
        await this._rpcCallsMiddleware(message, localData);
        return;
      }

      const internalHandler = new ExternalConnection();

      //data for futher proceeding
      const data = {
        ...message,
        tabId: sender?.tab?.id,
      };

      //checks for event from injected script
      switch (data?.method) {
        case "connect":
        case "eth_requestAccounts":
        case "eth_accounts":
          await internalHandler.handleConnect(data);
          break;
        case "disconnect":
          await internalHandler.handleDisconnect(data);
          break;
        case "eth_sendTransaction":
          await internalHandler.handleEthTransaction(data);
          break;
        case "get_endPoint":
          await internalHandler.sendEndPoint(data);
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
          await internalHandler.handleValidatorNominatorTransactions(data);
          break;
        default:
      }
    });
  }

  //listen for the popup close and open events
  bindPopupEvents = async () => {
    Browser.runtime.onConnect.addListener(async (port) => {

      //perform according to the port name
      if (port.name === CONNECTION_NAME) {

        //handle the connection emit the connection event
        eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);

        //auto update the balance
        if (!isNullorUndef(InitBackground.balanceTimer)) clearInterval(InitBackground.balanceTimer)
        InitBackground.balanceTimer = await this._balanceUpdate();

        //handle the popup close event
        port.onDisconnect.addListener(() => {
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

  //Method called when browser window is getting close
  bindBrowserCloseEvent = async () => {
    Browser.onDisconnect();
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

  /**************** Internal Usage Methods **************************/

  //rpc calls middleware
  _rpcCallsMiddleware = async (message, state) => {
    try {

      if (hasProperty(this.rpcCalls, message.event)) {
        const rpcResponse = await this._errorCheck(message, state)
        this._parseRPCRes(rpcResponse);
      } else {
        //handle if the method is not the part of system
        new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)).throw();
      }
    } catch (err) {
      console.log("Error in rpcCallsMiddleware: ", err);
    }
  }


  //error boundry for all background rpc operations
  _errorCheck = async (message, state) => {
    try {
      const rpcResponse = await this.rpcCalls[message.event](message, state);
      return rpcResponse;
    } catch (err) {
      console.log("Error in error checker: ", err);
      if (err.message?.errCode) return new EventPayload(null, message.event, null, [], err.message);
      else return new EventPayload(null, message.event, null, [], new ErrorPayload(ERRCODES.INTERNAL, err.message));
    }
  }


  //parse the response receive from operation and send message accordingly to extension ui
  _parseRPCRes = async (rpcResponse) => {
    try {
      if (!rpcResponse.error) {

        //change the state in local storage
        if (rpcResponse.stateChangeKey) await this.services.updateLocalState(rpcResponse.stateChangeKey, rpcResponse.payload.data, rpcResponse.payload?.options)
        //send the response message to extension ui
        if (rpcResponse.eventEmit) this.services.messageToUI(rpcResponse.eventEmit, rpcResponse.payload.data)

        //send the notification and if transaction is pending check the transaction status
        if (rpcResponse.payload?.notification) this._sendNotification({ data: rpcResponse.payload.data, account: rpcResponse.payload.options?.account })

      } else {
        console.log("in the processing the unit, error section: ", rpcResponse);
        //send the error related messages here
        //PENDING
      }
    } catch (err) {
      console.log("Error in parsing the rpc response: ", err);
    }
  }

  //auto update the balance
  _balanceUpdate = async () => {
    const id = setInterval(async () => {
      const state = await getDataLocal(LABELS.STATE);
      await this._rpcCallsMiddleware({ event: MESSAGE_EVENT_LABELS.BALANCE }, state)
    }, AUTO_BALANCE_UPDATE_TIMER)

    return id;
  }

  _sendNotification = (txData) => {
    this.services.checkTransactions(txData);
  }
}

//for extension common service work
export class Services {

  constructor() {
    this.controller = GUIHandler.getInstance();
  }

  /*************************** Service Helpers ********************************/
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
        await this.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, {txHash, status: txRecipt.status, isSwap}, {account: txData.account});
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
  apiConnection = async () => {
    try {
      const connector = Connection.getConnector();
      const state = await getDataLocal("state");
      const apiConn = await connector.initializeApi(state.currentNetwork)
      // console.log("api connection: ", apiConn);
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
  errorMessageToUI = async () => {

  }

  //update the local storage data
  updateLocalState = async (key, data, options) => {
    try {
      ExtensionStorageHandler.updateStorage(key, data, options)
    } catch (err) {
      log("Error while updating the local state: ", err)
    }
  }

  /*************************** Service Internals ******************************/
  //show browser notification from extension
  _showNotification = (message) => {
    if (hasLength(message)) this.controller.showNotification(message);
  }

  //find the native and evm transaction status
  _findTxStatus = async (txHash, isEvm, network) => {
    //get the url of current network for evm rpc call or native explorer search
    const rpcUrl = isEvm ? HTTP_END_POINTS[network.toUpperCase()] : API[network.toUpperCase()];

    //check if the transaction is still pending or not
    let res = null, txRecipt = null;
    if (isEvm) {
      res = await httpRequest(rpcUrl, HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [txHash])));
      txRecipt = res?.result;
    }
    else {
      res = await httpRequest(rpcUrl + txHash, HTTP_METHODS.GET);
      txRecipt = res?.data?.transaction;
    }

    //transform the evm status to success or fail
    if(!isNullorUndef(txRecipt?.status) && !isString(txRecipt?.status)) txRecipt.status = txRecipt.status ? STATUS.SUCCESS : STATUS.FAILED;
    if(isNullorUndef(txRecipt?.status) && isString(txRecipt?.status) && isEqual(txRecipt?.status, STATUS.PENDING.toLowerCase()))
    txRecipt = null;

    return txRecipt;

  }

}


//for network rpc calls
export class RPCCalls {
  static api = null;
  static isHttp = true;

  constructor() {
    if (isNullorUndef(RPCCalls.api)) eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION)
    this.services = new Services();
  }

  //for fething the balance of both (evm and native)
  getBalance = async (message, state) => {

    let nbalance = 0;
    const { evmApi, nativeApi } = RPCCalls.api;

    const account = state.allAccounts[state.currentAccount.index];
    if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

    // Evm Balance
    const w3balance = await evmApi?.eth?.getBalance(account.evmAddress);

    //Native Balance
    if (RPCCalls.isHttp) {
      let balance_ = await nativeApi?._query.system.account(account.nativeAddress);
      nbalance = parseFloat(`${balance_.data.free}`) - parseFloat(`${balance_.data.miscFrozen}`);
    } else {
      let balance_ = await nativeApi?.derive.balances.all(account.nativeAddress);
      nbalance = balance_.availableBalance;
    }

    let evmBalance = numFormatter(new BigNumber(w3balance).dividedBy(DECIMALS).toFixed(6, 8).toString());
    let nativeBalance = numFormatter(new BigNumber(nbalance).dividedBy(DECIMALS).toFixed(6, 8).toString());
    let totalBalance = numFormatter(new BigNumber(evmBalance).plus(nativeBalance).toString());

    const payload = {
      data: {
        evmBalance,
        nativeBalance,
        totalBalance
      }
    }

    return new EventPayload(STATE_CHANGE_ACTIONS.BALANCE, null, payload, [], null);

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

    const api = RPCCalls.api;

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

  //get the evm fee
  evmFee = async (message, state) => {

    const { data } = message;
    const account = state.allAccounts[data.account.index]
    if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

    let toAddress = data.toAddress ? data.toAddress : account.nativeAddress;
    let amount = data.amount;

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

    const gasAmount = await RPCCalls.api.evmApi.eth.estimateGas(tx);
    const gasPrice = await RPCCalls.api.evmApi.eth.getGasPrice();
    let fee = (new BigNumber(gasPrice * gasAmount)).dividedBy(DECIMALS).toString();

    const payload = {
      data: { fee }
    }

    return new EventPayload(null, message.event, payload, [], null);

  };

  //evm transfer
  evmTransfer = async (message, state) => {

    //history reference object
    let dataToDispatch = null, payload = null;

    try {
      const { data } = message;
      const account = state.allAccounts[data.account.index]
      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      dataToDispatch = {
        isEvm: true,
        chain: state.currentNetwork.toLowerCase(),
        dateTime: new Date().toString(),
        to: data.to ? data.to : "",
        type: data.to ? (data.amount !== "0x0" ? TX_TYPE.SEND : "Contract Execution") : "Contract Deployement",
        amount: data.amount !== "0x0" ? data.amount : 0,
        txHash: "",
        status: STATUS.PENDING
      };

      const tempAmount = data.isBig ? (new BigNumber(data.amount).dividedBy(DECIMALS)).toString() : data.amount;
      if ((Number(tempAmount) > (Number(state.balance.evmBalance)) && data.amount !== '0x0') || Number(state.balance.evmBalance) <= 0) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {
        const amt = (new BigNumber(data.amount).multipliedBy(DECIMALS)).toString();

        const transactions = {
          from: account.evmAddress,
          value: data.isBig
            ? data.amount
            : (Number(amt).noExponents()).toString(),
          gas: 21000,
          data: data?.data,
          nonce: await RPCCalls.api.evmApi.eth.getTransactionCount(
            account.evmAddress,
            STATUS.PENDING.toLowerCase()
          ),
        };


        const gasTx = {
          from: transactions.from,
          value: transactions.value,
        };

        if (data.to) {
          transactions.to = Web3.utils.toChecksumAddress(data.to);
          gasTx.to = transactions.to;
        }

        if (transactions.data) {
          gasTx.data = transactions.data;
        }

        const gasAmount = await RPCCalls.api.evmApi.eth.estimateGas(gasTx);
        transactions.gas = gasAmount;

        let temp2p = getKey(account.temp1m, state.pass);
        const signedTx = await RPCCalls.api.evmApi.eth.accounts.signTransaction(
          transactions,
          temp2p
        );

        //Sign And Send Transaction
        const txInfo = await RPCCalls.api.evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
        const hash = txInfo.transactionHash;

        if (hash) {

          //check once is transaction recipt is generated or not
          const txRecipt = await httpRequest(HTTP_END_POINTS[state.currentNetwork.toUpperCase()], HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [hash])));

          let txStatus = STATUS.PENDING;
          if (txRecipt.result) {
            txStatus = Boolean(Number(txRecipt.result.status)) ? STATUS.SUCCESS : STATUS.FAILED
          }

          dataToDispatch.txHash = hash;
          dataToDispatch.status = txStatus;

          //return the payload
          payload = {
            data: dataToDispatch,
            options: {
              account: data.account
            },
            notification: true
          }

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);

        }
        else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      log("Error in EVM Transfer: ", err)
      dataToDispatch.txHash = "";
      dataToDispatch.status = STATUS.FAILED;

      payload = {
        data: dataToDispatch
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }

  };

  //evm to native swap
  evmToNativeSwap = async (message, state) => {

    let dataToDispatch = null, payload = null;

    try {
      const { data } = message;
      const account = state.allAccounts[data.account.index]
      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();


      dataToDispatch = {
        chain: state.currentNetwork.toLowerCase(),
        isEvm: true,
        dateTime: new Date().toString(),
        to: "Evm to Native",
        type: TX_TYPE?.SWAP,
        amount: data.amount,
      };


      if (Number(data.amount) >= Number(state.balance.evmBalance) || Number(data.amount) <= 0) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {
        const seedAlice = mnemonicToMiniSecret(
          decryptor(account.temp1m, state.pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
        const publicKey = u8aToHex(alice.publicKey);
        const amt = new BigNumber(data.amount).multipliedBy(DECIMALS).toString();

        const transaction = {
          to: publicKey.slice(0, 42),
          value: (Number(amt).noExponents()).toString(),
          gas: 21000,
          nonce: await RPCCalls.api.evmApi.eth.getTransactionCount(account.evmAddress),
        };

        let temp2p = getKey(account.temp1m, state.pass);
        const signedTx = await RPCCalls.api.evmApi.eth.accounts.signTransaction(
          transaction,
          temp2p
        );

        //sign and send
        const txInfo = await RPCCalls.api.evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signHash = txInfo.transactionHash;

        if (signHash) {

          //withdraw amount
          const withdraw = await RPCCalls.api.nativeApi.tx.evm.withdraw(
            publicKey.slice(0, 42),
            (Number(amt).noExponents()).toString()
          );
          let signRes = await withdraw.signAndSend(alice);

          const txRecipt = await httpRequest(HTTP_END_POINTS[state.currentNetwork.toUpperCase()], HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [signHash])));

          let txStatus = STATUS.PENDING;
          if (txRecipt.result) {
            txStatus = Boolean(Number(txRecipt.result.status)) ? STATUS.SUCCESS : STATUS.PENDING
          }

          dataToDispatch.txHash = { mainHash: signHash, hash: signRes.toHex() };
          dataToDispatch.status = txStatus;


          payload = {
            data: dataToDispatch,
            options: { account: data.account },
            notification: true
          }

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);

        } else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      log("Error in EvmtoNative Swap: ", err)
      dataToDispatch.txHash = "";
      dataToDispatch.status = STATUS.FAILED;

      payload = {
        data: dataToDispatch
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }
  };

  //********************************** Native ***************************************/

  //get native gas fee
  nativeFee = async (message, state) => {

    const { data } = message;

    const account = state.allAccounts[data.account.index];
    if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();


    const toAddress = data.toAddress ? data.toAddress : account.evmAddress;
    let transferTx;

    const keyring = new Keyring({ type: "ed25519" });
    const seedAlice = mnemonicToMiniSecret(decryptor(account.temp1m, state.pass));
    const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

    if (toAddress?.startsWith("0x")) {
      const amt = BigNumber(data.amount).multipliedBy(DECIMALS).toString();
      transferTx = await RPCCalls.api.nativeApi.tx.evm.deposit(toAddress, (Number(amt).noExponents()).toString());
    }
    else if (toAddress?.startsWith("5")) {
      const amt = new BigNumber(data.amount).multipliedBy(DECIMALS).toString();
      transferTx = RPCCalls.api.nativeApi.tx.balances.transfer(toAddress, (Number(amt).noExponents()).toString());

    }
    const info = await transferTx?.paymentInfo(alice);
    const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS)).toString();

    //construct payload
    const payload = { data: { fee } }
    return new EventPayload(null, message.event, payload, [], null);


  };

  //native transfer
  nativeTransfer = async (message, state) => {

    let dataToDispatch = null, payload = null;


    try {

      const { data } = message;
      const account = state.allAccounts[data.account.index]
      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      if (Number(data.amount) >= Number(state.balance.nativeBalance)) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {

        dataToDispatch = {
          chain: state.currentNetwork.toLowerCase(),
          isEvm: false,
          dateTime: new Date().toString(),
          to: data.to,
          type: TX_TYPE?.SEND,
          amount: data.amount,
        };

        let hash, err;

        const secretSeed = mnemonicToMiniSecret(
          decryptor(account?.temp1m, state.pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const keypair = keyring.addFromPair(ed25519PairFromSeed(secretSeed));
        const amt = new BigNumber(data.amount).multipliedBy(DECIMALS).toString();

        // const transfer = nativeApi.tx.balances.transferKeepAlive(
        //   data.to,
        //   (Number(amt).noExponents()).toString()
        // );

        const transfer = RPCCalls.api.nativeApi.tx.balances.transfer(data.to, (Number(amt).noExponents()).toString());

        if (RPCCalls.isHttp) {
          const txHash = await transfer.signAndSend(keypair)
          if (txHash) {


            const hash = txHash.toHex();
            dataToDispatch.txHash = hash;
            const txRecipt = await httpRequest(API[state.currentNetwork?.toUpperCase()] + hash, HTTP_METHODS.GET);

            let txStatus = STATUS.PENDING.toLowerCase();
            if (txRecipt?.data?.transaction) {
              txStatus = txRecipt.data.transaction.status;
            }

            //set the transaction status
            dataToDispatch.status = txStatus;

            payload = {
              data: dataToDispatch,
              options: {
                account: data.account
              },
              notification: true
            }

            return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload, [], null);

          } else new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();

        } else {
          //Send and sign txn
          const { status, events, txHash } = transfer.signAndSend(keypair);

          if (status.isInBlock) {
            if (hash !== txHash.toHex()) {
              hash = txHash.toHex();
              let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

              //Matching Extrinsic Events for get the status
              phase.forEach(({ event }) => {

                if (RPCCalls.api.nativeApi.events.system.ExtrinsicSuccess.is(event)) {

                  err = false;
                  dataToDispatch.status = STATUS.SUCCESS;

                } else if (RPCCalls.api.nativeApi.events.system.ExtrinsicFailed.is(event)) {

                  err = false;
                  dataToDispatch.status = STATUS.FAILED;

                }
              });

              dataToDispatch.txHash = hash ? hash : "";

              if (err) new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
              else {
                return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);
              }
            }
          }
        }
      }
    } catch (err) {
      log("Error while native transfer : ", err);
      dataToDispatch.txHash = "";
      dataToDispatch.status = STATUS.FAILED;

      payload = {
        data: dataToDispatch
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }
  }

  //native to evm swap
  nativeToEvmSwap = async (message, state) => {

    let dataToDispatch = null, payload = null

    try {

      const { data } = message;
      const account = state.allAccounts[data.account.index]
      if (isNullorUndef(account)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();


      if (Number(data.amount) >= Number(state.balance.nativeBalance) || Number(data.amount) <= 0) {
        return new EventPayload(null, ERROR_EVENTS_LABELS.INSUFFICENT_BALANCE, null, [], null);
      } else {

        dataToDispatch = {
          chain: state.currentNetwork.toLowerCase(),
          isEvm: false,
          dateTime: new Date().toString(),
          to: "Native to Evm",
          type: TX_TYPE?.SWAP,
          amount: data.amount,
        };


        let err, evmDepositeHash, signedHash;
        const seedSecret = mnemonicToMiniSecret(
          decryptor(account?.temp1m, state.pass)
        );

        const keyring = new Keyring({ type: "ed25519" });
        const keyringPair = keyring.addFromPair(ed25519PairFromSeed(seedSecret));
        const amt = (new BigNumber(data.amount).multipliedBy(DECIMALS)).toString();

        //Deposite amount
        let deposit = await RPCCalls.api.nativeApi.tx.evm.deposit(
          account?.evmAddress,
          (Number(amt).noExponents()).toString()
        );
        evmDepositeHash = deposit.hash.toHex();

        if (RPCCalls.isHttp) {

          //Sign and Send txn for http provider
          const txHash = await deposit.signAndSend(keyringPair);
          if (txHash) {

            const hash = txHash.toHex();
            dataToDispatch.txHash = { hash: evmDepositeHash, mainHash: hash };
            const txRecipt = await httpRequest(API[state.currentNetwork?.toUpperCase()] + hash, HTTP_METHODS.GET);

            let txStatus = STATUS.PENDING.toLowerCase();
            if (txRecipt?.data?.transaction) {
              txStatus = txRecipt.data.transaction.status;
            }

            //set the transaction status
            dataToDispatch.status = txStatus;

            payload = {
              data: dataToDispatch,
              options: { account: data.account },
              notification: true
            }
            return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload, [], null);

          } else {

            // dataToDispatch.data.txHash = { hash: evmDepositeHash, mainHash: "" };
            // dataToDispatch.data.status = STATUS.FAILED;
            new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
          }

        } else {

          //Sign and Send txn for websocket provider
          deposit.signAndSend(keyringPair, ({ status, events, txHash }) => {
            if (status.isInBlock) {

              if (signedHash !== txHash) {

                signedHash = txHash.toHex();
                let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

                //Matching Extrinsic Events for get the status
                phase.forEach(({ event }) => {

                  if (RPCCalls.api.nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                    err = false;
                    dataToDispatch.status = STATUS.SUCCESS;
                  } else if (RPCCalls.api.nativeApi.events.system.ExtrinsicFailed.is(event)) {
                    err = true;
                    dataToDispatch.status = STATUS.FAILED;
                  }

                });

                dataToDispatch.txHash = { hash: evmDepositeHash, mainHash: signedHash };

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
      dataToDispatch.txHash = { hash: "", mainHash: "" };
      dataToDispatch.status = STATUS.FAILED;

      payload = {
        data: dataToDispatch
      }
      return new EventPayload(null, ERROR_EVENTS_LABELS.NETWORK_ERROR, payload, [], new ErrorPayload(err.message.errCode || ERRCODES.NETWORK_REQUEST, err.message));
    }
  };

}