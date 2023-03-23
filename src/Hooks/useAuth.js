import bcrypt from "bcryptjs";
import {useContext} from "react";
import { AuthContext } from "../Store";
import {LABELS} from "../Constants/index";
import Browser from "webextension-polyfill";
import { isManifestV3 } from "../Scripts/utils";
import { encryptor } from "../Helper/CryptoHelper";

export default function useAuth() {
  const {state, updateState} = useContext(AuthContext);
  const { allAccounts, newAccount } = state;

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
              temp2p: null,
            };

            const currentAccountDetails = {
              index : allAccounts.length,
              accountName : newAccount.accountName,          
            }

            updateState(LABELS.PASS, hash);
            updateState(LABELS.NEW_ACCOUNT,null);
            updateState(LABELS.ALL_ACCOUNTS, [...allAccounts, dataToDispatch]);
            updateState(LABELS.CURRENT_ACCOUNT,currentAccountDetails );
            updateState(LABELS.ISLOGIN,true);
            
            if (isManifestV3) {
              await Browser.storage.session.set({ login: true });
            } else {
              await Browser.storage.local.set({ login: true });
            }
            resolve({
              error: false,
              data: "Successfully created password for user.",
            });
          } else throw new Error("Error");
        } else throw new Error("Error");
      } catch (error) {
        resolve({
          error: true,
          data: "Error occured.",
        });
      }
    });
  };

  const verifyPass = async (p) => {
    try {
      let res = bcrypt.compareSync(p, LABELS.PASS);

      if (res) {
        if (isManifestV3) {
          await Browser.storage.session.set({ login: true });
        } else {
          await Browser.storage.local.set({ login: true });
        } 

        return {
          error: false,
          data: "Login successfully.",
        };
      } else {
        return {
          error: true,
          data: "Incorrect password.",
        };
      }
    } catch (error) {
      // console.log("Error : ", error);
      return {
        error: true,
        data: "Error Occured.",
      };
    }
  };

  const logout = async () => {
    try {
      if (isManifestV3) {
        await Browser.storage.session.remove(["login"]);
      } else {
        await Browser.storage.local.remove(["login"]);
      }
      // dispatch(setLogin(false));

      return {
        error: false,
        data: "Logout successfully!",
      };
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: false,
        data: "Error while logging out!",
      };
    }
  };

  return {
    verifyPass,
    setUserPass,
    logout,
  };
}
