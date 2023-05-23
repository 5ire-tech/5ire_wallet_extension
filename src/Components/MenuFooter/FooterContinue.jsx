import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import { isEqual } from "../../Utility/utility";
import ButtonComp from "../ButtonComp/ButtonComp";
import React, { useContext, useEffect, useState } from "react";
import { TabMessagePayload } from "../../Utility/network_calls";
import { newAccountInitialState } from "../../Store/initialState";
import { ExtensionStorageHandler } from "../../Storage/loadstore";
import { sendMessageOverStream } from "../../Utility/message_helper";
import { sendMessageToTab, sendRuntimeMessage } from "../../Utility/message_helper";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import {
  LABELS,
  TX_TYPE,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  EVM_JSON_RPC_METHODS,
  STATE_CHANGE_ACTIONS,
} from "../../Constants/index";

//Before We begin
function FooterStepOne() {
  const { state, setNewWalletName } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLogin } = state;

  const handleCancle = () => {
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  }

  const handleClick = () => {
    setNewWalletName("");
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
  const [show, setShow] = useState(false);
  const { setNewAccount, newAccount, setDetailsPage } = useContext(AuthContext);

  const handleCancle = async () => {
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT, { address: newAccount?.evmAddress });
    setDetailsPage(false);
  };

  const handleClick = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setNewAccount(newAccountInitialState);
      navigate(ROUTES.WALLET);
      setDetailsPage(false);
    }, 2000);
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

      const res = isEthReq ? { method: activeSession.method, result: [account?.evmAddress] } : {
        result: {
          evmAddress: account?.evmAddress,
          nativeAddress: account?.nativeAddress,
        }
      };

      //send the message to tab after approve request
      sendMessageToTab(activeSession.tabId, new TabMessagePayload(activeSession.id, res, activeSession.method))
    }

    //send closure message to backend
    sendMessageOverStream(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION, { approve: isApproved });
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
  const { pendingTransactionBalance, balance, currentAccount, currentNetwork } = state;
  const [disableApproval, setDisableApproval] = useState(true);

  const navigate = useNavigate();

  //check if user has sufficent balance to make transaction
  useEffect(() => {
    if (estimatedGas && (Number(activeSession.message?.value) + Number(estimatedGas)) >= (Number(balance?.evmBalance) - pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm)) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
      return;
    } else setDisableApproval(!estimatedGas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGas, activeSession.message?.value, balance?.evmBalance, currentAccount?.evmAddress, currentNetwork]);


  function handleClick(isApproved) {
    if (isApproved) {
      const txType = activeSession.message?.data ? activeSession.message?.to ? TX_TYPE.CONTRACT_EXECUTION : TX_TYPE.CONTRACT_DEPLOYMENT : TX_TYPE.SEND;

      sendMessageOverStream(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.EVM_TX, { options: { account: currentAccount, network: currentNetwork, type: txType, isEvm: true } });
    }
    sendMessageOverStream(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION, { approve: isApproved });
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
        <ButtonComp
          bordered={true}
          text={"Reject"}
          maxWidth={"100%"}
          onClick={() => handleClick(false)}
        />
      </div>
    </>
  );
};

//default export
export default FooterStepOne;