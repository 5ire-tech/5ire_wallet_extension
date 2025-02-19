import {
  ERRCODES,
  ERROR_MESSAGES,
  INTERNAL_EVENT_LABELS,
  LABELS,
  NETWORK,
  STATE_CHANGE_ACTIONS,
  STATUS,
  TRANSACTION_STATUS_CHECK_TIMER,
  TX_TYPE,
  WEI_IN_ONE_ETH
} from "../Constants";
import { formatNumUptoSpecificDecimal } from "../Helper/helper";
import { getDataLocal } from "../Storage/loadstore";
import { ErrorPayload } from "../Utility/error_helper";
import { sendMessageToTab } from "../Utility/message_helper";
import { EventPayload, TabMessagePayload, TransactionPayload } from "../Utility/network_calls";
import { hasProperty, isEqual, log } from "../Utility/utility";
import { ExtensionEventHandle } from "./ExtensionEventHandle";
import { Services } from "./Services";
import { TransactionsRPC } from "./TransactionsRPC";
import { txNotificationStringTemplate } from "./utils";

let tester = 0;

/**
 * For handling transaction queue related Task
 */
export class TransactionQueue {
  static instance = null;
  static transactionIntervalId = null;
  static networkTransactionHandler = [];
  static blockSlots = {};

  constructor() {
    this.injectNetworkSlots();
    this.services = new Services();
    this.transactionRpc = new TransactionsRPC();
  }

  //give only access to the single instance of class
  static getInstance = () => {
    if (!TransactionQueue.instance) {
      TransactionQueue.instance = new TransactionQueue();
      delete TransactionQueue.constructor;
    }
    return TransactionQueue.instance;
  };

  //set the block container network slots
  injectNetworkSlots = () => {
    const tempBlockSlots = {};
    Object.values(NETWORK).forEach((item) => (tempBlockSlots[item.toLowerCase()] = 0));
    TransactionQueue.blockSlots = tempBlockSlots;
  };

  //set the transaction interval id
  static setIntervalId = (transactionIntervalId) => {
    TransactionQueue.transactionIntervalId = transactionIntervalId;
  };

  //add new transaction
  addNewTransaction = async (transactionProcessingPayload) => {
    //add the transaction history track
    const { data, options } = transactionProcessingPayload;
    console.log("transactionProcessingPayload : ", transactionProcessingPayload);
    transactionProcessingPayload.transactionHistoryTrack = new TransactionPayload(
      data?.to || options?.to,
      data?.value ? Number(data?.value).toString() : "0",
      options?.isEvm,
      options?.network,
      options?.type,
      null,
      null,
      null,
      null,
      transactionProcessingPayload.type === "tokenTransfer"
        ? transactionProcessingPayload.options.contractDetails
        : null
    );

    //check if there is method inside tx payload (only nominator and validator transactions case)
    transactionProcessingPayload.transactionHistoryTrack.method = options?.method || null;

    //insert transaction history with flag "Queued"
    await this.services.updateLocalState(
      STATE_CHANGE_ACTIONS.TX_HISTORY,
      transactionProcessingPayload.transactionHistoryTrack,
      transactionProcessingPayload.options
    );

    //add the new transaction into queue
    await this.services.updateLocalState(
      STATE_CHANGE_ACTIONS.ADD_NEW_TRANSACTION,
      transactionProcessingPayload,
      {
        localStateKey: LABELS.TRANSACTION_QUEUE,
        network: transactionProcessingPayload.options?.network.toLowerCase()
      }
    );

    //update the current transaction pending balance state
    await this.services.updatePendingTransactionBalance(
      options.network.toLowerCase(),
      options.account.evmAddress,
      isNaN(Number(data?.value))
        ? 0 + Number(options?.fee)
        : Number(data?.value) + Number(options?.fee),
      options?.isEvm,
      true
    );
    //emit the event that new transaction is added into queue
    ExtensionEventHandle.eventEmitter.emit(
      INTERNAL_EVENT_LABELS.NEW_TRANSACTION_INQUEUE,
      options.network.toLowerCase()
    );
  };

  /**
   * Process next queued transaction
   * @param {*} network
   */
  processQueuedTransaction = async (network) => {
    //dequeue next transaction and add it as processing transaction
    await this.services.updateLocalState(
      STATE_CHANGE_ACTIONS.PROCESS_QUEUE_TRANSACTION,
      {},
      { localStateKey: LABELS.TRANSACTION_QUEUE, network }
    );

    //set the current transaction status to pending
    const allQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
    const { currentTransaction } = allQueues[network];
    if (currentTransaction)
      await this.services.updateLocalState(
        STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE,
        currentTransaction.transactionHistoryTrack,
        currentTransaction.options
      );
  };

  /**
   * Perform transaction rpc request
   */
  processTransaction = async (network) => {
    const state = await getDataLocal(LABELS.STATE);
    const allQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
    const { currentTransaction } = allQueues[network];
    console.log("current transaction inside the process transaction: ", currentTransaction);
    try {
      if (hasProperty(this.transactionRpc, currentTransaction?.type)) {
        const rpcResponse = await this.transactionRpc[currentTransaction.type](
          currentTransaction,
          state
        );
        return rpcResponse;
      } else
        new Error(
          new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_RPC_OPERATION)
        ).throw();
    } catch (err) {
      log("error while saving the transaction", err);
      const error = new ErrorPayload(ERRCODES.INTERNAL, err.message);
      return new EventPayload(
        null,
        null,
        { data: currentTransaction?.transactionHistoryTrack },
        error
      );
    }
  };

  /**
   * Parse the response after processing the transaction
   * @param {*} network
   */
  parseTransactionResponse = async (network) => {
    //perform the current active transactions
    tester++;
    const transactionResponse = await this.processTransaction(network);

    const txHash = transactionResponse.payload?.data?.txHash;

    //check if there is error payload into response
    if (!transactionResponse.error) {
      //if transaction is external then send the response to spefic tab
      if (transactionResponse.payload.options?.externalTransaction && txHash) {
        const {
          payload: {
            options: { type }
          }
        } = transactionResponse;
        const { externalTransaction } = transactionResponse.payload.options;
        const externalResponse = {
          method: externalTransaction.method,
          result: isEqual(type, TX_TYPE.NATIVE_APP) ? { txHash } : txHash
        };
        sendMessageToTab(
          externalTransaction?.tabId,
          new TabMessagePayload(externalTransaction.id, externalResponse)
        );
      }

      await this._updateQueueAndHistory(transactionResponse, network);
    } else {
      //check if txhash is found in payload then update transaction into queue and history
      if (txHash) this._updateQueueAndHistory(transactionResponse, network);
      else {
        transactionResponse?.payload &&
          (await this.services.updateLocalState(
            STATE_CHANGE_ACTIONS.SAVE_ERRORED_FAILED_TRANSACTION,
            { id: transactionResponse.payload.data?.id },
            transactionResponse.payload?.options
          ));

        //set the current errored transaction in queue as null
        await this.services.updateLocalState(
          STATE_CHANGE_ACTIONS.REMOVE_FAILED_TX,
          {},
          { localStateKey: LABELS.TRANSACTION_QUEUE, network }
        );

        //if transaction is external send the error response back to requester tab
        if (transactionResponse.payload.options?.externalTransaction) {
          const { externalTransaction } = transactionResponse.payload.options;
          const errorMessageForTab =
            transactionResponse.error?.errMessage?.data || ERROR_MESSAGES.ERROR_WHILE_TRANSACTION;
          sendMessageToTab(
            externalTransaction?.tabId,
            new TabMessagePayload(
              externalTransaction.id,
              { result: null },
              externalTransaction.method,
              null,
              errorMessageForTab
            )
          );
        }

        ExtensionEventHandle.eventEmitter.emit(
          INTERNAL_EVENT_LABELS.ERROR,
          transactionResponse.error
        );
      }
    }
  };

  /**
   * Set timer for updating the transaction status
   * @param {*} network
   * @returns
   */
  checkTransactionStatus = async (network) => {
    try {
      //check if current transaction is there or not
      const allQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
      const transactionQueue = allQueues[network];

      const hasPendingTx = transactionQueue.txQueue.length;

      //if the current transaction is null then it is failed and removed
      if (!transactionQueue.currentTransaction?.transactionHistoryTrack) {
        const { options, data } = transactionQueue.currentTransaction;
        //update the current transaction pending balance state
        await this.services.updatePendingTransactionBalance(
          network,
          options.account.evmAddress,
          isNaN(Number(data?.value))
            ? 0 + Number(options?.fee)
            : Number(data?.value) + Number(options?.fee),
          options.isEvm
        );

        //check if there any pending transaction into queue
        if (!isEqual(hasPendingTx, 0)) {
          await this.processQueuedTransaction(network);
          await this.parseTransactionResponse(network);
          TransactionQueue.setIntervalId(
            this._setTimeout(this.checkTransactionStatus.bind(null, network))
          );
        } else {
          await this.processQueuedTransaction(network);
          TransactionQueue.networkTransactionHandler =
            TransactionQueue.networkTransactionHandler.filter((item) => item !== network);
          //reset the timeout id as null so whenever new transaction made the timeout start again
          TransactionQueue.setIntervalId(null);
        }

        return;
      }

      const { currentTransaction } = transactionQueue;
      const transactionHistoryTrack = {
        ...currentTransaction.transactionHistoryTrack
      };

      //check if transaction status is pending then only check the status
      if (
        currentTransaction &&
        isEqual(currentTransaction.transactionHistoryTrack.status, STATUS.PENDING) &&
        currentTransaction.transactionHistoryTrack?.txHash
      ) {
        const {
          transactionHistoryTrack: { txHash, isEvm, chain }
        } = currentTransaction;
        const transactionStatus = await this.services.getTransactionStatus(txHash, isEvm, chain);

        //if transaction status is found ether Failed or Success
        if (transactionStatus?.status) {
          //update the transaction after getting the confirmation
          transactionHistoryTrack.status = transactionStatus.status;

          //check the transaction type and save the to recipent according to type
          if (isEqual(transactionHistoryTrack?.type, TX_TYPE.NATIVE_APP))
            transactionHistoryTrack.to = transactionStatus?.sectionmethod;
          else
            transactionHistoryTrack.to = transactionHistoryTrack.intermidateHash
              ? transactionHistoryTrack.to
              : transactionHistoryTrack.isEvm
              ? transactionStatus.to || transactionStatus.contractAddress
              : transactionHistoryTrack.to;

          //set the used gas
          transactionHistoryTrack.gasUsed = transactionHistoryTrack.isEvm
            ? (
                (Number(transactionStatus?.gasUsed) *
                  Number(transactionStatus?.effectiveGasPrice)) /
                WEI_IN_ONE_ETH
              ).toString()
            : transactionStatus?.txFee;

          //set the amount when the method is reward
          if (isEqual(transactionStatus?.sectionmethod, LABELS.STACKING_REWARD)) {
            transactionHistoryTrack.amount = formatNumUptoSpecificDecimal(
              Number(Number(transactionStatus?.value).noExponents()) / 10 ** 18,
              6
            );
          }

          //update the transaction status and other details after confirmation
          await this.services.updateLocalState(
            STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE,
            transactionHistoryTrack,
            currentTransaction?.options
          );

          //update the balance after transaction confirmation
          ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH);

          //show notification of transaction status
          this.services.showNotification(
            txNotificationStringTemplate(transactionStatus.status, txHash)
          );

          //update the pending transaction balance
          await this.services.updatePendingTransactionBalance(
            network,
            currentTransaction.options?.account.evmAddress,
            isNaN(Number(currentTransaction.data?.value))
              ? 0 + Number(currentTransaction.options.fee)
              : Number(currentTransaction.data?.value) + Number(currentTransaction.options.fee),
            currentTransaction.options.isEvm
          );

          /***********************************Test */
          console.log("length of pending in upper: ", hasPendingTx);
          console.log("here is tx count: ", tester);
          const tempTxQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
          const tempQueue = tempTxQueues[network];
          const tempTxQueueLenght = tempQueue.txQueue.length;

          console.log("here is queue tx: ", tempTxQueueLenght);

          //check if there any pending transaction into queue
          if (!isEqual(tempTxQueueLenght, 0)) {
            //dequeue the new transaction and set as active for processing
            await this.processQueuedTransaction(network);
            await this.parseTransactionResponse(network);
            TransactionQueue.setIntervalId(
              this._setTimeout(this.checkTransactionStatus.bind(null, network))
            );
          } else {
            //dequeue the new transaction and set as active for processing
            await this.processQueuedTransaction(network);
            TransactionQueue.networkTransactionHandler =
              TransactionQueue.networkTransactionHandler.filter((item) => item !== network);
            //reset the timeout id as null so whenever new transaction made the timeout start again
            TransactionQueue.setIntervalId(null);
          }
        }
        //if transaction is still in pending state
        else {
          TransactionQueue.setIntervalId(
            this._setTimeout(this.checkTransactionStatus.bind(null, network))
          );
        }
      } else {
        log("transaction not processed: ", currentTransaction);
      }
    } catch (err) {
      log("error while transaction processing: ", err);
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(
          ERRCODES.ERROR_WHILE_TRANSACTION_STATUS_CHECK,
          ERROR_MESSAGES.ERROR_WHILE_TRANSACTION_STATUS_CHECK
        )
      );

      const tempTxQueues = await getDataLocal(LABELS.TRANSACTION_QUEUE);
      const tempQueue = tempTxQueues[network];
      const tempTxQueueLenght = tempQueue.txQueue.length;

      //check if there any pending transaction into queue
      if (!isEqual(tempTxQueueLenght, 0)) {
        //dequeue the new transaction and set as active for processing
        await this.processQueuedTransaction(network);
        await this.parseTransactionResponse(network);
        TransactionQueue.setIntervalId(
          this._setTimeout(this.checkTransactionStatus.bind(null, network))
        );
      } else {
        //dequeue the new transaction and set as active for processing
        await this.processQueuedTransaction(network);
        TransactionQueue.networkTransactionHandler =
          TransactionQueue.networkTransactionHandler.filter((item) => item !== network);
        //reset the timeout id as null so whenever new transaction made the timeout start again
        TransactionQueue.setIntervalId(null);
      }

      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(
          ERRCODES.ERROR_WHILE_TRANSACTION_STATUS_CHECK,
          ERROR_MESSAGES.ERROR_WHILE_TRANSACTION_STATUS_CHECK
        )
      );
    }
  };

  /******************************* Event Callbacks *************************/
  /**
   * callback for new transaction inserted into queue event
   * @param {*} network
   */
  newTransactionAddedEventCallback = async (network) => {
    // isNullorUndef(TransactionQueue.transactionIntervalId)
    if (!TransactionQueue.networkTransactionHandler.includes(network)) {
      TransactionQueue.networkTransactionHandler.push(network);
      await this.processQueuedTransaction(network);
      await this.parseTransactionResponse(network);

      TransactionQueue.setIntervalId(
        this._setTimeout(this.checkTransactionStatus.bind(null, network))
      );
    }
  };

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
  };

  //update the transaction queue and history
  _updateQueueAndHistory = async (transactionResponse, network) => {
    await this.services.updateLocalState(
      STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE,
      transactionResponse.payload.data,
      transactionResponse.payload?.options
    );

    //update the transaction into active transaction session
    await this.services.updateLocalState(
      STATE_CHANGE_ACTIONS.UPDATE_HISTORY_TRACK,
      transactionResponse.payload.data,
      { localStateKey: LABELS.TRANSACTION_QUEUE, network }
    );
  };
}
