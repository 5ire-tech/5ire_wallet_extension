import { Layout } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss";
import pageStyle from "../../Pages/RejectNotification/style.module.scss";
import ButtonComp from "../ButtonComp/ButtonComp";
import {
  ERROR_MESSAGES,
  MESSAGE_EVENT_LABELS,
  MESSAGE_TYPE_LABELS,
  TX_TYPE,
  VALIDATION_METHODS_VD_NM
} from "../../Constants";
import { shortLongAddress } from "../../Utility/utility";
import { AuthContext } from "../../Store";
import { sendMessageOverStream } from "../../Utility/message_helper";
import { toast } from "react-hot-toast";
import { ROUTES } from "../../Routes";

function formatParams(messageInfo) {
  try {
    const obj = JSON.parse(JSON.stringify(messageInfo));
    const d = Object.keys(obj).map((k) => {
      return {
        key: k.charAt(0).toUpperCase() + k.slice(1),
        value: obj[k]
      };
    });
    return d;
  } catch (er) {
    return [];
  }
}

function ValidatorNominatorTxns() {
  const navigate = useNavigate();
  const { Content } = Layout;

  const {
    state,
    externalControlsState: { activeSession },
    valdatorNominatorFee,
    updateLoading,
    setValdatorNominatorFee
  } = useContext(AuthContext);

  const { pendingTransactionBalance, allAccountsBalance, currentAccount, currentNetwork } = state;

  const [disableApproval, setDisableApproval] = useState(true);
  const balance = allAccountsBalance[currentAccount?.evmAddress][currentNetwork?.toLowerCase()];

  //calculate the transaction fee
  useEffect(() => {
    //if balance is 0 then don't call the fee calculator
    if (Number(balance?.transferableBalance) === 0) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
      return;
    }
    updateLoading(true);
    sendMessageOverStream(
      MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
      MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_FEE,
      { options: { id: activeSession?.id } }
    );
    setDisableApproval(!valdatorNominatorFee?.fee);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //check if user has sufficent balance to make trnsaction
  useEffect(() => {
    if (valdatorNominatorFee?.fee && isInsufficientBalance()) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
    } else setDisableApproval(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valdatorNominatorFee?.fee]);

  function isInsufficientBalance() {
    let totalAmount =
      +valdatorNominatorFee?.fee +
      pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm;

    if (VALIDATION_METHODS_VD_NM.includes(activeSession?.method)) {
      totalAmount += +activeSession.message?.amount;
    }

    return +balance?.transferableBalance < totalAmount;
  }
  //process the transaction
  function handleClick(isApproved) {
    if (isApproved && isInsufficientBalance()) {
      return toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE_VD_NM);
    }

    sendMessageOverStream(
      MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL,
      MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_TRANSACTION,
      {
        approve: isApproved,
        options: {
          account: currentAccount,
          isEvm: false,
          network: currentNetwork.toLowerCase(),
          type: TX_TYPE.NATIVE_APP,
          fee: valdatorNominatorFee
        }
      }
    );
    setValdatorNominatorFee(null);
    navigate(ROUTES.WALLET);
  }

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        <Content className={style.fixedLayout__content}>
          <div>
            <div className={pageStyle.rejectedSec}>
              <div
                className={`${pageStyle.rejectedSec__detailDataSec} ${pageStyle.rejectedSec__transactionDetailMain}`}>
                <h3 className={`${pageStyle.rejectedSec__sendSwapbtn__txnDetailHeading} }`}>
                  Transaction Details
                </h3>
                <div
                  className={`${pageStyle.rejectedSec__listReject} ${pageStyle.rejectedSec__txnDetail}`}>
                  <div
                    className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact1}`}>
                    <h4>From: </h4>
                    <p>{shortLongAddress(String(currentAccount?.nativeAddress), 8, 6)}</p>
                  </div>
                  <div
                    className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
                    <h4>Method: </h4>
                    <p>{valdatorNominatorFee?.methodName || ""}</p>
                  </div>

                  {formatParams(activeSession?.message).map((d) => {
                    return (
                      <div
                        key={d.key}
                        className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
                        <h4>{d.key}: </h4>

                        <p>{d.value}</p>
                      </div>
                    );
                  })}

                  <div
                    className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
                    <h4>Estimated Fee: </h4>
                    <p>{valdatorNominatorFee?.fee} 5IRE</p>
                  </div>
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
    </div>
  );
}

export default ValidatorNominatorTxns;
