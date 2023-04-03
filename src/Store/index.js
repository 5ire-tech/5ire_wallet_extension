import { log } from "../Utility/utility";
import Browser from "webextension-polyfill";
import { userState } from "./initialState";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useState } from "react";
import { sessionStorage, localStorage } from "../Storage";
// import { getDataLocal, getDataSession } from "../Storage/loadstore";
import {  bindRuntimeMessageListener } from "../Utility/message_helper";
import { MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS,STORAGE} from "../Constants";

export const AuthContext = createContext();


export default function Context({ children }) {
  const [state, setState] = useState(userState);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [isLoading, setLoading] = useState(false);


  Browser.storage.onChanged.addListener((changedData, area) => {
    if(area === STORAGE.LOCAL){
      //change the state whenever the local storage is updated
       setState(changedData.state.newValue)
    }
  })


   //bind the message from background event
   bindRuntimeMessageListener((message) => {
    log("message from the background script: ", message);
    if(message.type === MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND) {
      if(message.event === MESSAGE_EVENT_LABELS.EVM_FEE || message.event === MESSAGE_EVENT_LABELS.NATIVE_FEE) {
        (!estimatedGas) && updateEstimatedGas(message.data.fee);
      }
      updateLoading(false);
    }
  })

  
  /********************************state update handler**************************************/
  //set the evm fee
  const updateEstimatedGas = (latestEstimatedGas) => {
    (latestEstimatedGas !== estimatedGas) && setEstimatedGas(latestEstimatedGas)
  }

  //set Loading
  const updateLoading = (loading) => {
    setLoading(loading)
  } 

  //update the main state (also update into the persistant store)
  const updateState = (name, data, toLocal = true, toSession = false) => {

    if (toSession) {
      if (isManifestV3) {
        sessionStorage.set({ [name]: data });
      } else {
        localStorage.set({ [name]: data });
      }
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

  //set the tx history
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
    estimatedGas,
    isLoading,
    setState,
    updateState,
    setTxHistory,
    updateEstimatedGas,
    updateLoading
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}
