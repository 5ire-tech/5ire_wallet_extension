import Browser from "webextension-polyfill";
import { isNullorUndef, isObject, isString } from "./utility";

//message passing helper
export const sendMessageToBackground = (eventLabel, message) => {
    try {
        if(!isObject(message) && isNullorUndef(message)) throw new Error("Invalid message, (*Only Objects and Array is the Valid)");
        if(!isString(eventLabel && eventLabel.trim().length > 0)) throw new Error("Invalid event Label")
        Browser.runtime.sendMessage({type: eventLabel, data: message});
    } catch (err) {
        console.log("Error while sending message to background: ", err.message);
    }
}


//bind the message listner
export const messageListenerHelper = (listner) => {
    try {
        Browser.runtime.onMessage.addListener(listner)
    } catch (err) {
        console.log("Error while binding the listner: ", err.message);
    }
}