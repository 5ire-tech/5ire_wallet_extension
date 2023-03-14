import { Select } from "antd";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import useWallet from "../../Hooks/useWallet";
import { useLocation } from "react-router-dom";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";
import WalletQr from "../../Assets/QRicon.svg";
import DarkLogo from "../../Assets/DarkLogo.svg";
import React, { useEffect, useState } from "react";
import GrayCircle from "../../Assets/graycircle.svg";
import ModalCustom from "../ModalCustom/ModalCustom";
import GreenCircle from "../../Assets/greencircle.svg";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentTabUrl } from "../../Scripts/utils";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import DownArrowSuffix from "../../Assets/DownArrowSuffix.svg";
import { NATIVE, EVM, NETWORK, COPIED } from "../../Constants/index";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import { resetBalance, setCurrentNetwork, toggleLoader } from "../../Utility/redux_helper"


function BalanceDetails({ className, textLeft, mt0 }) {

  const dispatch = useDispatch();
  const getLocation = useLocation();
  const { getBalance } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvmModal, setIsEvmModal] = useState(false);
  const [addresses, setAddresses] = useState({
    evmAddress: "",
    nativeAddress: "",
  });
  const {
    currentAccount,
    currentNetwork,
    balance,
    connectedSites,
    httpEndPoints
  } = useSelector((state) => state.auth);


  useEffect(() => {

    getCurrentTabUrl((cv) => {
      const isExist = connectedSites.find((ct) => ct?.origin === cv);
      if (isExist) {
        setIsConnected(isExist.isConnected);
      }
    });

    if (currentAccount.evmAddress && currentAccount?.nativeAddress) {
      setAddresses({ evmAddress: shortner(currentAccount?.evmAddress), nativeAddress: shortner(currentAccount?.nativeAddress) });
    }

    //inverval id for unbind the interval
    let intId = null;

    connectionObj.initializeApi(httpEndPoints.testnet, httpEndPoints.qa, currentNetwork, false).then((res) => {
      if (!res?.value) {
        Connection.isExecuting.value = false;
        getBalance(res.evmApi, res.nativeApi, true);

        intId = setInterval(() => {
          getBalance(res.evmApi, res.nativeApi, true);
        }, 3000)

      }
    })
      .catch((err) => {
        console.log("Error while getting the balance : ", err.message)
      });

    return () => { intId && clearInterval(intId) }

  }, [currentNetwork, currentAccount.accountName]);



  useEffect(() => {
    if (balance?.evmBalance === "" || balance.nativeAddress === "") {
      dispatch(toggleLoader(true));
    } else {
      dispatch(toggleLoader(false));
    }
  }, [balance?.evmBalance, balance?.nativeBalance, balance?.totalBalance]);


  const handleNetworkChange = (network) => {
    dispatch(setCurrentNetwork(network));
    dispatch(resetBalance());
  };

  const handleCopy = (e) => {
    if (e.target.name === NATIVE)
      navigator.clipboard.writeText(currentAccount.nativeAddress);
    else if (e.target.name === EVM)
      navigator.clipboard.writeText(currentAccount.evmAddress);
    toast.success(COPIED);
  };


  const path = getLocation.pathname.replace("/", "");
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
      {(path === "wallet" ||
        path === "swapapprove" ||
        path === "approveTx") && (
          <div className={`${style.balanceDetails} ${mt0 ? mt0 : ""}`}>
            <div className={style.balanceDetails__decoratedSec}>
              <>
                <img src={DarkLogo} alt="logo" draggable={false} />

                {path === "wallet" && (

                  <div className={style.balanceDetails__accountName}>
                    {
                      isConnected ?
                        <>
                          <p>
                            <img src={GreenCircle} alt="connectionLogo" draggable={false} />
                            {currentAccount?.accountName}
                          </p>
                          <span>{addresses.evmAddress}
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
                          {currentAccount?.accountName}

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
                      // {
                      //   value: NETWORK.TEST_NETWORK,
                      //   label: <span className="flexedItemSelect">Testnet</span>,
                      // },
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
            {path === "wallet" && (
              <div className={style.balanceDetails__innerBalance}>
                <div className={style.balanceDetails__innerBalance__totalBalnce}>
                  <p>
                    Total Balance : <span>{balance?.totalBalance} 5ire</span>
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
                        {balance?.nativeBalance}
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
                        {balance?.evmBalance}
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
                      value={currentAccount.nativeAddress}
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
                      {addresses.nativeAddress}
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
                      value={currentAccount.evmAddress}
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
                      {addresses.evmAddress}
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
