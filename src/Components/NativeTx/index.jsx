import { Layout } from "antd";
import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../Store";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss";
import pageStyle from "../../Pages/RejectNotification/style.module.scss";
import { useNavigate } from "react-router-dom";

import ButtonComp from "../ButtonComp/ButtonComp";
import {
  isObject,
} from "@polkadot/util";
import { shortLongAddress } from "../../Utility/utility";
import {
  MESSAGE_EVENT_LABELS,
  MESSAGE_TYPE_LABELS,
  SIGNER_METHODS,
} from "../../Constants";
import { sendMessageOverStream } from "../../Utility/message_helper";
import { ROUTES } from "../../Routes";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";

function NativeSigner() {
  const [formattedMethod, setFormattedMethod] = useState("");
  const { Content } = Layout;
  const {
    externalControlsState: { activeSession },
    state,
    externalNativeTxDetails,
    updateLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = async (isApproved) => {
    sendMessageOverStream(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.NATIVE_SIGNER, { ...externalNativeTxDetails, approve: isApproved, options: { account: state.currentAccount, network: state.currentNetwork, nativeSigner: true } });
    navigate(ROUTES.WALLET);
  };

  useEffect(() => {
    const method = activeSession.method;
    if (SIGNER_METHODS.SIGN_PAYLOAD === method) {
      updateLoading(true);
      sendMessageOverStream(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EXTERNAL_NATIVE_TRANSACTION_ARGS_AND_GAS, { options: { account: state.currentAccount, network: state.currentNetwork } });
    } else setFormattedMethod(SIGNER_METHODS.SIGN_RAW)
  }, [])

  function RecComponent({ data }) {
    return Object.keys(data).map((v) => {
      if (isObject(data[v])) {
        return <RecComponent data={data[v]} />;
      }
      return (
        <div key={v} className={pageStyle.rejectedSec__listReject__innerList}>
          <h4>{v}: </h4>
          <h4>
            {String(data[v]).length > 20 ? shortLongAddress(data[v]) : data[v]}
          </h4>
        </div>
      );
    });
  }

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        <Content className={style.fixedLayout__content}>
          <div>
            <div className={pageStyle.rejectedSec}>
              <div className={pageStyle.rejectedSec__detailDataSec}>
                <div className={pageStyle.rejectedSec__sendSwapbtn}>
                  <button
                    className={`${pageStyle.rejectedSec__sendSwapbtn__buttons}  ${pageStyle.rejectedSec__sendSwapbtn__buttons__active}`}
                  >
                    Txn Detail
                  </button>
                </div>
                <div className={pageStyle.rejectedSec__listReject}>
                  <div className={pageStyle.rejectedSec__listReject__innerList}>
                    <h4>From: </h4>
                    <h4>
                      {shortner(String(state.currentAccount?.nativeAddress))}{" "}
                      <img
                        src={CopyIcon}
                        alt="copyIcon"
                        name="name"

                        draggable={false}
                      />{" "}
                    </h4>
                  </div>
                  <div className={pageStyle.rejectedSec__listReject__innerList}>
                    <h4>Method: </h4>
                    <h4>
                      {externalNativeTxDetails.method
                        ? externalNativeTxDetails.method
                        : formattedMethod}
                      <img
                        src={CopyIcon}
                        alt="copyIcon"
                        name="name"

                        draggable={false}
                      />
                    </h4>
                  </div>
                  {/* {externalNativeTxDetails?.txHash && */}
                  <div className={pageStyle.rejectedSec__listReject__innerList}>
                    <h4>Tx Hash: </h4>
                    <h4>
                      {shortLongAddress(externalNativeTxDetails?.txHash) || ""}
                      <img
                        src={CopyIcon}
                        alt="copyIcon"
                        name="name"

                        draggable={false}
                      />
                    </h4>
                  </div>
                  {/* } */}
                  {/* 
                                    {
                                        externalNativeTxDetails?.args && 
                                    } */}
                  <RecComponent
                    data={
                      externalNativeTxDetails?.args || {}
                    }
                  />

                  {externalNativeTxDetails?.estimatedGas && (
                    <div
                      className={pageStyle.rejectedSec__listReject__innerList}
                    >
                      <h4>Estimated Fee: </h4>
                      <h4>
                        {externalNativeTxDetails?.estimatedGas || ""}{" "}
                        5IRE
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Content>
        <div className={footerstyle.menuItems__cancleContinue1}>
        <ButtonComp
            onClick={() => handleClick(true)}
            text={"Approve"}
            maxWidth={"100%"}
          />
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
