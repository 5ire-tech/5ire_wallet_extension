import style from "./style.module.scss";
import React, {useState, useContext, useEffect } from "react";
import { AuthContext } from "../../Store";
import { MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS, LABELS } from "../../Constants";
import { sendRuntimeMessage } from "../../Utility/message_helper";


function ApproveTx() {
  const [activeTab, setActiveTab] = useState("detail");
  const {estimatedGas, state , externalControlsState, updateLoading} = useContext(AuthContext);
  const {activeSession} = externalControlsState;

  //current account
  const account = state.currentAccount;


  useEffect(() => {
    updateLoading(true);
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, {value: activeSession.message?.value, toAddress: activeSession.message?.to, data: activeSession.message?.data, options: {account: state.currentAccount}});
  }, [])

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
              ${activeTab === "detail" &&
                style.rejectedSec__sendSwapbtn__buttons__active
                }
            `}
            >
              Details
            </button>
            <button
              onClick={activeData}
              className={`${style.rejectedSec__sendSwapbtn__buttons}  ${activeTab === "data" &&
                style.rejectedSec__sendSwapbtn__buttons__active
                }`}
            >
              Data
            </button>
          </div>

          <div className={style.rejectedSec__listReject}>
            {activeTab === "detail" ? (
              <>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>From: </h4>
                  <h4>{account.evmAddress}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>To: </h4>
                  <h4>{activeSession.message?.data ? LABELS.CONTRACT : activeSession.message.to}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Value: </h4>
                  <h4>{String(activeSession.message.value ? parseFloat(activeSession.message.value).toString() : 0)}</h4>
                </div>

                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Fee: </h4>
                  <h4>{estimatedGas ? `${estimatedGas} 5ire`: ""}</h4>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerList}>
                <h4 style={{ wordBreak: "break-all" }}>{activeSession.message?.data || ""}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default ApproveTx;
