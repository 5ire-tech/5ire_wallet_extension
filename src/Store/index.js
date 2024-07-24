import { ROUTES } from "../Routes/index";
import Browser from "webextension-polyfill";
import { useNavigate } from "react-router-dom";
import { isManifestV3 } from "../Scripts/utils";
import { createContext, useState } from "react";
import { isNullorUndef } from "../Utility/utility";
import { sessionStorage, localStorage } from "../Storage";
import { sendEventToTab, setTimer } from "../Helper/helper";
import { TabMessagePayload } from "../Utility/network_calls";
import { bindRuntimeMessageListener } from "../Utility/message_helper";
import {
  LABELS,
  DECIMALS,
  TABS_EVENT,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../Constants";
import {
  userState,
  externalControls,
  windowAndTabState,
  newAccountInitialState,
  initialExternalNativeTransaction
} from "./initialState";

//context created
export const AuthContext = createContext();

//main context wraper
export default function Context({ children }) {
  const navigate = useNavigate();
  const [edValue, setEDValue] = useState(1);
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
  const [showCongratLoader, setShowCongratLoader] = useState(false);
  const [newAccount, setNewAccount] = useState(newAccountInitialState);
  const [externalControlsState, setExternalControlState] = useState(externalControls);

  //for check if localstate is loaded or not
  const [isStateLoaded, setStateLoaded] = useState(false);

  //background error's
  const [backgroundError, setBackgroundError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [valdatorNominatorFee, setValdatorNominatorFee] = useState(null);
  const [tempBalance, setTempBalance] = useState({
    evmBalance: 0,
    nativeBalance: 0
  });
  const [externalNativeTxDetails, setExternalNativeTxDetails] = useState(
    initialExternalNativeTransaction
  );
  const [windowAndTab, setWindowAndTab] = useState(windowAndTabState);

  Browser.storage.local.onChanged.addListener((changedData) => {
    //change the state whenever the local storage is updated
    !isNullorUndef(changedData?.state) && setState(changedData.state.newValue);
    !isNullorUndef(changedData?.externalControls) &&
      setExternalControlState(changedData.externalControls.newValue);
    !isNullorUndef(changedData?.windowAndTabState) &&
      setWindowAndTab(changedData.windowAndTabState.newValue);
  });

  //bind the message from background event
  bindRuntimeMessageListener((message) => {
    if (message.type === MESSAGE_TYPE_LABELS.EXTENSION_BACKGROUND) {
      switch (message.event) {
        case MESSAGE_EVENT_LABELS.EVM_FEE:
        case MESSAGE_EVENT_LABELS.NATIVE_FEE:
          Number(message.data.fee) !== Number(estimatedGas) && updateEstimatedGas(message.data.fee);
          setTimer(updateLoading.bind(null, false));
          break;

        case MESSAGE_EVENT_LABELS.EXTERNAL_NATIVE_TRANSACTION_ARGS_AND_GAS:
          setExternalNativeTxDetails(message.data);
          setTimer(updateLoading.bind(null, false));
          break;

        case MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE:
          createOrRestore(message.data);
          break;

        case MESSAGE_EVENT_LABELS.UNLOCK:
          unlock(message.data);
          break;

        case MESSAGE_EVENT_LABELS.ADD_ACCOUNT:
          addAccount(message.data);
          break;

        case MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC:
          importAccountByMnemonics(message.data);
          break;

        case MESSAGE_EVENT_LABELS.GET_ACCOUNTS:
          getAccounts(message.data);
          break;

        case MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD:
          verifyUserPassword(message.data);
          break;

        case MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY:
          exportPrivatekey(message.data);
          break;

        case MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE:
          exportSeedPhrase(message.data);
          break;

        case MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT:
          removeAccount(message.data);
          break;

        case MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_FEE:
          setValdatorNominatorFee(message.data);
          setTimer(updateLoading.bind(null, false));
          break;

        case MESSAGE_EVENT_LABELS.BACKGROUND_ERROR:
          setBackgroundError(message.data);
          setTimer(updateLoading.bind(null, false));
          break;

        case MESSAGE_EVENT_LABELS.NETWORK_CONNECTION_ERROR:
          setNetworkError(message.data);
          setTimer(updateLoading.bind(null, false));
          break;

        case MESSAGE_EVENT_LABELS.NETWORK_CHECK:
          setTimer(updateLoading.bind(null, false));
          break;
        case MESSAGE_EVENT_LABELS.GET_ED:
          setEDValue(
            Number(
              Number(message?.data?.ed / DECIMALS)
                .noExponents()
                .toString()
            )
          );
          break;

        default:
          break;
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
    Number(latestEstimatedGas) !== Number(estimatedGas) && setEstimatedGas(latestEstimatedGas);
  };

  //set Loading
  const updateLoading = (loading) => {
    setLoading(loading);
  };

  //update the main state (also update into the persistant store)
  const updateState = (name, data, _, toSession = false) => {
    if (toSession) {
      if (isManifestV3) {
        sessionStorage.set({ [name]: data });
      } else {
        localStorage.set({ [name]: data });
      }
    }

    setState((p) => {
      const dataToSet = {
        ...p,
        [name]: data
      };

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
      setShowCongratLoader(true);
      setTimeout(() => {
        navigate(ROUTES.WALLET);
        setShowCongratLoader(false);
      }, 2000);
      sendEventToTab(
        windowAndTab,
        new TabMessagePayload(
          TABS_EVENT.ACCOUNT_CHANGE_EVENT,
          {
            result: {
              evmAddress: data?.newAccount?.evmAddress,
              nativeAddress: data?.newAccount?.nativeAddress
            }
          },
          null,
          TABS_EVENT.ACCOUNT_CHANGE_EVENT
        ),
        externalControlsState.connectedApps
      );
    } else if (data?.errCode === 3) {
      setInputError(data?.errMessage ? data.errMessage : "");
      setShowCongratLoader(false);
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
    //send account details whenever account is changed
    sendEventToTab(
      windowAndTab,
      new TabMessagePayload(
        TABS_EVENT.ACCOUNT_CHANGE_EVENT,
        {
          result: {
            evmAddress: data?.newAccount?.evmAddress,
            nativeAddress: data?.newAccount?.nativeAddress
          }
        },
        null,
        TABS_EVENT.ACCOUNT_CHANGE_EVENT
      ),
      externalControlsState.connectedApps
    );
  };

  const getAccounts = (data) => {
    setAllAccounts(data?.accounts ? data.accounts : data);
  };

  const verifyUserPassword = (data) => {
    if (data?.errCode === 3) {
      setInputError(data?.errMessage ? data?.errMessage : "");
    }
    setPassVerified(data?.verified ? true : false);
  };

  const exportPrivatekey = (data) => {
    setPrivateKey(data?.privateKey);
  };

  const exportSeedPhrase = (data) => {
    setSeedPhrase(data?.seedPhrase);
  };

  const removeAccount = (data) => {
    const { accounts, isInitialAccount } = data;
    setNewAccount(newAccountInitialState);
    setAllAccounts(accounts);
    if (isInitialAccount) {
      navigate(ROUTES.DEFAULT);
    }
  };

  const values = {
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
    windowAndTab,
    passVerified,
    isStateLoaded,
    newWalletName,
    backgroundError,
    showCongratLoader,
    valdatorNominatorFee,
    externalControlsState,
    externalNativeTxDetails,
    edValue,

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
    setTempBalance,
    setStateLoaded,
    setWindowAndTab,
    setNetworkError,
    setPassVerified,
    setNewWalletName,
    setBackgroundError,
    updateEstimatedGas,
    setShowCongratLoader,
    setValdatorNominatorFee,
    setExternalControlState,
    importAccountByMnemonics,
    setExternalNativeTxDetails,
    setEDValue
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}
