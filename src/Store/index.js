import { userState } from "./initialState";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useState, useEffect } from "react";
import { sessionStorage, localStorage } from "../Storage";
import { getDataLocal, getDataSession } from "../Storage/loadstore";
import { sendRuntimeMessage, bindRuntimeMessageListener } from "../Utility/message_helper";
import { MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS,STORAGE} from "../Constants";
import { isEqual, log } from "../Utility/utility";
import Browser from "webextension-polyfill";

export const AuthContext = createContext();


export default function Context({ children }) {
  const [state, setState] = useState(userState);

  useEffect(() => {
    setInterval(() => {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.BALANCE, {})
    }, 8000);

  }, []);


  Browser.storage.onChanged.addListener((changedData, area) => {
    if(area === STORAGE.LOCAL){
      //change the state whenever the local storage is updated
       setState(changedData.state.newValue)
    }
  })


   //bind the message from background event
   bindRuntimeMessageListener((message) => {
    if(message.type === MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND) {
      
    }
  })
  
  // const updateBalance = (balanceState) => {
  //   if(isEqual(balanceState.totalBalance, state.balance.totalBalance)) return;
  //   setState(prev => {return {...prev, balance: balanceState}})
  // };


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
