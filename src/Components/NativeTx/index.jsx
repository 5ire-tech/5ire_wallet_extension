import { Layout } from "antd";
import React, { useEffect } from "react";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss"
import pageStyle from "../../Pages/RejectNotification/style.module.scss"
import { setTxHistory, setUIdata, toggleLoader } from "../../Utility/redux_helper";
import { useDispatch, useSelector } from "react-redux";
import Browser from "webextension-polyfill";
import ButtonComp from "../ButtonComp/ButtonComp";
import UseWallet from "../../Hooks/useWallet";
import { useState } from "react";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import { STATUS, TX_TYPE } from "../../Constants";
import { toast } from "react-toastify";
import { shortLongAddress } from "../../Utility/utility";


const extraFee = 0.02;

function NativeTx() {
    const { Content } = Layout;
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { addNominator, reNominate, nominatorValidatorPayout, stopValidatorNominator, unbondNominatorValidator, withdrawNominatorValidatorData, withdrawNominatorUnbonded, addValidator, bondMoreFunds, restartValidator } = UseWallet();
    const [fee, setFee] = useState(0);
    const [fomattedMethod, setFormattedMethod] = useState('')

    useEffect(() => {
        getFee()
    }, [])

    function getFee() {
        dispatch(toggleLoader(true));

        connectionObj.initializeApi(auth.wsEndPoints.testnet, auth.wsEndPoints.qa, auth.currentNetwork, false).then(async (apiRes) => {
            if (!apiRes?.value) {
                Connection.isExecuting.value = false;
            }
            let feeData, methodName = '';
            switch (auth?.uiData?.method) {
                case "native_add_nominator":
                    feeData = await addNominator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Add Nominator";
                    break;
                case "native_renominate":
                    feeData = await reNominate(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Re-Nominate";
                    break;
                case "native_nominator_payout":
                    feeData = await nominatorValidatorPayout(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Nominator Payout";
                    break;
                case "native_validator_payout":
                    feeData = await nominatorValidatorPayout(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Validator Payout";
                    break;
                case "native_stop_validator":
                    feeData = await stopValidatorNominator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Stop Validator";
                    break;

                case "native_stop_nominator":
                    feeData = await stopValidatorNominator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Stop Nominator";
                    break;
                case "native_unbond_validator":
                    feeData = await unbondNominatorValidator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Unbond Validator";
                    break;

                case "native_unbond_nominator":
                    feeData = await unbondNominatorValidator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Unbond Nominator";
                    break;
                case "native_withdraw_nominator":
                    feeData = await withdrawNominatorValidatorData(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Send Funds";
                    break;

                case "native_withdraw_validator":
                    feeData = await withdrawNominatorValidatorData(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Send Funds";
                    break;
                case "native_withdraw_nominator_unbonded":
                    feeData = await withdrawNominatorUnbonded(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Withdraw Nominator Unbonded";
                    break;

                case "native_add_validator":
                    feeData = await addValidator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Add Validator";
                    break;

                case "native_validator_bondmore":
                    feeData = await bondMoreFunds(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Bond More Funds";
                    break;
                case "native_nominator_bondmore":
                    feeData = await bondMoreFunds(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Bond More Funds";
                    break;
                case "native_restart_validator":
                    feeData = await restartValidator(apiRes.nativeApi, auth?.uiData?.message, true);
                    methodName = "Restart Validator";
                    break;
                default:

            }

            if (!feeData?.error && methodName) {
                setFee(+feeData.data + extraFee);
                setFormattedMethod(methodName)
            } else {
                Browser.tabs.sendMessage(auth.uiData.tabId, {
                    id: auth.uiData.id,
                    response: null,
                    error: feeData.data,
                });

                setTimeout(() => {
                    dispatch(setUIdata({}));
                    window.close();
                }, 300);
            }
            dispatch(toggleLoader(false));

        })

    }



    function handleClick(isApproved) {
        if (isApproved) {
            if (+auth?.balance?.nativeBalance < +fee) {
                return toast.error("Insufficient Funds")
            }
            const method = auth?.uiData?.method;
            const validationMethods = ["native_validator_bondmore", "native_nominator_bondmore", "native_withdraw_nominator", "native_withdraw_validator", "native_unbond_validator", "native_unbond_nominator", "native_withdraw_nominator", "native_withdraw_validator"]
            if (validationMethods.includes(method)) {
                const totalAmount = +fee + +auth?.uiData?.message?.amount;
                // console.log("HERE TESET", fee, auth?.balance?.nativeBalance, totalAmount)
                if (+auth?.balance?.nativeBalance < totalAmount) {
                    return toast.error("Insufficient Funds: Fee + Amount is more than available balance,")
                }
            }
            dispatch(toggleLoader(true));
            connectionObj.initializeApi(auth.httpEndPoints.testnet, auth.httpEndPoints.qa, auth.currentNetwork, false).then(async (apiRes) => {
                if (!apiRes?.value) {
                    Connection.isExecuting.value = false;
                }

                let res
                switch (method) {
                    case "native_add_nominator":
                        res = await addNominator(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    case "native_renominate":
                        res = await reNominate(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    case "native_nominator_payout":
                        res = await nominatorValidatorPayout(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    case "native_validator_payout":
                        res = await nominatorValidatorPayout(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    case "native_stop_validator":
                        res = await stopValidatorNominator(apiRes.nativeApi);
                        break;

                    case "native_stop_nominator":
                        res = await stopValidatorNominator(apiRes.nativeApi);
                        break;
                    case "native_unbond_validator":
                        res = await unbondNominatorValidator(apiRes.nativeApi, auth?.uiData?.message);
                        break;

                    case "native_unbond_nominator":
                        res = await unbondNominatorValidator(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    case "native_withdraw_nominator":
                        res = await withdrawNominatorValidatorData(apiRes.nativeApi, auth?.uiData?.message);
                        break;

                    case "native_withdraw_validator":
                        res = await withdrawNominatorValidatorData(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    case "native_withdraw_nominator_unbonded":
                        res = await withdrawNominatorUnbonded(apiRes.nativeApi, auth?.uiData?.message);
                        break;

                    case "native_add_validator":
                        res = await addValidator(apiRes.nativeApi, auth?.uiData?.message);
                        break;

                    case "native_validator_bondmore":
                        res = await bondMoreFunds(apiRes.nativeApi, auth?.uiData?.message);
                        break;

                    case "native_restart_validator":
                        res = await restartValidator(apiRes.nativeApi, auth?.uiData?.message);
                        break;

                    case "native_nominator_bondmore":
                        res = await bondMoreFunds(apiRes.nativeApi, auth?.uiData?.message);
                        break;
                    default:

                }
                // console.log("HERE RES", res)
                if (res.error) {
                    Browser.tabs.sendMessage(auth.uiData.tabId, {
                        id: auth.uiData.id,
                        response: null,
                        error: res.data,
                    });
                } else {

                    let dataToDispatch = {
                        data: {
                            chain: auth?.currentNetwork.toLowerCase(),
                            isEvm: false,
                            dateTime: new Date(),
                            to: "",
                            type: TX_TYPE?.SEND,
                            amount: 0,
                            txHash: res?.data?.txHash,
                            status: STATUS.SUCCESS
                        },
                        index: auth?.accounts.findIndex((obj) => obj.id === auth?.currentAccount?.id),
                    };


                    dispatch(setTxHistory(dataToDispatch));
                    Browser.tabs.sendMessage(auth.uiData.tabId, {
                        id: auth.uiData.id,
                        response: res.data,
                        error: null,
                    });
                }
                dispatch(toggleLoader(false));

                setTimeout(() => {
                    dispatch(setUIdata({}));
                    window.close();
                }, 300);
            })

        } else {
            Browser.tabs.sendMessage(auth.uiData.tabId, {
                id: auth.uiData.id,
                response: null,
                error: "User rejected  transaction.",
            });
            dispatch(setUIdata({}));
            window.close();
        }

        //false the popup
        Browser.storage.local.set({ popupStatus: false });
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
                                        <h4>{shortLongAddress(String(auth?.currentAccount?.nativeAddress))}</h4>
                                    </div>
                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Method: </h4>
                                        <h4>{fomattedMethod || ""}</h4>
                                    </div>

                                    {formatParams(auth?.uiData?.message).map((d) => {
                                        return <div key={d.key} className={pageStyle.rejectedSec__listReject__innerList}>
                                            <h4>{d.key}: </h4>

                                            <h4>{d.value}</h4>
                                        </div>
                                    })}



                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Estimated Fee: </h4>
                                        <h4>{fee} 5IRE</h4>
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

export default NativeTx;
