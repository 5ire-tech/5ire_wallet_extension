import QRCode from "react-qr-code";
import { ROUTES } from "../../Routes";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import Browser from "webextension-polyfill";
import ThreeDot from "../../Assets/dot3.svg";
import { shortner } from "../../Helper/helper";
import { Dropdown, Select, Space } from "antd";
import WalletQr from "../../Assets/QRicon.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import DarkLogo from "../../Assets/DarkLogo.svg";
import { Link, useLocation } from "react-router-dom";
import GrayCircle from "../../Assets/graycircle.svg";
import ModalCustom from "../ModalCustom/ModalCustom";
import GreenCircle from "../../Assets/greencircle.svg";
import React, { useEffect, useState, useContext } from "react";
import DownArrowSuffix from "../../Assets/DownArrowSuffix.svg";
// import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { getCurrentTabUId, getCurrentTabUrl } from "../../Scripts/utils";

import {
  EVM,
  COPIED,
  LABELS,
  NATIVE,
  NETWORK,
  EMTY_STR,
  CURRENCY,
  ZERO_CHAR,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  ACCOUNT_CHANGED_EVENT,

} from "../../Constants/index";


function BalanceDetails({ mt0 }) {
  const getLocation = useLocation();
  const [isEvmModal, setIsEvmModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHeaderActive, setHeaderActive] = useState(false);
  const { state, updateState, externalControlsState, allAccounts } = useContext(AuthContext);

  const { connectedApps } = externalControlsState;

  const items = [
    {
      key: "1",
      label: <Link target="_blank">Disconnected</Link>,
    },
  ];
  const { pathname } = getLocation;

  const {
    balance,
    currentAccount,
    currentNetwork,
  } = state;


  useEffect(() => {

    //check if current app is connected with extension
    getCurrentTabUrl((tabUrl) => {
      const isConnectionExist = connectedApps[tabUrl];
      if (isConnectionExist?.isConnected) {
        setIsConnected(isConnectionExist.isConnected);
      }
    });

    sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.BALANCE, {});
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.GET_ACCOUNTS, {});
  }, [currentNetwork, currentAccount.evmAddress]);


  const handleNetworkChange = (network) => {
    //change the network
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.NETWORK_HANDLER, MESSAGE_EVENT_LABELS.NETWORK_CHANGE, {})
    updateState(LABELS.CURRENT_NETWORK, network);

    updateState(LABELS.BALANCE, {
      evmBalance: ZERO_CHAR,
      nativeBalance: ZERO_CHAR,
      totalBalance: ZERO_CHAR,
    });
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

  const handleCopy = (e) => {
    if (e.target.name === NATIVE)
      navigator.clipboard.writeText(currentAccount.nativeAddress);
    else if (e.target.name === EVM)
      navigator.clipboard.writeText(currentAccount.evmAddress);
    toast.success(COPIED);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const evmModal = () => {
    setIsEvmModal(true);
  };
  const evmOk = () => {
    setIsEvmModal(false);
  };
  const evmCancel = () => {
    setIsEvmModal(false);
  };
  const headerActive = () => {
    setHeaderActive(true);
  };
  const handle_OK_Cancel = () => {
    setHeaderActive(false);
  };


  return (
    <>
      {(pathname === ROUTES.WALLET ||
        ROUTES.SWAP_APPROVE ||
        ROUTES.APPROVE_TXN ||
        pathname === ROUTES.HISTORY_P ||
        pathname === ROUTES.MY_ACCOUNT) && (
          <div className={`${style.balanceDetails} ${mt0 ? mt0 : EMTY_STR}`}>
            <div className={style.balanceDetails__decoratedSec}>
              <>
                <img src={DarkLogo} alt="logo" draggable={false} />

                {(pathname === ROUTES.WALLET ||
                  pathname === ROUTES.HISTORY_P ||
                  pathname === ROUTES.MY_ACCOUNT) && (
                    <div className={style.balanceDetails__accountName}>
                      {isConnected ? (
                        <>
                          <p>
                            <img
                              src={GreenCircle}
                              alt="connectionLogo"
                              draggable={false}
                            />
                            {currentAccount?.accountName ? currentAccount?.accountName : ""}
                          </p>
                          <span>
                            {currentAccount?.evmAddress ? currentAccount.evmAddress : ""}{" "}
                            <img
                              draggable={false}
                              src={CopyIcon}
                              alt="copyIcon"
                              name={EVM}
                              onClick={handleCopy}
                            />
                          </span>
                        </>
                      ) : (
                        <>
                          <p onClick={headerActive}>
                            <img
                              src={GrayCircle}
                              alt="connectionLogo"
                              draggable={false}
                            />
                            {currentAccount?.accountName ? currentAccount?.accountName : ""}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                <ModalCustom
                  isModalOpen={isHeaderActive}
                  handleOk={handle_OK_Cancel}
                  handleCancel={handle_OK_Cancel}
                >
                  <div className={style.activeDis_Modal}>
                    <div className={style.activeDis_Modal__modalHeading}>
                      <h3>stake.lido.fi</h3>
                      <p>You have 1 accounts connected to this site.</p>
                    </div>
                    {
                      allAccounts.length > 0 && allAccounts.map((e, i) => (

                        <div className={style.activeDis_Modal__accountActive} key={i + e?.accountName}>
                          <div className={style.activeDis_Modal__leftSec}>
                            <img src={DarkLogo} alt="logo" />
                            <div
                              className={
                                style.activeDis_Modal__leftSec__accountConatct
                              }
                            >
                              <h2>{e.accountName}</h2>

                              {
                                e?.accountName === currentAccount?.accountName
                                  ?
                                  <p>{balance?.totalBalance}</p>
                                  :
                                  <p classname={style.activeDis_Modal__switchAcc} onClick={() => onSelectAcc(e?.accountName)}>
                                    Switch to this account
                                  </p>
                              }

                            </div>
                          </div>
                          <div className={style.activeDis_Modal__rytSec}>
                            <h2>{
                              e?.accountName === currentAccount?.accountName
                                ?
                                LABELS.ACTIVE
                                :
                                LABELS.NOT_ACTIVE
                            }</h2>
                            <Dropdown
                              menu={{
                                items,
                              }}
                              trigger="click"
                            >
                              <Space style={{ cursor: "pointer" }}>
                                <img src={ThreeDot} alt="3dots" />
                              </Space>
                            </Dropdown>
                          </div>
                        </div>
                      ))
                    }

                  </div>
                </ModalCustom>
                <div className={style.balanceDetails__selectStyle}>
                  <Select
                    onChange={handleNetworkChange}
                    suffixIcon={
                      <img
                        src={DownArrowSuffix}
                        alt="DownArrow"
                        draggable={false}
                      />
                    }
                    defaultValue={[
                      {
                        value: currentNetwork,
                        label: (
                          <span className="flexedItemSelect">
                            {currentNetwork || "Testnet"}
                          </span>
                        ),
                      },
                    ]}
                    style={{
                      width: 100,
                    }}
                    options={[
                      {
                        value: NETWORK.TEST_NETWORK,
                        label: <span className="flexedItemSelect">Testnet</span>,
                      },
                      {
                        value: NETWORK.QA_NETWORK,
                        label: (
                          <span className="flexedItemSelect">
                            {NETWORK.QA_NETWORK}
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              </>
            </div>

            {pathname === ROUTES.WALLET && (
              <div className={style.balanceDetails__innerBalance}>
                <div className={style.balanceDetails__innerBalance__totalBalnce}>
                  <p>
                    Total Balance : <span>{balance?.totalBalance ? `${balance.totalBalance} ${CURRENCY}` : ""} </span>
                  </p>
                </div>
                <div className={style.balanceDetails__innerBalance__chainBalance}>
                  <div
                    className={style.balanceDetails__innerBalance__balanceCard}
                  >
                    <div
                      className={style.balanceDetails__innerBalance__balanceName}
                    >
                      <p>Native Chain Balance</p>
                      <h3>
                        {/* <img src={WalletCardLogo} draggable={false} alt="walletLogo" /> */}
                        {balance?.nativeBalance ? balance?.nativeBalance : ""}
                      </h3>
                    </div>
                    <div className={style.balanceDetails__innerBalance__walletQa}>
                      <img
                        onClick={showModal}
                        alt="walletQR"
                        src={WalletQr}
                        width={30}
                        height={30}
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div
                    className={style.balanceDetails__innerBalance__balanceCard}
                  >
                    <div
                      className={style.balanceDetails__innerBalance__balanceName}
                    >
                      <p>EVM Chain Balance</p>
                      <h3>
                        {/* <img src={WalletCardLogo} draggable={false} alt="balanceLogo" /> */}
                        {balance?.evmBalance ? balance?.evmBalance : ""}
                      </h3>
                    </div>
                    <div className={style.balanceDetails__innerBalance__walletQa}>
                      <img
                        onClick={evmModal}
                        alt="balance"
                        src={WalletQr}
                        width={30}
                        height={30}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ModalCustom
              isModalOpen={isModalOpen}
              handleOk={handleOk}
              handleCancel={handleCancel}
            >
              <div className={style.balanceDetails__nativemodal}>
                <div className={style.balanceDetails__nativemodal__innerContact}>
                  <div className={style.balanceDetails__nativemodal__logoFlex}>
                    <img
                      src={DarkLogo}
                      alt="logo"
                      width={55}
                      height={55}
                      draggable={false}
                    />
                    <p className={style.balanceDetails__nativemodal__title}>
                      5ire Native Chain
                    </p>
                  </div>
                  <div className={style.balanceDetails__nativemodal__scanner}>
                    <QRCode
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                      value={currentAccount?.nativeAddress ? currentAccount?.nativeAddress : ""}
                    />
                  </div>
                  <div className={style.balanceDetails__nativemodal__modalOr}>
                    <p>or</p>
                  </div>
                  <p className={style.balanceDetails__nativemodal__addressText}>
                    Your 5ire Native Address
                  </p>
                  <div className={style.balanceDetails__nativemodal__wrapedText}>
                    <p>
                      {currentAccount?.nativeAddress ? shortner(currentAccount?.nativeAddress) : ""}
                      <img
                        draggable={false}
                        src={CopyIcon}
                        alt="copyIcon"
                        name={NATIVE}
                        onClick={handleCopy}
                      />
                    </p>
                  </div>
                  <div
                    className={style.balanceDetails__nativemodal__footerbuttons}
                  ></div>
                </div>
              </div>
            </ModalCustom>
            <ModalCustom
              isModalOpen={isEvmModal}
              handleOk={evmOk}
              handleCancel={evmCancel}
            >
              <div className={style.balanceDetails__nativemodal}>
                <div className={style.balanceDetails__nativemodal__innerContact}>
                  <div className={style.balanceDetails__nativemodal__logoFlex}>
                    <img
                      src={DarkLogo}
                      width={55}
                      height={55}
                      alt="darkLogo"
                      draggable={false}
                    />
                    <p className={style.balanceDetails__nativemodal__title}>
                      5ire EVM Chain
                    </p>
                  </div>
                  <div className={style.balanceDetails__nativemodal__scanner}>
                    <QRCode
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                      value={currentAccount?.evmAddress ? currentAccount.evmAddress : ""}
                    />
                  </div>
                  <div className={style.balanceDetails__nativemodal__modalOr}>
                    <p>or</p>
                  </div>
                  <p className={style.balanceDetails__nativemodal__addressText}>
                    Your 5ire EVM Address
                  </p>
                  <div className={style.balanceDetails__nativemodal__wrapedText}>
                    <p>
                      {currentAccount?.evmAddress ? shortner(currentAccount?.evmAddress) : ""}
                      <img
                        draggable={false}
                        src={CopyIcon}
                        alt="copyIcon"
                        name={EVM}
                        onClick={handleCopy}
                      />
                    </p>
                  </div>
                  <div
                    className={style.balanceDetails__nativemodal__footerbuttons}
                  >
                    {/* <ButtonComp text={"Share Address"} /> */}
                  </div>
                </div>
              </div>
            </ModalCustom>
          </div>
        )}
    </>
  );
}

export default BalanceDetails;
