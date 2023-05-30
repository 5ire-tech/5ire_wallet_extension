import QRCode from "react-qr-code";
import { ROUTES } from "../../Routes";
import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import Info from "../../Assets/infoIcon.svg";
import ThreeDot from "../../Assets/dot3.svg";
import WalletQr from "../../Assets/QRicon.svg";
import { useLocation } from "react-router-dom";
import CopyIcon from "../../Assets/CopyIcon.svg";
import DarkLogo from "../../Assets/DarkLogo.svg";
import GrayCircle from "../../Assets/graycircle.svg";
import ModalCustom from "../ModalCustom/ModalCustom";
import GreenCircle from "../../Assets/greencircle.svg";
import { Dropdown, Select, Space, Tooltip } from "antd";
import {
  sendEventToTab,
  formatNumUptoSpecificDecimal
} from "../../Helper/helper";
import React, { useEffect, useState, useContext } from "react";
import DownArrowSuffix from "../../Assets/DownArrowSuffix.svg";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { ExtensionStorageHandler } from "../../Storage/loadstore";
import { isEqual, isNullorUndef, log } from "../../Utility/utility";
import { TabMessagePayload } from "../../Utility/network_calls";

import {
  EVM,
  COPIED,
  LABELS,
  NATIVE,
  NETWORK,
  EMTY_STR,
  CURRENCY,
  TABS_EVENT,
  WALLET_TYPES,
  HTTP_END_POINTS,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  STATE_CHANGE_ACTIONS
} from "../../Constants/index";

function BalanceDetails({ mt0 }) {
  const getLocation = useLocation();
  const [url, setUrl] = useState("");
  const [isNewSite, setNewSite] = useState(false);
  const [isEvmModal, setIsEvmModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHeaderActive, setHeaderActive] = useState(false);
  const {
    state,
    updateState,
    externalControlsState,
    allAccounts,
    updateLoading,
    windowAndTab
  } = useContext(AuthContext);

  const { connectedApps } = externalControlsState;
  const { pathname } = getLocation;

  const { currentAccount, currentNetwork, allAccountsBalance } = state;

  useEffect(() => {
    log(
      "here is the main: ",
      windowAndTab,
      connectedApps,
      connectedApps[windowAndTab.tabDetails.origin]
    );

    const isConnectionExist = connectedApps[windowAndTab.tabDetails.origin];
    if (isConnectionExist?.isConnected) {
      setIsConnected(isConnectionExist.isConnected);
    }
    setUrl(windowAndTab.tabDetails.origin);
    setNewSite(isNullorUndef(isConnectionExist));

    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.GET_ACCOUNTS,
      {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetwork, currentAccount?.evmAddress]);

  //network change handler
  const handleNetworkChange = async (network) => {
    updateLoading(true);

    updateState(LABELS.CURRENT_NETWORK, network);

    updateState(
      LABELS.BALANCE,
      allAccountsBalance[currentAccount?.evmAddress][network?.toLowerCase()]
    );

    //change the network
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.NETWORK_HANDLER,
      MESSAGE_EVENT_LABELS.NETWORK_CHANGE,
      {}
    );

    //send the network change event to current opned tab if its connected
    sendEventToTab(
      windowAndTab,
      new TabMessagePayload(
        TABS_EVENT.NETWORK_CHANGE_EVENT,
        { result: { network, url: HTTP_END_POINTS[network.toUpperCase()] } },
        null,
        TABS_EVENT.NETWORK_CHANGE_EVENT
      ),
      connectedApps
    );
  };

  //account change handler
  const onSelectAcc = (name) => {
    //update the current account
    const acc = allAccounts.find((acc) => acc.accountName === name);
    updateState(LABELS.CURRENT_ACCOUNT, acc);

    if (allAccountsBalance.hasOwnProperty(acc?.evmAddress)) {
      updateState(
        LABELS.BALANCE,
        allAccountsBalance[acc?.evmAddress][currentNetwork.toLowerCase()]
      );
    } else {
      //fetch balance of changed account
      sendRuntimeMessage(
        MESSAGE_TYPE_LABELS.FEE_AND_BALANCE,
        MESSAGE_EVENT_LABELS.BALANCE,
        {}
      );
    }

    //send account details whenever account is changed
    sendEventToTab(
      windowAndTab,
      new TabMessagePayload(
        TABS_EVENT.ACCOUNT_CHANGE_EVENT,
        {
          result: {
            evmAddress: acc?.evmAddress,
            nativeAddress: acc?.nativeAddress
          }
        },
        null,
        TABS_EVENT.ACCOUNT_CHANGE_EVENT
      ),
      connectedApps
    );
  };

  const handleCopy = (e) => {
    if (e.target.name === NATIVE)
      navigator.clipboard.writeText(currentAccount?.nativeAddress);
    else if (e.target.name === EVM)
      navigator.clipboard.writeText(currentAccount?.evmAddress);
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

  //handle the disconnect
  const handleDisconnect = async () => {
    const isAnyError = await ExtensionStorageHandler.updateStorage(
      STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE,
      { connected: false, origin: url },
      { localStateKey: LABELS.EXTERNAL_CONTROLS }
    );
    setIsConnected(false);

    //send the disconnect event to extension
    !isAnyError &&
      sendEventToTab(
        windowAndTab,
        new TabMessagePayload(
          TABS_EVENT.WALLET_DISCONNECTED_EVENT,
          { result: null },
          null,
          TABS_EVENT.WALLET_DISCONNECTED_EVENT
        ),
        connectedApps
      );
  };

  //handle the connect
  const handleConnect = async () => {
    const isAnyError = await ExtensionStorageHandler.updateStorage(
      STATE_CHANGE_ACTIONS.APP_CONNECTION_UPDATE,
      { connected: true, origin: url },
      { localStateKey: LABELS.EXTERNAL_CONTROLS }
    );
    setIsConnected(true);

    //send the disconnect event to extension
    !isAnyError &&
      sendEventToTab(
        windowAndTab,
        new TabMessagePayload(
          TABS_EVENT.WALLET_CONNECTED_EVENT,
          {
            result: {
              evmAddress: currentAccount?.evmAddress,
              nativeAddress: currentAccount?.nativeAddress
            }
          },
          null,
          TABS_EVENT.WALLET_CONNECTED_EVENT
        ),
        connectedApps,
        true
      );
  };

  return (
    <>
      {(isEqual(pathname, ROUTES.WALLET) ||
        isEqual(pathname, ROUTES.SWAP_APPROVE) ||
        isEqual(pathname, ROUTES.APPROVE_TXN) ||
        isEqual(pathname, ROUTES.HISTORY_P) ||
        isEqual(pathname, ROUTES.MY_ACCOUNT)) && (
        <div className={`${style.balanceDetails} ${mt0 ? mt0 : EMTY_STR}`}>
          <div className={style.balanceDetails__decoratedSec}>
            <>
              <img src={DarkLogo} alt="logo" draggable={false} />
              {(isEqual(pathname, ROUTES.WALLET) ||
                isEqual(pathname, ROUTES.HISTORY_P) ||
                isEqual(pathname, ROUTES.APPROVE_TXN) ||
                isEqual(pathname, ROUTES.MY_ACCOUNT)) && (
                <div
                  className={`${
                    isConnected && !isEqual(pathname, ROUTES.APPROVE_TXN)
                      ? style.balanceDetails__accountName
                      : style.balanceDetails__accountName1
                  } ${style.headerInfo}`}>
                  {isConnected && !isEqual(pathname, ROUTES.APPROVE_TXN) ? (
                    <>
                      <p onClick={headerActive}>
                        <img
                          src={GreenCircle}
                          alt="connectionLogo"
                          draggable={false}
                        />
                        {currentAccount?.accountName
                          ? currentAccount?.accountName
                          : ""}
                        <img src={Info} alt="infoIcon" />
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <Tooltip
                          placement="bottom"
                          title={
                            isEqual(pathname, ROUTES.APPROVE_TXN)
                              ? "Connected"
                              : "Not Connected"
                          }>
                          <img
                            src={
                              isEqual(pathname, ROUTES.APPROVE_TXN)
                                ? GreenCircle
                                : GrayCircle
                            }
                            alt="connectionLogo"
                            draggable={false}
                            className="ant-tooltip-open"
                          />
                        </Tooltip>
                        {currentAccount?.accountName
                          ? currentAccount?.accountName
                          : ""}
                      </p>
                    </>
                  )}
                </div>
              )}
              <ModalCustom
                isModalOpen={isHeaderActive}
                handleOk={handle_OK_Cancel}
                handleCancel={handle_OK_Cancel}>
                <div className={style.activeDis_Modal}>
                  <div className={style.activeDis_Modal__modalHeading}>
                    <h3>{url.replace(/[a-z]+:\/\//, "")}</h3>
                    {(!url.startsWith("http") || isNewSite) && (
                      <p>
                        5ire Extension is not connected to this site. To connect
                        to a web3 site, find and click the connect button.
                      </p>
                    )}
                  </div>
                  <div className="headerPopUpModal">
                    {url.startsWith("http") &&
                      !isNewSite &&
                      allAccounts.length > 0 &&
                      allAccounts.map((e, i) => (
                        <div
                          className={style.activeDis_Modal__accountActive}
                          key={i + e?.accountName}>
                          <div className={style.activeDis_Modal__leftSec}>
                            <img src={DarkLogo} alt="logo" />
                            <div
                              className={
                                style.activeDis_Modal__leftSec__accountConatct
                              }>
                              <h2>
                                {e.accountName ===
                                  currentAccount?.accountName && isConnected ? (
                                  <Tooltip placement="bottom" title="Connected">
                                    <img
                                      src={GreenCircle}
                                      alt="connectionLogo"
                                      draggable={false}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    placement="bottom"
                                    title="Not Connected">
                                    <img
                                      className={style.grayCircle}
                                      src={GrayCircle}
                                      alt="connectionLogo"
                                      draggable={false}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </Tooltip>
                                )}
                                {e.accountName}
                              </h2>

                              {e?.accountName ===
                              currentAccount?.accountName ? (
                                <p>
                                  <span
                                    className={
                                      style.activeDis_Modal__leftSec__spanContact
                                    }>
                                    {`${formatNumUptoSpecificDecimal(
                                      allAccountsBalance[
                                        currentAccount?.evmAddress
                                      ][currentNetwork?.toLowerCase()]
                                        ?.totalBalance
                                        ? allAccountsBalance[
                                            currentAccount?.evmAddress
                                          ][currentNetwork?.toLowerCase()]
                                            ?.totalBalance
                                        : 0,
                                      2
                                    )} `}
                                  </span>
                                  &nbsp;{CURRENCY}
                                </p>
                              ) : (
                                <p
                                  className={style.activeDis_Modal__switchAcc}
                                  onClick={() => onSelectAcc(e?.accountName)}>
                                  <span>Switch Account</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={style.activeDis_Modal__rytSec}>
                            {e?.type === WALLET_TYPES.IMPORTED_NATIVE && (
                              <h5>IMPORTED</h5>
                            )}
                            {e.accountName === currentAccount?.accountName && (
                              <Dropdown
                                placement="bottomRight"
                                arrow={{ pointAtCenter: true }}
                                menu={{
                                  items: [
                                    {
                                      key: i,
                                      label: (
                                        <span
                                          onClick={
                                            isConnected
                                              ? handleDisconnect
                                              : handleConnect
                                          }>
                                          {isConnected
                                            ? "Disconnect"
                                            : "Connect"}
                                        </span>
                                      )
                                    }
                                  ]
                                }}
                                trigger="hover">
                                <Space style={{ cursor: "pointer" }}>
                                  <img src={ThreeDot} alt="3dots" />
                                </Space>
                              </Dropdown>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </ModalCustom>
              <div className={style.balanceDetails__selectStyle}>
                <Select
                  disabled={isEqual(pathname, ROUTES.APPROVE_TXN)}
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
                      )
                    }
                  ]}
                  style={{
                    width: 100
                  }}
                  options={[
                    {
                      value: NETWORK.TEST_NETWORK,
                      label: (
                        <span className="flexedItemSelect">
                          {NETWORK.TEST_NETWORK}
                        </span>
                      )
                    },
                    {
                      value: NETWORK.UAT,
                      label: (
                        <span className="flexedItemSelect">{NETWORK.UAT}</span>
                      )
                    },
                    {
                      value: NETWORK.QA_NETWORK,
                      label: (
                        <span className="flexedItemSelect">
                          {NETWORK.QA_NETWORK}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            </>
          </div>

          {pathname === ROUTES.WALLET && (
            <div className={style.balanceDetails__innerBalance}>
              <div className={style.balanceDetails__innerBalance__totalBalnce}>
                <p>
                  Total Balance :{" "}
                  <span>
                    {allAccountsBalance[currentAccount?.evmAddress][
                      currentNetwork.toLowerCase()
                    ].totalBalance ? (
                      <>
                        {" "}
                        <Tooltip
                          placement="bottom"
                          title={
                            allAccountsBalance[currentAccount?.evmAddress][
                              currentNetwork.toLowerCase()
                            ].totalBalance
                          }>
                          <span className="totalBal">
                            {
                              allAccountsBalance[currentAccount?.evmAddress][
                                currentNetwork.toLowerCase()
                              ].totalBalance
                            }
                          </span>
                        </Tooltip>{" "}
                        &nbsp;{CURRENCY}
                      </>
                    ) : (
                      ""
                    )}{" "}
                  </span>
                </p>
              </div>
              <div className={style.balanceDetails__innerBalance__chainBalance}>
                <div
                  className={style.balanceDetails__innerBalance__balanceCard}>
                  <div
                    className={style.balanceDetails__innerBalance__balanceName}>
                    <p>Native Chain Balance</p>
                    <Tooltip
                      title={
                        allAccountsBalance[currentAccount?.evmAddress][
                          currentNetwork.toLowerCase()
                        ]?.nativeBalance
                          ? allAccountsBalance[currentAccount?.evmAddress][
                              currentNetwork.toLowerCase()
                            ]?.nativeBalance
                          : ""
                      }>
                      <h3>
                        {/* <img src={WalletCardLogo} draggable={false} alt="walletLogo" /> */}
                        {allAccountsBalance[currentAccount?.evmAddress][
                          currentNetwork.toLowerCase()
                        ]?.nativeBalance
                          ? allAccountsBalance[currentAccount?.evmAddress][
                              currentNetwork.toLowerCase()
                            ]?.nativeBalance
                          : ""}
                      </h3>
                    </Tooltip>
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
                  className={style.balanceDetails__innerBalance__balanceCard}>
                  <div
                    className={style.balanceDetails__innerBalance__balanceName}>
                    <p>EVM Chain Balance</p>
                    <Tooltip
                      title={
                        allAccountsBalance[currentAccount?.evmAddress][
                          currentNetwork.toLowerCase()
                        ]?.evmBalance
                          ? allAccountsBalance[currentAccount?.evmAddress][
                              currentNetwork.toLowerCase()
                            ]?.evmBalance
                          : ""
                      }>
                      <h3>
                        {allAccountsBalance[currentAccount?.evmAddress][
                          currentNetwork.toLowerCase()
                        ]?.evmBalance
                          ? allAccountsBalance[currentAccount?.evmAddress][
                              currentNetwork.toLowerCase()
                            ]?.evmBalance
                          : ""}
                      </h3>
                    </Tooltip>
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
            centered>
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
                    size={180}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                    value={
                      currentAccount?.nativeAddress
                        ? currentAccount?.nativeAddress
                        : ""
                    }
                  />
                </div>
                <div className={style.balanceDetails__nativemodal__modalOr}>
                  <p>or</p>
                </div>
                <div className={style.balanceDetails__nativemodal__wrapedText}>
                  <p>
                    {currentAccount?.nativeAddress
                      ? currentAccount?.nativeAddress
                      : ""}
                    <img
                      draggable={false}
                      src={CopyIcon}
                      alt="copyIcon"
                      name={NATIVE}
                      onClick={handleCopy}
                    />
                  </p>
                </div>
              </div>
            </div>
          </ModalCustom>
          <ModalCustom
            isModalOpen={isEvmModal}
            handleOk={evmOk}
            handleCancel={evmCancel}
            centered>
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
                    value={
                      currentAccount?.evmAddress
                        ? currentAccount?.evmAddress
                        : ""
                    }
                  />
                </div>
                <div className={style.balanceDetails__nativemodal__modalOr}>
                  <p>or</p>
                </div>
                <div className={style.balanceDetails__nativemodal__wrapedText}>
                  <p>
                    {currentAccount?.evmAddress
                      ? currentAccount?.evmAddress
                      : ""}
                    <img
                      draggable={false}
                      src={CopyIcon}
                      alt="copyIcon"
                      name={EVM}
                      onClick={handleCopy}
                    />
                  </p>
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
