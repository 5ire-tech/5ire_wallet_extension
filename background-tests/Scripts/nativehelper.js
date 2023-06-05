"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _bignumber = require("bignumber.js");
var _keyring = require("@polkadot/keyring");
var _Constants = require("../Constants");
var _ireKeyring = require("./5ire-keyring");
var _initbackground = require("./initbackground");
var _utility = require("../Utility/utility");
var _network_calls = require("../Utility/network_calls");
var _error_helper = require("../Utility/error_helper");
var _loadstore = require("../Storage/loadstore");
var _utils = require("./utils");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class ValidatorNominatorHandler {
  constructor() {
    var _this = this;
    //pass the request to handler methods
    _defineProperty(this, "handleNativeAppsTask", async (state, message, isFee) => {
      var _message$options, _message$options2;
      const payload = {
        data: {},
        options: {
          ...(message === null || message === void 0 ? void 0 : message.options)
        }
      };
      const {
        activeSession
      } = await (0, _loadstore.getDataLocal)(_Constants.LABELS.EXTERNAL_CONTROLS);
      const externalData = (activeSession === null || activeSession === void 0 ? void 0 : activeSession.message) || message.options.externalTransaction.message;
      const method = (activeSession === null || activeSession === void 0 ? void 0 : activeSession.method) || message.options.externalTransaction.method;
      const options = {
        nativeAddress: (message === null || message === void 0 ? void 0 : (_message$options = message.options) === null || _message$options === void 0 ? void 0 : _message$options.account.nativeAddress) || state.currentAccount.nativeAddress,
        network: (message === null || message === void 0 ? void 0 : (_message$options2 = message.options) === null || _message$options2 === void 0 ? void 0 : _message$options2.network) || state.currentNetwork.toLowerCase()
      };
      if ((0, _utility.hasProperty)(ValidatorNominatorHandler.instance, method)) {
        const methodDetails = (0, _utils.getFormattedMethod)(method, externalData);
        const res = await ValidatorNominatorHandler.instance[method](state, externalData, isFee, options);
        //if error occured then throw it
        if (res !== null && res !== void 0 && res.error) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, res)).throw();

        //check if request is for fee-estimation or transaction
        if (isFee) payload.data = {
          fee: res.data,
          ...methodDetails
        };else {
          var _res$data;
          const transactionHistory = {
            ...(message === null || message === void 0 ? void 0 : message.transactionHistoryTrack),
            status: _Constants.STATUS.PENDING,
            txHash: (_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.txHash,
            method: methodDetails.methodName,
            amount: methodDetails.amount
          };
          payload.data = transactionHistory;
        }
        return new _network_calls.EventPayload(null, message.event, payload);
      } else new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.INVALID_PROPERTY)).throw();
    });
    _defineProperty(this, "getKeyring", address => {
      try {
        const signer = this.hybridKeyring.getNativeSignerByAddress(address);
        return signer;
      } catch (err) {
        (0, _utility.log)("err:", err);
        const signer = this.hybridKeyring.getNativeSignerByAddress(address);
        return signer;
      }
    });
    //Nominator methods
    _defineProperty(this, "native_add_nominator", async function (state, payload) {
      var _nativeApi$derive$sta;
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      if (!(payload !== null && payload !== void 0 && payload.stakeAmount) || !payload.validatorsAccounts) {
        return {
          error: true,
          data: "Invalid Params: Stake Amount and Validator Accounts are required"
        };
      }
      const {
        stakeAmount,
        validatorsAccounts
      } = payload;
      const bondedAmount = new _bignumber.BigNumber(stakeAmount).multipliedBy(_Constants.DECIMALS).toFixed().toString();
      const stashId = (0, _keyring.encodeAddress)(nativeAddress);
      const nominateTx = nativeApi.tx.staking.nominate(validatorsAccounts);
      const points = await ((_nativeApi$derive$sta = nativeApi.derive.staking) === null || _nativeApi$derive$sta === void 0 ? void 0 : _nativeApi$derive$sta.currentPoints()); //find points
      const bondOwnTx = await nativeApi.tx.staking.bond(stashId, bondedAmount, "Staked");
      const batchAll = await nativeApi.tx.utility.batchAll([bondOwnTx, nominateTx]);
      if (isFee) {
        const info = await (batchAll === null || batchAll === void 0 ? void 0 : batchAll.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await batchAll.signAndSend(_this.getKeyring(nativeAddress));
      const data = {
        txHash: txHash.toHex(),
        stakeAmount,
        points
      };
      return {
        error: false,
        data
      };
    });
    _defineProperty(this, "native_renominate", async function (state, payload) {
      var _nativeApi$derive$sta2;
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      if (!payload.validatorAccounts) {
        return {
          error: true,
          data: "Invalid Params: Validator Accounts are required"
        };
      }
      const {
        validatorAccounts
      } = payload;
      const nominateTx = nativeApi.tx.staking.nominate(validatorAccounts);
      const points = await ((_nativeApi$derive$sta2 = nativeApi.derive.staking) === null || _nativeApi$derive$sta2 === void 0 ? void 0 : _nativeApi$derive$sta2.currentPoints()); //find points
      const batchAll = await nativeApi.tx.utility.batchAll([nominateTx]);
      if (isFee) {
        const info = await (batchAll === null || batchAll === void 0 ? void 0 : batchAll.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await batchAll.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex(),
          points
        }
      };
    });
    _defineProperty(this, "native_nominator_payout", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      if (!payload.validatorIdList) {
        return {
          error: true,
          data: "Invalid Params: Validator Accounts are required"
        };
      }
      return _this.native_validator_payout(state, payload, isFee, options);
    });
    _defineProperty(this, "native_validator_payout", async function (state, payload) {
      var _nativeApi$tx, _nativeApi$tx$staking;
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      if (!payload.validatorIdList) {
        return {
          error: true,
          data: "Invalid Params: Validator Accounts are required"
        };
      }
      const {
        validatorIdList
      } = payload;
      const validators = [validatorIdList];
      let eraIndex;
      if (payload.firstEra) {
        eraIndex = payload.firstEra;
      } else {
        var _nativeApi$derive, _nativeApi$derive$sta3, _nativeApi$derive2, _nativeApi$derive2$st, _era$, _era$0$;
        const allEras = await (nativeApi === null || nativeApi === void 0 ? void 0 : (_nativeApi$derive = nativeApi.derive) === null || _nativeApi$derive === void 0 ? void 0 : (_nativeApi$derive$sta3 = _nativeApi$derive.staking) === null || _nativeApi$derive$sta3 === void 0 ? void 0 : _nativeApi$derive$sta3.erasHistoric());
        const era = await (nativeApi === null || nativeApi === void 0 ? void 0 : (_nativeApi$derive2 = nativeApi.derive) === null || _nativeApi$derive2 === void 0 ? void 0 : (_nativeApi$derive2$st = _nativeApi$derive2.staking) === null || _nativeApi$derive2$st === void 0 ? void 0 : _nativeApi$derive2$st.stakerRewardsMultiEras(validators, allEras));
        if (((_era$ = era[0]) === null || _era$ === void 0 ? void 0 : _era$.length) === 0) {
          return {
            error: true,
            data: "You have no era to payout"
          };
        }
        eraIndex = (_era$0$ = era[0][0]) === null || _era$0$ === void 0 ? void 0 : _era$0$.era;
      }
      const payout = await (nativeApi === null || nativeApi === void 0 ? void 0 : (_nativeApi$tx = nativeApi.tx) === null || _nativeApi$tx === void 0 ? void 0 : (_nativeApi$tx$staking = _nativeApi$tx.staking) === null || _nativeApi$tx$staking === void 0 ? void 0 : _nativeApi$tx$staking.payoutStakers(validators[0], eraIndex));
      if (isFee) {
        const info = await (payout === null || payout === void 0 ? void 0 : payout.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await payout.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    _defineProperty(this, "native_stop_validator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      return _this.native_stop_nominator(state, payload, isFee, options);
    });
    _defineProperty(this, "native_stop_nominator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const stopValidator = await nativeApi.tx.staking.chill();
      if (isFee) {
        const info = await (stopValidator === null || stopValidator === void 0 ? void 0 : stopValidator.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await stopValidator.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    _defineProperty(this, "native_unbond_validator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      return _this.native_unbond_nominator(state, payload, isFee, options);
    });
    _defineProperty(this, "native_unbond_nominator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      if (!payload.amount) {
        return {
          error: true,
          data: "Invalid Params: Amount is required"
        };
      }
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const amt = new _bignumber.BigNumber(payload.amount).multipliedBy(_Constants.DECIMALS).toFixed().toString();
      const unbound = await nativeApi.tx.staking.unbond(amt);
      if (isFee) {
        const info = await (unbound === null || unbound === void 0 ? void 0 : unbound.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await unbound.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    _defineProperty(this, "native_withdraw_validator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      return _this.native_withdraw_nominator(state, payload, isFee, options);
    });
    _defineProperty(this, "native_withdraw_nominator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      if (!payload.amount || !payload.address) {
        return {
          error: true,
          data: "Invalid Params: Amount and Address are required"
        };
      }
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const {
        amount,
        address
      } = payload;
      const sendAmounts = new _bignumber.BigNumber(amount).multipliedBy(_Constants.DECIMALS).toFixed().toString();
      // const sendAmt = nativeApi.tx.balances.transferKeepAlive(address, sendAmounts);
      const sendAmt = nativeApi.tx.balances.transfer(address, sendAmounts);
      if (isFee) {
        const info = await (sendAmt === null || sendAmt === void 0 ? void 0 : sendAmt.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await sendAmt.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    _defineProperty(this, "native_withdraw_validator_unbonded", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      return _this.native_withdraw_nominator_unbonded(state, payload, isFee, options);
    });
    _defineProperty(this, "native_withdraw_nominator_unbonded", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const unbond = await nativeApi.tx.staking.withdrawUnbonded(0);
      if (isFee) {
        const info = await (unbond === null || unbond === void 0 ? void 0 : unbond.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await unbond.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    //validators methods
    _defineProperty(this, "native_add_validator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      if (!(payload !== null && payload !== void 0 && payload.commission) || !(payload !== null && payload !== void 0 && payload.amount) || !(payload !== null && payload !== void 0 && payload.rotateKeys)) {
        return {
          error: true,
          data: "Invalid Params: commission, rotateKeys and  amount are required"
        };
      }
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const bondAmt = new _bignumber.BigNumber(payload.amount).multipliedBy(_Constants.DECIMALS).toFixed().toString();
      const stashId = (0, _keyring.encodeAddress)((0, _keyring.decodeAddress)(nativeAddress));
      const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;
      const validatorInfo = {
        bondTx: nativeApi.tx.staking.bond(stashId, bondAmt, "Staked"),
        sessionTx: nativeApi.tx.session.setKeys(payload === null || payload === void 0 ? void 0 : payload.rotateKeys, new Uint8Array()),
        validateTx: nativeApi.tx.staking.validate({
          blocked: false,
          commission
        })
      };
      const validationTransfer = await nativeApi.tx.utility.batchAll([validatorInfo.bondTx, validatorInfo.sessionTx, validatorInfo.validateTx]);
      if (isFee) {
        const info = await (validationTransfer === null || validationTransfer === void 0 ? void 0 : validationTransfer.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await validationTransfer.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    _defineProperty(this, "native_validator_bondmore", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      return _this.native_nominator_bondmore(state, payload, isFee, options);
    });
    _defineProperty(this, "native_nominator_bondmore", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      if (!payload.amount) {
        return {
          error: true,
          data: "Invalid Params: Amount is required"
        };
      }
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const amt = new _bignumber.BigNumber(payload.amount).multipliedBy(_Constants.DECIMALS).toFixed().toString();
      const bondExtraTx = await nativeApi.tx.staking.bondExtra(amt);
      if (isFee) {
        const info = await (bondExtraTx === null || bondExtraTx === void 0 ? void 0 : bondExtraTx.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await bondExtraTx.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    _defineProperty(this, "native_restart_validator", async function (state, payload) {
      let isFee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let options = arguments.length > 3 ? arguments[3] : undefined;
      if (!payload.commission) {
        return {
          error: true,
          data: "Invalid Params: Commission is required"
        };
      }
      const {
        network,
        nativeAddress
      } = options;
      const {
        nativeApi
      } = _initbackground.NetworkHandler.api[network];
      const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;
      const validatorInfo = {
        validateTx: nativeApi.tx.staking.validate({
          blocked: false,
          commission
        })
      };
      const validationTransfer = await nativeApi.tx.utility.batchAll([validatorInfo.validateTx]);
      if (isFee) {
        const info = await (validationTransfer === null || validationTransfer === void 0 ? void 0 : validationTransfer.paymentInfo(_this.getKeyring(nativeAddress)));
        const fee = new _bignumber.BigNumber(info.partialFee.toString()).div(_Constants.DECIMALS).toFixed(6, 8).toString();
        return {
          error: false,
          data: fee
        };
      }
      const txHash = await validationTransfer.signAndSend(_this.getKeyring(nativeAddress));
      return {
        error: false,
        data: {
          txHash: txHash.toHex()
        }
      };
    });
    this.hybridKeyring = _ireKeyring.HybridKeyring.getInstance();
  }
}
exports.default = ValidatorNominatorHandler;
_defineProperty(ValidatorNominatorHandler, "instance", null);
_defineProperty(ValidatorNominatorHandler, "getInstance", () => {
  if (!ValidatorNominatorHandler.instance) {
    ValidatorNominatorHandler.instance = new ValidatorNominatorHandler();
    delete ValidatorNominatorHandler.constructor;
  }
  return ValidatorNominatorHandler.instance;
});