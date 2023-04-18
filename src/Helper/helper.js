import Browser from "webextension-polyfill";
import { CONNECTION_METHODS, ERRCODES, ERROR_MESSAGES, EXPLORERS } from "../Constants";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { isNullorUndef, log } from "../Utility/utility";

export const formatDate = (_date) => {
    try {

        let currentDate = new Date(_date);
        let date =
            currentDate.getDate() +
            "/" +
            (currentDate.getMonth() + 1) +
            "/" +
            currentDate.getFullYear() +
            " | ";

        let time =
            currentDate.getHours() +
            ":" +
            currentDate.getMinutes() +
            ":" +
            currentDate.getSeconds();

        time = time.split(":");
        time[3] = time[0] < 12 ? " AM" : " PM";
        time[0] = time[0] > 12 ? time[0] % 12 : time[0];
        let dateTime = date + `${time[0]}:${time[1]}:${time[2]}${time[3]}`;

        return dateTime;

    } catch (error) {
        // console.log("Error while formating date : ", error);
        return "";
    }
};




export const formatNum = (num, numOfDecimals = 4) => {
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
export const shortner = (str, startLength = 5, endLength=4) => {
    const start = str.slice(0, startLength);

    const len = str.length;
    const end = str.slice(len - endLength, len);

    const shortTx = `${start}....${end}`;
    return shortTx;
};


//number formatter
export const numFormatter = num => {

    if (Number(num) % 1 === 0 ) {
        let numArr = (num.toString()).split(".");
        return numArr[0];
    }else{
        return num;
    }
}


//check transaction network and generate url
export const generateTransactionUrl = (network, txHash) => {
try {

    if(isNullorUndef(network) && isNullorUndef(txHash)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
    const explorerUrl = EXPLORERS[network.toUpperCase()];
    return `${explorerUrl}/${txHash}`;

} catch(err) {
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
export const checkStringInclusionIntoArray = (str, strArr=CONNECTION_METHODS) => {
    if(isNullorUndef(str) && isNullorUndef(strArr)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
    return strArr.includes(str);
}

//generate the request error message string
export const generateErrorMessage = (method, origin) => {
    return `The request of method '${method}' for ${origin} is already pending, please check.`;
}