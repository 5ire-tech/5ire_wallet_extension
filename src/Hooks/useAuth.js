import bcrypt from "bcryptjs";
import { useContext } from "react";
import { AuthContext } from "../Store";
import Browser from "webextension-polyfill";
import { isManifestV3 } from "../Scripts/utils";
import { encryptor } from "../Helper/CryptoHelper";
import { LABELS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../Constants/index";

export default function useAuth() {
  const { state, updateState } = useContext(AuthContext);
  const { allAccounts, newAccount, txHistory } = state;

  const setUserPass = (p) => {
    return new Promise(async (resolve) => {
      try {
        var salt = bcrypt.genSaltSync(10);
        let hash;

        if (salt) {
          hash = bcrypt.hashSync(p, salt);
          if (hash) {
            const temp1m = encryptor(newAccount?.temp1m, hash);

            const dataToDispatch = {
              ...newAccount,
              temp1m,
              temp2p: null
            };

            const currentAccountDetails = {
              index: allAccounts.length,
              accountName: newAccount.accountName
            };

            updateState(LABELS.PASS, hash);
            updateState(LABELS.NEW_ACCOUNT, null);
            updateState(LABELS.TX_HISTORY, { ...txHistory, [newAccount.evmAddress]: [] });
            updateState(LABELS.ALL_ACCOUNTS, [...allAccounts, dataToDispatch]);
            updateState(LABELS.CURRENT_ACCOUNT, currentAccountDetails);
            updateState(LABELS.ISLOGIN, true, true, true);

            resolve({
              error: false,
              data: SUCCESS_MESSAGES.PASS_CREATED_SUCCESS
            });
          } else throw new Error();
        } else throw new Error();
      } catch (error) {
        console.log("Error while settig user Pass : ", error);
        resolve({
          error: true,
          data: ERROR_MESSAGES.ERR_OCCURED
        });
      }
    });
  };

  const verifyPass = async (pass, hash) => {
    try {
      let res = bcrypt.compareSync(pass, hash);

      if (res) {
        if (isManifestV3) {
          await Browser.storage.session.set({ login: true });
        } else {
          await Browser.storage.local.set({ login: true });
        }

        return {
          error: false,
          data: SUCCESS_MESSAGES.LOGIN_SUCCESS
        };
      } else {
        return {
          error: true,
          data: ERROR_MESSAGES.INCORRECT_PASS
        };
      }
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: ERROR_MESSAGES.ERR_OCCURED
      };
    }
  };

  const logout = async () => {
    try {
      updateState(LABELS.ISLOGIN, false, true, true);

      return {
        error: false,
        data: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      };
    } catch (error) {
      console.log("Error  while logging out: ", error);
      return {
        error: false,
        data: ERROR_MESSAGES.LOGOUT_ERR
      };
    }
  };

  return {
    verifyPass,
    setUserPass,
    logout
  };
}
