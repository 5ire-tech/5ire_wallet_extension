import bcrypt from "bcryptjs";
import { useSelector, useDispatch } from "react-redux";
import {
  setLogin,
  setPassword,
  setCurrentAcc,
  pushAccounts,
  setNewAccount,
} from "../Utility/redux_helper";
import { encryptor } from "../Helper/CryptoHelper";
import Browser from "webextension-polyfill";
import { isManifestV3 } from "../Scripts/utils";

export default function useAuth() {
  const { pass, newAccount } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const setUserPass = (p) => {
    return new Promise(async (resolve) => {
      try {
        var salt = bcrypt.genSaltSync(10);
        let hash;

        if (salt) {
          hash = bcrypt.hashSync(p, salt);
          if (hash) {
            let temp1m = encryptor(newAccount?.temp1m, hash);
            let dataToDispatch = {
              ...newAccount,
              temp1m,
              temp2p: null,
            };

            dispatch(setPassword(hash));
            dispatch(setNewAccount(null));
            dispatch(setCurrentAcc(dataToDispatch));
            dispatch(pushAccounts(dataToDispatch));
            if (isManifestV3) {
              await Browser.storage.session.set({ login: true });
            } else {
              await Browser.storage.local.set({ login: true });
            }
            resolve({
              error: false,
              data: "Successfully created password for user!",
            });
          } else throw new Error("Error while setting up password for user!");
        } else throw new Error("Error while setting up password for user!");
      } catch (error) {
        // console.log("Error : ", error);
        resolve({
          error: true,
          data: "Error occured!",
        });
      }
    });
  };

  const verifyPass = async (p) => {
    try {
      let res = bcrypt.compareSync(p, pass);

      if (res) {
        if (isManifestV3) {
          await Browser.storage.session.set({ login: true });
        } else {
          await Browser.storage.local.set({ login: true });
        } 

        return {
          error: false,
          data: "Login successfully!",
        };
      } else {
        return {
          error: true,
          data: "Incorrect password!",
        };
      }
    } catch (error) {
      // console.log("Error : ", error);
      return {
        error: true,
        data: "Error Occured!",
      };
    }
  };

  const logout = async () => {
    try {
      if (isManifestV3) {
        // console.log("REMOVING LOGOUT FOR MANIFESTV3");
        await Browser.storage.session.remove(["login"]);
      } else {
        await Browser.storage.local.remove(["login"]);
      }
      dispatch(setLogin(false));

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
