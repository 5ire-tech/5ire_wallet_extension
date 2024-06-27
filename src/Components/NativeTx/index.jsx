import { Layout } from "antd";
import { ROUTES } from "../../Routes";
import { isObject } from "@polkadot/util";
import { AuthContext } from "../../Store";
import { shortner } from "../../Helper/helper";
import { useNavigate } from "react-router-dom";
import CopyIcon from "../../Assets/CopyIcon.svg";
import ButtonComp from "../ButtonComp/ButtonComp";
import style from "../../Layout/style.module.scss";
import { shortLongAddress } from "../../Utility/utility";
import footerstyle from "../MenuFooter/style.module.scss";
import React, { useEffect, useContext, useState } from "react";
import { sendMessageOverStream } from "../../Utility/message_helper";
import pageStyle from "../../Pages/RejectNotification/style.module.scss";
import { SIGNER_METHODS, MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS, COPIED } from "../../Constants";
import { toast } from "react-hot-toast";

function NativeSigner() {
  const { Content } = Layout;
  const navigate = useNavigate();

  const [formattedMethod, setFormattedMethod] = useState("");

  const {
    externalControlsState: { activeSession },
    state,
    externalNativeTxDetails,
    updateLoading
  } = useContext(AuthContext);

  const handleClick = async (isApproved) => {
    sendMessageOverStream(
      MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL,
      MESSAGE_EVENT_LABELS.NATIVE_SIGNER,
      {
        ...externalNativeTxDetails,
        approve: isApproved,
        options: {
          account: state.currentAccount,
          network: state.currentNetwork,
          nativeSigner: true
        }
      }
    );
    navigate(ROUTES.WALLET);
  };

  useEffect(() => {
    const method = activeSession.method;
    if (SIGNER_METHODS.SIGN_PAYLOAD === method) {
      updateLoading(true);
      sendMessageOverStream(
        MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
        MESSAGE_EVENT_LABELS.EXTERNAL_NATIVE_TRANSACTION_ARGS_AND_GAS,
        {
          options: {
            account: state.currentAccount,
            network: state.currentNetwork
          }
        }
      );
    } else setFormattedMethod(SIGNER_METHODS.SIGN_RAW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function RecComponent({ data }) {
    return Object.keys(data).map((v) => {
      if (isObject(data[v])) {
        return <RecComponent key={v} data={data[v]} />;
      }
      return (
        <div
          key={v}
          className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__listReject__txnDetail}`}>
          <h4>{v}: </h4>
          <p>{String(data[v]).length > 20 ? shortLongAddress(data[v]) : data[v]}</p>
        </div>
      );
    });
  }

  const handleCopy = (data) => {
    navigator.clipboard.writeText(data);
    toast.success(COPIED);
  };

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        <Content className={style.fixedLayout__content}>
          <div>
            <div className={pageStyle.rejectedSec}>
              <div className={pageStyle.rejectedSec__detailDataSec}>
                <div className={pageStyle.rejectedSec__sendSwapbtn}>
                  <button
                    className={`${pageStyle.rejectedSec__sendSwapbtn__buttons}  ${pageStyle.rejectedSec__sendSwapbtn__buttons__active}`}>
                    Txn Detail
                  </button>
                </div>
                <div className={`${pageStyle.rejectedSec__listReject} detailTsxPage`}>
                  <div
                    className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__listReject__txnDetail}`}>
                    <h4>From: </h4>
                    <p>
                      {shortner(String(state.currentAccount?.nativeAddress))}{" "}
                      <img
                        src={CopyIcon}
                        style={{ cursor: "pointer" }}
                        alt="copyIcon"
                        onClick={() => handleCopy(state.currentAccount?.nativeAddress)}
                        draggable={false}
                      />{" "}
                    </p>
                  </div>
                  <div
                    className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__listReject__txnDetail}`}>
                    <h4>Method: </h4>
                    <p>
                      {externalNativeTxDetails.method
                        ? externalNativeTxDetails.method
                        : formattedMethod}
                      <img
                        src={CopyIcon}
                        alt="copyIcon"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleCopy(
                            externalNativeTxDetails.method
                              ? externalNativeTxDetails.method
                              : formattedMethod
                          )
                        }
                        draggable={false}
                      />
                    </p>
                  </div>

                  {/* <div
                    className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__listReject__txnDetail}`}>
                    <h4>Tx Hash: </h4>
                    <p>
                      {shortLongAddress(externalNativeTxDetails?.txHash) || ""}
                      <img
                        src={CopyIcon}
                        style={{cursor:"pointer"}}

                        alt="copyIcon"
                        onClick={() => handleCopy(externalNativeTxDetails?.txHash)}
                        draggable={false}
                      />
                    </p>
                  </div> */}

                  <RecComponent data={externalNativeTxDetails?.args || {}} />

                  {externalNativeTxDetails?.estimatedGas && (
                    <div
                      className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__listReject__txnDetail}`}>
                      <h4>Estimated Fee: </h4>
                      <p>{externalNativeTxDetails?.estimatedGas || ""} 5IRE</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Content>
        <div className={footerstyle.menuItems__cancleContinue1}>
          <ButtonComp onClick={() => handleClick(true)} text={"Approve"} maxWidth={"100%"} />
          <ButtonComp
            bordered={true}
            text={"Reject"}
            maxWidth={"100%"}
            onClick={() => handleClick(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default NativeSigner;
