import { BigNumber } from "bignumber.js";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { DECIMALS, VALIDATOR_NOMINATOR_METHOD } from "../Constants";
import { HybridKeyring } from "./5ire-keyring";
import { NetworkHandler } from "./initbackground";

export default class ValidatorNominatorHandler {


  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
  }


  get_formatted_method = (method, message) => {
    let methodName = "", amount = 0;
    switch (method) {
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
        methodName = "Add Nominator";
        amount = message?.stakeAmount;
        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
        methodName = "Re-Nominate";
        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
        methodName = "Nominator Payout";
        amount = message?.amount;
        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
        methodName = "Validator Payout";
        amount = message?.amount;
        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
        methodName = "Stop Validator";
        break;

      case VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
        methodName = "Stop Nominator";
        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
        methodName = "Unbond Validator";
        amount = message?.amount;
        break;

      case VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
        methodName = "Unbond Nominator";
        amount = message?.amount;

        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
        methodName = "Send Funds";
        amount = message?.amount;
        break;

      case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
        methodName = "Send Funds";
        amount = message?.amount;

        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
        methodName = "Withdraw Nominator Unbonded";
        amount = message?.value;
        break;

      case VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
        methodName = "Withdraw Validator Unbonded";
        amount = message?.value;

        break;

      case VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
        methodName = "Add Validator";
        amount = message?.amount;
        break;

      case VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
        methodName = "Bond More Funds";
        amount = message?.amount;

        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
        methodName = "Bond More Funds";
        amount = message?.amount;

        break;
      case VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
        methodName = "Restart Validator";
        break;
      default:

    }

    return { methodName, amount }
  }

  getKeyring = (address) => {
    const signer = this.hybridKeyring.getNativeSignerByAddress(address)
    return signer;
  }

  //Nominator methods
  native_add_nominator = async (state, payload, isFee = false) => {

    try {
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
    } catch (err) {
      return {
        error: true,
        data: err?.message
      }
    }
  }

  native_renominate = async (state, payload, isFee = false) => {
    try {
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
    } catch (err) {
      return { error: true, data: err?.message };
    }

  };

  native_validator_payout = async (state, payload, isFee = false) => {
    return this.native_nominator_payout(state, payload, isFee)
  }

  native_nominator_payout = async (state, payload, isFee = false) => {
    try {

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
      const allEras = await nativeApi?.derive?.staking?.erasHistoric();
      const era = await nativeApi?.derive?.staking?.stakerRewardsMultiEras(validators, allEras);
      if (era[0]?.length === 0) {
        return {
          error: true,
          data: "You have no era to payout"
        };
      }
      const payout = await nativeApi?.tx?.staking?.payoutStakers(validators[0], era[0][0]?.era);

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

    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  native_stop_validator = async (state, payload, isFee = false) => {
    return this.native_stop_nominator(state, payload, isFee)
  }

  native_stop_nominator = async (state, payload, isFee = false) => {
    try {
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
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  native_unbond_validator = async (state, payload, isFee = false) => {
    return this.native_unbond_nominator(state, payload, isFee)
  }

  native_unbond_nominator = async (state, payload, isFee = false) => {
    try {


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
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  native_withdraw_validator = async (state, payload, isFee = false) => {

    return this.native_withdraw_nominator(state, payload, isFee)
  }


  native_withdraw_nominator = async (state, payload, isFee = false) => {
    try {

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
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  native_withdraw_validator_unbonded = async (state, payload, isFee = false) => {
    return this.native_withdraw_nominator_unbonded(state, payload, isFee)
  }

  native_withdraw_nominator_unbonded = async (state, payload, isFee = false) => {
    try {

      if (!payload.value) {
        return {
          error: true,
          data: "Invalid Params: Value is required"
        }
      }
      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const nativeAddress = state.currentAccount?.nativeAddress;

      const unbond = await nativeApi.tx.staking.withdrawUnbonded(payload.value);

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
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };


  //validators methods
  native_add_validator = async (state, payload, isFee = false) => {
    try {

      if (!payload.commission || !payload.bondedAmount) {
        return {
          error: true,
          data: "Invalid Params: Commission and Bonded Amount are required"
        }
      }

      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const nativeAddress = state.currentAccount?.nativeAddress;

      const rotateKey = await nativeApi.rpc.author.rotateKeys();
      const bondAmt = (new BigNumber(payload.bondedAmount).multipliedBy(DECIMALS)).toFixed().toString()

      const stashId = encodeAddress(decodeAddress(nativeAddress));
      const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;

      const validatorInfo = {
        bondTx: nativeApi.tx.staking.bond(stashId, bondAmt, 'Staked'),
        sessionTx: nativeApi.tx.session.setKeys(rotateKey, new Uint8Array()),
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
    } catch (err) {
      return { error: true, data: err?.message };

    }

  };
  native_validator_bondmore = async (state, payload, isFee = false) => {
    return this.native_nominator_bondmore(state, payload, isFee)
  }

  native_nominator_bondmore = async (state, payload, isFee = false) => {
    try {

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
    } catch (err) {
      return { error: true, data: err?.message };

    }
  };


  native_restart_validator = async (state, payload, isFee = false) => {
    try {
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
    } catch (err) {
      return { error: true, data: err?.message };

    }
  };

}
