import Browser from "webextension-polyfill";
import { isNullorUndef, isObject, isString, log } from "./utility";
import { Error, ErrorPayload } from "./error_helper";
import { ERRCODES, ERROR_MESSAGES, STREAM_CHANNELS } from "../Constants";
import ExtensionPortStream from "../Scripts/extension-port-stream-mod/index";

//message passing helper
export const sendRuntimeMessage = (typeLabel, eventLabel, message) => {
  try {
    if (!isObject(message) && isNullorUndef(message))
      throw new Error(
        "Invalid message, (*Only Objects or Array is valid value)"
      );
    if (!isString(eventLabel) && eventLabel.trim().length === 0)
      throw new Error("Invalid event Label");
    if (!isString(typeLabel) && typeLabel.trim().length === 0)
      throw new Error("Invalid type Label");
    Browser.runtime.sendMessage({
      type: typeLabel,
      event: eventLabel,
      data: message
    });
  } catch (err) {
    console.log("Error while sending message to background: ", err.message);
  }
};

//send the runtime message over a port duplex stream
export class MessageOverStream {
  static instance = null;
  static portStream = null;

  //maintain only single instance at runtime
  static getInstance = () => {
    if (!MessageOverStream.instance) {
      MessageOverStream.instance = new MessageOverStream();
      delete MessageOverStream.constructor;
    }
    return MessageOverStream.instance;
  };

  //create the stream connection to background using port connection and convert the connection into stream
  static setupStream = () => {
    MessageOverStream.portStream = new ExtensionPortStream(
      Browser.runtime.connect({ name: STREAM_CHANNELS.EXTENSION_UI })
    );
    return MessageOverStream.getInstance();
  };

  sendMessageOverStream = (typeLabel, eventLabel, message) => {
    try {
      if (!MessageOverStream.portStream)
        new Error(
          new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)
        ).throw();
      if (!isObject(message) && isNullorUndef(message))
        throw new Error(
          "Invalid message, (*Only Objects or Array is valid value)"
        );
      if (!isString(eventLabel) && eventLabel.trim().length === 0)
        throw new Error("Invalid event Label");
      if (!isString(typeLabel) && typeLabel.trim().length === 0)
        throw new Error("Invalid type Label");
      MessageOverStream.portStream.write({
        type: typeLabel,
        event: eventLabel,
        data: message
      });
    } catch (err) {
      console.log(
        "Error while sending message to background over streams: ",
        err.message
      );
    }
  };
}

export const sendMessageOverStream =
  MessageOverStream.getInstance().sendMessageOverStream;

//bind the message listner
export const bindRuntimeMessageListener = (listner) => {
  try {
    Browser.runtime.onMessage.addListener(listner);
  } catch (err) {
    console.log("Error while binding the listner: ", err);
  }
};

//send message to tabs
export const sendMessageToTab = (tabId, payload) => {
  try {
    tabId && Browser.tabs.sendMessage(tabId, payload);
  } catch (err) {
    log("Error while sending message to tabs: ", err);
  }
};
