import { userState } from "./initialState";
import { createContext, useState } from "react";
import { isManifestV3 } from "../Scripts/utils";
import { localStorage, sessionStorage } from "../Storage";

export const AuthContext = createContext();


export default function Context({ children }) {
  const [state, setState] = useState(userState);

  const updateState = (name, data, toLocal = true, toSession = false) => {
    if (toLocal) {
      const dataToSet = {
        ...state,
        [name]: data
      }
      localStorage.set({ state: dataToSet });
    }

    if (toSession) {
      if (isManifestV3) {
        console.log("Setting to Session storage : ",{ [name]: data });
        sessionStorage.set({ [name]: data });
      } else {
        localStorage.set({ [name]: data });
      }
      sessionStorage.set({ [name]: data });
    }
    setState(p => ({ ...p, [name]: data }));
  };

  const setTxHistory = (accName, data) => {

      let dataToSet = {}
    if (state.txHistory[state.currentAccount.accountName]) {
      setState(p => {
        return {
          ...p,
          txHistory: p.txHistory[accName].push(data)
        }
      });
      dataToSet = {
        ...state,
        txHistory: state.txHistory[accName].push(data)
      }
    } else {
      setState(p => {
        return {
          ...p,
          txHistory: {
            ...p.txHistory,
            [accName] : data
          }
        }
      });
      dataToSet = {
        ...state,
        txHistory: {
          ...state.txHistory,
          [accName] : [data]
        }
      }
    }
    
    localStorage.set({ state: dataToSet });

  }


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
