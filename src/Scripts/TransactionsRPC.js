import BigNumber from "bignumber.js";
import {
  CHAIN_ID,
  DECIMALS,
  ERRCODES,
  ERROR_EVENTS_LABELS,
  ERROR_MESSAGES,
  STATE_CHANGE_ACTIONS,
  STATUS
} from "../Constants";
import { ErrorPayload } from "../Utility/error_helper";
import { isNullorUndef, log } from "../Utility/utility";
import { HybridKeyring } from "./5ire-keyring";
import ValidatorNominatorHandler from "./nativehelper";
import { NetworkHandler } from "./NetworkHandler";
import { Services } from "./Services";
import Web3 from "web3";
import { EventPayload } from "../Utility/network_calls";
import { ERC20_ABI } from "../Constants/erc20.abi";
import { u8aToHex } from "@polkadot/util";
import { RpcRequestProcessor } from "./RpcRequestProcessor";

/**
 * For transaction realted calls
 */
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
    let transactionHistory = { ...message?.transactionHistoryTrack },
      payload = null;

    try {
      const { data, transactionHistoryTrack, contractBytecode } = message;
      const {
        options: { account, fee }
      } = data;
      const network =
        transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();

      const chainId = CHAIN_ID[state.currentNetwork.toUpperCase()];
      // console.log("chainId: ", chainId);
      const { evmApi } = NetworkHandler.api[network];
      const balance = state.allAccountsBalance[account?.evmAddress][network];

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      // transactionHistory.status = STATUS.PENDING

      const tempAmount = data?.options?.isBig
        ? new BigNumber(data.value).dividedBy(DECIMALS).toString()
        : data.value;
      const balanceWithFee = Number(tempAmount) + Number(fee);

      if (
        balanceWithFee >
        Number(balance?.transferableBalance) -
          (state.pendingTransactionBalance[account.evmAddress][network].evm - balanceWithFee)
      )
        new Error(
          new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)
        ).throw();
      else {
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        const to = Web3.utils.toChecksumAddress(data.to);
        const value = data?.options?.isBig ? data.value : Number(amt).noExponents().toString();

        const nonce = await evmApi.eth.getTransactionCount(
          account.evmAddress,
          STATUS.PENDING.toLowerCase()
        );

        const feeRes = await this._getEvmFee(
          to,
          account.evmAddress,
          value,
          state,
          contractBytecode
        );

        const transactions = {
          to,
          gas: 21000,
          data: contractBytecode ? contractBytecode : "0x",
          value: "0x" + Number(value).toString(16),
          nonce: "0x" + Number(nonce).toString(16),
          gasLimit: "0x" + Number(feeRes.gasLimit).toString(16),
          gasPrice: "0x" + Number(feeRes.gasPrice).toString(16)
        };

        const signedTx = await this.hybridKeyring.signEthTx(
          account.evmAddress,
          transactions,
          chainId
        );

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

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
        } else
          new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      console.log("Error  while transfer: ", err);
      payload = {
        data: null,
        options: {
          ...message.data.options
        }
      };

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
        return new EventPayload(
          null,
          ERROR_EVENTS_LABELS.NETWORK_ERROR,
          payload,
          new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message)
        );
      }
    }
  };

  /**
   * Transfer token
   * @param {*} message
   * @param {*} state
   */
  tokenTransfer = async (message, state) => {
    try {
      const {
        data,
        transactionHistoryTrack
        //  contractBytecode
      } = message;
      let transactionHistory = { ...message?.transactionHistoryTrack };

      const network =
        transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const {
        options: { account }
      } = data;

      const { evmApi } = NetworkHandler.api[network];

      const chainId = CHAIN_ID[state.currentNetwork.toUpperCase()];

      const amt = new BigNumber(data?.value)
        .multipliedBy(10 ** Number(data?.options?.contractDetails?.decimals ?? 0))
        .toString();

      const to = Web3.utils.toChecksumAddress(data.to);

      const nonce = await evmApi.eth.getTransactionCount(
        account.evmAddress,
        STATUS.PENDING.toLowerCase()
      );

      const contract = new evmApi.eth.Contract(ERC20_ABI, data?.options?.contractDetails?.address);

      const tokenData = contract.methods.transfer(to, Number(amt).noExponents()).encodeABI();

      const feeRes = await this._getEvmFee(
        data?.options?.contractDetails?.address,
        account.evmAddress,
        0,
        state,
        tokenData
      );

      // Create the transaction object
      const tx = {
        to: data?.options?.contractDetails?.address,
        nonce: nonce,
        gas: 21000,
        // gas: +gasEstimate,
        value: 0,
        gasLimit: "0x" + Number(feeRes.gasLimit).toString(16),
        gasPrice: "0x" + Number(feeRes.gasPrice).toString(16),
        data: tokenData
      };

      // Sign the transaction
      const signedTx = await this.hybridKeyring.signEthTx(account.evmAddress, tx, chainId);

      //Sign And Send Transaction
      const txInfo = await evmApi.eth.sendSignedTransaction(signedTx);
      const hash = txInfo.transactionHash;

      if (hash) {
        transactionHistory.txHash = hash;

        //return the payload
        const payload = {
          data: transactionHistory,
          options: {
            ...data.options
          }
        };

        return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
      } else {
        new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
      return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, null);
    } catch (error) {
      console.log("error while performing token transfer : ", error);
      return new EventPayload(
        null,
        ERROR_EVENTS_LABELS.NETWORK_ERROR,
        null,
        new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, error?.message)
      );
    }
  };

  //evm to native swap
  evmToNativeSwap = async (message, state) => {
    //history reference object
    let transactionHistory = { ...message?.transactionHistoryTrack },
      payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const {
        options: { account, fee }
      } = data;
      const network =
        transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const { evmApi, nativeApi } = NetworkHandler.api[network];
      const balance = state.allAccountsBalance[account?.evmAddress][network];

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      // transactionHistory.status = STATUS.PENDING;

      const balanceWithFee = Number(data.value) + Number(fee);

      if (
        balanceWithFee >=
        Number(balance?.evmBalance) -
          (state.pendingTransactionBalance[account.evmAddress][network].evm - balanceWithFee)
      )
        new Error(
          new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)
        ).throw();
      else {
        const alice = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
        const to = u8aToHex(alice.publicKey).slice(0, 42);
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
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
            options: { ...data.options }
          };

          return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, null, payload);
        } else
          new Error(new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)).throw();
      }
    } catch (err) {
      log("error while evm to native swap: ", err);
      transactionHistory.status = transactionHistory.txHash ? STATUS.PENDING : STATUS.FAILED;

      payload = {
        data: transactionHistory,
        options: { ...message.data.options }
      };
      return new EventPayload(
        null,
        ERROR_EVENTS_LABELS.NETWORK_ERROR,
        payload,
        new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message)
      );
    }
  };

  //********************************** Native ***************************************/
  //native transfer
  nativeTransfer = async (message, state) => {
    let transactionHistory = { ...message?.transactionHistoryTrack },
      payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const {
        options: { account, fee },
        isEd
      } = data;
      const network =
        transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const { nativeApi } = NetworkHandler.api[network];
      const balance = state.allAccountsBalance[account?.evmAddress][network];

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      const balanceWithFee = Number(data.value) + Number(fee);

      if (
        balanceWithFee >=
        Number(balance?.nativeBalance) -
          (state.pendingTransactionBalance[account.evmAddress][network].native - balanceWithFee)
      )
        new Error(
          new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)
        ).throw();
      else {
        //set the status to pending
        // transactionHistory.status = STATUS.PENDING;

        let err;
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
        let transfer;

        if (isEd)
          transfer = nativeApi.tx.balances.transferKeepAlive(
            data.to,
            Number(amt).noExponents().toString()
          );
        else
          transfer = nativeApi.tx.balances.transfer(data.to, Number(amt).noExponents().toString());

        //save the current block number
        await this.services.getCurrentBlockNumber(network);

        if (RpcRequestProcessor.isHttp) {
          const txHash = await transfer.signAndSend(signer);
          if (txHash) {
            const hash = txHash.toHex();
            transactionHistory.txHash = hash;

            payload = {
              data: transactionHistory,
              options: {
                ...data.options
              }
            };

            return new EventPayload(STATE_CHANGE_ACTIONS.TX_HISTORY, message.event, payload);
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

              if (err)
                new Error(
                  new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)
                ).throw();
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
      };

      return new EventPayload(
        null,
        ERROR_EVENTS_LABELS.NETWORK_ERROR,
        payload,
        new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message)
      );
    }
  };

  //native to evm swap
  nativeToEvmSwap = async (message, state) => {
    let transactionHistory = { ...message?.transactionHistoryTrack },
      payload = null;

    try {
      const { data, transactionHistoryTrack } = message;
      const {
        options: { account, fee }
      } = data;
      const network =
        transactionHistoryTrack.chain?.toLowerCase() || state.currentNetwork.toLowerCase();
      const { nativeApi } = NetworkHandler.api[network];
      const balance = state.allAccountsBalance[account.evmAddress][network];

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      const balanceWithFee = Number(data.value) + Number(fee);

      if (
        balanceWithFee >=
        Number(balance?.nativeBalance) -
          (state.pendingTransactionBalance[account.evmAddress][network].native - balanceWithFee)
      )
        new Error(
          new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, ERROR_MESSAGES.INSUFFICENT_BALANCE)
        ).throw();
      else {
        // transactionHistory.status = STATUS.PENDING;
        let err, evmDepositeHash, signedHash;
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

        //Deposite amount
        let deposit = await nativeApi.tx.evm.deposit(
          account?.evmAddress,
          Number(amt).noExponents().toString()
        );

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
              options: { ...data.options }
            };

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
                  new Error(
                    new ErrorPayload(ERRCODES.NETWORK_REQUEST, ERROR_MESSAGES.TX_FAILED)
                  ).throw();
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
      };
      return new EventPayload(
        null,
        ERROR_EVENTS_LABELS.NETWORK_ERROR,
        payload,
        new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message)
      );
    }
  };

  validatorNominatorTransaction = async (message, state) => {
    try {
      //save the current block
      await this.services.getCurrentBlockNumber(message.options.network);
      const eventPayload = await this.nominatorValidatorHandler.handleNativeAppsTask(
        state,
        message,
        false
      );
      return eventPayload;
    } catch (err) {
      const payload = {
        options: message?.options,
        data: message?.transactionHistoryTrack
      };

      return new EventPayload(
        null,
        null,
        payload,
        new ErrorPayload(ERRCODES.ERROR_WHILE_TRANSACTION, err.message)
      );
    }
  };

  /**************************************** Internal Methods *****************************/
  //internal method for getting the evm fee
  _getEvmFee = async (to, from, amount, state, data = "") => {
    const tx = {
      to: to || null,
      from,
      value: amount
    };

    if (data) tx.data = data;
    log("here is address: ", tx);
    const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const gasLimit = await evmApi.eth.estimateGas(tx);
    const gasPrice = await evmApi.eth.getGasPrice();
    const gasFee = new BigNumber(gasPrice * gasLimit).dividedBy(DECIMALS).toString();

    return {
      gasLimit,
      gasPrice,
      gasFee
    };
  };
}
