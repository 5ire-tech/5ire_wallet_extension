import { LABELS, MESSAGE_EVENT_LABELS } from "../Constants";
import { getDataLocal } from "../Storage/loadstore";
import { sendMessageToTab } from "../Utility/message_helper";
import { TabMessagePayload, TransactionProcessingPayload } from "../Utility/network_calls";
import { hasProperty, isEqual } from "../Utility/utility";
import { ExternalWindowControl } from "./controller";
import { NativeSigner } from "./NativeSigner";
import { TransactionQueue } from "./TransactionQueue";
import { getFormattedMethod } from "./utils";

/**
 * For non rpc tasks
 */
export class ExternalTxTasks {
  constructor() {
    this.transactionQueueHandler = TransactionQueue.getInstance();
    this.nativeSignerhandler = new NativeSigner();
  }

  //process and check external task (connection, tx approval)
  processExternalTask = async (message, state) => {
    if (isEqual(message.event, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION))
      await this.closePopupSession(message, state);
    else if (isEqual(MESSAGE_EVENT_LABELS.EVM_TX, message.event))
      await this.externalEvmTransaction(message, state);
    else if (isEqual(MESSAGE_EVENT_LABELS.NATIVE_SIGNER, message.event))
      await this.nativeSigner(message, state);
    else if (isEqual(MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_TRANSACTION, message.event))
      await this.validatorNominatorTransaction(message, state);
  };

  //handle the evm external transaction
  externalEvmTransaction = async (message) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //process the external evm transactions
    const externalTransactionProcessingPayload = new TransactionProcessingPayload(
      {
        ...activeSession.message,
        options: {
          ...message?.data.options,
          externalTransaction: { ...activeSession }
        }
      },
      message.event,
      null,
      activeSession.message?.data,
      { ...message?.data.options, externalTransaction: { ...activeSession } }
    );

    await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
  };

  //handle the nominator and validator transaction
  nativeSigner = async (message, state) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

    //check if the requested method is supported by the handler
    if (hasProperty(this.nativeSignerhandler, activeSession?.method)) {
      if (message.data?.approve) {
        const signerRes = await this.nativeSignerhandler[activeSession.method](
          activeSession.message,
          state
        );
        if (!signerRes.error) {
          sendMessageToTab(
            activeSession.tabId,
            new TabMessagePayload(activeSession.id, {
              result: signerRes.payload.data
            })
          );

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
        } else if (signerRes.error)
          sendMessageToTab(
            activeSession.tabId,
            new TabMessagePayload(
              activeSession.id,
              { result: null },
              null,
              null,
              signerRes.error.errMessage
            )
          );
      }
    }

    //close the popup
    await this.closePopupSession(message);
  };

  //handle the nominator and validator transaction
  // eslint-disable-next-line no-unused-vars
  validatorNominatorTransaction = async (message, state) => {
    if (message.data?.approve) {
      const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);

      //get the method and amount
      const methodDetails = getFormattedMethod(activeSession?.method, activeSession?.message);

      //process the external evm transactions
      const externalTransactionProcessingPayload = new TransactionProcessingPayload(
        {
          ...activeSession.message,
          value: methodDetails?.amount,
          options: {
            ...message?.data.options,
            externalTransaction: { ...activeSession }
          }
        },
        message.event,
        null,
        activeSession.message?.data,
        {
          ...message?.data.options,
          externalTransaction: { ...activeSession },
          method: methodDetails?.methodName
        }
      );

      await this.transactionQueueHandler.addNewTransaction(externalTransactionProcessingPayload);
    }

    //close the popup
    await this.closePopupSession(message);
  };

  //close the current popup session
  closePopupSession = async (message) => {
    ExternalWindowControl.isApproved = message.data?.approve;
    const externalWindowControl = ExternalWindowControl.getInstance();
    await externalWindowControl.closeActiveSessionPopup();
  };
}
