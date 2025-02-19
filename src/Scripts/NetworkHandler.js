import {
  ERRCODES,
  HTTP_END_POINTS,
  INTERNAL_EVENT_LABELS,
  LABELS,
  MESSAGE_EVENT_LABELS
} from "../Constants";
import { getDataLocal } from "../Storage/loadstore";
import { ErrorPayload } from "../Utility/error_helper";
import { hasProperty, isNullorUndef, log } from "../Utility/utility";
import { ExtensionEventHandle } from "./ExtensionEventHandle";
import { InitBackground } from "./initbackground";
import { Services } from "./Services";

/**
 * Network task handler
 */
export class NetworkHandler {
  static instance = null;
  static api = {};

  constructor() {
    this.services = new Services();
  }

  //get only single instance
  static getInstance = () => {
    if (!NetworkHandler.instance) {
      NetworkHandler.instance = new NetworkHandler();
      NetworkHandler.createNetworkSlots();
      delete NetworkHandler.constructor;
    }
    return NetworkHandler.instance;
  };

  //create network slots
  static createNetworkSlots = () => {
    Object.keys(HTTP_END_POINTS).forEach((key) => (NetworkHandler.api[key.toLowerCase()] = null));
  };

  //network handler request
  handleNetworkRelatedTasks = async (message, state) => {
    if (!isNullorUndef(message.event) && hasProperty(NetworkHandler.instance, message.event)) {
      const error = await NetworkHandler.instance[message.event](message, state);

      //check for errors while network operations
      if (error) {
        log("Error while performing network operation: ", error);
      }
    }
  };

  //change network handler
  // eslint-disable-next-line no-unused-vars
  networkChange = async (message, state) => {
    try {
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.CONNECTION);
      return false;
    } catch (err) {
      return true;
    }
  };

  /******************************** connection handlers *********************************/
  initRpcApi = async () => {
    const { currentNetwork } = await getDataLocal(LABELS.STATE);
    const api = await this.services.createConnection(currentNetwork);
    if (api?.error) return;

    //insert connection into its network slot
    NetworkHandler.api[currentNetwork.toLowerCase()] = api;

    await this.checkNetwork();
  };

  //check the network connection
  checkNetwork = async () => {
    try {
      const state = await getDataLocal(LABELS.STATE);
      const connectionApi = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const chainId = await connectionApi.evmApi.eth.getChainId();

      //send only if the extension opened
      ExtensionEventHandle.eventEmitter.emit(INTERNAL_EVENT_LABELS.BALANCE_FETCH);
      InitBackground.uiStream &&
        this.services.messageToUI(MESSAGE_EVENT_LABELS.NETWORK_CHECK, {
          chainId
        });
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.FAILED_TO_CONNECT_NETWORK, err.message)
      );
      console.log("Exception in network check handler: ", err);
    }
  };
}
