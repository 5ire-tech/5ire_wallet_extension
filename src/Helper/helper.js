import Browser from "webextension-polyfill";
import { BigNumber } from "bignumber.js";
import { isNullorUndef, log } from "../Utility/utility";
import { getCurrentTabDetails } from "../Scripts/utils";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { sendMessageToTab } from "../Utility/message_helper";
import {
    CONNECTION_METHODS,
    ERRCODES, ERROR_MESSAGES,
    EXPLORERS, RESTRICTED_URLS
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

        date = date.length === 1 ? "0" + date : date;

        month = month.length === 1 ? "0" + month : month;

        hours = hours.length === 1 ? "0" + hours : hours;

        minutes = minutes.length === 1 ? "0" + minutes : minutes;

        seconds = seconds.length === 1 ? "0" + seconds : seconds;

        const fullDate = date + "-" + month + "-" + fullYear + " | ";

        let time = hours + ":" + minutes + ":" + seconds;

        time = time.split(":");
        time[3] = time[0] < 12 ? " AM" : " PM";
        time[0] = time[0] > 12 ? time[0] % 12 : time[0];
        const dateTime = fullDate + `${time[0]}:${time[1]}:${time[2]}${time[3]}`;

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
            let index = num.search(reDot);

            if (numOfDecimals <= 0)
                return Number(num.slice(0, index));
            else
                return Number(num.slice(0, (index + numOfDecimals + 1)));
        }
    } catch (err) {
        // console.log("Error while formatting num : ", err);
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
export const numFormatter = num => {

    if (Number(num) % 1 === 0) {
        let numArr = (num.toString()).split(".");
        return numArr[0];
    } else {
        return num;
    }
}


//check transaction network and generate url
export const generateTransactionUrl = (network, txHash, isEvm) => {
    try {
        if (isNullorUndef(network) && isNullorUndef(txHash)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
        const explorerUrl = EXPLORERS[network.toUpperCase()];
        return `${explorerUrl}/${isEvm ? "evm/tx" : "testnet/tx"}/${txHash}`;

    } catch (err) {
        log("error while generating the url: ", err)
    }
}


//open new browser tab
export const openBrowserTab = (url) => {
    try {
        Browser.tabs.create({ url });
    } catch (err) {
        log("Error while opening browser tab: ", err)
    }
}

//check if string is included into array
export const checkStringInclusionIntoArray = (str, strArr = Object.values(CONNECTION_METHODS)) => {
    if (isNullorUndef(str) && isNullorUndef(strArr)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
    return strArr.includes(str);
}

//generate the request error message string
export const generateErrorMessage = (method, origin) => {
    return `The request of method '${method}' for ${origin} is already pending, please check.`;
}

//send event to the connected tab
export const sendEventToTab = async (tabMessagePayload, connectedApps, emitWithoutConnectionCheck = false) => {
    getCurrentTabDetails().then((tabDetails) => {
        if (!checkStringInclusionIntoArray(tabDetails.tabUrl, RESTRICTED_URLS) && ((connectedApps &&connectedApps[tabDetails?.tabUrl]?.isConnected) || emitWithoutConnectionCheck)) {
            sendMessageToTab(tabDetails.tabId, tabMessagePayload)
        }
    });
}

//send event to specfic tab
export const sendEventUsingTabId = async (tabId, tabEventPayload, connectedApps=null) => {
    if(connectedApps) {
    const tabDetails = getTabDetailsUsingTabId(tabId);
        if(tabDetails) {
            const isConnected = connectedApps[new URL(tabDetails.url).hostname]?.isConnected;
            isConnected && sendMessageToTab(tabId, tabEventPayload);
        }
    } else sendMessageToTab(tabId, tabEventPayload);
    
}

//get tab using tab id
export const getTabDetailsUsingTabId = async (tabId) => {
    try {
        const tabDetails = await Browser.tabs.get(tabId);
        return tabDetails;
    } catch (err) {
        return null;
    }
}

//fix number upto certain decimals
export const fixNumber = (num, decimalPlaces = 6, roundingMode = 8) => {
    try {
        const number = new BigNumber(Number(num)).toFixed(decimalPlaces, roundingMode).toString();
        return number;
    }
    catch (error) {
        return "";
    }
}

//set default timeout for 1sec
export const setTimer = (callback, timer=1000) => {
    return setTimeout(callback, timer);
}