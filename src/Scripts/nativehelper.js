import { BigNumber } from "bignumber.js";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { DECIMALS, ERRCODES, ERROR_MESSAGES, LABELS, STATUS, VALIDATOR_NOMINATOR_METHOD } from "../Constants";
import { HybridKeyring } from "./5ire-keyring";
import { NetworkHandler } from "./initbackground";
import { hasProperty, log } from "../Utility/utility";
import { EventPayload } from "../Utility/network_calls";
import { ErrorPayload, Error } from "../Utility/error_helper";
import { getDataLocal } from "../Storage/loadstore";
import { getFormattedMethod } from "./utils";

export default class ValidatorNominatorHandler {
  static instance = null;

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
  }

  static getInstance = () => {
    if (!ValidatorNominatorHandler.instance) {
      ValidatorNominatorHandler.instance = new ValidatorNominatorHandler();
      delete ValidatorNominatorHandler.constructor;
    }
    return ValidatorNominatorHandler.instance;
  }

  //pass the request to handler methods
  handleNativeAppsTask = async (state, message, isFee) => {
    const payload = { data: {}, options: { ...message?.options }};
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
  
    
    const externalData = activeSession?.message || message.options.externalTransaction.message;
    const method = activeSession?.method || message.options.externalTransaction.method;

    if (hasProperty(ValidatorNominatorHandler.instance, method)) {
      const methodDetails = getFormattedMethod(method, externalData);

      // if(!isFee) {
      // //check for sufficent balance to perfrom operation
      // const network = message?.transactionHistoryTrack?.chain.toLowerCase() || state.currentNetwork.toLowerCase();
      // const balance = state.allAccountsBalance[message.options?.account.evmAddress][network];
      //   if (Number(methodDetails.amount) >= (Number(balance?.nativeBalance) - (state.pendingTransactionBalance[message.options?.account.evmAddress][network].native - Number(methodDetails.amount))))
      //   new Error(new ErrorPayload(ERRCODES.INSUFFICENT_BALANCE, { error: true, data: ERROR_MESSAGES.INSUFFICENT_BALANCE })).throw();

      // //check if the amount is valid
      // if (Number(methodDetails.amount) < 0 || isNaN(Number(methodDetails.amount)))
      //   new Error(new ErrorPayload(ERRCODES.INVALID_INPUT, { error: true, data: ERROR_MESSAGES.INVALID_AMOUNT })).throw();
      // }

      const res = await ValidatorNominatorHandler.instance[method](state, externalData, isFee);
      //if error occured then throw it
      if (res?.error) new Error(new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, res)).throw();

      //check if request is for fee-estimation or transaction 
      if (isFee) payload.data = { fee: res.data, ...methodDetails };
      else {
        const transactionHistory = { ...message?.transactionHistoryTrack, status: STATUS.PENDING, txHash: res.data?.txHash, method: methodDetails.methodName, amount: methodDetails.amount };
        payload.data = transactionHistory;
      }

      return new EventPayload(null, message.event, payload);
    } else new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.INVALID_PROPERTY)).throw();
  }

  getKeyring = (address) => {
    try {
      const signer = this.hybridKeyring.getNativeSignerByAddress(address)
      return signer;
    } catch (err) {
      log("err:", err);
      const signer = this.hybridKeyring.getNativeSignerByAddress(address)
      return signer;
    }
  }


  //Nominator methods
  native_add_nominator = async (state, payload, isFee = false) => {


    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;


    if (!payload?.stakeAmount || !payload.validatorsAccounts) {
      return {
        error: true,
        data: "Invalid Params: Stake Amount and Validator Accounts are required"
      }
    }
    const { stakeAmount, validatorsAccounts } = payload;

    const bondedAmount = (new BigNumber(stakeAmount).multipliedBy(DECIMALS)).toFixed().toString()

    const stashId = encodeAddress(nativeAddress);
    const nominateTx = nativeApi.tx.staking.nominate(validatorsAccounts);
    const points = await nativeApi.derive.staking?.currentPoints(); //find points
    const bondOwnTx = await nativeApi.tx.staking.bond(stashId, bondedAmount, "Staked");
    const batchAll = await nativeApi.tx.utility.batchAll([bondOwnTx, nominateTx]);

    if (isFee) {
      const info = await batchAll?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }

    const txHash = await batchAll.signAndSend(this.getKeyring(nativeAddress))

    const data = {
      txHash: txHash.toHex(),
      stakeAmount,
      points,
    };
    return {
      error: false,
      data
    }
  }

  native_renominate = async (state, payload, isFee = false) => {
    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;

    if (!payload.validatorAccounts) {
      return {
        error: true,
        data: "Invalid Params: Validator Accounts are required"
      }
    }
    const { validatorAccounts } = payload
    const nominateTx = nativeApi.tx.staking.nominate(validatorAccounts);
    const points = await nativeApi.derive.staking?.currentPoints(); //find points
    const batchAll = await nativeApi.tx.utility.batchAll([nominateTx]);
    if (isFee) {
      const info = await batchAll?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await batchAll.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex(), points },
    };
  };

  native_nominator_payout = async (state, payload, isFee = false) => {

    if (!payload.validatorIdList) {
      return {
        error: true,
        data: "Invalid Params: Validator Accounts are required"
      }
    }
    return this.native_validator_payout(state, payload, isFee)
  }

  native_validator_payout = async (state, payload, isFee = false) => {
    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;

    if (!payload.validatorIdList) {
      return {
        error: true,
        data: "Invalid Params: Validator Accounts are required"
      }
    }

    const { validatorIdList } = payload;
    const validators = [validatorIdList];
    let eraIndex;
    if (payload.firstEra) {
      eraIndex = payload.firstEra;
    } else {
      const allEras = await nativeApi?.derive?.staking?.erasHistoric();
      const era = await nativeApi?.derive?.staking?.stakerRewardsMultiEras(validators, allEras);
      if (era[0]?.length === 0) {
        return {
          error: true,
          data: "You have no era to payout"
        };
      }
      eraIndex = era[0][0]?.era;

    }
    const payout = await nativeApi?.tx?.staking?.payoutStakers(validators[0], eraIndex);

    if (isFee) {
      const info = await payout?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await payout.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };

  native_stop_validator = async (state, payload, isFee = false) => {
    return this.native_stop_nominator(state, payload, isFee)
  }

  native_stop_nominator = async (state, payload, isFee = false) => {
    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;

    const stopValidator = await nativeApi.tx.staking.chill();

    if (isFee) {
      const info = await stopValidator?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await stopValidator.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };

  native_unbond_validator = async (state, payload, isFee = false) => {
    return this.native_unbond_nominator(state, payload, isFee)
  }

  native_unbond_nominator = async (state, payload, isFee = false) => {

    if (!payload.amount) {
      return {
        error: true,
        data: "Invalid Params: Amount is required"
      }

    }
    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;


    const amt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString()
    const unbound = await nativeApi.tx.staking.unbond(amt);
    if (isFee) {
      const info = await unbound?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await unbound.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };

  native_withdraw_validator = async (state, payload, isFee = false) => {

    return this.native_withdraw_nominator(state, payload, isFee)
  }


  native_withdraw_nominator = async (state, payload, isFee = false) => {
    if (!payload.amount || !payload.address) {
      return {
        error: true,
        data: "Invalid Params: Amount and Address are required"
      }
    }
    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;


    const { amount, address } = payload
    const sendAmounts = (new BigNumber(amount).multipliedBy(DECIMALS)).toFixed().toString()
    // const sendAmt = nativeApi.tx.balances.transferKeepAlive(address, sendAmounts);
    const sendAmt = nativeApi.tx.balances.transfer(address, sendAmounts);

    if (isFee) {
      const info = await sendAmt?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await sendAmt.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };

  native_withdraw_validator_unbonded = async (state, payload, isFee = false) => {
    return this.native_withdraw_nominator_unbonded(state, payload, isFee)
  }

  native_withdraw_nominator_unbonded = async (state, payload, isFee = false) => {

    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;

    const unbond = await nativeApi.tx.staking.withdrawUnbonded(0);

    if (isFee) {
      const info = await unbond?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await unbond.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };


  //validators methods
  native_add_validator = async (state, payload, isFee = false) => {

    if (!payload?.commission || !payload?.amount || !payload?.rotateKeys) {
      return {
        error: true,
        data: "Invalid Params: commission, rotateKeys and  amount are required"
      }
    }

    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;


    const bondAmt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString();

    const stashId = encodeAddress(decodeAddress(nativeAddress));
    const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;

    const validatorInfo = {
      bondTx: nativeApi.tx.staking.bond(stashId, bondAmt, 'Staked'),
      sessionTx: nativeApi.tx.session.setKeys(payload?.rotateKeys, new Uint8Array()),
      validateTx: nativeApi.tx.staking.validate({
        blocked: false,
        commission,
      }),
    };
    const validationTransfer = await nativeApi.tx.utility.batchAll([
      validatorInfo.bondTx,
      validatorInfo.sessionTx,
      validatorInfo.validateTx,
    ]);


    if (isFee) {
      const info = await validationTransfer?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }

    const txHash = await validationTransfer.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }

  };

  native_validator_bondmore = async (state, payload, isFee = false) => {
    return this.native_nominator_bondmore(state, payload, isFee)
  }

  native_nominator_bondmore = async (state, payload, isFee = false) => {
    if (!payload.amount) {
      return {
        error: true,
        data: "Invalid Params: Amount is required"
      }
    }

    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;

    const amt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString()
    const bondExtraTx = await nativeApi.tx.staking.bondExtra(amt);

    if (isFee) {
      const info = await bondExtraTx?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await bondExtraTx.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };

  native_restart_validator = async (state, payload, isFee = false) => {
    if (!payload.commission) {
      return {
        error: true,
        data: "Invalid Params: Commission is required"
      }
    }


    const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
    const nativeAddress = state.currentAccount?.nativeAddress;

    const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;
    const validatorInfo = {
      validateTx: nativeApi.tx.staking.validate({
        blocked: false,
        commission,
      }),
    };

    const validationTransfer = await nativeApi.tx.utility.batchAll([validatorInfo.validateTx]);

    if (isFee) {
      const info = await validationTransfer?.paymentInfo(this.getKeyring(nativeAddress));
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
      return {
        error: false,
        data: fee
      }
    }
    const txHash = await validationTransfer.signAndSend(this.getKeyring(nativeAddress))
    return {
      error: false,
      data: { txHash: txHash.toHex() }
    }
  };

}
