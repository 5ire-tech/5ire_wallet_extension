import style from "./style.module.scss";
import React, {useState, useContext } from "react";
import { AuthContext } from "../../Store";

function ApproveTx() {
  const [activeTab, setActiveTab] = useState("detail");
  const {estimatedGas, updateEstimatedGas, state} = useContext(AuthContext);

  //get current account
  const account = state.allAccounts[state.currentAccount.index];


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
                  <h4>{state?.uiData?.message?.to || ""}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Value: </h4>
                  <h4>{String(state?.uiData?.message?.value || 0)}</h4>
                </div>

                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Fee: </h4>
                  <h4>{estimatedGas ? `${estimatedGas} 5ire`: ""}</h4>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerList}>
                <h4 style={{ wordBreak: "break-all" }}>{state?.uiData?.message?.data || ""}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default ApproveTx;
