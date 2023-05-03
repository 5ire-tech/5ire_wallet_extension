import { Layout } from "antd";
import React, { useContext, useEffect, useState } from "react";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss"
import pageStyle from "../../Pages/RejectNotification/style.module.scss"
import ButtonComp from "../ButtonComp/ButtonComp";
import { ERROR_MESSAGES, MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS, TX_TYPE } from "../../Constants";
import { shortLongAddress } from "../../Utility/utility";
import { AuthContext } from "../../Store";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../Routes";



function ValidatorNominatorTxns() {
    const navigate = useNavigate();
    const [disableApproval, setDisableApproval] = useState(false);
    const {
        state,
        externalControlsState: { activeSession },
        valdatorNominatorFee,
        updateLoading,
        setValdatorNominatorFee,
        backgroundError
    } = useContext(AuthContext);
    const { Content } = Layout;


      //check if user has sufficent balance to make transaction
  useEffect(() => {

    if ((Number(activeSession.message?.value) + Number(valdatorNominatorFee?.fee)) >= Number(state.balance.evmBalance)) {
      toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      setDisableApproval(true);
      setValdatorNominatorFee(null);
      return;
    } else {
        setDisableApproval(false)
    }
  }, [valdatorNominatorFee?.fee]);


  //calculate the transaction fee
    useEffect(() => {
        updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_FEE, {});
        setDisableApproval(!valdatorNominatorFee?.fee);
    }, [])


    //process the transaction
    function handleClick(isApproved) {
        // updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_TRANSACTION, {approve: isApproved, options: {account: state.currentAccount, isEvm: false, network: state.currentNetwork, type: TX_TYPE.NATIVE_APP } });
        setValdatorNominatorFee(null);
        navigate(ROUTES.WALLET);
    }






    function formatParams(messageInfo) {
        try {
            const obj = JSON.parse(JSON.stringify(messageInfo));
            const d = Object.keys(obj).map((k) => {
                return {
                    key: k.charAt(0).toUpperCase() + k.slice(1),
                    value: obj[k]
                }
            })
            return d;
        } catch (er) {
            return []
        }
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
                                        className={`${pageStyle.rejectedSec__sendSwapbtn__buttons}  ${pageStyle.rejectedSec__sendSwapbtn__buttons__active
                                            }`}
                                    >
                                        Txn Detail
                                    </button>
                                </div>
                                <div className={`${pageStyle.rejectedSec__listReject} ${pageStyle.rejectedSec__txnDetail}`}>

                                    <div className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
                                        <h4>From: </h4>
                                        <p>{shortLongAddress(String(state?.currentAccount?.nativeAddress))}</p>
                                    </div>
                                    <div className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
                                        <h4>Method: </h4>
                                        <p>{valdatorNominatorFee?.methodName || ""}</p>
                                    </div>

                                    {formatParams(activeSession?.message).map((d) => {
                                        return <div key={d.key} className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
                                            <h4>{d.key}: </h4>

                                            <p>{d.value}</p>
                                        </div>
                                    })}

                                    <div className={`${pageStyle.rejectedSec__listReject__innerList} ${pageStyle.rejectedSec__txnDetail__txnContact}`}>
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
                        bordered={true}
                        text={"Reject"}
                        maxWidth={"100%"}
                        onClick={() => handleClick(false)}
                    />
                    <ButtonComp
                        onClick={() => handleClick(true)}
                        text={"Approve"}
                        maxWidth={"100%"}
                        isDisable={disableApproval}
                    />
                </div>
            </div>

        </div>
    );
}

export default ValidatorNominatorTxns;
