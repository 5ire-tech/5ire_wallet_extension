import { Layout } from "antd";
import React, { useEffect } from "react";
import style from "../../Layout/style.module.scss";
import footerstyle from "../MenuFooter/style.module.scss"
import pageStyle from "../../Pages/RejectNotification/style.module.scss"
import { setUIdata } from "../../Store/reducer/auth";
import { useDispatch, useSelector } from "react-redux";
import Browser from "webextension-polyfill";
import ButtonComp from "../ButtonComp/ButtonComp";
import UseWallet from "../../Hooks/useWallet";
import { useState } from "react";


function NativeTx() {
    const { Content } = Layout;
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { addNominator } = UseWallet();
    const [fee, setFee] = useState(0)
    useEffect(() => {
        addNominator(auth?.uiData?.message, true).then((fee) => setFee(fee.data))
    }, [])
    function handleClick(isApproved) {
        if (isApproved) {
            // dispatch(toggleLoader(true));

            //   evmTransfer(
            //     {
            //       to: auth?.uiData?.message?.to,
            //       amount: auth?.uiData?.message?.value,
            //       data: auth?.uiData?.message?.data,
            //     },
            //     true
            //   ).then((rs) => {
            //     if (rs.error) {
            //       browser.tabs.sendMessage(auth.uiData.tabId, {
            //         id: auth.uiData.id,
            //         response: null,
            //         error: rs.data,
            //       });
            //     } else {
            //       browser.tabs.sendMessage(auth.uiData.tabId, {
            //         id: auth.uiData.id,
            //         response: rs.data,
            //         error: null,
            //       });
            //     }

            //     dispatch(setUIdata({}));
            //     dispatch(toggleLoader(false));

            //     setTimeout(() => {
            //       window.close();
            //     }, 300);
            //   });
        } else {
            Browser.tabs.sendMessage(auth.uiData.tabId, {
                id: auth.uiData.id,
                response: null,
                error: "User rejected  transactoin.",
            });

            dispatch(setUIdata({}));
            window.close();
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
                                        Tx Detail
                                    </button>
                                </div>

                                <div className={pageStyle.rejectedSec__listReject}>

                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>From: </h4>
                                        <h4>{auth?.currentAccount?.nativeAddress}</h4>
                                    </div>
                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Method: </h4>
                                        <h4>{auth?.uiData?.method || ""}</h4>
                                    </div>
                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Params: </h4>
                                        <h4>{String(JSON.stringify(auth?.uiData?.message) || '')}</h4>
                                    </div>

                                    <div className={pageStyle.rejectedSec__listReject__innerList}>
                                        <h4>Fee: </h4>
                                        <h4>{fee} 5IRE</h4>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                </Content>

                <div className={footerstyle.menuItems__cancleContinue}>
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
