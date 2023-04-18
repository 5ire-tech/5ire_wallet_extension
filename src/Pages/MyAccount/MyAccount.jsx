import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import React, { useContext } from "react";
import { AuthContext } from "../../Store";
import Browser from "webextension-polyfill";
import ThreeDot from "../../Assets/dot3.svg";
import Import from "../../Assets/PNG/import.png";
import Logout from "../../Assets/PNG/logout.png";
import DarkLogo from "../../Assets/DarkLogo.svg";
import Createaccount from "../../Assets/PNG/createaccount.png";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { getCurrentTabUId, getCurrentTabUrl } from "../../Scripts/utils";
import AccountSetting from "../../Components/AccountSetting/AccountSetting";
import {
  LABELS,
  MESSAGE_TYPE_LABELS,
  ACCOUNT_CHANGED_EVENT,
  MESSAGE_EVENT_LABELS,
  ERROR_MESSAGES
} from "../../Constants/index";


import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Space } from "antd";

function MyAccount() {
  const items = [
    {
      key: "1",
      label: <Link target="_blank">Delete</Link>,
    },
  ];

  const navigate = useNavigate();
  const { allAccounts, state, updateState } = useContext(AuthContext);
  const { balance, currentAccount } = state;

  console.log("All Accounts :: ", allAccounts);

  const hanldeCreateNewAcc = () => {
    navigate(ROUTES.CREATE_WALLET);
  };
  const handleImportAcc = () => {
    navigate(ROUTES.IMPORT_WALLET);
  };

  const handleLogout = async () => {
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.LOCK, {});
  };

  const onSelectAcc = name => {
    //update the current account
    const acc = allAccounts.find(acc => acc.accountName === name);
    updateState(LABELS.CURRENT_ACCOUNT, acc);

    //fetch balance of changed account
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.BALANCE, {});

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

  };

  return (
    <div className={style.myAccountSec}>
      <div className={style.myAccountSec__tabAccount}>
        <AccountSetting
          img={Createaccount}
          title="Create New Account"
          onClick={hanldeCreateNewAcc}
        />
        <AccountSetting
          img={Import}
          title="Import Account"
          onClick={handleImportAcc}
        />
        <AccountSetting img={Logout} title="Logout" onClick={handleLogout} />
      </div>
      <div className={style.myAccountSec__accountHeading}>
        <h3>My Accounts</h3>
      </div>
      {
        allAccounts?.map((data, index) =>
          <div className={style.myAccountSec__accountActive} key={index + data?.accountIndex}>
            <div className={style.myAccountSec__leftSec}>
              <img src={DarkLogo} alt="logo" draggable={false} />
              <div className={style.myAccountSec__leftSec__accountConatct}>
                <h2>{data?.accountName}</h2>
                <p>{data?.accountName === currentAccount?.accountName ? balance?.totalBalance : <span onClick={() => onSelectAcc(data?.accountName)} className={style.myAccountSec__switchAcc}>Switch to this account</span>}</p>
              </div>
            </div>
            <div className={style.myAccountSec__rytSec}>
              <h2>{data?.accountName === currentAccount?.accountName ? "Active" : "Not Active"}</h2>
              <Dropdown
                menu={{
                  items,
                }}
                trigger="click"
              >
                {/* <a onClick={(e) => e.preventDefault()}> */}
                <Space style={{cursor: "pointer"}}>
                  <img src={ThreeDot} alt="3dots"/>
                </Space>
                {/* </a> */}
              </Dropdown>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default MyAccount;
