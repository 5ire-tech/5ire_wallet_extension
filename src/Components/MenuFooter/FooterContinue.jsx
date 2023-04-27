import style from "./style.module.scss";
import { ROUTES } from "../../Routes";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import ButtonComp from "../ButtonComp/ButtonComp";
import { EVM_JSON_RPC_METHODS, LABELS, STATE_CHANGE_ACTIONS, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS, ERROR_MESSAGES, TX_TYPE, DECIMALS } from "../../Constants/index";
import React, { useContext, useEffect, useState } from "react";
import { newAccountInitialState } from "../../Store/initialState";
import { ExtensionStorageHandler } from "../../Storage/loadstore";
import { isEqual } from "../../Utility/utility";
import { sendMessageToTab, sendRuntimeMessage } from "../../Utility/message_helper";
import { TabMessagePayload } from "../../Utility/network_calls";
import { toast } from "react-toastify";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import BigNumber from "bignumber.js";


//Before We begin
function FooterStepOne() {
  const { state } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLogin } = state;

  const handleCancle = () => {
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  }

  const handleClick = () => {
    // navigate(ROUTES.NEW_WALLET_DETAILS);
    navigate(ROUTES.CREATE_WALLET);
  }

  return (
    <>
      <div className={`${style.menuItems__cancleContinue} ${style.beginStyle}`}>
        <ButtonComp
          onClick={handleClick}
          text={"Continue"}
          maxWidth={"100%"}
        />
        <ButtonComp
          onClick={handleCancle}
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
        />

      </div>
    </>
  );
}

//Footer of New wallet Detail Page
export const FooterStepTwo = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false)


  const { state, setNewAccount, newAccount, updateState } = useContext(AuthContext);

  const { txHistory, isLogin } = state;


  const handleCancle = async () => {

    console.log("IsLOGIN :::: ",isLogin);

    // if (isLogin) {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT, { address: newAccount.evmAddress });
    // }



  };

  const handleClick = () => {

    const currentAcc = {
      evmAddress: newAccount?.evmAddress,
      nativeAddress: newAccount?.nativeAddress,
      accountName: newAccount?.accountName,
      accountIndex: newAccount?.accountIndex,
    };

    const txHis = {
      ...txHistory,
      [newAccount?.accountName]: []
    };
    setShow(true)
    setTimeout(() => {
      setShow(false)
      updateState(LABELS.CURRENT_ACCOUNT, currentAcc);
      updateState(LABELS.TX_HISTORY, txHis);

      setNewAccount(newAccountInitialState);
      navigate(ROUTES.WALLET);
    }, 2000)


  };

  return (
    <>
      <div className={style.menuItems__cancleContinue}>

        <ButtonComp
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
          onClick={handleCancle}
        />

        <ButtonComp onClick={handleClick} text={"Continue"} maxWidth={"100%"} />
      </div>
      {show && <div className="loader">
        <CongratulationsScreen text={"Your wallet has been created"} /></div>}
    </>
  );
};


//approve the connection to pass the accounts
export const ApproveLogin = () => {
  const { state, externalControlsState } = useContext(AuthContext);
  const account = state.currentAccount;
  const { activeSession } = externalControlsState;
  const navigate = useNavigate();


  //handle the approval and reject click
  const handleClick = async (isApproved) => {

    if (isApproved) {
      //add the app into connected list
      await ExtensionStorageHandler.updateStorage(STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE, { connected: true, origin: activeSession.origin }, { localStateKey: LABELS.EXTERNAL_CONTROLS })

      //check if current connection request is for evm
      const isEthReq = isEqual(activeSession.method, EVM_JSON_RPC_METHODS.ETH_REQUEST_ACCOUNT) || isEqual(activeSession.method, EVM_JSON_RPC_METHODS.ETH_ACCOUNTS)

      const res = isEthReq ? { method: activeSession.method, result: [account.evmAddress] } : {
        result: {
          evmAddress: account.evmAddress,
          nativeAddress: account.nativeAddress,
        }
      };

      //send the message to tab after approve request
      sendMessageToTab(activeSession.tabId, new TabMessagePayload(activeSession.id, res))
    }

    //send closure message to backend
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION, { approve: isApproved });
    navigate(ROUTES.WALLET);
  }


  return (
    <>
      <div className={`${style.menuItems__cancleContinue} approveBtn`}>
        <ButtonComp
          onClick={() => handleClick(true)}
          text={"Approve"}
          maxWidth={"100%"}
        />
        <ButtonComp
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
          onClick={() => handleClick(false)}
        />

      </div>
    </>
  );
};


//approve the evm transactions
export const ApproveTx = () => {
  const { state, externalControlsState, estimatedGas } = useContext(AuthContext);
  const { activeSession } = externalControlsState;
  const [disableApproval, setDisableApproval] = useState(false);

  const navigate = useNavigate();

  //check if user has sufficent balance to make transaction
  useEffect(() => {

    const amount = (new BigNumber(activeSession.message?.value).dividedBy(DECIMALS)).toString();

    if ((Number(amount) + Number(estimatedGas)) >= Number(state.balance.evmBalance)) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
      return;
    }

  }, [estimatedGas]);


  function handleClick(isApproved) {
    if (isApproved) {
      const txType = activeSession.message?.data && activeSession.message?.to ? TX_TYPE.CONTRACT_EXECUTION : TX_TYPE.CONTRACT_DEPLOYMENT;
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.EVM_TX, { options: { account: state.currentAccount, network: state.currentNetwork, type: txType, isEvm: true, isBig: true } });
    }
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION, { approve: isApproved });
    navigate(ROUTES.WALLET);
  }

  return (
    <>
      <div className={`${style.menuItems__cancleContinue} approveBtn`}>
        <ButtonComp
          onClick={() => handleClick(true)}
          text={"Approve"}
          maxWidth={"100%"}
          isDisable={disableApproval}
        />
      </div>
      <ButtonComp
        bordered={true}
        text={"Reject"}
        maxWidth={"100%"}
        onClick={() => handleClick(false)}
      />
    </>
  );
};

//default export
export default FooterStepOne;