import { ERRCODES, ERROR_MESSAGES, INTERNAL_EVENT_LABELS } from "../Constants";
import { ErrorPayload } from "../Utility/error_helper";
import { EventPayload } from "../Utility/network_calls";
import { HybridKeyring } from "./5ire-keyring";
import { ExtensionEventHandle } from "./ExtensionEventHandle";
import { Services } from "./Services";

/**
 * keyring handler
 */
export class KeyringHandler {
  static instance = null;

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
    this.services = new Services();
  }

  //If there is already an instance of this class then it will return this otherwise this will create it.
  static getInstance = () => {
    if (!KeyringHandler.instance) {
      KeyringHandler.instance = new KeyringHandler();
      delete KeyringHandler.constructor;
    }
    return KeyringHandler.instance;
  };

  keyringHelper = async (message) => {
    try {
      if (this.hybridKeyring[message.event]) {
        const keyringResponse = await this._keyringCaller(message);
        this._parseKeyringRes(keyringResponse);

        //handle if the method is not the part of system
      } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.UNDEF_PROPERTY)).throw();
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.INTERNAL, err.message)
      );
    }
  };

  _keyringCaller = async (message) => {
    try {
      const keyResponse = await this.hybridKeyring[message.event](message);
      return keyResponse;
    } catch (err) {
      return new EventPayload(
        null,
        message.event,
        null,
        new ErrorPayload(
          err.message.errCode || ERRCODES.KEYRING_SECTION_ERROR,
          err.message.errMessage || err.message
        )
      );
    }
  };

  //parse the response recieve from operation and send message accordingly to extension ui
  _parseKeyringRes = async (response) => {
    if (!response.error) {
      //change the state in local storage
      if (response.stateChangeKey)
        await this.services.updateLocalState(
          response.stateChangeKey,
          response.payload,
          response.payload?.options
        );
      //send the response message to extension ui
      if (response.eventEmit) this.services.messageToUI(response.eventEmit, response.payload);
    } else {
      if (Number(response?.error?.errCode) === 3)
        response.eventEmit && this.services.messageToUI(response.eventEmit, response.error);
      else
        ExtensionEventHandle.eventEmitter.emit(
          INTERNAL_EVENT_LABELS.ERROR,
          new ErrorPayload(ERRCODES.KEYRING_SECTION_ERROR, response.error)
        );
    }
  };
}
