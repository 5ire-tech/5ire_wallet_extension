import { ROUTES } from "../../Routes";
import { Dropdown, Space } from "antd";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import Browser from "webextension-polyfill";
import ThreeDot from "../../Assets/dot3.svg";
import GreenCircle from "../../Assets/greencircle.svg";
import { useNavigate } from "react-router-dom";
import Import from "../../Assets/PNG/import.png";
import Logout from "../../Assets/PNG/logout.png";
import DarkLogo from "../../Assets/DarkLogo.svg";
import React, { useContext, useState, useEffect } from "react";
import Createaccount from "../../Assets/PNG/createaccount.png";
import {
  sendMessageToTab,
  sendRuntimeMessage,
} from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { getCurrentTabDetails } from "../../Scripts/utils";
import AccountSetting from "../../Components/AccountSetting/AccountSetting";
import {
  LABELS,
  CURRENCY,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  ACCOUNT_CHANGED_EVENT,
  MESSAGE_EVENT_LABELS,
  RESTRICTED_URLS,
  TABS_EVENT,
  WALLET_TYPES,
} from "../../Constants/index";
import { toast } from "react-hot-toast";
import { isEqual } from "../../Utility/utility";
import { TabMessagePayload } from "../../Utility/network_calls";
import {
  checkStringInclusionIntoArray,
  sendEventToTab,
} from "../../Helper/helper";
import fillArow from "../../Assets/fillArow.svg";

function MyAccount() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState(null);
  const {
    allAccounts,
    state,
    updateState,
    removeHistory,
    externalControlsState,
    setNewWalletName,
  } = useContext(AuthContext);
  const { connectedApps } = externalControlsState;
  const { balance, currentAccount } = state;

  useEffect(() => {
    setAccounts(allAccounts);
  }, [allAccounts]);

  const handleRemoveAcc = () => {
    if (!addressToRemove) {
      toast.error(ERROR_MESSAGES.UNABLE_TO_REMOVE_ACC);
    } else {
      if (
        currentAccount.evmAddress === addressToRemove ||
        currentAccount.nativeAddress === addressToRemove
      ) {
        //Remove account
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
          MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT,
          { address: addressToRemove }
        );

        const index = accounts.findIndex(acc => (
          acc.evmAddress === addressToRemove ||
          acc.nativeAddress === addressToRemove
        )
        );

        updateState(LABELS.CURRENT_ACCOUNT, accounts[index - 1]);
        // removeHistory(accounts[index].accountName);
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
          MESSAGE_EVENT_LABELS.BALANCE,
          {}
        );
      }
    }
    handle_OK_Cancel();
  };

  const hanldeCreateNewAcc = () => {
    setNewWalletName("");
    navigate(ROUTES.CREATE_WALLET);
  };

  const handleImportAcc = () => {
    navigate(ROUTES.IMPORT_WALLET);
  };
  const handleLogout = async () => {
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.LOCK,
      {}
    );
  };

  const handleModalOpen = (address) => {
    if (address) {
      setAddressToRemove(address);
      setModalOpen(true);
    }
  };

  const handle_OK_Cancel = () => {
    setModalOpen(false);
  };

  const onSelectAcc = (name) => {
    const acc = accounts.find((acc) => acc.accountName === name);
    updateCurrentAccount(acc);
  };

  //update the current account
  const updateCurrentAccount = (acc) => {
    updateState(LABELS.CURRENT_ACCOUNT, acc);
    //fetch balance of changed account
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
      MESSAGE_EVENT_LABELS.BALANCE,
      {}
    );
    //send account details whenever account is changed
    sendEventToTab(
      new TabMessagePayload(
        TABS_EVENT.ACCOUNT_CHANGE_EVENT,
        {
          result: {
            evmAddress: acc.evmAddress,
            nativeAddress: acc.nativeAddress,
          },
        },
        null,
        TABS_EVENT.ACCOUNT_CHANGE_EVENT
      ),
      connectedApps
    );
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
      {accounts?.map((e, i) => (
        <div
          className={style.myAccountSec__accountActive}
          key={i + e?.accountIndex}
        >
          <div className={style.myAccountSec__leftSec}>
            <img src={DarkLogo} alt="logo" draggable={false} />
            <div className={style.myAccountSec__leftSec__accountConatct}>
              <h2>
                {e?.accountName}
                {e?.type === WALLET_TYPES.IMPORTED_NATIVE ? (
                  <i>
                    {" "}
                    <small> (Imported)</small>
                  </i>
                ) : (
                  ""
                )}
              </h2>
              <p>
                {e?.accountName === currentAccount?.accountName ? (
                  balance?.totalBalance ? (
                    `${balance.totalBalance} ${CURRENCY}`
                  ) : (
                    ""
                  )
                ) : (
                  <span
                    onClick={() => onSelectAcc(e?.accountName)}
                    className={style.myAccountSec__switchAcc}
                  >
                    Switch to this account
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className={style.myAccountSec__rytSec}>
            {/* <h2> */}
            {e?.accountName === currentAccount?.accountName ? (
              <>
                <h2>
                  {" "}
                  <img
                    src={GreenCircle}
                    alt="connectionLogo"
                    draggable={false}
                  />
                  {LABELS.ACTIVE}
                </h2>
              </>
            ) : (
              <h2>{LABELS.NOT_ACTIVE}</h2>
            )}
            {/* </h2> */}
            {Number(e.accountIndex) === 0 && e.type === "hd_wallet" ? (
              ""
            ) : (
              <Dropdown
                placement="bottomRight" arrow={{ pointAtCenter: true }}
                menu={{
                  items: [
                    {
                      key: i,
                      label: (
                        <span onClick={() => handleModalOpen(e.evmAddress)}>
                          Remove
                          {/* <img src={fillArow} /> */}
                        </span>
                      ),
                    },
                  ],
                }}
                trigger="click"
              >
                <Space style={{ cursor: "pointer" }}>
                  <img src={ThreeDot} alt="3dots" />
                </Space>
              </Dropdown>
            )}
          </div>
        </div>
      ))}
      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
        centered
        closeIcon={false}
      >
        <div className={`${style.activeDis_Modal} yesnoPopup`}>
          <center>
            <h3 style={{ color: "white" }}>
              Are you sure, you want to remove this account ?
            </h3>
            <div className="innerContct">
              <button onClick={handleRemoveAcc} className="btnYesNo">
                Yes
              </button>

              <button onClick={handle_OK_Cancel} className="btnYesNo">
                No
              </button>
            </div>
          </center>
        </div>
      </ModalCustom>
    </div>
  );
}

export default MyAccount;
