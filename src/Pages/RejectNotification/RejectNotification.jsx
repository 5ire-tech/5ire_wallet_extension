import style from "./style.module.scss";
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../Store";
import {
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  LABELS,
} from "../../Constants";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import SwapIcon from "../../Assets/SwapIcon.svg";

function ApproveTx() {
  const [activeTab, setActiveTab] = useState("detail");
  const { estimatedGas, state, externalControlsState, updateLoading } =
    useContext(AuthContext);
  const { activeSession } = externalControlsState;

  //get current account
  const account = state.allAccounts[state.currentAccount.index];

  // useEffect(() => {
  //   updateLoading(true);
  //   sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, {amount: activeSession.message?.value, toAddress: activeSession.message?.to, data: activeSession.message?.data, options: {account: state.currentAccount,}});
  // }, [])

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
              ${
                activeTab === "detail" &&
                style.rejectedSec__sendSwapbtn__buttons__active
              }
            `}
            >
              Details
            </button>
            <button
              onClick={activeData}
              className={`${style.rejectedSec__sendSwapbtn__buttons}  ${
                activeTab === "data" &&
                style.rejectedSec__sendSwapbtn__buttons__active
              }`}
            >
              Data
            </button>
          </div>

          <div className={style.rejectedSec__listReject}>
            {activeTab === "detail" ? (
              <>
                <div className={style.rejectedSec__flexList}>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>From: </h4>
                    <p>{account.evmAddress}</p>
                  </div>
                  <div className={style.rejectedSec__icon}>
                    <img src={SwapIcon} alt="swapIcon" />
                  </div>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>To: </h4>
                    <p>
                      {activeSession.message?.data
                        ? LABELS.CONTRACT
                        : "digjidjgdijgrg8r8"}
                    </p>
                  </div>
                </div>
                <div className={style.rejectedSec__flexList}>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>Value: </h4>
                    <h4>
                      {String(
                        activeSession.message.value
                          ? parseFloat(activeSession.message.value).toString()
                          : 0
                      )}
                    </h4>
                  </div>

                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>Fee: </h4>
                    <h4>
                      {estimatedGas ? `${estimatedGas} 5ire` : "0.00005 5ire"}
                    </h4>
                  </div>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerDataList}>
                <h4 style={{ wordBreak: "break-all" }}>
                  {activeSession.message?.data ||
                    "ijgjr8gjg88888888888888888888888888888885j38888888888888888888888888888888888888888888888888888888888888888888888888888g8j53gj89"}
                </h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveTx;
