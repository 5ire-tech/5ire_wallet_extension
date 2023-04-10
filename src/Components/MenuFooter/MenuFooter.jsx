import { Drawer } from "antd";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import useAuth from "../../Hooks/useAuth";
import Browser from "webextension-polyfill";
import Logout from "../../Assets/PNG/logout.png";
import Import from "../../Assets/PNG/import.png";
import Wallet from "../../Assets/WalletIcon.svg";
import PrivacyPo from "../../Assets/PrivacyPo.svg";
import Setting from "../../Assets/setting.svg";
import Sendhistry from "../../Assets/sendhistry.svg";
import { arrayReverser } from "../../Utility/utility";
import HistoryIcon from "../../Assets/histry.svg";
import Myaccount from "../../Assets/myaccount.svg";
import BackArrow from "../../Assets/PNG/arrowright.png";
import { shortner, formatDate } from "../../Helper/helper";
import SocialAccount from "../SocialAccount/SocialAccount";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import ManageCustom from "../ManageCustomtocken/ManageCustom";
import Createaccount from "../../Assets/PNG/createaccount.png";
import { ACCOUNT_CHANGED_EVENT } from "../../Scripts/constants";
import AccountSetting from "../AccountSetting/AccountSetting.jsx";
import { Link, useNavigate, useLocation, Routes } from "react-router-dom";
import React, { useState, useContext, useEffect, useRef } from "react";
import { getCurrentTabUId, getCurrentTabUrl } from "../../Scripts/utils";
import TransectionHistry from "../TransectionHistry/TransectionHistry";
import {
  EMTY_STR,
  ERROR_MESSAGES,
  LABELS,
  TX_TYPE,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
} from "../../Constants/index";
import FooterStepOne, {
  ApproveLogin,
  FooterStepTwo,
  ApproveTx,
} from "./FooterContinue";
import { ROUTES } from "../../Routes";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import PrivacyPolicy from "./PrivacyPolicy";

function MenuFooter() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { state, updateState } = useContext(AuthContext);
  const getLocation = useLocation();
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [history, setHistory] = useState([]);
  const [accData, setAccData] = useState([]);

  const { pathname } = getLocation;

  const { currentAccount, allAccounts, currentNetwork, txHistory } = state;

  useEffect(() => {
    setAccData(allAccounts ? allAccounts[currentAccount.index] : {});
  }, [currentAccount?.accountName, allAccounts?.length]);

  const onClose1 = () => {
    setOpen1(false);
  };
  const onClose2 = () => {
    setOpen2(false);
  };
  const onClose = () => {
    setOpen(false);
  };

  const handleMyAccOpen = () => {
    setOpen(true);
    // setAccData(accounts);
  };

  const hanldeCreateNewAcc = () => {
    navigate(ROUTES.CREATE_WALLET);
  };

  const handleImportAcc = () => {
    navigate(ROUTES.IMPORT_WALLET);
  };

  const handleLogout = async () => {
    const res = await logout();

    if (!res.error) {
      navigate(ROUTES.UNLOACK_WALLET);
    } else {
      toast.error(ERROR_MESSAGES.LOGOUT_ERR);
    }
  };

  const onSelectAcc = (accId) => {
    let acc = allAccounts.find((acc) => acc.id === accId);
    updateState(LABELS.CURRENT_ACCOUNT, {
      accountName: acc.accountName,
      index: Number(acc.id) - 1,
    });

    //send account details whenever account is changed
    getCurrentTabUId((id) => {
      getCurrentTabUrl((url) => {
        if (!(url === "chrome://extensions")) {
          Browser.tabs.sendMessage(id, {
            id: ACCOUNT_CHANGED_EVENT,
            method: ACCOUNT_CHANGED_EVENT,
            response: {
              evmAddress: acc.evmAddress,
              nativeAddress: acc.nativeAddress,
            },
          });
        }
      });
    });

    //fetch balance of changed account
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI,
      MESSAGE_EVENT_LABELS.BALANCE,
      {}
    );

    onClose();
  };

  const handleHistoryOpen = () => {
    if (txHistory.hasOwnProperty(accData.accountName)) {
      let txData = txHistory[accData.accountName].filter(
        (tx) => tx?.chain.toLowerCase() === currentNetwork.toLowerCase()
      );
      setHistory(arrayReverser(txData));
    }
    setOpen1(true);
  };

  return (
    <div className={`${style.menuItems} welcomeFooter`}>
      {(pathname === ROUTES.WALLET ||
        pathname === ROUTES.HISTORY_P ||
        pathname === ROUTES.MYACCOUNT) && (
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
            to={ROUTES.MYACCOUNT}
            // onClick={handleMyAccOpen}
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
        {history?.length > 0 ? (
          history?.map((data, index) => (
            <TransectionHistry
              dateTime={formatDate(data.dateTime)}
              type={data?.type}
              txHash={
                data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase()
                  ? data.txHash.mainHash
                  : data.txHash
              }
              to={
                data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase()
                  ? data.to
                  : `${data?.to ? `To: ` + shortner(data.to) : EMTY_STR}`
              }
              amount={`${data?.amount} 5ire`}
              status={
                data?.status.charAt(0).toUpperCase() + data?.status.slice(1)
              }
              img={Sendhistry}
              key={index + "5ire"}
            />
          ))
        ) : (
          <h4 className={style.noTxn}>No Transaction Found!</h4>
        )}
      </Drawer>

      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            My Accounts
          </span>
        }
        placement="bottom"
        onClose={onClose}
        open={open}
        closeIcon={
          <img src={ModalCloseIcon} alt="ModalCloseIcon" draggable={false} />
        }
      >
        {allAccounts?.map((data, index) => (
          <ManageCustom
            img={Sendhistry}
            data={data}
            active={data?.id === accData?.id ? true : false}
            edited={false}
            checkValue={index}
            onSelectAcc={onSelectAcc}
          />
        ))}
        <AccountSetting
          img={Createaccount}
          title="Create a New Wallet"
          onClick={hanldeCreateNewAcc}
        />
        <AccountSetting
          img={Import}
          title="Import Wallet"
          onClick={handleImportAcc}
        />
        <AccountSetting img={Logout} title="Logout" onClick={handleLogout} />
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
        <Link to={ROUTES.MANAGE_WALLET}>
          <div className={style.sttings} style={{ marginTop: "14px" }}>
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
        </Link>

        <SocialAccount />
      </Drawer>

      {/* {(path === "" ||
        path === "createNewWallet" ||
        path === "unlockWallet" ||
        path === "importWallet") && (
          <div className={style.menuItems__needHelp}>
            <p>
              Need help? Contact <a>Support</a>
            </p>
          </div>
        )} */}
      {pathname === ROUTES.BEFORE_BEGIN && <FooterStepOne />}
      {pathname === ROUTES.NEW_WALLET_DETAILS && <FooterStepTwo />}
      {pathname === ROUTES.LOGIN_APPROVE && <ApproveLogin />}
      {pathname === ROUTES.APPROVE_TXN && <ApproveTx />}
      {(pathname === ROUTES.CREATE_WALLET ||
        pathname === ROUTES.UNLOACK_WALLET ||
        pathname === ROUTES.FORGOTPASSWORD ||
        pathname === ROUTES.IMPORT_WALLET) && <PrivacyPolicy />}
    </div>
  );
}

export default MenuFooter;
