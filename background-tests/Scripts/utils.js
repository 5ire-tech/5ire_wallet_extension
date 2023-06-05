"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.txNotificationStringTemplate = exports.isManifestV3 = exports.isAlreadyConnected = exports.getUrlOrigin = exports.getUUID = exports.getFormattedMethod = exports.getCurrentTabDetails = exports.bindNoExponentWithNumber = void 0;
var _uuid = require("uuid");
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _Constants = require("../Constants");
var _utility = require("../Utility/utility");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const getUrlOrigin = url => {
  return new URL(url).origin;
};

//get the current tab details
exports.getUrlOrigin = getUrlOrigin;
const getCurrentTabDetails = async () => {
  var _tabsDetails$, _tabsDetails$2, _tabsDetails$3;
  const queryInfo = {
    active: true
  };
  const tabsDetails = await _webextensionPolyfill.default.tabs.query(queryInfo);
  if (!((_tabsDetails$ = tabsDetails[0]) !== null && _tabsDetails$ !== void 0 && _tabsDetails$.url)) return null;
  return {
    tabId: (_tabsDetails$2 = tabsDetails[0]) === null || _tabsDetails$2 === void 0 ? void 0 : _tabsDetails$2.id,
    tabUrl: getUrlOrigin((_tabsDetails$3 = tabsDetails[0]) === null || _tabsDetails$3 === void 0 ? void 0 : _tabsDetails$3.url)
  };
};

//bind the noExponents function with the Number Constructor
exports.getCurrentTabDetails = getCurrentTabDetails;
const bindNoExponentWithNumber = () => {
  // eslint-disable-next-line no-extend-native
  Number.prototype.noExponents = function () {
    try {
      var data = String(this).split(/[eE]/);
      if (data.length === 1) return data[0];
      var z = _Constants.EMTY_STR,
        sign = this < 0 ? "-" : _Constants.EMTY_STR,
        str = data[0].replace(".", _Constants.EMTY_STR),
        mag = Number(data[1]) + 1;
      if (mag < 0) {
        z = sign + "0.";
        while (mag++) z += "0";
        // eslint-disable-next-line no-useless-escape
        return z + str.replace(/^\-/, _Constants.EMTY_STR);
      }
      mag -= str.length;
      while (mag--) z += "0";
      return str + z;
    } catch (error) {
      console.log("Exponent error", error);
    }
  };
};
exports.bindNoExponentWithNumber = bindNoExponentWithNumber;
const isManifestV3 = _webextensionPolyfill.default.runtime.getManifest().manifest_version === 3;

//tx notification message generator
exports.isManifestV3 = isManifestV3;
const txNotificationStringTemplate = function (status, hash) {
  let showHashLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
  return `Transaction ${status.toLowerCase()} ${hash.slice(0, showHashLength)}...`;
};

//check if app is already is connected
exports.txNotificationStringTemplate = txNotificationStringTemplate;
const isAlreadyConnected = (connectedApps, origin) => {
  return (0, _utility.isNullorUndef)(connectedApps[origin]) ? false : connectedApps[origin].isConnected;
};

//get uuid
exports.isAlreadyConnected = isAlreadyConnected;
const getUUID = () => {
  return (0, _uuid.v4)();
};

//get the amount and method
exports.getUUID = getUUID;
const getFormattedMethod = (method, message) => {
  let methodName = "",
    amount;
  switch (method) {
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
      methodName = "Add Nominator";
      amount = message === null || message === void 0 ? void 0 : message.stakeAmount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
      methodName = "Re-Nominate";
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
      methodName = "Nominator Payout";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
      methodName = "Validator Payout";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
      methodName = "Stop Validator";
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
      methodName = "Stop Nominator";
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
      methodName = "Unbond Validator";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
      methodName = "Unbond Nominator";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
      methodName = "Send Funds";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
      methodName = "Send Funds";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
      methodName = "Withdraw Nominator Unbonded";
      amount = message === null || message === void 0 ? void 0 : message.value;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
      methodName = "Withdraw Validator Unbonded";
      amount = message === null || message === void 0 ? void 0 : message.value;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
      methodName = "Add Validator";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
      methodName = "Bond More Funds";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
      methodName = "Bond More Funds";
      amount = message === null || message === void 0 ? void 0 : message.amount;
      break;
    case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
      methodName = "Restart Validator";
      break;
    default:
  }

  //init the balance with zero if balance not found
  amount = amount || 0;
  return {
    methodName,
    amount
  };
};
exports.getFormattedMethod = getFormattedMethod;