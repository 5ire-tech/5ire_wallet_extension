import { BigNumber } from "bignumber.js";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { Keyring } from "@polkadot/keyring";
import { decryptor, encryptor } from "../Helper/CryptoHelper";
import {
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
  ed25519PairFromSeed
} from "@polkadot/util-crypto";
import { getDataLocal } from "../Storage/loadstore";
import { DECIMALS } from "../Constants";

export const nativeMethod = async () => {

const store = await getDataLocal("state");
const state = store.state;
const {pass, currentAccount} = state;

    const getKeyring = () => {
        const seedAccount = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const signer = keyring.addFromPair(ed25519PairFromSeed(seedAccount));
        return signer;
      }
    
      //Nominator methods
      const addNominator = async (nativeApi, payload, isFee = false) => {
    
        try {
          if (!payload?.stakeAmount || !payload.validatorsAccounts) {
            return {
              error: true,
              data: "Invalid Params: Stake Amount and Validator Accounts are required"
            }
          }
          const { stakeAmount, validatorsAccounts } = payload;
    
          const bondedAmount = (new BigNumber(stakeAmount).multipliedBy(DECIMALS)).toFixed().toString()
    
          const stashId = encodeAddress(currentAccount?.nativeAddress);
          const nominateTx = nativeApi.tx.staking.nominate(validatorsAccounts);
          const points = await nativeApi.derive.staking?.currentPoints(); //find points
          const bondOwnTx = await nativeApi.tx.staking.bond(stashId, bondedAmount, "Staked");
          const batchAll = await nativeApi.tx.utility.batchAll([bondOwnTx, nominateTx]);
    
          if (isFee) {
            const info = await batchAll?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
    
          const txHash = await batchAll.signAndSend(getKeyring())
    
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
    
      const reNominate = async (nativeApi, payload, isFee = false) => {
        try {
    
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
            const info = await batchAll?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await batchAll.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex(), points },
          };
        } catch (err) {
          return { error: true, data: err?.message };
        }
    
      };
    
      const nominatorValidatorPayout = async (nativeApi, payload, isFee = false) => {
        try {
    
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
            const info = await payout?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await payout.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
    
        } catch (err) {
          return { error: true, data: err?.message };
        }
      };
    
      const stopValidatorNominator = async (nativeApi, isFee = false) => {
        try {
          const stopValidator = await nativeApi.tx.staking.chill();
    
          if (isFee) {
            const info = await stopValidator?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await stopValidator.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
        }
      };
    
      const unbondNominatorValidator = async (nativeApi, payload, isFee = false) => {
        try {
    
    
          if (!payload.amount) {
            return {
              error: true,
              data: "Invalid Params: Amount is required"
            }
    
          }
    
    
          const amt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString()
          const unbound = await nativeApi.tx.staking.unbond(amt);
          if (isFee) {
            const info = await unbound?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await unbound.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
        }
      };
    
    
      const withdrawNominatorValidatorData = async (nativeApi, payload, isFee = false) => {
        try {
    
          if (!payload.amount || !payload.address) {
            return {
              error: true,
              data: "Invalid Params: Amount and Address are required"
            }
          }
    
          const { amount, address } = payload
          const sendAmounts = (new BigNumber(amount).multipliedBy(DECIMALS)).toFixed().toString()
          // const sendAmt = nativeApi.tx.balances.transferKeepAlive(address, sendAmounts);
          const sendAmt = nativeApi.tx.balances.transfer(address, sendAmounts);
    
          if (isFee) {
            const info = await sendAmt?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await sendAmt.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
        }
      };
    
      const withdrawNominatorUnbonded = async (nativeApi, payload, isFee = false) => {
        try {
    
          if (!payload.value) {
            return {
              error: true,
              data: "Invalid Params: Value is required"
            }
          }
          const unbond = await nativeApi.tx.staking.withdrawUnbonded(payload.value);
    
          if (isFee) {
            const info = await unbond?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await unbond.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
        }
      };
    
    
      //validators methods
      const addValidator = async (nativeApi, payload, isFee = false) => {
        try {
    
          if (!payload.commission || !payload.bondedAmount) {
            return {
              error: true,
              data: "Invalid Params: Commission and Bonded Amount are required"
            }
          }
          const rotateKey = await nativeApi.rpc.author.rotateKeys();
          const bondAmt = (new BigNumber(payload.bondedAmount).multipliedBy(DECIMALS)).toFixed().toString()
    
          const stashId = encodeAddress(decodeAddress(currentAccount?.nativeAddress));
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
            const info = await validationTransfer?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
    
          const txHash = await validationTransfer.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
    
        }
    
      };
    
    
      const bondMoreFunds = async (nativeApi, payload, isFee = false) => {
        try {
    
          if (!payload.amount) {
            return {
              error: true,
              data: "Invalid Params: Amount is required"
            }
          }
          const amt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString()
          const bondExtraTx = await nativeApi.tx.staking.bondExtra(amt);
    
          if (isFee) {
            const info = await bondExtraTx?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await bondExtraTx.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
    
        }
      };
    
    
      const restartValidator = async (nativeApi, payload, isFee = false) => {
        try {
          if (!payload.commission) {
            return {
              error: true,
              data: "Invalid Params: Commission is required"
            }
          }
          const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;
          const validatorInfo = {
            validateTx: nativeApi.tx.staking.validate({
              blocked: false,
              commission,
            }),
          };
    
          const validationTransfer = await nativeApi.tx.utility.batchAll([validatorInfo.validateTx]);
    
          if (isFee) {
            const info = await validationTransfer?.paymentInfo(getKeyring());
            const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
            return {
              error: false,
              data: fee
            }
          }
          const txHash = await validationTransfer.signAndSend(getKeyring())
          return {
            error: false,
            data: { txHash: txHash.toHex() }
          }
        } catch (err) {
          return { error: true, data: err?.message };
    
        }
      };

      return {
        addNominator,
        reNominate,
        nominatorValidatorPayout,
        stopValidatorNominator,
        unbondNominatorValidator,
        withdrawNominatorValidatorData,
        withdrawNominatorUnbonded,
        addValidator,
        bondMoreFunds,
        restartValidator,
        state
      };

}