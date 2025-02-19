import {
  ERRCODES,
  ERROR_MESSAGES,
  INTERNAL_EVENT_LABELS,
  LABELS,
  MESSAGE_EVENT_LABELS,
  MESSAGE_TYPE_LABELS
} from "../Constants";
import { getDataLocal } from "../Storage/loadstore";
import { isEqual, log } from "../Utility/utility";
import { EventEmitter } from "./eventemitter";
import { InitBackground } from "./initbackground";
import { NetworkHandler } from "./NetworkHandler";
import { RpcRequestProcessor } from "./RpcRequestProcessor";
import { Services } from "./Services";
import { TransactionQueue } from "./TransactionQueue";

/**
 * For handling extension events like auto update balance or nework detection
 */
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
  };

  //bind all internal events
  bindAllEvents = () => {
    this.bindAutoBalanceUpdateEvent();
    this.bindTransactionProcessingEvents();
    // this.bindNewNativeSignerTransactionEvents();
    this.bindErrorHandlerEvent();
    this.bindLapsedTransactionCheckingEvent();
  };

  //for creating the instance of native and evm api
  bindConnectionEvent = async () => {
    //handling the connection using the events
    ExtensionEventHandle.eventEmitter.on(
      INTERNAL_EVENT_LABELS.CONNECTION,
      this.networkHandler.initRpcApi
    );
  };

  //bind the transaction processing related events
  bindTransactionProcessingEvents = async () => {
    //event triggered when new transaction is added into queue
    ExtensionEventHandle.eventEmitter.on(
      INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE,
      this.transactionQueue.newTransactionAddedEventCallback
    );
  };

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

      await this.rpcRequestProcessor.rpcCallsMiddleware(
        {
          event: MESSAGE_EVENT_LABELS.BALANCE,
          type: MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
          data: {}
        },
        state
      );
    });

    ExtensionEventHandle.eventEmitter.on(INTERNAL_EVENT_LABELS.TOKEN_BALANCE_FETCH, async () => {
      const state = await getDataLocal(LABELS.STATE);

      //if account is not created
      if (!state.currentAccount.accountName) return;

      await this.rpcRequestProcessor.rpcCallsMiddleware(
        {
          event: MESSAGE_EVENT_LABELS.GET_TOKEN_BALANCE,
          type: MESSAGE_TYPE_LABELS.TOKEN_BALANCE,
          data: {}
        },
        state
      );
    });
  };

  // bind event for lapsed pending transaction updation
  bindLapsedTransactionCheckingEvent = async () => {
    ExtensionEventHandle.eventEmitter.on(
      INTERNAL_EVENT_LABELS.LAPSED_TRANSACTION_CHECK,
      async () => {
        await this.services.checkPendingTransaction();
        //false the lapsed transaction check
        InitBackground.isStatusCheckerRunning = false;
      }
    );
  };

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
        if (isEqual(err?.errCode, ERRCODES.ERROR_WHILE_TRANSACTION))
          this.services.messageToUI(MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, {
            message: customMessage || ERROR_MESSAGES.ERROR_WHILE_TRANSACTION,
            real: err?.errMessage
          });

        if (isEqual(err?.errCode, ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE))
          this.services.messageToUI(MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, {
            message: customMessage || ERROR_MESSAGES.ERROR_WHILE_GAS_ESTIMATION,
            real: err?.errMessage
          });

        if (isEqual(err?.errCode, ERRCODES.FAILED_TO_CONNECT_NETWORK))
          this.services.messageToUI(
            MESSAGE_EVENT_LABELS.NETWORK_CONNECTION_ERROR,
            customMessage || ERROR_MESSAGES.ERROR_WHILE_NETWORK_CONNECTION
          );

        if (isEqual(err?.errCode, ERRCODES.INTERNAL))
          this.services.messageToUI(MESSAGE_EVENT_LABELS.BACKGROUND_ERROR, {
            message: customMessage || ERROR_MESSAGES.INTERNAL_ERROR,
            real: err?.errMessage
          });

        if (isEqual(err?.errCode, ERRCODES.INVALID_INPUT)) {
          console.log("invalidInput-ERR_MSG", err);

          this.services.messageToUI(MESSAGE_EVENT_LABELS.INVALID_INPUT, {
            message: "",
            real: err?.errMessage
          });
        }
      } catch (err) {
        log("Error in error event handler: ", err);
      }
    });
  };
}
