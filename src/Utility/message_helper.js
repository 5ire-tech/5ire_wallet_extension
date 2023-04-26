import Browser from "webextension-polyfill";
import { isNullorUndef, isObject, isString, log } from "./utility";


//message passing helper
// export const sendRuntimeMessage =async (typeLabel, eventLabel, message) => {
//     try {
//         if(!isObject(message) && isNullorUndef(message)) throw new Error("Invalid message, (*Only Objects or Array is valid value)");
//         if(!isString(eventLabel) && eventLabel.trim().length === 0) throw new Error("Invalid event Label")
//         if(!isString(typeLabel) && typeLabel.trim().length === 0) throw new Error("Invalid type Label")
//       const res=await  Browser.runtime.sendMessage({type: typeLabel, event: eventLabel, data: message})
//       return res
//     } catch (err) {
//         console.log("Error while sending message to background: ", err.message);
//         return null;
//     }
// }

//message passing helper
export const sendRuntimeMessage = (typeLabel, eventLabel, message) => {
    log("inside message passer:", message)
    try {
        if (!isObject(message) && isNullorUndef(message)) throw new Error("Invalid message, (*Only Objects or Array is valid value)");
        if (!isString(eventLabel) && eventLabel.trim().length === 0) throw new Error("Invalid event Label")
        if (!isString(typeLabel) && typeLabel.trim().length === 0) throw new Error("Invalid type Label")
        Browser.runtime.sendMessage({ type: typeLabel, event: eventLabel, data: message });
    } catch (err) {
        console.log("Error while sending message to background: ", err.message);
    }
}


//bind the message listner
export const bindRuntimeMessageListener = (listner) => {
    try {
        Browser.runtime.onMessage.addListener(listner)
    } catch (err) {
        console.log("Error while binding the listner: ", err);
    }
}


//send message to tabs
export const sendMessageToTab = (tabId, payload) => {
    try {
        Browser.tabs.sendMessage(tabId, payload);
    } catch (err) {
        log("Error while sending message to tabs: ", err)
    }
}