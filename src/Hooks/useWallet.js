import Web3 from "web3";
import { hexToU8a, isHex } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import {
  // mnemonicGenerate,
  mnemonicValidate,
  // ed25519PairFromSeed,
  // mnemonicToMiniSecret,
} from "@polkadot/util-crypto";
import {
  // LABELS,
  ERROR_MESSAGES,
  // ACCOUNT_CHANGED_EVENT,
} from "../Constants/index";

// import { useContext } from "react";
// import { AuthContext } from "../Store";
// import { decryptor, encryptor } from "../Helper/CryptoHelper";
// import { ethers } from "ethers";
// import Browser from "webextension-polyfill";
// import { getCurrentTabUId, getCurrentTabUrl } from "../Scripts/utils";


export default function UseWallet() {

  //Reterive privatekey 
  // const getKey = (str, p) => {
  //   const seed = decryptor(str, p);
  //   if (seed) {
  //     const { privateKey } = ethers.Wallet.fromMnemonic(seed);
  //     return privateKey;
  //   }
  // };

  //   try {

  //     const SS58Prefix = 6;
  //     // Create mnemonic string for Alice using BIP39
  //     let temp1m = mnemonicGenerate();

  //     // Create valid Substrate-compatible seed from mnemonic
  //     const seedAlice = mnemonicToMiniSecret(temp1m);

  //     // Generate new public/secret keypair for Alice from the supplied seed
  //     const { publicKey } = ed25519PairFromSeed(seedAlice);

  //     const nativeAddress = encodeAddress(decodeAddress(publicKey, SS58Prefix));
  //     const { address, privateKey } = ethers.Wallet.fromMnemonic(temp1m);
  //     const id = allAccounts.length + 1;

  //     const dataToDispatch = {
  //       id,
  //       temp1m,
  //       accountName,
  //       nativeAddress,
  //       evmAddress: address,
  //       temp2p: privateKey,
  //     };

  //     if (isLogin) {

  //       const incData = {
  //         ...dataToDispatch,
  //         temp1m: encryptor(temp1m, pass),
  //         temp2p: null,
  //       };

  //       updateState(LABELS.TX_HISTORY, { ...txHistory, [accountName]: [] });
  //       updateState(LABELS.CURRENT_ACCOUNT, { index: allAccounts.length, accountName });
  //       updateState(LABELS.ALL_ACCOUNTS, [...allAccounts, incData]);


  //       // when new keypair created or imported the old key emit the account change event
  //       getCurrentTabUId((id) => {
  //         getCurrentTabUrl((url) => {
  //           if (!(url === "chrome://extensions")) {
  //             Browser.tabs.sendMessage(id, { id: ACCOUNT_CHANGED_EVENT, method: ACCOUNT_CHANGED_EVENT, response: { evmAddress: address, nativeAddress: nativeAddress } })
  //           }
  //         })
  //       })

  //       return {
  //         error: false,
  //         data: dataToDispatch
  //       }
  //     }
  //     else {
  //       updateState(LABELS.NEW_ACCOUNT, dataToDispatch, false);
  //       return {
  //         error: false,
  //         data: dataToDispatch
  //       };
  //     }

  //   } catch (error) {
  //     console.log("error occured while creating new account ", error);
  //     return {
  //       error: true,
  //       data: ERROR_MESSAGES.ERR_OCCURED,
  //     };
  //   }
  // };
  const validMnemonic = (data) => {
    const isValidMnemonic = mnemonicValidate(data);
    return isValidMnemonic;
  }

  const validateAddress = async (address) => {
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
  // const walletSignUp = () => {

  // const importAccount = (data) => {
  //   try {
  //     const SS58Prefix = 6;
  //     const isValidMnemonic = mnemonicValidate(data.key);

  //     if (isValidMnemonic) {
  //       // Create valid Substrate-compatible seed from mnemonic
  //       const seedAlice = mnemonicToMiniSecret(data.key);

  //       // Generate new public/secret keypair for Alice from the supplied seed
  //       const { publicKey } = ed25519PairFromSeed(seedAlice);

  //       const nativeAddress = encodeAddress(
  //         decodeAddress(publicKey, SS58Prefix)
  //       );
  //       const { address } = ethers.Wallet.fromMnemonic(data.key);

  //       const id = allAccounts.length + 1;
  //       let temp1m = data.key;

  //       const dataToDispatch = {
  //         id,
  //         temp1m,
  //         nativeAddress,
  //         accountName: data.accName.trim(),
  //         evmAddress: address,
  //       };

  //       if (isLogin) {
  //         dataToDispatch.temp1m = encryptor(data.key, pass);
  //         updateState(LABELS.ALL_ACCOUNTS, [...allAccounts, dataToDispatch]);

  //         const currentAccountDetails = {
  //           index: allAccounts.length,
  //           accountName: data.accName,
  //         }

  //         updateState(LABELS.TX_HISTORY, { ...txHistory, [data.accName.trim()]: [] });
  //         updateState(LABELS.CURRENT_ACCOUNT, currentAccountDetails);
  //         updateState(LABELS.ACCOUNT_NAME, null);

  //       } else {
  //         updateState(LABELS.NEW_ACCOUNT, dataToDispatch, false);
  //         // updateState(LABELS.ACCOUNT_NAME, null);
  //       }

  //       //when new keypair created or imported the old key key emit the account change event
  //       getCurrentTabUId((id) => {
  //         getCurrentTabUrl((url) => {
  //           if (!(url === "chrome://extensions")) {
  //             Browser.tabs.sendMessage(id, { id: ACCOUNT_CHANGED_EVENT, method: ACCOUNT_CHANGED_EVENT, response: { evmAddress: address, nativeAddress: nativeAddress } })
  //           }
  //         })
  //       })

  //       return {
  //         error: false,
  //         data: "success",
  //       };
  //     } else return {
  //       error: true,
  //       data: ERROR_MESSAGES.INVALID_MNEMONIC,
  //     };
  //   } catch (error) {
  //     console.log("Error while importing : ", error);
  //     return {
  //       error: true,
  //       data: ERROR_MESSAGES.ERR_OCCURED,
  //     };
  //   }
  // };


  return {
    validMnemonic,
    validateAddress,
    // getKey,
    // walletSignUp,
    // importAccount,
  };
}