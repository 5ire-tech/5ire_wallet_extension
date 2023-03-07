import { Drawer } from "antd";
import { toast } from "react-toastify";
import React, { useState } from "react";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { TX_TYPE } from "../../Constants/index";
import Logout from "../../Assets/PNG/logout.png";
import Import from "../../Assets/PNG/import.png";
import Wallet from "../../Assets/WalletIcon.svg";
import Setting from "../../Assets/PNG/setting.png";
import Sendhistry from "../../Assets/sendhistry.svg";
import HistoryIcon from "../../Assets/PNG/histry.png";
import Myaccount from "../../Assets/PNG/myaccount.png";
import { useSelector, useDispatch } from "react-redux";
import BackArrow from "../../Assets/PNG/arrowright.png";
import Walletlogo from "../../Assets/PNG/walletlogo.png";
import { shortner, formatDate } from "../../Helper/helper";
import SocialAccount from "../SocialAccount/SocialAccount";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import ManageCustom from "../ManageCustomtocken/ManageCustom";
import Createaccount from "../../Assets/PNG/createaccount.png";
import AccountSetting from "../AccountSetting/AccountSetting.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TransectionHistry from "../TransectionHistry/TransectionHistry";
import { setCurrentAcc } from "../../Utility/redux_helper";
// import { Moment } from "moment";
// import DefiIcon from "../../Assets/DefiIcon.svg";
// import SettignIcon from "../../Assets/SettignIcon.svg";
// import ButtonComp from "../ButtonComp/ButtonComp";
import FooterStepOne, {
  ApproveLogin,
  FooterStepTwo,
  ApproveTx,
} from "./FooterContinue";

function MenuFooter() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getLocation = useLocation();
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [history, setHistory] = useState([]);
  // const [accData, setAccData] = useState([]);
  const path = getLocation.pathname.replace("/", "");
  const { accounts,
    currentAccount,
    currentNetwork
  } = useSelector((state) => state.auth);


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
    navigate("/createNewWallet");
  };

  const handleImportAcc = () => {
    navigate("/importWallet");
  };

  const handleLogout = async () => {
    const res = await logout();

    if (!res.error) {
      navigate("/unlockWallet");
    } else {
      toast.error("Error while logging out!");
    }
  };

  const onSelectAcc = (accId) => {
    // dispatch(resetBalance());
    let acc = accounts.find(acc => acc.id === accId);
    dispatch(setCurrentAcc(acc));
    onClose();
  };

  const handleHistoryOpen = () => {
    setOpen1(true);
    let filterData = currentAccount.txHistory.filter((his) => {
      return his.chain === currentNetwork.toLowerCase();
    });
    let newArr = [];
    for (let i = filterData.length - 1; i >= 0; i--) {
      newArr.push(filterData[i]);
    }
    setHistory(newArr);
  }


  const edited = false;

  return (
    <div className={`${style.menuItems} welcomeFooter`}>
      {/* {path === "wallet" && (
        <Link
          to="/wallet"
          // onClick={() => setactiveLink("wallet")}
          className={`${style.menuItems__items} ${path === "wallet" ? style.menuItems__items__active : ""
            }`}
        >
          <div className={style.menuItems__items__img}>
            <img src={Walletlogo} alt="Walletlogo"/>
          </div>
          <span className={style.menuItems__items__title}>Wallet</span>
        </Link>
      )} */}
      {path === "wallet" && (
        <Link
          to="#"
          // onClick={() => setOpen1(true)}
          onClick={handleHistoryOpen}
          className={`${style.menuItems__items} ${path === "history" ? style.menuItems__items__active : ""
            }`}
        >
          <div className={style.menuItems__items__img}>
            <img src={HistoryIcon} alt="HistoryIcon" draggable={false} />
          </div>
          <span className={style.menuItems__items__title}>History</span>
        </Link>
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
          history?.map((data) => (
            <TransectionHistry
              dateTime={formatDate(data.dateTime)}
              type={data?.type}
              txHash={data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase() ?
                data.txHash.mainHash : data.txHash}
              to={
                data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase()
                  ? data.to
                  : `${data?.to ? `To: `+shortner(data.to) : ""}`
              }
              amount={`${data?.amount} 5ire`}
              status={data?.status.charAt(0).toUpperCase() + data?.status.slice(1)}
              img={Sendhistry}
            />
          ))
        ) : (
          <h4 className={style.noTxn}>No Transaction Found!</h4>
        )}
      </Drawer>

      {path === "wallet" && (
        <Link
          // to="/setting"
          // onClick={() => setOpen(true)}
          onClick={handleMyAccOpen}
          className={`${style.menuItems__items} ${path === "setting" ? style.menuItems__items__active : ""
            }`}
        >
          <div className={style.menuItems__items__img}>
            <img src={Myaccount} alt="Myaccount" draggable={false} />
          </div>
          <span className={style.menuItems__items__title}>My Accounts</span>
        </Link>
      )}
      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            My Accounts
          </span>
        }
        placement="bottom"
        onClose={onClose}
        open={open}
        closeIcon={<img src={ModalCloseIcon} alt="ModalCloseIcon" draggable={false} />}
      >
        {accounts?.map((data, index) => (
          <ManageCustom
            img={Sendhistry}
            data={data}
            active={data?.id === currentAccount?.id ? true : false}
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

      {path === "wallet" && (
        <Link
          // to="/setting"
          onClick={() => setOpen2(true)}
          className={`${style.menuItems__items} ${path === "setting" ? style.menuItems__items__active : ""
            }`}
        >
          <div className={style.menuItems__items__img}>
            <img src={Setting} alt="Setting" draggable={false} />
          </div>
          <span className={style.menuItems__items__title}>Settings</span>
        </Link>
      )}
      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Settings
          </span>
        }
        placement="bottom"
        onClose={onClose2}
        open={open2}
        closeIcon={<img src={ModalCloseIcon} alt="ModalCloseIcon" draggable={false} />}
      >
        <Link to="/manageWallet">
          <div className={style.sttings}>
            <div className={style.sttings__left}>
              <div className={style.walletIconBorder}><img draggable={false} src={Wallet} width={30} height={30} alt="walletIcon" /></div>
              <div className={style.sttings__left__texts}>
                <div className={style.sttings__left__textsTop}>
                  Manage Wallet
                </div>
              </div>
            </div>

            <div className={style.sttings__right}>
              <img src={BackArrow} width={8} height={15} alt="backArrow" draggable={false} />
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
      {path === "beforebegin" && <FooterStepOne />}
      {path === "createwalletchain" && <FooterStepTwo />}
      {/* {path === "setPassword" && <FooterStepThree />} */}
      {path === "loginApprove" && <ApproveLogin />}
      {path === "approveTx" && <ApproveTx />}
    </div>
  );
}

export default MenuFooter;
