import Browser from "webextension-polyfill";
import { userState, newAccountInitialState, externalControls } from "./initialState";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useState } from "react";
import { sessionStorage, localStorage } from "../Storage";
import { sendRuntimeMessage, bindRuntimeMessageListener } from "../Utility/message_helper";
import { MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS, STORAGE, LABELS } from "../Constants";
import { isNullorUndef, log } from "../Utility/utility";



export const AuthContext = createContext();

export default function Context({ children }) {
  const [state, setState] = useState(userState);
  const [externalControlsState, setExternalControlState] = useState(externalControls)
  const [passError, setPassError] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [passVerified, setPassVerified] = useState(false);
  const [allAccounts, setAllAccounts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [userPass, setUserPass] = useState(null);
  const [accountName, setAccName] = useState(null);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [newAccount, setNewAccount] = useState(newAccountInitialState);


  Browser.storage.local.onChanged.addListener((changedData) => {

    // console.log("changed the storage: ", changedData);
    //change the state whenever the local storage is updated
    !isNullorUndef(changedData?.state) && setState(changedData.state.newValue);
    !isNullorUndef(changedData?.externalControls) && setExternalControlState(changedData.externalControls.newValue);
  })


  //bind the message from background event
  bindRuntimeMessageListener((message) => {

    if (message.type === MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND) {
      if (message.event === MESSAGE_EVENT_LABELS.EVM_FEE || message.event === MESSAGE_EVENT_LABELS.NATIVE_FEE) {
        (!estimatedGas) && updateEstimatedGas(message.data.fee);

      } else if (message.event === MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE) {
        createOrRestore(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.UNLOCK) {
        unlock(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.ADD_ACCOUNT) {
        addAccount(message.data);
      } else if (
        message.event === MESSAGE_EVENT_LABELS.GET_ACCOUNTS ||
        message.event === MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT
      ) {
        getAccounts(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD) {
        verifyUserPassword(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY) {
        exportPrivatekey(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE) {
        exportSeedPhrase(message.data);
      }

      //  if (message.event === MESSAGE_EVENT_LABELS.LOCK) {
      //   lock(message.data);
      // } 
      //  if (message.event === MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC) {
      //   importAccountByMnemonics(message.data);
      // } 

      updateLoading(false);
    }
  });


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


    log("state updated by updateState: ", name, data)


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

      localStorage.set({ state: dataToSet });
      return dataToSet;
    });
  };

  // set the new Account
  const createOrRestore = (data) => {
  
    if (data?.type === "create") {
      setNewAccount(data.newAccount);
    }
  };

  const unlock = (data) => {
    if (data?.errMessage) {
      setPassError(data.errMessage);
    } else {
      // setPassVerified(data?.verified ? true : false);
      updateState(LABELS.ISLOGIN, data.isLogin, true, true);
    }

  };

  const addAccount = (data) => {
    setNewAccount(data.newAccount);
  };

  const getAccounts = (data) => {
    // console.log("Data : ", data);
    setAllAccounts(data?.accounts ? data.accounts : data);
  };

  const verifyUserPassword = (data) => {
    if (data?.errCode === 3) {
      setPassError(data?.errMessage ? data?.errMessage : "");
    }
    setPassVerified(data?.verified ? true : false);
  }

  const exportPrivatekey = (data) => {
    setPrivateKey(data?.privateKey);
  }

  const exportSeedPhrase = (data) => {
    setSeedPhrase(data?.seedPhrase);
  }


  const values = {
    state,
    userPass,
    passError,
    isLoading,
    newAccount,
    privateKey,
    seedPhrase,
    allAccounts,
    accountName,
    estimatedGas,
    passVerified,

    setState,
    setAccName,
    setUserPass,
    updateState,
    setPassError,
    updateLoading,
    setNewAccount,
    setPrivateKey,
    setPassVerified,
    updateEstimatedGas,
    externalControlsState,
    setExternalControlState
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}