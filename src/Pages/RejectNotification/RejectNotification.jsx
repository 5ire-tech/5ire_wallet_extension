import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import CopyIcon from "../../Assets/CopyIcon.svg";
import SwapIcon from "../../Assets/SwapIcon.svg";
import { toast } from "react-hot-toast";
import React, { useState, useContext, useEffect } from "react";
import { sendMessageOverStream } from "../../Utility/message_helper";
import {
  LABELS,
  COPIED,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
} from "../../Constants";

function ApproveTx() {
  const [activeTab, setActiveTab] = useState("detail");
  const { estimatedGas, state, externalControlsState, updateLoading } =
    useContext(AuthContext);
  const { activeSession } = externalControlsState;

  //current account
  const account = state.currentAccount;

  useEffect(() => {
    updateLoading(true);
    sendMessageOverStream(
      MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
      MESSAGE_EVENT_LABELS.EVM_FEE,
      {
        value: activeSession.message?.value,
        toAddress: activeSession.message?.to,
        data: activeSession.message?.data,
        options: { account: state.currentAccount },
      }
    );
  }, []);

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
                  <div
                    className={style.rejectedSec__icon}
                    style={{ marginTop: "30px" }}
                  >
                    <img src={SwapIcon} alt="swapIcon" />
                  </div>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>To: </h4>
                    <p>
                      <span>
                        {" "}
                        {activeSession.message?.data
                          ? LABELS.CONTRACT
                          : activeSession.message?.to}
                      </span>
                      <img
                        src={CopyIcon}
                        alt="copyIcon"
                        draggable={false}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            activeSession.message?.data
                              ? LABELS.CONTRACT
                              : activeSession.message?.to
                          )
                          toast.success(COPIED);
                        }} />
                    </p>
                  </div>
                </div>
                <div className={style.rejectedSec__flexList}>
                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>Value: </h4>
                    <p><span>{activeSession.message?.value || "0"}</span></p>
                  </div>

                  <div className={style.rejectedSec__listReject__innerList}>
                    <h4>Fee: </h4>
                    <p><span>{estimatedGas ? `${estimatedGas} ` : ""}</span>5ire</p>
                  </div>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerDataList}>
                <h4 style={{ wordBreak: "break-all" }}>
                  {activeSession.message?.data || ""}
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
