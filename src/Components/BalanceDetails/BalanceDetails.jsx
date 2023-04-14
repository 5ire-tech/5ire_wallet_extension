import { Select } from "antd";
import QRCode from "react-qr-code";
import { ROUTES } from "../../Routes";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useLocation } from "react-router-dom";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";
import WalletQr from "../../Assets/QRicon.svg";
import DarkLogo from "../../Assets/DarkLogo.svg";
import GrayCircle from "../../Assets/graycircle.svg";
import ModalCustom from "../ModalCustom/ModalCustom";
import GreenCircle from "../../Assets/greencircle.svg";
import { getCurrentTabUrl } from "../../Scripts/utils";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import React, { useEffect, useState, useContext } from "react";
import { sendRuntimeMessage } from "../../Utility/message_helper"
import DownArrowSuffix from "../../Assets/DownArrowSuffix.svg";

import {
  EVM,
  COPIED,
  LABELS,
  NATIVE,
  NETWORK,
  EMTY_STR,
  CURRENCY,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
} from "../../Constants/index";


function BalanceDetails({ mt0 }) {

  const getLocation = useLocation();
  const { state, updateState} = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvmModal, setIsEvmModal] = useState(false);
  

  const { pathname } = getLocation;

  const {
    balance,
    currentAccount,
    currentNetwork,
    connectedSites,
  } = state;


  useEffect(() => {

    getCurrentTabUrl((cv) => {
      const isExist = connectedSites.find((ct) => ct?.origin === cv);
      if (isExist) {
        setIsConnected(isExist.isConnected);
      }
    });

    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.BALANCE, {});

  }, [currentNetwork, currentAccount.evmAddress]);



  // useEffect(() => {
  //   if (balance?.evmBalance === "" || balance.nativeAddress === "") {
  //     // dispatch(toggleLoader(true));
  //   } else {
  //     // dispatch(toggleLoader(false));
  //   }
  // }, [balance?.evmBalance, balance?.nativeBalance, balance?.totalBalance]);


  const handleNetworkChange = (network) => {
    updateState(LABELS.CURRENT_NETWORK, network);
    updateState(balance, { evmBalance: EMTY_STR, nativeBalance: EMTY_STR, totalBalance: EMTY_STR });
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



  return (
    <>
      {(pathname === (ROUTES.WALLET || ROUTES.SWAP_APPROVE || ROUTES.APPROVE_TXN)) && (

        <div className={`${style.balanceDetails} ${mt0 ? mt0 : EMTY_STR}`}>
          <div className={style.balanceDetails__decoratedSec}>
            <>
              <img src={DarkLogo} alt="logo" draggable={false} />

              {pathname === ROUTES.WALLET && (

                <div className={style.balanceDetails__accountName}>
                  {
                    isConnected ?
                      <>
                        <p>
                          <img src={GreenCircle} alt="connectionLogo" draggable={false} />
                          {currentAccount?.accountName ? currentAccount?.accountName : ""}
                        </p>
                        <span>{currentAccount.evmAddress}
                          {" "}
                          <img
                            draggable={false}
                            src={CopyIcon}
                            alt="copyIcon"
                            name={EVM}
                            onClick={handleCopy}
                          />
                        </span>
                      </>
                      :
                      <p>
                        <img src={GrayCircle} alt="connectionLogo" draggable={false} />
                        {currentAccount?.accountName ? currentAccount?.accountName : ""}

                      </p>

                  }
                </div>
              )}

              <div className={style.balanceDetails__selectStyle}>
                <Select
                  onChange={handleNetworkChange}
                  suffixIcon={<img src={DownArrowSuffix} alt="DownArrow" draggable={false} />}
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
                      label: <span className="flexedItemSelect">{NETWORK.QA_NETWORK}</span>,
                    },
                  ]}
                />
              </div>
            </>
          </div>
          {/* {path === "swapapprove" && (
              <div className={style.balanceDetails__conectedSec}>
                <p className={style.balanceDetails__conectedSec__connectedField}>
                  <img src={GreenCircle} />
                  connected
                </p>
                <div className={style.balanceDetails__conectedSec__textConatct}>
                  <p>Account 1</p>
                  <span>0x02da....q12sd</span>
                </div>
              </div>
            )} */}

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
                      <img src={WalletCardLogo} draggable={false} alt="walletLogo" />
                      {balance?.nativeBalance ? balance?.nativeBalance : ""}
                    </h3>
                  </div>
                  <div className={style.balanceDetails__innerBalance__walletQa}>
                    <img onClick={showModal} alt="walletQR" src={WalletQr} width={30} height={30} draggable={false} />
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
                      <img src={WalletCardLogo} draggable={false} alt="balanceLogo" />
                      {balance?.evmBalance ? balance?.evmBalance : ""}
                    </h3>
                  </div>
                  <div className={style.balanceDetails__innerBalance__walletQa}>
                    <img onClick={evmModal} alt="balance" src={WalletQr} width={30} height={30} draggable={false} />
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
                <img src={DarkLogo} alt="logo" width={55} height={55} draggable={false} />
                <p className={style.balanceDetails__nativemodal__title}>
                  5ire Native Chain
                </p>
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
                >
                </div>
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
                <img src={DarkLogo} width={55} height={55} alt="darkLogo" draggable={false} />
                <p className={style.balanceDetails__nativemodal__title}>
                  5ire EVM Chain
                </p>
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
