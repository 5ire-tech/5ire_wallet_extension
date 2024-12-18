import Web3 from "web3";
import { ethers } from "ethers";
import { ERROR_MESSAGES } from "../Constants";
import { hexToU8a, isHex } from "@polkadot/util";
import { decryptor } from "../Helper/CryptoHelper";
import { mnemonicValidate } from "@polkadot/util-crypto";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";

//Check if mnemonic is valid or not
export const validateMnemonic = (data) => {
  const isValidMnemonic = mnemonicValidate(data);
  return isValidMnemonic;
};

// validate Evm and Native Address
export const validateAddress = async (address) => {
  if (address?.startsWith("0x")) {
    try {
      Web3.utils.toChecksumAddress(address);
      return {
        error: false
      };
    } catch (error) {
      return {
        error: true,
        data: ERROR_MESSAGES.INCORRECT_ADDRESS
      };
    }
  } else if (address?.startsWith("5")) {
    try {
      encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
      return {
        error: false
      };
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: ERROR_MESSAGES.INCORRECT_ADDRESS
      };
    }
  } else {
    return {
      error: true,
      data: ERROR_MESSAGES.INCORRECT_ADDRESS
    };
  }
};

//check if something is string or not
export function isString(arg) {
  return typeof arg === "string";
}

//check if something is string or not
export function isObject(arg) {
  return typeof arg === "object";
}

//check if something is undefined or null
export function isNullorUndef(arg) {
  return arg === undefined || arg === null;
}

//check if something is undefined or not
export function isUndef(arg) {
  return arg === undefined;
}

//check if string or array has length
export function hasLength(arg) {
  if (isString(arg)) return arg.trim()?.length > 0;
  return arg?.length > 0;
}

//check if string or array has length
export function isEmpty(str) {
  return str?.length === 0;
}

//check if string or array has length
export function compStr(a, b) {
  return a === b;
}

//check if object has the given property
export function hasProperty(arg, key) {
  if (isObject(arg)) {
    return arg.hasOwnProperty(key);
  }
  throw new Error(ERROR_MESSAGES.UNDEF_PROPERTY);
}

//equlity check
export function isEqual(arg1, arg2) {
  return arg1 === arg2;
}

//slice the string to any size
export const shortLongAddress = (data = "", startLen = 10, endLen = 10) => {
  return `${data.substring(0, startLen)}...${data.substring(data?.length - endLen, data?.length)}`;
};

export const arrayReverser = (arr) => {
  const newArr = [];
  for (let i = arr?.length - 1; i >= 0; i--) {
    newArr.push(arr[i]);
  }
  return newArr;
};

//check if value is number
export function isNumber(arg) {
  return typeof arg === "number";
}

//logging utility
export function log(...logs) {
  //get the time stamp for the logs
  const timeStamp = new Date(Date.now());
  const dateString = `${timeStamp.getDate()}:${timeStamp.getMonth()}:${timeStamp.getFullYear()} :: ${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}:${timeStamp.getMilliseconds()}`;

  console.log(`${dateString} - `, ...logs);
}

export const getKey = (str, p) => {
  const seed = decryptor(str, p);
  if (seed) {
    const { privateKey } = ethers.Wallet.fromPhrase(seed);
    return privateKey;
  }
};

export const formatBalance = (balance) => {
  if (isNaN(balance) || !balance) {
    return "0";
  }

  const abbreviations = ["", "K", "M", "B", "T"];
  let index = 0;

  // Handle negative numbers separately
  const sign = balance < 0 ? "-" : "";
  balance = Math.abs(balance);

  while (balance >= 1000 && index < abbreviations.length - 1) {
    balance /= 1000;
    index++;
  }

  const formattedBalance =
    balance >= 1 ? limitDecimalsCustom(balance, 2) : limitDecimalsCustom(balance, 4);
  return `${sign}${formattedBalance}${abbreviations[index]}`;
};

export function limitDecimalsCustom(number, decimalPlaces) {
  if (number % 1 === 0) {
    // If no decimals, return the numberber as it is
    return number;
  } else {
    // If there are decimals, format the numberber to have a maximum of 6 decimals
    const decimalPart = number.toString().split(".")[1].slice(0, decimalPlaces);
    const completePart = number.toString().split(".")[0];
    const concatenated = String(completePart) + "." + String(decimalPart);
    return concatenated;
  }
}

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait ?? 1000);
  };
};

export const nameWithEllipsis = (name, nameLimit = 10) =>
  name.length > nameLimit ? `${name.slice(0, nameLimit)}...` : `${name}.`;

export const limitDecimalsOnlyWhenRequired = (number, limit = 6) =>
  number?.toString().split(".")?.[1]?.length > limit ? number.toFixed(limit) : number;
