import { Layout } from "antd";
import React, { useEffect, useRef } from "react";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss"
import pageStyle from "../../Pages/RejectNotification/style.module.scss"
import { setTxHistory, setUIdata, toggleLoader } from "../../Utility/redux_helper";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";
import Browser from "webextension-polyfill";
import UseWallet from "../../Hooks/useWallet";
import ButtonComp from "../ButtonComp/ButtonComp";
import { shortLongAddress } from "../../Utility/utility";
import {closeBoth} from "../../Utility/window.helper"
import { connectionObj, Connection } from "../../Helper/connection.helper";
import {
    STATUS,
    TX_TYPE,
    HTTP_END_POINTS,
    WS_END_POINTS
} from "../../Constants";


const extraFee = 0.02;



function NativeTx() {
    const { Content } = Layout;
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [fee, setFee] = useState(0);
    const [fomattedMethod, setFormattedMethod] = useState('')

    useEffect(() => {
        calculateFee();
    }, [])


    Browser.runtime.onMessage.addListener(async (res) => {
        if (res.type === "EST_GAS") {
          console.log("here the data from background EST_GAS: ", res);
          if(res?.data?.feeData?.error) {
            console.log("error happend while native transaction: ", res?.data?.feeData?.error);
            return;
          }
          setFee(res?.data?.feeData?.data)
          setFormattedMethod(res?.data?.methodName)
        } else if(res.type === "NATIVE_TX") {

            console.log("here is the tx data: ", res);

            if (res.data.feeData.error) {

                console.log("error is here: ", res);

                await Browser.tabs.sendMessage(auth.uiData.tabId, {
                    id: auth.uiData.id,
                    response: null,
                    error: res?.data?.feeData?.data,
                });
            } else {

                //dispatch the native transactions
                await Browser.tabs.sendMessage(auth.uiData.tabId, {
                    id: auth.uiData.id,
                    response: res?.data?.feeData?.data,
                    error: null,
                });

                closeBoth();

                let dataToDispatch = {
                    data: {
                        chain: auth?.currentNetwork.toLowerCase(),
                        isEvm: false,
                        dateTime: new Date(),
                        to: "",
                        type: TX_TYPE?.SEND,
                        amount: 0,
                        txHash: res.data.feeData?.data?.txHash,
                        status: STATUS.SUCCESS
                    },
                    index: auth?.accounts.findIndex((obj) => obj.id === auth?.currentAccount?.id),
                };
                dispatch(setTxHistory(dataToDispatch));
                dispatch(setUIdata({}));
            }

        }

        // dispatch(toggleLoader(false));
      });


     function calculateFee() {
        // dispatch(toggleLoader(true));
        Browser.runtime.sendMessage({type: "gas"});
     } 

    // async function loadApi() {
    //     try {
    //         dispatch(toggleLoader(true));
    //         const apiRes = await connectionObj.initializeApi(auth.wsEndPoints.testnet, auth.wsEndPoints.qa, auth.currentNetwork, false);

    //         if(!apiRes?.value) {
    //             apiRef.current = apiRes;
    //             getBalance(apiRef.current.evmApi, apiRef.current.nativeApi, true);
    //             setReadyApi(true);
    //         }

    //     } catch (err) {
    //         console.log("Error while creating the connection: ", err);
    //         dispatch(toggleLoader(false));
    //         setReadyApi(false);
    //     }
    // }

    function handleClick(isApproved) {

        if (isApproved) {
            if (+auth?.balance?.nativeBalance < +fee) {
                return toast.error("Insufficient Funds")
            }
            const method = auth?.uiData?.method;
            const validationMethods = ["native_validator_bondmore", "native_nominator_bondmore", "native_withdraw_nominator", "native_withdraw_validator", "native_withdraw_nominator", "native_withdraw_validator"]
            if (validationMethods.includes(method)) {
                const totalAmount = +fee + +auth?.uiData?.message?.amount;
                // console.log("HERE TESET", fee, auth?.balance?.nativeBalance, totalAmount)
                if (+auth?.balance?.nativeBalance < totalAmount) {
                    return toast.error("Insufficient Funds: Fee + Amount is more than available balance,")
                }
            }

            // dispatch(toggleLoader(true));
            Browser.runtime.sendMessage({type: "native_tx", isFee: false})

        } else {
            Browser.tabs.sendMessage(auth.uiData.tabId, {
                id: auth.uiData.id,
                response: null,
                error: "User rejected transaction.",
            });
            // dispatch(toggleLoader(false));
            closeBoth();
            dispatch(setUIdata({}));
        }
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
