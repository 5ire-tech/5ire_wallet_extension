import Web3 from "web3";
import { hexToU8a, isHex } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import {
  mnemonicValidate,
} from "@polkadot/util-crypto";
import {
  ERROR_MESSAGES,
} from "../Constants/index";



export const validMnemonic = (data) => {
  const isValidMnemonic = mnemonicValidate(data);
  return isValidMnemonic;
}

export const validateAddress = async (address) => {
  if (address?.startsWith("0x")) {
    try {
      Web3.utils.toChecksumAddress(address);
      return ({
        error: false,
      });
    } catch (error) {
      return ({
        error: true,
        data: ERROR_MESSAGES.INCORRECT_ADDRESS
      });
    }
  } else if (address?.startsWith("5")) {
    try {
      encodeAddress(
        isHex(address)
          ? hexToU8a(address)
          : decodeAddress(address)
      );
      return ({
        error: false,
      });
    } catch (error) {
      console.log("Error : ", error);
      return ({
        error: true,
        data: ERROR_MESSAGES.INCORRECT_ADDRESS
      });
    }

  } else {
    return ({
      error: true,
      data: ERROR_MESSAGES.INCORRECT_ADDRESS
    });
  }
}