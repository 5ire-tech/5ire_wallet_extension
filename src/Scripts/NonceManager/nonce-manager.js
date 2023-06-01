import { log } from "../../Utility/utility";
import { NetworkHandler } from "../initbackground";

export class NonceManager {
  //previous transaction nonce
  static preNonce = 0;

  //nonce setter and getter
  getPreviousNonce = () => NonceManager.preNonce;
  setPreviousNonce = (nonce) => (NonceManager.preNonce = nonce);

  //generate new nonce
  getNonce = async (network, evmAddress) => {
    try {
      const nonce = await NetworkHandler.api[network].evmApi.eth.getTransactionCount(evmAddress);
      return nonce;
    } catch (err) {
      log("Error while getting the nonce: ", err);
    }
  };
}
