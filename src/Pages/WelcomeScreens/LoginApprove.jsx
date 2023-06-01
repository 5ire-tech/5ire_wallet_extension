import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import React, { useContext } from "react";
import { AuthContext } from "../../Store";
import { isEqual } from "../../Utility/utility.js";
import { Link, useNavigate } from "react-router-dom";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { TabMessagePayload } from "../../Utility/network_calls";
import { sendMessageToTab } from "../../Utility/message_helper";
import { ExtensionStorageHandler } from "../../Storage/loadstore";
import { sendMessageOverStream } from "../../Utility/message_helper";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  LABELS,
  MESSAGE_TYPE_LABELS,
  STATE_CHANGE_ACTIONS,
  EVM_JSON_RPC_METHODS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index.js";

function LoginApprove() {
  //get the origin for approval connection
  const {
    externalControlsState: { activeSession },
    state
  } = useContext(AuthContext);
  const account = state.currentAccount;
  const navigate = useNavigate();

  //handle the approval and reject click
  const handleClick = async (isApproved) => {
    if (isApproved) {
      //add the app into connected list
      await ExtensionStorageHandler.updateStorage(
        STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE,
        { connected: true, origin: activeSession.origin },
        { localStateKey: LABELS.EXTERNAL_CONTROLS }
      );

      //check if current connection request is for evm
      const isEthReq =
        isEqual(activeSession.method, EVM_JSON_RPC_METHODS.ETH_REQUEST_ACCOUNT) ||
        isEqual(activeSession.method, EVM_JSON_RPC_METHODS.ETH_ACCOUNTS);

      const res = isEthReq
        ? { method: activeSession.method, result: [account?.evmAddress] }
        : {
            result: {
              evmAddress: account?.evmAddress,
              nativeAddress: account?.nativeAddress
            }
          };

      //send the message to tab after approve request
      sendMessageToTab(
        activeSession.tabId,
        new TabMessagePayload(activeSession.id, res, activeSession.method)
      );
    }

    //send closure message to backend
    sendMessageOverStream(
      MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL,
      MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION,
      { approve: isApproved }
    );
    navigate(ROUTES.WALLET);
  };

  return (
    <>
      <div className={style.cardWhite}>
        <MenuRestofHeaders logosilver={true} title="5ire Wallet" />
        <div className={style.cardWhite__cardInner}>
          <div className={style.cardWhite__cardInner__innercontact}>
            <h1>Access Request</h1>
          </div>
          <div className={style.cardWhite__cardInner__siteUrl}>
            <h4>Site URL</h4>
            <Link>{activeSession?.origin} </Link>
          </div>
          <div className={style.cardWhite__cardInner__accessConatct}>
            <h1>Allow Access</h1>
            <span>Allow this site to login with your 5ire Wallet?</span>
          </div>
        </div>
      </div>
      <div className={`${style.cancleContinueContainer} approveBtn`}>
        <ButtonComp onClick={() => handleClick(true)} text={"Approve"} maxWidth={"100%"} />
        <ButtonComp
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
          onClick={() => handleClick(false)}
        />
      </div>
    </>
  );
}

export default LoginApprove;
