"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shortner = exports.setTimer = exports.sendEventUsingTabId = exports.sendEventToTab = exports.openBrowserTab = exports.numFormatter = exports.getTabDetailsUsingTabId = exports.generateTransactionUrl = exports.generateErrorMessage = exports.formatNumUptoSpecificDecimal = exports.formatDate = exports.fixNumber = exports.checkStringInclusionIntoArray = void 0;
var _bignumber = require("bignumber.js");
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _utility = require("../Utility/utility");
var _error_helper = require("../Utility/error_helper");
var _message_helper = require("../Utility/message_helper");
var _Constants = require("../Constants");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const formatDate = _date => {
  try {
    const currentDate = new Date(_date);
    const fullYear = currentDate.getFullYear();
    let date = currentDate.getDate().toString();
    let hours = currentDate.getHours().toString();
    let seconds = currentDate.getSeconds().toString();
    let minutes = currentDate.getMinutes().toString();
    let month = (currentDate.getMonth() + 1).toString();
    const fullDate = date.padStart(2, "0") + "-" + month.padStart(2, "0") + "-" + fullYear + " | ";
    let time = hours + ":" + minutes + ":" + seconds;
    time = time.split(":");
    time[3] = time[0] < 12 ? " AM" : " PM";
    time[0] = time[0] > 12 ? time[0] % 12 : time[0];
    const dateTime = fullDate + `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}:${time[2].toString().padStart(2, "0")}${time[3]}`;
    return dateTime;
  } catch (error) {
    // console.log("Error while formating date : ", error);
    return "";
  }
};
exports.formatDate = formatDate;
const formatNumUptoSpecificDecimal = function (num) {
  let numOfDecimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
  try {
    if (!num) {
      return 0;
    } else {
      num = num.toString();
      const reDot = /[.]/;
      if (!reDot.test(num)) return Number(num);
      let index = num.search(reDot);
      if (numOfDecimals <= 0) return Number(num.slice(0, index));else return Number(num.slice(0, index + numOfDecimals + 1));
    }
  } catch (err) {
    // console.log("Error while formatting num : ", err);
    return 0;
  }
};

//address and hash shortner from starting and ending
exports.formatNumUptoSpecificDecimal = formatNumUptoSpecificDecimal;
const shortner = function (str) {
  let startLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  let endLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
  const start = str.slice(0, startLength);
  const len = str.length;
  const end = str.slice(len - endLength, len);
  const shortTx = `${start}....${end}`;
  return shortTx;
};

//number formatter
exports.shortner = shortner;
const numFormatter = num => {
  if (Number(num) % 1 === 0) {
    let numArr = num.toString().split(".");
    return numArr[0];
  } else {
    return num;
  }
};

//check transaction network and generate url
exports.numFormatter = numFormatter;
const generateTransactionUrl = (network, txHash, isEvm) => {
  try {
    if ((0, _utility.isNullorUndef)(network) && (0, _utility.isNullorUndef)(txHash)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
    const explorerUrl = _Constants.EXPLORERS[network.toUpperCase()];
    return `${explorerUrl}/${isEvm ? "evm/tx" : "testnet/tx"}/${txHash}`;
  } catch (err) {
    (0, _utility.log)("error while generating the url: ", err);
  }
};

//open new browser tab
exports.generateTransactionUrl = generateTransactionUrl;
const openBrowserTab = url => {
  try {
    _webextensionPolyfill.default.tabs.create({
      url
    });
  } catch (err) {
    (0, _utility.log)("Error while opening browser tab: ", err);
  }
};

//check if string is included into array
exports.openBrowserTab = openBrowserTab;
const checkStringInclusionIntoArray = function (str) {
  let strArr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.values(_Constants.CONNECTION_METHODS);
  if ((0, _utility.isNullorUndef)(str) && (0, _utility.isNullorUndef)(strArr)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
  return strArr.includes(str);
};

//generate the request error message string
exports.checkStringInclusionIntoArray = checkStringInclusionIntoArray;
const generateErrorMessage = (method, origin) => {
  return `The request of method '${method}' for ${origin} is already pending, please check.`;
};

//send event to the connected tab
exports.generateErrorMessage = generateErrorMessage;
const sendEventToTab = async function (tabDetails, tabMessagePayload, connectedApps) {
  var _connectedApps$tabDet;
  let emitWithoutConnectionCheck = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!checkStringInclusionIntoArray(tabDetails.tabDetails.origin, _Constants.RESTRICTED_URLS) && (connectedApps && (_connectedApps$tabDet = connectedApps[tabDetails.tabDetails.origin]) !== null && _connectedApps$tabDet !== void 0 && _connectedApps$tabDet.isConnected || emitWithoutConnectionCheck)) {
    tabDetails.tabDetails.tabId && (0, _message_helper.sendMessageToTab)(tabDetails.tabDetails.tabId, tabMessagePayload);
  }
};

//send event to specfic tab
exports.sendEventToTab = sendEventToTab;
const sendEventUsingTabId = async function (tabId, tabEventPayload) {
  let connectedApps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (connectedApps) {
    const tabDetails = getTabDetailsUsingTabId(tabId);
    if (tabDetails) {
      var _connectedApps$URL$or;
      const isConnected = (_connectedApps$URL$or = connectedApps[new URL(tabDetails.url).origin]) === null || _connectedApps$URL$or === void 0 ? void 0 : _connectedApps$URL$or.isConnected;
      isConnected && (0, _message_helper.sendMessageToTab)(tabId, tabEventPayload);
    }
  } else (0, _message_helper.sendMessageToTab)(tabId, tabEventPayload);
};

//get tab using tab id
exports.sendEventUsingTabId = sendEventUsingTabId;
const getTabDetailsUsingTabId = async tabId => {
  try {
    const tabDetails = await _webextensionPolyfill.default.tabs.get(tabId);
    return tabDetails;
  } catch (err) {
    return null;
  }
};

//fix number upto certain decimals
exports.getTabDetailsUsingTabId = getTabDetailsUsingTabId;
const fixNumber = function (num) {
  let decimalPlaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;
  let roundingMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8;
  try {
    const number = new _bignumber.BigNumber(Number(num)).toFixed(decimalPlaces, roundingMode).toString();
    return number;
  } catch (error) {
    return "";
  }
};

//set default timeout for 1sec
exports.fixNumber = fixNumber;
const setTimer = function (callback) {
  let timer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
  return setTimeout(callback, timer);
};
exports.setTimer = setTimer;