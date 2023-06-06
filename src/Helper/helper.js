import { BigNumber } from "bignumber.js";
import Browser from "webextension-polyfill";
import { isNullorUndef, log } from "../Utility/utility";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { sendMessageToTab } from "../Utility/message_helper";
import {
  CONNECTION_METHODS,
  ERRCODES,
  ERROR_MESSAGES,
  EXPLORERS,
  RESTRICTED_URLS
} from "../Constants";

export const formatDate = (_date) => {
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
    const dateTime =
      fullDate +
      `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}:${time[2]
        .toString()
        .padStart(2, "0")}${time[3]}`;

    return dateTime;
  } catch (error) {
    // console.log("Error while formating date : ", error);
    return "";
  }
};

export const formatNumUptoSpecificDecimal = (num, numOfDecimals = 4) => {
  try {
    if (!num) {
      return 0;
    } else {
      num = num.toString();
      const reDot = /[.]/;
      if (!reDot.test(num)) return Number(num);
      let index = num.search(reDot);

      if (numOfDecimals <= 0) return Number(num.slice(0, index));
      else return Number(num.slice(0, index + numOfDecimals + 1));
    }
  } catch (err) {
    // console.log("Error while formatting num : ", err);
    return 0;
  }
};

//address and hash shortner from starting and ending
export const shortner = (str, startLength = 5, endLength = 4) => {
  const start = str.slice(0, startLength);

  const len = str.length;
  const end = str.slice(len - endLength, len);

  const shortTx = `${start}....${end}`;
  return shortTx;
};

//number formatter
export const numFormatter = (num) => {
  if (Number(num) % 1 === 0) {
    let numArr = num.toString().split(".");
    return numArr[0];
  } else {
    return num;
  }
};

//check transaction network and generate url
export const generateTransactionUrl = (network, txHash, isEvm) => {
  try {
    if (isNullorUndef(network) && isNullorUndef(txHash))
      new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
    const explorerUrl = EXPLORERS[network.toUpperCase()];
    return `${explorerUrl}/${isEvm ? "evm/tx" : "testnet/tx"}/${txHash}`;
  } catch (err) {
    log("error while generating the url: ", err);
  }
};

//open new browser tab
export const openBrowserTab = (url) => {
  try {
    Browser.tabs.create({ url });
  } catch (err) {
    log("Error while opening browser tab: ", err);
  }
};

//check if string is included into array
export const checkStringInclusionIntoArray = (str, strArr = Object.values(CONNECTION_METHODS)) => {
  if (isNullorUndef(str) && isNullorUndef(strArr))
    new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
  return strArr.includes(str);
};

//generate the request error message string
export const generateErrorMessage = (method, origin) => {
  return `The request of method '${method}' for ${origin} is already pending, please check.`;
};

//send event to the connected tab
export const sendEventToTab = async (
  tabDetails,
  tabMessagePayload,
  connectedApps,
  emitWithoutConnectionCheck = false
) => {
  if (
    !checkStringInclusionIntoArray(tabDetails.origin, RESTRICTED_URLS) &&
    ((connectedApps && connectedApps[tabDetails.origin]?.isConnected) || emitWithoutConnectionCheck)
  ) {
    tabDetails.tabDetails.tabId && sendMessageToTab(tabDetails.tabDetails.tabId, tabMessagePayload);
  }
};

//send event to specfic tab
export const sendEventUsingTabId = async (tabId, tabEventPayload, connectedApps = null) => {
  if (connectedApps) {
    const tabDetails = getTabDetailsUsingTabId(tabId);
    if (tabDetails) {
      const isConnected = connectedApps[new URL(tabDetails.url).origin]?.isConnected;
      isConnected && sendMessageToTab(tabId, tabEventPayload);
    }
  } else sendMessageToTab(tabId, tabEventPayload);
};

//get tab using tab id
export const getTabDetailsUsingTabId = async (tabId) => {
  try {
    const tabDetails = await Browser.tabs.get(tabId);
    return tabDetails;
  } catch (err) {
    return null;
  }
};

//fix number upto certain decimals
export const fixNumber = (num, decimalPlaces = 6, roundingMode = 8) => {
  try {
    const number = new BigNumber(Number(num)).toFixed(decimalPlaces, roundingMode).toString();
    return number;
  } catch (error) {
    return "";
  }
};

//set default timeout for 1sec
export const setTimer = (callback, timer = 1000) => {
  return setTimeout(callback, timer);
};
