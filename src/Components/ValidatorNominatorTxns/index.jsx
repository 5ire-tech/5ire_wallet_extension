import { Layout } from "antd";
import React, { useContext, useEffect } from "react";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss"
import pageStyle from "../../Pages/RejectNotification/style.module.scss"
import ButtonComp from "../ButtonComp/ButtonComp";
import { MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS } from "../../Constants";
import { shortLongAddress } from "../../Utility/utility";
import { AuthContext } from "../../Store";
import { sendRuntimeMessage } from "../../Utility/message_helper";



function ValidatorNominatorTxns() {
    const { Content } = Layout;
    const {
        state,
        externalControlsState: { activeSession },
        valdatorNominatorFee,
        updateLoading,
    } = useContext(AuthContext);


    useEffect(() => {
        updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_FEE, { options: { isFee: true } });

    }, [])

    function handleClick(isApproved) {
        updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTERNAL_TX_APPROVAL, MESSAGE_EVENT_LABELS.VALIDATOR_NOMINATOR_FEE, { options: { isFee: false, isApproved } });
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
                                <div className={pageStyle.rejectedSec__listReject}>

                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>From: </h4>
                                        <h4>{shortLongAddress(String(state?.currentAccount?.nativeAddress))}</h4>
                                    </div>
                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Method: </h4>
                                        <h4>{valdatorNominatorFee?.methodName || ""}</h4>
                                    </div>

                                    {formatParams(activeSession?.message).map((d) => {
                                        return <div key={d.key} className={pageStyle.rejectedSec__listReject__innerList}>
                                            <h4>{d.key}: </h4>

                                            <h4>{d.value}</h4>
                                        </div>
                                    })}

                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Estimated Fee: </h4>
                                        <h4>{valdatorNominatorFee?.fee} 5IRE</h4>
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
                    />
                </div>
            </div>

        </div>
    );
}

export default ValidatorNominatorTxns;
