import { log } from "../Utility/utility";
import Browser from "webextension-polyfill";
import { userState, newAccountInitialState } from "./initialState";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useState } from "react";
import { sessionStorage, localStorage } from "../Storage";
// import { getDataLocal, getDataSession } from "../Storage/loadstore";
import { bindRuntimeMessageListener } from "../Utility/message_helper";
import { MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS, STORAGE, LABELS } from "../Constants";

export const AuthContext = createContext();


export default function Context({ children }) {
  const [state, setState] = useState(userState);
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


  Browser.storage.onChanged.addListener((changedData, area) => {
    if (area === STORAGE.LOCAL) {
      //change the state whenever the local storage is updated
      setState(changedData.state.newValue)
    }
  });


  //bind the message from background event
  bindRuntimeMessageListener((message) => {
    log("message from the background script: ", message);

    if (message.type === MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND) {
      if (
        message.event === MESSAGE_EVENT_LABELS.EVM_FEE ||
        message.event === MESSAGE_EVENT_LABELS.NATIVE_FEE
      ) {
        (!estimatedGas) && updateEstimatedGas(message.data.fee);

      } if (message.event === MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE) {
        createOrRestore(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.UNLOCK) {
        unlock(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC) {
        importAccountByMnemonics(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.ADD_ACCOUNT) {
        addAccount(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.GET_ACCOUNTS) {
        getAccounts(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.LOCK) {
        lock(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD) {
        verifyUserPassword(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY) {
        exportPrivatekey(message.data);
      } if (message.event === MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE) {
        exportSeedPhrase(message.data);
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
    //todo
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

  // set the new Account
  const createOrRestore = (data) => {

    console.log("Changing New account .... ", data);
    const { vault, newAccount } = data;

    setNewAccount(newAccount);

    updateState(
      LABELS.CURRENT_ACCOUNT,
      {
        evmAddress: newAccount.evmAddress,
        accountName: newAccount.accountName,
        accountIndex: newAccount.accountIndex,
        nativeAddress: newAccount.nativeAddress,
      });

    updateState(LABELS.VAULT, vault);

    //todo
    updateState(LABELS.ISLOGIN, true, true, true);
  };


  const importAccountByMnemonics = (data) => {
    console.log("Changing current account .... ", data);
    const { newAccount, vault } = data;
    updateState(LABELS.CURRENT_ACCOUNT, newAccount);
    updateState(LABELS.VAULT, vault);
  };

  const unlock = (data) => {

    console.log("Response in parseKeyring  :", data);

    if (data?.errMessage) {
      setPassError(data.errMessage);
    } else {
      // setPassVerified(data?.verified ? true : false);
      updateState(LABELS.ISLOGIN, data.isLogin);
    }

  };


  const addAccount = (data) => {

    console.log("Changing New accunt State  .... ", data);

    const { newAccount, vault } = data;

    setNewAccount(newAccount);

    updateState(LABELS.CURRENT_ACCOUNT, {
      evmAddress: newAccount.evmAddress,
      nativeAddress: newAccount.nativeAddress,
      accountName: newAccount.accountName,
      accountIndex: newAccount.accountIndex,
    });

    updateState(LABELS.VAULT, vault);

  };

  const getAccounts = (data) => {
    console.log("Accounts data.... ", data);
    setAllAccounts(data);
  };

  const lock = (data) => {
    console.log("Locked state : ", data);
    updateState(LABELS.ISLOGIN, data.isLogin);
  }

  const verifyUserPassword = (data) => {
    console.log("Data VerifuPass : ", data);
    setPassError(data?.errMessage ? data?.errMessage : "");
    setPassVerified(data?.verified ? true : false);
  }

  const exportPrivatekey = (data) => {
    console.log("Data Export Private Key : ", data);
    setPrivateKey(data?.privateKey);
  }

  const exportSeedPhrase = (data) => {
    console.log("Data Export Seed phrase : ", data);
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
    setTxHistory,
    updateLoading,
    setNewAccount,
    setPrivateKey,
    setPassVerified,
    updateEstimatedGas,
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}
