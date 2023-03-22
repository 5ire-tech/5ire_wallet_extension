import React, { useContext } from "react";
import style from "./style.module.scss";
import browser from "webextension-polyfill";
import useWallet from "../../Hooks/useWallet";
import { useNavigate } from "react-router-dom";
import ButtonComp from "../ButtonComp/ButtonComp";
import { HTTP_END_POINTS, LABELS } from "../../Constants/index";
import { useDispatch, useSelector } from "react-redux";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import {
  setSite,
  setUIdata,
  toggleLoader,
  toggleSite,
  setNewAccount,
} from "../../Utility/redux_helper";
import { AuthContext } from "../../Store";

function FooterStepOne() {
  const { state } = useContext(AuthContext);
  const navigate = useNavigate();
  const {isLogin} = state;

  const handleCancle = () => {
    if (isLogin) navigate("/wallet");
    else 
    navigate("/");
  }
  return (
    <>
      <div className={style.menuItems__cancleContinue}>
        <ButtonComp
          onClick={handleCancle}
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
        />
        <ButtonComp
          onClick={() => navigate("/createwalletchain")}
          text={"Continue"}
          maxWidth={"100%"}
        />
      </div>
    </>
  );
}

export default FooterStepOne;

export const FooterStepTwo = () => {
  const { state, updateState } = useContext(AuthContext);
  const navigate = useNavigate();
  const {isLogin} = state;

  const handleCancle = () => {
    updateState(LABELS.NEW_ACCOUNT, null);
    updateState(LABELS.ACCOUNT_NAME, null, false);
    navigate("/beforebegin");
  };

  const handleClick = () => {
    if (isLogin) navigate("/wallet");
    else navigate("/setPassword/create");
  };
  return (
    <>
      <div className={style.menuItems__cancleContinue}>
        {!state.isLogin && (
          <ButtonComp
            bordered={true}
            text={"Cancel"}
            maxWidth={"100%"}
            onClick={handleCancle}
          />
        )}

        <ButtonComp onClick={handleClick} text={"Continue"} maxWidth={"100%"} />
      </div>
    </>
  );
};

export const ApproveLogin = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  function handleClick(isApproved) {
    dispatch(toggleLoader(true));

    if (isApproved) {
      const siteIndex = auth?.connectedSites.findIndex(
        (st) => (st.origin = auth.uiData.message?.origin)
      );

      //if not connected but exists in state we will set connected property true
      if (siteIndex > -1) {
        dispatch(
          toggleSite({ origin: auth.uiData.message?.origin, isConnected: true })
        );
      } else {
        //if use connect same origin again and again we give response back in background script
        dispatch(
          setSite({ origin: auth.uiData.message?.origin, isConnected: true })
        );
      }

      const isEthReq =
        auth.uiData?.message?.method === "eth_requestAccounts" ||
        auth.uiData?.message?.method === "eth_accounts";
      const res = isEthReq
        ? [auth.currentAccount.evmAddress]
        : {
          result: {
            evmAddress: auth.currentAccount.evmAddress,
            nativeAddress: auth.currentAccount.nativeAddress,
          }
        };
      browser.tabs.sendMessage(auth.uiData.tabId, {
        id: auth.uiData.id,
        response: res,
        error: null,
      });
    } else {
      browser.tabs.sendMessage(auth.uiData.tabId, {
        id: auth.uiData.id,
        response: null,
        error: "User rejected connect permission.",
      });
    }

    browser.storage.local.set({ popupStatus: false });
    dispatch(toggleLoader(false));
    setTimeout(() => {
      dispatch(setUIdata({}));
      window.close();
    }, 1000);
  }


  return (
    <>
      <div className={style.menuItems__cancleContinue}>
        <ButtonComp
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
          onClick={() => handleClick(false)}
        />
        <ButtonComp
          onClick={() => handleClick(true)}
          text={"Approve"}
          maxWidth={"100%"}
        />
      </div>
    </>
  );
};


export const ApproveTx = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { evmTransfer } = useWallet();

  function handleClick(isApproved) {
    if (isApproved) {
      dispatch(toggleLoader(true));

      connectionObj.initializeApi(HTTP_END_POINTS.TESTNET, HTTP_END_POINTS.QA, auth.currentNetwork, false).then((apiRes) => {

        if (!apiRes?.value) {
          Connection.isExecuting.value = false;

          evmTransfer(
            apiRes.evmApi,
            {
              to: auth?.uiData?.message?.to,
              amount: auth?.uiData?.message?.value,
              data: auth?.uiData?.message?.data,
            },
            true
          ).then((rs) => {
            if (rs.error) {
              browser.tabs.sendMessage(auth.uiData.tabId, {
                id: auth.uiData.id,
                response: null,
                error: rs.data,
              });
            } else {
              browser.tabs.sendMessage(auth.uiData.tabId, {
                id: auth.uiData.id,
                response: rs.data,
                error: null,
              });
            }

            dispatch(setUIdata({}));
            dispatch(toggleLoader(false));

            setTimeout(() => {
              window.close();
            }, 300);
          });
        }
      });


    } else {
      browser.tabs.sendMessage(auth.uiData.tabId, {
        id: auth.uiData.id,
        response: null,
        error: "User rejected  transaction.",
      });

      dispatch(setUIdata({}));
      window.close();
    }

    browser.storage.local.set({ popupStatus: false });
  }

  return (
    <>
      <div className={style.menuItems__cancleContinue}>
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
    </>
  );
};
