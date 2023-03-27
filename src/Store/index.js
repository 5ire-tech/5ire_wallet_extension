import { LABELS } from "../Constants";
import { userState } from "./initialState";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useState, useEffect } from "react";
import { sessionStorage, localStorage } from "../Storage";
import { getDataLocal, getDataSession } from "../Storage/loadstore";

export const AuthContext = createContext();


export default function Context({ children }) {
  const [state, setState] = useState(userState);

  // useEffect(() => {
  //   (async () => {

  //     //inject the current state into main app
  //     const localState = await getDataLocal(LABELS.STATE);
  //     const loginState = await getDataSession(LABELS.ISLOGIN);

  //     console.log("Current local state before: ", localState);
  //     if (localState) {
  //       localState.isLogin = !loginState?.isLogin ? false : localState.isLogin
  //     }
  //     console.log("Current local state after: ", localState);

  //     setState(localState);

  //   })();
  // }, []);

  const updateState = (name, data, toLocal = true, toSession = false) => {

    if (toSession) {
      if (isManifestV3) {
        sessionStorage.set({ [name]: data });
      } else {
        localStorage.set({ [name]: data });
      }
      sessionStorage.set({ [name]: data });
    }

    setState(p => {
      const dataToSet = {
        ...p,
        [name]: data
      }
      localStorage.set({ state : dataToSet });

      return dataToSet;
    });
  };

  const setTxHistory = (accName, data) => {

    let dataToSet = {};

    if (state.txHistory[state.currentAccount.accountName]) {
      setState(p => {
        dataToSet = {
          ...p,
          txHistory: p.txHistory[accName].push(data)
        }
        return dataToSet;
      });

    } else {
      setState(p => {
        dataToSet = {
          ...p,
          txHistory: {
            ...p.txHistory,
            [accName]: [data]
          }
        }
        return dataToSet;
      });
    }

    localStorage.set({ state: dataToSet });

  };


  const values = {
    state,
    setState,
    updateState,
    setTxHistory
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}
