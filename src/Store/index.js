import { createContext, useEffect, useReducer, useState } from "react";
import Browser from "webextension-polyfill";
import { localStorage } from "../Storage";
import { userState } from "./initialState";
import { sendRuntimeMessage } from "../Utility/message_helper";
import { LABELS, MESSAGE_EVENT_LABELS } from "../Constants";

export const AuthContext = createContext();


export default function Context({ children }) {

  const [state, setState] = useState(userState);

  // Browser.runtime.onMessage.addListener((message) => {
  //   console.log(message);
  // })

  sendRuntimeMessage(LABELS.EXTENSIONUI, MESSAGE_EVENT_LABELS.BALANCE, null);

  const updateState = (name, data, toLocal = true) => {
    setState(p => ({ ...p, [name]: data }));
  };


  const values = {
    state,
    setState,
    updateState
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}
