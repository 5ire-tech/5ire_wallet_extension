"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayReverser = void 0;
exports.compStr = compStr;
exports.getKey = void 0;
exports.hasLength = hasLength;
exports.hasProperty = hasProperty;
exports.isEmpty = isEmpty;
exports.isEqual = isEqual;
exports.isNullorUndef = isNullorUndef;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
exports.isUndef = isUndef;
exports.log = log;
exports.validateMnemonic = exports.validateAddress = exports.shortLongAddress = void 0;
var _web = _interopRequireDefault(require("web3"));
var _ethers = require("ethers");
var _Constants = require("../Constants");
var _util = require("@polkadot/util");
var _CryptoHelper = require("../Helper/CryptoHelper");
var _utilCrypto = require("@polkadot/util-crypto");
var _keyring = require("@polkadot/keyring");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//Check if mnemonic is valid or not
const validateMnemonic = data => {
  const isValidMnemonic = (0, _utilCrypto.mnemonicValidate)(data);
  return isValidMnemonic;
};

// validate Evm and Native Address
exports.validateMnemonic = validateMnemonic;
const validateAddress = async address => {
  if (address !== null && address !== void 0 && address.startsWith("0x")) {
    try {
      _web.default.utils.toChecksumAddress(address);
      return {
        error: false
      };
    } catch (error) {
      return {
        error: true,
        data: _Constants.ERROR_MESSAGES.INCORRECT_ADDRESS
      };
    }
  } else if (address !== null && address !== void 0 && address.startsWith("5")) {
    try {
      (0, _keyring.encodeAddress)((0, _util.isHex)(address) ? (0, _util.hexToU8a)(address) : (0, _keyring.decodeAddress)(address));
      return {
        error: false
      };
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: _Constants.ERROR_MESSAGES.INCORRECT_ADDRESS
      };
    }
  } else {
    return {
      error: true,
      data: _Constants.ERROR_MESSAGES.INCORRECT_ADDRESS
    };
  }
};

//check if something is string or not
exports.validateAddress = validateAddress;
function isString(arg) {
  return typeof arg === "string";
}

//check if something is string or not
function isObject(arg) {
  return typeof arg === "object";
}

//check if something is undefined or null
function isNullorUndef(arg) {
  return arg === undefined || arg === null;
}

//check if something is undefined or not
function isUndef(arg) {
  return arg === undefined;
}

//check if string or array has length
function hasLength(arg) {
  var _arg$trim;
  if (isString(arg)) return ((_arg$trim = arg.trim()) === null || _arg$trim === void 0 ? void 0 : _arg$trim.length) > 0;
  return (arg === null || arg === void 0 ? void 0 : arg.length) > 0;
}

//check if string or array has length
function isEmpty(str) {
  return (str === null || str === void 0 ? void 0 : str.length) === 0;
}

//check if string or array has length
function compStr(a, b) {
  return a === b;
}

//check if object has the given property
function hasProperty(arg, key) {
  if (isObject(arg)) {
    return arg.hasOwnProperty(key);
  }
  throw new Error(_Constants.ERROR_MESSAGES.UNDEF_PROPERTY);
}

//equlity check
function isEqual(arg1, arg2) {
  return arg1 === arg2;
}

//slice the string to any size
const shortLongAddress = function () {
  let data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  let startLen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
  let endLen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  return `${data.substring(0, startLen)}...${data.substring((data === null || data === void 0 ? void 0 : data.length) - endLen, data === null || data === void 0 ? void 0 : data.length)}`;
};
exports.shortLongAddress = shortLongAddress;
const arrayReverser = arr => {
  const newArr = [];
  for (let i = (arr === null || arr === void 0 ? void 0 : arr.length) - 1; i >= 0; i--) {
    newArr.push(arr[i]);
  }
  return newArr;
};

//check if value is number
exports.arrayReverser = arrayReverser;
function isNumber(arg) {
  return typeof arg === "number";
}

//logging utility
function log() {
  //get the time stamp for the logs
  const timeStamp = new Date(Date.now());
  const dateString = `${timeStamp.getDate()}:${timeStamp.getMonth()}:${timeStamp.getFullYear()} :: ${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}:${timeStamp.getMilliseconds()}`;
  for (var _len = arguments.length, logs = new Array(_len), _key = 0; _key < _len; _key++) {
    logs[_key] = arguments[_key];
  }
  console.log(`${dateString} - `, ...logs);
}
const getKey = (str, p) => {
  const seed = (0, _CryptoHelper.decryptor)(str, p);
  if (seed) {
    const {
      privateKey
    } = _ethers.ethers.Wallet.fromPhrase(seed);
    return privateKey;
  }
};
exports.getKey = getKey;