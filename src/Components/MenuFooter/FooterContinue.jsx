import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import ButtonComp from "../ButtonComp/ButtonComp";
import style from "./style.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import {
  setLogin,
  setSite,
  setUIdata,
  toggleLoader,
  toggleSite,
  setNewAccount,
} from "../../Store/reducer/auth";
import browser from "webextension-polyfill";
import useWallet from "../../Hooks/useWallet";

function FooterStepOne() {
  const { isLogin } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const handleCancle = () => {
    if (isLogin) navigate("/wallet");
    else navigate("/");
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
  const { isLogin } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCancle = () => {
    dispatch(setNewAccount(null));
    navigate("/beforebegin");
  };

  const handleClick = () => {
    if (isLogin) navigate("/wallet");
    else navigate("/setPassword");
  };
  return (
    <>
      <div className={style.menuItems__cancleContinue}>
        {!isLogin && (
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

export const FooterStepThree = () => {
  const { pass, passError } = useSelector((state) => state.auth);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { setUserPass } = useAuth();
  const dispatch = useDispatch();

  const handleCancle = () => {
    navigate("/createwalletchain");
  };

  const handleSubmit = async () => {
    if (!passError) {
      dispatch(toggleLoader(true));
      let res = await setUserPass(pass);

      if (!res.error) {
        dispatch(toggleLoader(false));

        setShow(true);
        setTimeout(() => {
          dispatch(setLogin(true));

          setShow(false);
          setTimeout(() => {
            navigate("/wallet");
          }, 500);
        }, 2000);
      }

      if (res.error) {
        dispatch(toggleLoader(false));
        toast.error(res.data);
      }
    }
  };

  return (
    <>
      <div className={style.menuItems__cancleContinue}>
        <ButtonComp
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
          onClick={handleCancle}
        />

        {show && (
          <div className="loader">
            <CongratulationsScreen />
          </div>
        )}

        <ButtonComp
          onClick={handleSubmit}
          text={"Continue"}
          maxWidth={"100%"}
        />
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
          evmAddress: auth.currentAccount.evmAddress,
          nativeAddress: auth.currentAccount.nativeAddress,
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

    dispatch(setUIdata({}));
    dispatch(toggleLoader(false));
    setTimeout(() => {
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

      evmTransfer(
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
    } else {
      browser.tabs.sendMessage(auth.uiData.tabId, {
        id: auth.uiData.id,
        response: null,
        error: "User rejected  transactoin.",
      });

      dispatch(setUIdata({}));
      window.close();
    }
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
