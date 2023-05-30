import { Drawer } from "antd";
import { ROUTES } from "../../Routes";
import React, { useState } from "react";
import style from "./style.module.scss";
import PrivacyPolicy from "./PrivacyPolicy";
import Setting from "../../Assets/setting.svg";
import Wallet from "../../Assets/WalletIcon.svg";
import HistoryIcon from "../../Assets/histry.svg";
import PrivacyPo from "../../Assets/PrivacyPo.svg";
import Myaccount from "../../Assets/myaccount.svg";
import { openBrowserTab } from "../../Helper/helper";
import { Link, useLocation } from "react-router-dom";
import BackArrow from "../../Assets/PNG/arrowright.png";
import SocialAccount from "../SocialAccount/SocialAccount";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import {
  SOCIAL_LINKS,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";
import FooterStepOne, {
  ApproveTx,
  ApproveLogin,
  FooterStepTwo
} from "./FooterContinue";

function MenuFooter() {
  const getLocation = useLocation();
  const [open2, setOpen2] = useState(false);
  const { pathname } = getLocation;

  const onClose2 = () => {
    setOpen2(false);
  };

  const handleMyAccOpen = () => {
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.GET_ACCOUNTS,
      {}
    );
  };

  return (
    <div className={`${style.menuItems} welcomeFooter`}>
      {(pathname === ROUTES.WALLET ||
        pathname === ROUTES.HISTORY_P ||
        pathname === ROUTES.MY_ACCOUNT) && (
        <>
          <Link
            draggable={false}
            to={ROUTES.WALLET}
            className={`${style.menuItems__items} ${
              pathname === ROUTES.WALLET ? style.menuItems__items__active : ""
            }`}>
            <div className={style.menuItems__items__img}>
              <img src={Wallet} alt="HistoryIcon" draggable={false} />
            </div>
            <span className={style.menuItems__items__title}>Wallet</span>
          </Link>
          <Link
            draggable={false}
            to={ROUTES.HISTORY_P}
            className={`${style.menuItems__items} ${
              pathname === ROUTES.HISTORY_P
                ? style.menuItems__items__active
                : ""
            }`}>
            <div className={style.menuItems__items__img}>
              <img src={HistoryIcon} alt="HistoryIcon" draggable={false} />
            </div>
            <span className={style.menuItems__items__title}>History</span>
          </Link>

          <Link
            draggable={false}
            to={ROUTES.MY_ACCOUNT}
            onClick={handleMyAccOpen}
            className={`${style.menuItems__items} ${
              pathname === ROUTES.MY_ACCOUNT
                ? style.menuItems__items__active
                : ""
            }`}>
            <div className={style.menuItems__items__img}>
              <img src={Myaccount} alt="Myaccount" draggable={false} />
            </div>
            <span className={style.menuItems__items__title}>My Accounts</span>
          </Link>

          <Link
            draggable={false}
            onClick={() => setOpen2(true)}
            className={`${style.menuItems__items} ${
              pathname === ROUTES.MANAGE_WALLET
                ? style.menuItems__items__active
                : ""
            }`}>
            <div className={style.menuItems__items__img}>
              <img src={Setting} alt="Setting" draggable={false} />
            </div>
            <span className={style.menuItems__items__title}>Settings</span>
          </Link>
        </>
      )}

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
          <img
            src={ModalCloseIcon}
            alt="ModalCloseIcon"
            draggable={false}
            className="closeModalIcon"
          />
        }>
        <Link to={ROUTES.MANAGE_WALLET} draggable={false}>
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

        <div
          className={style.sttings}
          style={{ marginTop: "14px" }}
          onClick={() => openBrowserTab(SOCIAL_LINKS.POLICY)}>
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

        <SocialAccount />
      </Drawer>

      {pathname === ROUTES.BEFORE_BEGIN && <FooterStepOne />}
      {pathname === ROUTES.NEW_WALLET_DETAILS && <FooterStepTwo />}
      {pathname === ROUTES.LOGIN_APPROVE && <ApproveLogin />}
      {pathname === ROUTES.APPROVE_TXN && <ApproveTx />}
      {(pathname === ROUTES.CREATE_WALLET ||
        pathname === ROUTES.UNLOACK_WALLET ||
        pathname === ROUTES.FORGOT_PASSWORD ||
        pathname === ROUTES.IMPORT_WALLET ||
        pathname === ROUTES.DEFAULT) && <PrivacyPolicy />}
    </div>
  );
}

export default MenuFooter;
