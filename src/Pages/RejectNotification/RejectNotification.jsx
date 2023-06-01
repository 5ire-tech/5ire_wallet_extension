import { ROUTES } from "../../Routes";
import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import CopyIcon from "../../Assets/CopyIcon.svg";
import SwapIcon from "../../Assets/SwapIcon.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import React, { useState, useContext, useEffect } from "react";
import { sendMessageOverStream } from "../../Utility/message_helper";
import {
  LABELS,
  COPIED,
  TX_TYPE,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants";

function ApproveTx() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("detail");
  const [disableApproval, setDisableApproval] = useState(true);
  const { estimatedGas, state, externalControlsState, updateLoading } = useContext(AuthContext);
  const { pendingTransactionBalance, allAccountsBalance, currentAccount, currentNetwork } = state;
  const { activeSession } = externalControlsState;
  const balance = allAccountsBalance[currentAccount?.evmAddress][currentNetwork?.toLowerCase()];

  //current account
  const account = currentAccount;

  useEffect(() => {
    updateLoading(true);
    sendMessageOverStream(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, {
      value: activeSession?.message?.value,
      toAddress: activeSession?.message?.to,
      data: activeSession?.message?.data,
      options: { account: currentAccount }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //check if user has sufficent balance to make transaction
  useEffect(() => {
    if (
      estimatedGas &&
      Number(activeSession.message?.value) + Number(estimatedGas) >=
        Number(balance?.evmBalance) -
          pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm
    ) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
      return;
    } else setDisableApproval(!estimatedGas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGas, balance?.evmBalance]);

  function handleClick(isApproved) {
    if (isApproved) {
      const txType = activeSession.message?.data
        ? activeSession.message?.to
          ? TX_TYPE.CONTRACT_EXECUTION
          : TX_TYPE.CONTRACT_DEPLOYMENT
        : TX_TYPE.SEND;
      sendMessageOverStream(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.EVM_TX, {
        options: { account: currentAccount, network: currentNetwork, type: txType, isEvm: true }
      });
    }
    sendMessageOverStream(
      MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL,
      MESSAGE_EVENT_LABELS.CLOSE_POPUP_SESSION,
      { approve: isApproved }
    );
    navigate(ROUTES.WALLET);
  }

  const activeDetail = () => {
    setActiveTab("detail");
  };

  const activeData = () => {
    setActiveTab("data");
  };

  return (
    <div>
      <div className={style.rejectedSec}>
        <div className={style.rejectedSec__detailDataSec}>
          <div className={style.rejectedSec__sendSwapbtn}>
            <button
              onClick={activeDetail}
              className={`${style.rejectedSec__sendSwapbtn__buttons} 
              ${activeTab === "detail" && style.rejectedSec__sendSwapbtn__buttons__active}
            `}>
              Details
            </button>
            <button
              onClick={activeData}
              className={`${style.rejectedSec__sendSwapbtn__buttons}  ${
                activeTab === "data" && style.rejectedSec__sendSwapbtn__buttons__active
              }`}>
              HEX Data
            </button>
          </div>

          <div className={style.rejectedSec__listReject}>
            {activeTab === "detail" ? (
              <>
                <div className={style.rejectedSec__flexList}>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>From: </h4>
                    <p>
                      <span> {account.evmAddress} </span>
                      <img
                        alt="copyIcon"
                        src={CopyIcon}
                        draggable={false}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(account?.evmAddress);
                          toast.success(COPIED);
                        }}
                      />
                    </p>
                  </div>
                  <div className={style.rejectedSec__icon} style={{ marginTop: "30px" }}>
                    <img src={SwapIcon} alt="swapIcon" />
                  </div>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>To: </h4>
                    <p>
                      <span>
                        {" "}
                        {activeSession?.message?.to ? activeSession?.message?.to : LABELS.CONTRACT}
                      </span>
                      {activeSession?.message?.to && (
                        <img
                          src={CopyIcon}
                          alt="copyIcon"
                          draggable={false}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            navigator.clipboard.writeText(activeSession?.message?.to);
                            toast.success(COPIED);
                          }}
                        />
                      )}
                    </p>
                  </div>
                </div>
                <div className={style.rejectedSec__flexList}>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>Value: </h4>
                    <p>
                      <span>{activeSession?.message?.value || "0"}</span>
                    </p>
                  </div>

                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>Fee: </h4>
                    <p>
                      <span>{estimatedGas ? `${estimatedGas} ` : ""}</span>5ire
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerDataList}>
                <h4 style={{ wordBreak: "break-all" }}>{activeSession?.message?.data || ""}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`${style.cancleContinueContainer}`}>
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
    </div>
  );
}

export default ApproveTx;
