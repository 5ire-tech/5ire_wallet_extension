import style from "./style.module.scss";
import { ROUTES } from "../../Routes";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Store";
import browser from "webextension-polyfill";
import { useNavigate } from "react-router-dom";
import ButtonComp from "../ButtonComp/ButtonComp";
import { EVM_JSON_RPC_METHODS, LABELS, STATE_CHANGE_ACTIONS, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS, ERROR_MESSAGES } from "../../Constants/index";
import { useDispatch, useSelector } from "react-redux";
import { newAccountInitialState } from "../../Store/initialState";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import {
  setUIdata,
  toggleLoader,
} from "../../Utility/redux_helper";


import { ExtensionStorageHandler } from "../../Storage/loadstore";
import { isEqual } from "../../Utility/utility";
import { sendMessageToTab, sendRuntimeMessage } from "../../Utility/message_helper";
import { TabMessagePayload } from "../../Utility/network_calls";
import { toast } from "react-toastify";



//Wallet of Before We begin
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
      <div className={`${style.menuItems__cancleContinue } ${style.beginStyle}`}>
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
  const { state, setNewAccount } = useContext(AuthContext);
  const navigate = useNavigate();


  const handleCancle = () => {
    setNewAccount(newAccountInitialState);
    navigate(ROUTES.DEFAULT);
  };

  const handleClick = () => {
    setNewAccount(newAccountInitialState);
    navigate(ROUTES.WALLET);
  };

  return (
    <>
      <div className={style.menuItems__cancleContinue}>
        {!state.isLogin && (
          <ButtonComp
            bordered={true}
            text={"Cancel"}
            maxWidth={"100%"}
            onClick={handleCancle}
          />
        )}

        <ButtonComp onClick={handleClick} text={"Continue"} maxWidth={"100%"} />
      </div>
    </>
  );
};


//approve the connection to pass the accounts
export const ApproveLogin = () => {
  const { state, externalControlsState } = useContext(AuthContext);
  const account = state.currentAccount;
  const {activeSession} = externalControlsState;
  const navigate = useNavigate();


  //handle the approval and reject click
  const handleClick = async (isApproved) => {

    if (isApproved) {
      //add the app into connected list
      await ExtensionStorageHandler.updateStorage(STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE, {connected: true, origin: activeSession.origin}, {localStateKey: LABELS.EXTERNAL_CONTROLS})

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
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION, {approve: isApproved});
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
  const {activeSession} = externalControlsState;
  const [disableApproval, setDisableApproval] = useState(false);

  const navigate = useNavigate();

  //check if user has sufficent balance to make transaction
  useEffect(() => {
    if((Number(activeSession.message?.value) + Number(estimatedGas)) >= Number(state.balance.evmBalance)) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
      return;
    }
  }, [estimatedGas]);


  function handleClick(isApproved) {
    if (isApproved) sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.EVM_TX, {options: {account: state.currentAccount}});
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION, {approve: isApproved});
    navigate(ROUTES.WALLET);
  }

  return (
    <>
      <div className={`${style.menuItems__cancleContinue} approveBtn`}>
        <ButtonComp
          bordered={true}
          text={"Reject"}
          maxWidth={"100%"}
          onClick={() => handleClick(false)}
        />
        <ButtonComp
          onClick={() => handleClick(true)}
          text={"Approve"}
          maxWidth={"100%"}
          isDisable={disableApproval}
        />
      </div>
    </>
  );
};

//default export
export default FooterStepOne;