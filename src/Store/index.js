import { ROUTES } from "../Routes/index";
import Browser from "webextension-polyfill";
import { useNavigate } from "react-router-dom";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useEffect, useState } from "react";
import { isNullorUndef, log } from "../Utility/utility";
import { sessionStorage, localStorage } from "../Storage";
import { bindRuntimeMessageListener } from "../Utility/message_helper";
import {
  LABELS,
  TABS_EVENT,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
} from "../Constants";
import {
  userState,
  externalControls,
  newAccountInitialState,
  initialExternalNativeTransaction,
  transactionQueue
} from "./initialState";
import { sendEventToTab, setTimer } from "../Helper/helper";
import { TabMessagePayload } from "../Utility/network_calls";

//context created
export const AuthContext = createContext();

//main context wraper
export default function Context({ children }) {

  const navigate = useNavigate();
  const [state, setState] = useState(userState);
  const [userPass, setUserPass] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [accountName, setAccName] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [detailsPage, setDetailsPage] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [newWalletName, setNewWalletName] = useState("");
  const [passVerified, setPassVerified] = useState(false);
  const [newAccount, setNewAccount] = useState(newAccountInitialState);
  const [externalControlsState, setExternalControlState] = useState(externalControls);
  const [showCongratLoader, setShowCongratLoader] = useState(false);
  
  //transaction queue
  // const [transactionQueues, setTransactionQueues] = useState(transactionQueue);
  const [pendingBalance, setPendingBalance] = useState(0);

  const [isStateLoaded, setStateLoaded] = useState(false);
  
  
  //background error's
  const [backgroundError, setBackgroundError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [valdatorNominatorFee, setValdatorNominatorFee] = useState(null);
  const [tempBalance, setTempBalance] = useState({ evmBalance: 0, nativeBalance: 0 });
  const [externalNativeTxDetails, setExternalNativeTxDetails] = useState(initialExternalNativeTransaction);


  Browser.storage.local.onChanged.addListener((changedData) => {
    //change the state whenever the local storage is updated
    !isNullorUndef(changedData?.state) && setState(changedData.state.newValue);
    !isNullorUndef(changedData?.externalControls) && setExternalControlState(changedData.externalControls.newValue);
  })


  //bind the message from background event
  bindRuntimeMessageListener((message) => {

    if (message.type === MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND) {
      if (message.event === MESSAGE_EVENT_LABELS.EVM_FEE ||
        message.event === MESSAGE_EVENT_LABELS.NATIVE_FEE
      ) {
        (!estimatedGas) && updateEstimatedGas(message.data.fee);
        setTimer(updateLoading.bind(null, false));
      } else if (message.event === MESSAGE_EVENT_LABELS.EXTERNAL_NATIVE_TRANSACTION_ARGS_AND_GAS) {
        setExternalNativeTxDetails(message.data);
        setTimer(updateLoading.bind(null, false));
      } else if (message.event === MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE) {
        createOrRestore(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.UNLOCK) {
        unlock(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.ADD_ACCOUNT) {
        addAccount(message.data);
        //send account details whenever account is changed
        sendEventToTab(new TabMessagePayload(TABS_EVENT.ACCOUNT_CHANGE_EVENT, { result: { evmAddress: state.currentAccount.evmAddress, nativeAddress: state.currentAccount.nativeAddress } }, null, TABS_EVENT.ACCOUNT_CHANGE_EVENT), externalControlsState.connectedApps);
      } else if (message.event === MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC) {
        importAccountByMnemonics(message.data);
        //send account details whenever account is changed
        sendEventToTab(new TabMessagePayload(TABS_EVENT.ACCOUNT_CHANGE_EVENT, { result: { evmAddress: state.currentAccount.evmAddress, nativeAddress: state.currentAccount.nativeAddress } }, null, TABS_EVENT.ACCOUNT_CHANGE_EVENT), externalControlsState.connectedApps);
      } else if (message.event === MESSAGE_EVENT_LABELS.GET_ACCOUNTS) {
        getAccounts(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD) {
        verifyUserPassword(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY) {
        exportPrivatekey(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE) {
        exportSeedPhrase(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT) {
        removeAccount(message.data);
      } else if (message.event === MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_FEE) {
        setValdatorNominatorFee(message.data)
        setTimer(updateLoading.bind(null, false));
      } else if (message.event === MESSAGE_EVENT_LABELS.BACKGROUND_ERROR) {
        setBackgroundError(message.data);
        setTimer(updateLoading.bind(null, false));
      } else if(message.event === MESSAGE_EVENT_LABELS.NETWORK_CONNECTION_ERROR) {
        setNetworkError(message.data);
        setTimer(updateLoading.bind(null, false));
      } else if(message.event === MESSAGE_EVENT_LABELS.NETWORK_CHECK) {
        setTimer(updateLoading.bind(null, false));
      }
    }
  });


  /********************************state update handler**************************************/
  //handle the transaction queue and blocked pending balance
  // const handleTheTransacionQueueChange = (transactionQueue) => {
  //   log("here is transaction queue: ", transactionQueue);
  // }

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
      navigate(ROUTES.NEW_WALLET_DETAILS);
    }
  };

  // set the new Account
  const importAccountByMnemonics = (data) => {
    if (data?.vault && data?.newAccount) {
      setShowCongratLoader(true)
      setTimeout(() => {
        navigate(ROUTES.WALLET);
        setShowCongratLoader(false)

      }, 2000)

    } else if (data?.errCode === 3) {
      setInputError(data?.errMessage ? data.errMessage : "");
      setShowCongratLoader(false)
    }
  };



  const unlock = (data) => {
    if (data?.errMessage) {
      setInputError(data.errMessage);
    } else {
      // setPassVerified(data?.verified ? true : false);
      updateState(LABELS.ISLOGIN, data.isLogin, true, true);
    }

  };

  const addAccount = (data) => {
    setNewAccount(data?.newAccount);
    // navigate(ROUTES.NEW_WALLET_DETAILS);
  };

  const getAccounts = (data) => {

    setAllAccounts(data?.accounts ? data.accounts : data);
  };

  const verifyUserPassword = (data) => {
    if (data?.errCode === 3) {
      setInputError(data?.errMessage ? data?.errMessage : "");
    }
    setPassVerified(data?.verified ? true : false);
  }

  const exportPrivatekey = (data) => {
    setPrivateKey(data?.privateKey);
  }

  const exportSeedPhrase = (data) => {
    setSeedPhrase(data?.seedPhrase);
  }

  // remove entries of history of specific account from TxHistory
  // const removeHistory = (accName) => {
  //   const newTx = { ...state.txHistory };
  //   delete newTx[accName];
  //   updateState(LABELS.TX_HISTORY, newTx)
  // }


  const removeAccount = (data) => {
    const { accounts, isInitialAccount } = data;
    setNewAccount(newAccountInitialState);
    setAllAccounts(accounts);
    if (isInitialAccount) {
      navigate(ROUTES.DEFAULT)
    }

  }


  const values = {
    //data
    state,
    userPass,
    isLoading,
    inputError,
    newAccount,
    privateKey,
    seedPhrase,
    detailsPage,
    tempBalance,
    allAccounts,
    accountName,
    networkError,
    estimatedGas,
    passVerified,
    isStateLoaded,
    newWalletName,
    pendingBalance,
    backgroundError,
    // transactionQueues,
    showCongratLoader,
    valdatorNominatorFee,
    externalControlsState,
    externalNativeTxDetails,

    //data setters
    setState,
    setAccName,
    setUserPass,
    updateState,
    setInputError,
    setDetailsPage,
    updateLoading,
    setNewAccount,
    setPrivateKey,
    setStateLoaded,
    setTempBalance,
    // removeHistory,
    setNetworkError,
    setPassVerified,
    setNewWalletName,
    setPendingBalance,
    setBackgroundError,
    updateEstimatedGas,
    // setTransactionQueues,
    setShowCongratLoader,
    setValdatorNominatorFee,
    setExternalControlState,
    importAccountByMnemonics,
    setExternalNativeTxDetails,
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}