import style from "./style.module.scss";
import useWallet from "../../Hooks/useWallet";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { resetBalance } from "../../Store/reducer/auth";
import { connectionObj, Connection } from "../../Helper/connection.helper";

function ApproveTx() {

  const dispatch = useDispatch();
  const [fee, setFee] = useState("");
  const [isReady, setReady] = useState("");
  const { retriveEvmFee } = useWallet();
  const [activeTab, setActiveTab] = useState("detail");
  const auth = useSelector((state) => state.auth);

  useEffect(() => {

    dispatch(resetBalance());

    if (!isReady) {
      setTimeout(() => {
        getFee();
      },4000)
    }else{
      getFee();
    }
  }, [isReady]);

  const getFee = () => {

    connectionObj.initializeApi(auth.httpEndPoints.testnet, auth.httpEndPoints.qa, auth.currentNetwork, false).then((apiRes) => {


      if (!apiRes?.value) {
        setReady(true);
        Connection.isExecuting.value = false;

        retriveEvmFee(
          apiRes.evmApi,
          auth?.uiData?.message?.to,
          auth?.uiData?.message?.value,
          auth?.uiData?.message?.data,
          false
        )
          .then((res) => {

            if (!res.error) {
              setFee(res.data);
            }
          })
          .catch((e) => {
            console.log("Error : ", e);
          });
      } else {
        setReady(false);
      }
    });

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
                  <h4>{auth.currentAccount.evmAddress}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>To: </h4>
                  <h4>{auth?.uiData?.message?.to || ""}</h4>
                </div>
                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Value: </h4>
                  <h4>{String(auth?.uiData?.message?.value || 0)}</h4>
                </div>

                <div className={style.rejectedSec__listReject__innerList}>
                  <h4>Fee: </h4>
                  <h4>{fee} 5IRE</h4>
                </div>
              </>
            ) : (
              <div className={style.rejectedSec__listReject__innerList}>
                <h4 style={{ wordBreak: "break-all" }}>{auth?.uiData?.message?.data || ""}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveTx;
