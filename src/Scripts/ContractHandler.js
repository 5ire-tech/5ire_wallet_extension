import { ERRCODES, ERROR_MESSAGES, INTERNAL_EVENT_LABELS } from "../Constants";
import { ERC20_ABI } from "../Constants/erc20.abi";
import { ErrorPayload } from "../Utility/error_helper";
import { EventPayload } from "../Utility/network_calls";
import { ExtensionEventHandle } from "./ExtensionEventHandle";
import { NetworkHandler } from "./NetworkHandler";
import { Services } from "./Services";

export class ContractHandler {
  static instance = null;

  constructor() {
    this.services = new Services();
  }

  static getInstance = () => {
    if (!ContractHandler.instance) {
      ContractHandler.instance = new ContractHandler();
      delete ContractHandler.constructor;
    }
    return ContractHandler.instance;
  };

  /**
   * Check if method exists in class instance or not
   * @param {*} message
   * @param {*} state
   */
  handleContractRelatedTasks = async (message, state) => {
    try {
      if (ContractHandler.instance[message.event]) {
        const keyringResponse = await this._methodCaller(message, state);
        this._parseResponse(keyringResponse);

        //handle if the method is not the part of system
      } else new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.UNDEF_PROPERTY)).throw();
    } catch (err) {
      ExtensionEventHandle.eventEmitter.emit(
        INTERNAL_EVENT_LABELS.ERROR,
        new ErrorPayload(ERRCODES.INTERNAL, err.message)
      );
    }
  };

  /**
   * Get Contract info like name decimals and symbol
   * @param {*} message
   * @param {*} state
   */
  getTokenInfo = async (message, state) => {
    try {
      const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const contract = new evmApi.eth.Contract(ERC20_ABI, message?.data?.address);
      const decimals = await contract.methods.decimals().call();
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();

      const payload = {
        decimals: decimals,
        symbol: symbol,
        name: name
      };

      return new EventPayload(null, message.event, payload);
    } catch (error) {
      console.log("Error while hetting token : ", error);
      new Error(new ErrorPayload(ERRCODES.CONTRACT_RELATED, ERROR_MESSAGES.ERC20_ONLY)).throw();
    }
  };

  /**
   * Import token to the wallet
   * @param {*} message
   * @param {*} state
   */
  importToken = async (message, state) => {
    try {
      const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const contract = new evmApi.eth.Contract(ERC20_ABI, message?.data?.address);
      const currentAccount = state.currentAccount?.evmAddress;
      const balance = await contract.methods.balanceOf(currentAccount).call();

      const payload = {
        ...message?.data,
        balance
      };
      return new EventPayload(message.event, message.event, payload);
    } catch (error) {
      console.log("error while importing token : ", error);
      new Error(new ErrorPayload(ERRCODES.CONTRACT_RELATED, ERROR_MESSAGES.IMPORT_ERROR)).throw();
    }
  };

  /**
   * *********************** Internal Functions ***********************
   */

  /**
   * call the class methods
   * @param {*} message
   * @param {*} state
   * @returns
   */
  _methodCaller = async (message, state) => {
    try {
      const keyResponse = await ContractHandler.instance[message.event](message, state);
      return keyResponse;
    } catch (err) {
      return new EventPayload(
        null,
        message.event,
        null,
        new ErrorPayload(
          err.message.errCode ?? ERRCODES.CONTRACT_RELATED,
          err.message.errMessage ?? err.message
        )
      );
    }
  };

  /**
   * send message to ui or update the storage if needed
   * @param {*} response
   */
  _parseResponse = async (response) => {
    if (!response?.error) {
      //change the state in local storage
      if (response?.stateChangeKey)
        await this.services.updateLocalState(
          response.stateChangeKey,
          response.payload,
          response.payload?.options
        );
      //send the response message to extension ui
      if (response?.eventEmit) this.services.messageToUI(response.eventEmit, response.payload);
    } else {
      if (Number(response?.error?.errCode) === 18)
        response.eventEmit && this.services.messageToUI(response.eventEmit, response.error);
      else
        ExtensionEventHandle.eventEmitter.emit(
          INTERNAL_EVENT_LABELS.ERROR,
          new ErrorPayload(ERRCODES.CONTRACT_RELATED, response.error)
        );
    }
  };
}
