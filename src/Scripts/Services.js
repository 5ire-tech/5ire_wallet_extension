import {
  API,
  ERRCODES,
  EVM_JSON_RPC_METHODS,
  HTTP_END_POINTS,
  HTTP_METHODS,
  INTERNAL_EVENT_LABELS,
  LABELS,
  MESSAGE_TYPE_LABELS,
  STATE_CHANGE_ACTIONS,
  STATUS,
  TX_TYPE,
  WEI_IN_ONE_ETH
} from "../Constants";
import { Connection } from "../Helper/connection.helper";
import { ExtensionStorageHandler, getDataLocal } from "../Storage/loadstore";
import { ErrorPayload } from "../Utility/error_helper";
import { sendRuntimeMessage } from "../Utility/message_helper";
import { EVMRPCPayload, httpRequest } from "../Utility/network_calls";
import { hasLength, isEqual, isNullorUndef, isString, log } from "../Utility/utility";
import { ExtensionEventHandle } from "./ExtensionEventHandle";
import { InitBackground } from "./initbackground";
import { NetworkHandler } from "./NetworkHandler";
import { NotificationAndBedgeManager } from "./platform";
import { TransactionQueue } from "./TransactionQueue";

/**
 * For extension common service work
 */
export class Services {
  constructor() {
    this.notificationAndBedgeManager = NotificationAndBedgeManager.getInstance();
  }

  /*************************** Service Helpers ********************************/

  //get the transaction details from chain side
  getBlockInsideDetails = async (network, txHash) => {
    try {
      log("here is the network: ", network);

      //return if the node connection is null
      if (!NetworkHandler.api[network]?.nativeApi) return null;

      const { nativeApi } = NetworkHandler.api[network];
      const blockNumber = TransactionQueue.blockSlots[network];

      if (blockNumber === 0) return null;

      const blockHash = await nativeApi.rpc.chain.getBlockHash(blockNumber);
      const signedBlock = await nativeApi.rpc.chain.getBlock(blockHash);

      const allRecords = await nativeApi.query.system.events.at(signedBlock.block.header.hash);
      const date = new Date();
      const transactionObj = {};

      //index handler and filtered event records
      let index = 0;

      const filter = (index) => {
        return allRecords.filter(
          (e) => e.phase.isApplyExtrinsic && e.phase.asApplyExtrinsic.eq(index)
        );
      };

      //traverse the block extrinsics
      for (const extrinsics of signedBlock.block.extrinsics) {
        const {
          method: { method, section }
        } = extrinsics;
        // let eraIndex = null;

        const filteredExt = filter(index);

        //traverse the event records
        for (const storageEvents of filteredExt) {
          const { event } = storageEvents;

          log("here is main: ", event.toHuman(), "extrinscs: ", method, section);
          let transactionData;

          if (event.method.toLowerCase() === "extrinsicfailed") {
            const [dispatchError] = event.data;
            let errorInfo;

            if (dispatchError.isModule) {
              const decoded = NetworkHandler.api[network].nativeApi.registry.findMetaError(
                dispatchError.asModule
              );
              errorInfo = `${decoded.section}.${decoded.name}`;
            } else {
              errorInfo = dispatchError.toString();
            }

            const data = JSON.parse(signedBlock.block.extrinsics[index].toString());
            const hash = signedBlock.block.extrinsics[index].hash.toString();
            const txFee = transactionObj[hash]?.txFee ? transactionObj[hash].txFee : 0;
            const from = data?.signature?.signer?.id.toString();
            const to = data?.method?.args?.dest?.id.toString();
            const value = Number(data?.method?.args?.value).toString();

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
            const hash = signedBlock.block.extrinsics[index].hash.toString();
            const data = JSON.parse(signedBlock.block.extrinsics[index].toString());

            const from = data?.signature?.signer?.id.toString();
            const to = data?.method?.args?.dest?.id.toString();
            const value = Number(data?.method?.args?.value).toString();
            transactionObj[hash] =
              transactionObj[hash]?.sectionmethod !== "staking.Bonded" ? {} : transactionObj[hash];
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
              let txFee = transactionObj[signedBlock.block.extrinsics[index].hash.toString()]?.txFee
                ? transactionObj[signedBlock.block.extrinsics[index].hash.toString()]?.txFee
                : 0;

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
            } else if (
              (event.method.toLowerCase() === "bonded" && event.section === "staking") ||
              (event.method.toLowerCase() === "unbonded" && event.section === "staking") ||
              (event.method.toLowerCase() === "chilled" && event.section === "staking") ||
              (event.method.toLowerCase() === "validatorprefsset" && event.section === "staking") ||
              (event.method.toLowerCase() === "nominatorprefsset" && event.section === "staking") ||
              (event.method.toLowerCase() === "withdrawn" && event.section === "staking")
            ) {
              const hash = signedBlock.block.extrinsics[index].hash.toString();
              let txFee = transactionObj[hash].txFee ? transactionObj[hash].txFee : 0;

              if (
                (event.method.toLowerCase() === "validatorprefsset" &&
                  event.section === "staking") ||
                (event.method.toLowerCase() === "nominatorprefsset" && event.section === "staking")
              ) {
                if (transactionObj[hash]?.sectionmethod !== "staking.Bonded") {
                  transactionData = {
                    from_address: event.data[0].toString(),
                    to_address: "N/A",
                    value: "0",
                    txhash: hash,
                    reason: event.method.toLowerCase(),
                    sectionmethod:
                      event.method.toLowerCase() === "validatorprefsset"
                        ? "staking.revalidated"
                        : "staking.renominated",
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

              transactionObj[hash] =
                transactionData === undefined ? transactionObj[hash] : transactionData;
            }
            // else if (
            //   event.section === "staking" &&
            //   event.method.toLowerCase() === "payoutstarted"
            // ) {
            //   eraIndex = `${event.data[0]}`;
            // }
            else if (event.section === "staking" && event.method.toLowerCase() === "rewarded") {
              const data = JSON.parse(signedBlock.block.extrinsics[index].toString());
              const hash = signedBlock.block.extrinsics[index].hash.toString();
              let txFee = transactionObj[hash]?.txFee ? transactionObj[hash].txFee : 0;

              transactionData = {
                from_address: data?.signature?.signer?.id.toString(),
                to_address: "N/A",
                value: transactionObj[hash]?.value
                  ? (Number(transactionObj[hash].value) + Number(event.data[1])).toString()
                  : 0 + Number(event.data[1]),
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
              log("it can't run man");
            }
          }
        }

        index++;
        TransactionQueue.blockSlots[network] = blockNumber + 1;
      }

      log("transaction object: ", transactionObj);
      return transactionObj[txHash];
    } catch (err) {
      console.log("Error while getting transaction details: ", err);
      return null;
    }
  };

  //find the native and evm transaction status
  getTransactionStatus = async (txHash, isEvm, network) => {
    //get the url of current network for evm rpc call or native explorer search
    const rpcUrl = isEvm ? HTTP_END_POINTS[network.toUpperCase()] : API[network.toUpperCase()];

    //check if the transaction is still pending or not
    let res = null,
      txRecipt = null;
    if (isEvm) {
      res = await httpRequest(
        rpcUrl,
        HTTP_METHODS.POST,
        JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [txHash]))
      );
      txRecipt = res?.result;

      //parse the hex string into decimal
      if (!isNullorUndef(txRecipt?.status))
        txRecipt.status = parseInt(txRecipt.status) ? STATUS.SUCCESS : STATUS.FAILED;
    } else {
      res = await this.getBlockInsideDetails(network.toLowerCase(), txHash);
      txRecipt = res;
      log("here is the txHash: ", txRecipt);

      //check the transaction on explorer api if not found in current block
      if (!txRecipt) {
        log("api called for searching the tx: ", txHash);
        res = await httpRequest(rpcUrl + txHash, HTTP_METHODS.GET);
        txRecipt = res?.data?.transaction;
      }

      if (!isNullorUndef(txRecipt?.status)) {
        if (isEqual(txRecipt.status.toLowerCase(), STATUS.SUCCESS.toLowerCase()))
          txRecipt.status = STATUS.SUCCESS;
        if (isEqual(txRecipt.status.toLowerCase(), STATUS.FAILED.toLowerCase()))
          txRecipt.status = STATUS.FAILED;
      }
    }

    //transform the evm status to success or fail
    if (
      isNullorUndef(txRecipt?.status) &&
      isString(txRecipt?.status) &&
      isEqual(txRecipt?.status, STATUS.PENDING.toLowerCase())
    )
      txRecipt = null;

    return txRecipt;
  };

  //assign the latest block to blockSlots
  getCurrentBlockNumber = async (network) => {
    try {
      const { nativeApi } = NetworkHandler.api[network];
      const blockHeader = await nativeApi.rpc.chain.getHeader();
      TransactionQueue.blockSlots[network] = Number(blockHeader?.number) || 0;
      log("blockheader: ", TransactionQueue.blockSlots[network]);
    } catch (err) {
      log("error while saving the latest block: ", err);
    }
  };

  //create rpc handler
  createConnection = async (currentNetwork) => {
    const connector = Connection.getInsatnce();
    const apiConn = await connector.initializeApi(currentNetwork);

    // const ed = apiConn.nativeApi.consts.balances.existentialDeposit.toString();
    // this.messageToUI(MESSAGE_EVENT_LABELS.GET_ED, { ed });
    //check if there is error property connection payload
    if (apiConn?.error) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.FAILED_TO_CONNECT_NETWORK, apiConn?.error.message)
      );
      return { error: apiConn?.error };
    }

    return apiConn;
  };

  //pass message to extension ui
  messageToUI = async (event, message) => {
    try {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND, event, message);
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.INTERNAL, err.message)
      );
    }
  };

  //update the local storage data
  updateLocalState = async (key, data, options = {}) => {
    const res = await ExtensionStorageHandler.updateStorage(key, data, options);
    if (res) ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.ERROR, res);
  };

  //update the pending transaction balance
  updatePendingTransactionBalance = async (network, address, value, isEvm, isInc = false) => {
    const transactionBalance = { evm: 0, native: 0 };
    const state = await getDataLocal(LABELS.STATE);
    const accountBalance = state.pendingTransactionBalance[address][network];

    if (isInc) {
      if (isEvm) transactionBalance.evm = accountBalance.evm + value;
      else transactionBalance.native = accountBalance.native + value;
    } else {
      if (isEvm) transactionBalance.evm = accountBalance.evm - value;
      else transactionBalance.native = accountBalance.native - value;
    }

    // log(`Here is the Balance: evm: ${transactionBalance.evm} native: ${transactionBalance.native} for acc ${address} and network ${network} or chain is evm (true/false): ${isEvm}`);

    await this.updateLocalState(
      STATE_CHANGE_ACTIONS.UPDATE_PENDING_TRANSACTION_BALANCE,
      transactionBalance,
      { network, address }
    );
  };

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
      const pendingHistoryItem = localDataState.txHistory[account.evmAddress]?.filter(
        (historyItem) => historyItem.status === STATUS.PENDING
      );

      if (!pendingHistoryItem?.length) return;

      //check the transaction status and update the status inside local storage
      for (const hItem of pendingHistoryItem) {
        if (hItem?.txHash) {
          const { txHash, isEvm, chain } = hItem;
          const transactionStatus = await this.getTransactionStatus(txHash, isEvm, chain);

          if (transactionStatus?.status) {
            //update the transaction after getting the confirmation
            hItem.status = transactionStatus.status;

            //set the used gas
            hItem.gasUsed = hItem.isEvm
              ? (
                  (Number(transactionStatus?.gasUsed) *
                    Number(transactionStatus?.effectiveGasPrice)) /
                  WEI_IN_ONE_ETH
                ).toString()
              : transactionStatus?.txFee;

            //check the transaction type and save the to recipent according to type
            if (isEqual(hItem?.type, TX_TYPE.NATIVE_APP))
              hItem.to = transactionStatus?.sectionmethod;
            else
              hItem.to = hItem.intermidateHash
                ? hItem.to
                : hItem.isEvm
                ? transactionStatus.to || transactionStatus.contractAddress
                : hItem.to;

            await this.updateLocalState(STATE_CHANGE_ACTIONS.TX_HISTORY_UPDATE, hItem, { account });
          }
        }
      }
    } catch (err) {
      log("error while checking the lapsed pending transactions: ", err);
    }
  };

  /*************************** Service Internals ******************************/
  //show browser notification from extension
  showNotification = (message) => {
    if (hasLength(message)) this.notificationAndBedgeManager.showNotification(message);
  };
}
