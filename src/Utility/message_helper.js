import Browser from "webextension-polyfill";
import { isNullorUndef, isObject, isString } from "./utility";

//message passing helper
export const sendRuntimeMessage = (typeLabel, eventLabel, message) => {
    try {
        if(!isObject(message) && isNullorUndef(message)) throw new Error("Invalid message, (*Only Objects or Array is valid value)");
        if(!isString(eventLabel) && eventLabel.trim().length === 0) throw new Error("Invalid event Label")
        if(!isString(typeLabel) && typeLabel.trim().length === 0) throw new Error("Invalid type Label")
        Browser.runtime.sendMessage({type: typeLabel, event: eventLabel, data: message});
    } catch (err) {
        console.log("Error while sending message to background: ", err.message);
    }
}


//bind the message listner
export const bindRuntimeMessageListener = (listner) => {
    try {
        Browser.runtime.onMessage.addListener(listner)
    } catch (err) {
        console.log("Error while binding the listner: ", err.message);
    }
}