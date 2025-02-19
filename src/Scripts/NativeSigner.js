import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { ERRCODES, ERROR_MESSAGES } from "../Constants";
import { ErrorPayload } from "../Utility/error_helper";
import { EventPayload } from "../Utility/network_calls";
import { log } from "../Utility/utility";
import { HybridKeyring } from "./5ire-keyring";
import { NetworkHandler } from "./NetworkHandler";

/**
 * For the nominator and validator and other native
 */
export class NativeSigner {
  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
  }

  signPayload = async (payload, state) => {
    try {
      const account = state.currentAccount;
      const pair = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
      const connectionApi = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      let registry = connectionApi.nativeApi.registry;
      const isJsonPayload = (value) => {
        return value?.genesisHash !== undefined;
      };

      if (isJsonPayload(payload)) {
        // registry = new TypeRegistry();
        registry.setSignedExtensions(payload.signedExtensions);
        // }
      }
      // else {
      //   // for non-payload, just create a registry to use
      //   registry = new TypeRegistry();
      // }

      const extrinsicPayload = registry
        .createType("ExtrinsicPayload", payload, {
          version: payload.version
        })
        .sign(pair);

      // const payloadU8a = extrinsicPayload.toU8a({ method: true });
      // const rawSignatureU8a = pair.sign(payloadU8a, { withType: true });
      // const signatureHex = u8aToHex(rawSignatureU8a);

      return new EventPayload(null, null, {
        data: extrinsicPayload
      });
    } catch (err) {
      log("error while signing the payload: ", err);
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.SIGNER_ERROR, ERROR_MESSAGES.SINGER_ERROR)
      );
    }
  };

  signRaw = async (payload, state) => {
    try {
      const account = state.currentAccount;
      const pair = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);
      const result = { signature: u8aToHex(pair.sign(u8aWrapBytes(payload))) };
      return new EventPayload(null, null, { data: result });
    } catch (err) {
      log("error while signing the raw: ", err);
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.SIGNER_ERROR, ERROR_MESSAGES.SINGER_ERROR)
      );
    }
  };
}
