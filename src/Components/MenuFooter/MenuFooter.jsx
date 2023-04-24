import { Drawer } from "antd";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import PrivacyPolicy from "./PrivacyPolicy";
import Setting from "../../Assets/setting.svg";
import Wallet from "../../Assets/WalletIcon.svg";
import HistoryIcon from "../../Assets/histry.svg";
import PrivacyPo from "../../Assets/PrivacyPo.svg";
import Myaccount from "../../Assets/myaccount.svg";
import React, { useState, useContext } from "react";
import Sendhistry from "../../Assets/sendhistry.svg";
import { openBrowserTab } from "../../Helper/helper";
import { Link, useLocation } from "react-router-dom";
import { arrayReverser } from "../../Utility/utility";
import BackArrow from "../../Assets/PNG/arrowright.png";
import { shortner, formatDate } from "../../Helper/helper";
import SocialAccount from "../SocialAccount/SocialAccount";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import TransectionHistry from "../TransectionHistry/TransectionHistry";
import {
  TX_TYPE,
  CURRENCY,
  EMTY_STR,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  SOCIAL_LINKS
} from "../../Constants/index";
import FooterStepOne, {
  ApproveTx,
  ApproveLogin,
  FooterStepTwo,
} from "./FooterContinue";

function MenuFooter() {
  const getLocation = useLocation();
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const { state } = useContext(AuthContext);

  const { pathname } = getLocation;
  const { currentAccount, currentNetwork, txHistory } = state;

  const onClose1 = () => {
    setOpen1(false);
  };

  const onClose2 = () => {
    setOpen2(false);
  };

  const handleMyAccOpen = () => {
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.GET_ACCOUNTS, {});
  };


  return (
    <div className={`${style.menuItems} welcomeFooter`}>
      {(pathname === ROUTES.WALLET ||
        pathname === ROUTES.HISTORY_P ||
        pathname === ROUTES.MY_ACCOUNT) && (
          <>
            <Link
              to={ROUTES.WALLET} // onClick={handleHistoryOpen}
              className={`${style.menuItems__items} ${style.menuItems__items__active}`}
            >
              <div className={style.menuItems__items__img}>
                <img src={Wallet} alt="HistoryIcon" draggable={false} />
              </div>
              <span className={style.menuItems__items__title}>Wallet</span>
            </Link>
            <Link
              to={ROUTES.HISTORY_P} // onClick={handleHistoryOpen}
              className={`${style.menuItems__items} ${style.menuItems__items__active}`}
            >
              <div className={style.menuItems__items__img}>
                <img src={HistoryIcon} alt="HistoryIcon" draggable={false} />
              </div>
              <span className={style.menuItems__items__title}>History</span>
            </Link>

            <Link
              to={ROUTES.MY_ACCOUNT}
              onClick={handleMyAccOpen}
              className={`${style.menuItems__items} ${style.menuItems__items__active}`}
            >
              <div className={style.menuItems__items__img}>
                <img src={Myaccount} alt="Myaccount" draggable={false} />
              </div>
              <span className={style.menuItems__items__title}>My Accounts</span>
            </Link>

            <Link
              onClick={() => setOpen2(true)}
              className={`${style.menuItems__items} ${style.menuItems__items__active}`}
            >
              <div className={style.menuItems__items__img}>
                <img src={Setting} alt="Setting" draggable={false} />
              </div>
              <span className={style.menuItems__items__title}>Settings</span>
            </Link>
          </>
        )}

      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Transaction History
          </span>
        }
        placement="bottom"
        onClose={onClose1}
        open={open1}
        closeIcon={<img src={ModalCloseIcon} alt="close" draggable={false} />}
      >
        {
          (txHistory[currentAccount?.accountName] ? txHistory[currentAccount?.accountName] : []).filter((tx => tx?.chain.toLowerCase() === currentNetwork.toLowerCase())).length > 0 ?
            (
              arrayReverser(txHistory[currentAccount?.accountName].filter((tx => tx?.chain.toLowerCase() === currentNetwork.toLowerCase()))).map((data, index) => (
                <TransectionHistry
                  dateTime={formatDate(data.dateTime)}
                  type={data?.type}
                  txHash={data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase() ?
                    data.txHash.mainHash : data.txHash}
                  to={
                    data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase()
                      ? data.to
                      : `${data?.to ? `To: ` + shortner(data.to) : EMTY_STR}`
                  }
                  amount={data?.amount}
                  status={data?.status.charAt(0).toUpperCase() + data?.status.slice(1)}
                  img={Sendhistry}
                  key={index + CURRENCY}
                />
              ))
            )
            :
            (<h4 className={style.noTxn}>No Transaction Found!</h4>)
        }

      </Drawer>


      <Drawer
        height={404}
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Settings
          </span>
        }
        placement="bottom"
        onClose={onClose2}
        open={open2}
        closeIcon={
          <img src={ModalCloseIcon} alt="ModalCloseIcon" draggable={false} />
        }
      >
        <Link to={ROUTES.MANAGE_WALLET}>
          <div className={style.sttings}>
            <div className={style.sttings__left}>
              <div className={style.walletIconBorder}>
                <img
                  draggable={false}
                  src={Wallet}
                  width={30}
                  height={30}
                  alt="walletIcon"
                />
              </div>
              <div className={style.sttings__left__texts}>
                <div className={style.sttings__left__textsTop}>
                  Manage Wallet
                </div>
              </div>
            </div>

            <div className={style.sttings__right}>
              <img
                src={BackArrow}
                width={8}
                height={15}
                alt="backArrow"
                draggable={false}
              />
            </div>
          </div>
        </Link>
        {/* <Link to={ROUTES.PRIVACY_POLICY}> */}
        <div className={style.sttings} style={{ marginTop: "14px" }} onClick={() => openBrowserTab(SOCIAL_LINKS.POLICY)}>
          <div className={style.sttings__left}>
            <div className={style.walletIconBorder}>
              <img
                draggable={false}
                src={PrivacyPo}
                width={30}
                height={30}
                alt="walletIcon"
              />
            </div>
            <div className={style.sttings__left__texts}>
              <div className={style.sttings__left__textsTop}>
                Privacy Policy
              </div>
            </div>
          </div>

          <div className={style.sttings__right}>
            <img
              src={BackArrow}
              width={8}
              height={15}
              alt="backArrow"
              draggable={false}
            />
          </div>
        </div>
        {/* </Link> */}

        <SocialAccount />
      </Drawer>

      {pathname === ROUTES.BEFORE_BEGIN && <FooterStepOne />}
      {pathname === ROUTES.NEW_WALLET_DETAILS && <FooterStepTwo />}
      {pathname === ROUTES.LOGIN_APPROVE && <ApproveLogin />}
      {pathname === ROUTES.APPROVE_TXN && <ApproveTx />}
      {(pathname === ROUTES.CREATE_WALLET ||
        pathname === ROUTES.UNLOACK_WALLET ||
        pathname === ROUTES.FORGOT_PASSWORD ||
        pathname === ROUTES.IMPORT_WALLET) && <PrivacyPolicy />}
    </div>
  );
}

export default MenuFooter;