import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { useSelector } from "react-redux";
import useWallet from "../../Hooks/useWallet";

function ApproveTx() {
  const [activeTab, setActiveTab] = useState("detail");
  const auth = useSelector((state) => state.auth);
  const [fee, setFee] = useState(0);
  const { retriveEvmFee } = useWallet();

  useEffect(() => {
    retriveEvmFee(
      auth?.uiData?.message?.to,
      auth?.uiData?.message?.value,
      auth?.uiData?.message?.data
    )
      .then(setFee)
      .catch(setFee);
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
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>From: </h4>
                  <h4>{auth.currentAccount.evmAddress}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>To: </h4>
                  <h4>{auth?.uiData?.message?.to || ""}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Value: </h4>
                  <h4>{auth?.uiData?.message?.value}</h4>
                </div>

                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Fee: </h4>
                  <h4>{fee} 5IRE</h4>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerList}>
                <h4>{auth?.uiData?.message?.data || ""}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveTx;
