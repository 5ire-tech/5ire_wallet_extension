import { ERRCODES, ERROR_MESSAGES, INTERNAL_EVENT_LABELS, MESSAGE_TYPE_LABELS } from "../Constants";
import { ErrorPayload } from "../Utility/error_helper";
import { TransactionProcessingPayload } from "../Utility/network_calls";
import { hasProperty, isEqual } from "../Utility/utility";
import { ExtensionEventHandle } from "./ExtensionEventHandle";
import { GeneralWalletRPC } from "./GeneralWalletRPC";
import { Services } from "./Services";
import { TransactionQueue } from "./TransactionQueue";

/**
 * Process the transactions
 */
export class RpcRequestProcessor {
  static instance = null;
  static isHttp = true;

  constructor() {
    this.transactionQueue = TransactionQueue.getInstance();
    this.generalWalletRpc = new GeneralWalletRPC();
    this.services = new Services();
    ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
  }

  //access only single instance
  static getInstance = () => {
    if (!RpcRequestProcessor.instance) {
      RpcRequestProcessor.instance = new RpcRequestProcessor();
      delete RpcRequestProcessor.constructor;
    }
    return RpcRequestProcessor.instance;
  };

  //rpc calls middleware
  rpcCallsMiddleware = async (message, state) => {
    let rpcResponse = null;
    try {
      if (
        isEqual(message.type, MESSAGE_TYPE_LABELS.FEE_AND_BALANCE) ||
        isEqual(message.type, MESSAGE_TYPE_LABELS.TOKEN_BALANCE)
      ) {
        if (hasProperty(this.generalWalletRpc, message.event)) {
          rpcResponse = await this.generalWalletRpc[message.event](message, state);
          this.parseGeneralRpc(rpcResponse);
        } else
          new Error(
            new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)
          ).throw();
      } else if (isEqual(message.type, MESSAGE_TYPE_LABELS.INTERNAL_TX)) {
        this.processTransactionRequest(message);
      }
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.INTERNAL, err.message)
      );
    }
  };

  //parse and send the message related to fee and balance
  parseGeneralRpc = async (rpcResponse) => {
    if (!rpcResponse?.error) {
      //change the state in local storage
      if (rpcResponse?.stateChangeKey)
        await this.services.updateLocalState(
          rpcResponse.stateChangeKey,
          rpcResponse.payload.data,
          rpcResponse.payload?.options
        );
      //send the response message to extension ui
      if (rpcResponse?.eventEmit) {
        this.services.messageToUI(rpcResponse.eventEmit, rpcResponse.payload.data);
      }
    } else {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, rpcResponse.error);
    }
  };

  //parse the transaction related rpc response
  processTransactionRequest = async (transactionRequest) => {
    try {
      //create a transaction payload
      const { data } = transactionRequest;
      const transactionProcessingPayload = new TransactionProcessingPayload(
        data,
        transactionRequest.event,
        null,
        data?.data,
        { ...data?.options }
      );

      //send the transaction into tx queue
      await this.transactionQueue.addNewTransaction(transactionProcessingPayload);
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.INTERNAL, err.message)
      );
    }
  };
}
