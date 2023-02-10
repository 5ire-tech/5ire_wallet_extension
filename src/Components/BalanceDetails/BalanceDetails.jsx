import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { useLocation } from "react-router-dom";
import DarkLogo from "../../Assets/DarkLogo.svg";
import GreenCircle from "../../Assets/greencircle.svg";
import GrayCircle from "../../Assets/graycircle.svg";
import DownArrowSuffix from "../../Assets/DownArrowSuffix.svg";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import WalletQr from "../../Assets/walletqr.png";
import ModalCustom from "../ModalCustom/ModalCustom";
import ModelLogo from "../../Assets/modalLogo.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentNetwork, toggleLoader } from "../../Store/reducer/auth";
import useWallet from "../../Hooks/useWallet";
import QRCode from "react-qr-code";
import { NATIVE, EVM } from "../../Constants/index";
import { toast } from "react-toastify";
import { shortner } from "../../Helper/helper";
import { getCurrentTabUrl } from "../../Scripts/utils";
import { NETWORK } from "../../Constants/index";


function BalanceDetails({ className, textLeft, mt0 }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvmModal, setIsEvmModal] = useState(false);
  const [addresses, setAddresses] = useState({
    evmAddress: "",
    nativeAddress: "",
  });
  const [evm_balance, setEvmBalance] = useState("");
  const [native_balance, setNativeBalance] = useState("");
  const [total_balance, setTotalBalance] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  // const [accountName, setAccName] = useState("");
  const { getBalance } = useWallet();
  const dispatch = useDispatch();
  const { currentAccount, currentNetwork, balance, connectedSites, isApiReady } =
    useSelector((state) => state.auth);
  const getLocation = useLocation();


  useEffect(() => {
    getCurrentTabUrl((cv) => {
      // console.log(cv);
      const isExist = connectedSites.find((ct) => ct?.origin === cv);
      if (isExist) {
        setIsConnected(isExist.isConnected);
      }
    });

    if (isApiReady) {
      getBalance();
    }
  }, [isApiReady, currentNetwork, currentAccount]);

  useEffect(() => {
    const evmAdd = shortner(currentAccount?.evmAddress);
    const nativeAdd = shortner(currentAccount?.nativeAddress);
    setAddresses({ evmAddress: evmAdd, nativeAddress: nativeAdd });
  }, [currentAccount]);

  useEffect(() => {
    if (balance?.evmBalance === "" || balance.nativeAddress === "") {
      dispatch(toggleLoader(true));
    } else {
      setEvmBalance(balance?.evmBalance);
      setNativeBalance(balance?.nativeBalance);
      setTotalBalance(balance?.totalBalance);
      dispatch(toggleLoader(false));
    }
  }, [balance?.evmBalance, balance?.nativeBalance, balance?.totalBalance]);


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

  const handleNetworkChange = (network) => {
    // dispatch(resetBalance());
    dispatch(setCurrentNetwork(network));
  };

  const handleCopy = (e) => {
    if (e.target.name === NATIVE)
      navigator.clipboard.writeText(currentAccount.nativeAddress);

    if (e.target.name === EVM)
      navigator.clipboard.writeText(currentAccount.evmAddress);
    toast.success("Copied!");
  };

  return (
    <>
      {(path === "wallet" ||
        path === "swapapprove" ||
        path === "approveTx") && (
          <div className={`${style.balanceDetails} ${mt0 ? mt0 : ""}`}>
            <div className={style.balanceDetails__decoratedSec}>
              <>
                <img src={DarkLogo} alt="logo"/>

                {path === "wallet" && (

                  <div className={style.balanceDetails__accountName}>
                    {
                      isConnected ?
                        <>
                          <p>
                            <img src={GreenCircle} alt="connectionLogo" />
                            {currentAccount?.accountName}
                          </p>
                          <span>{addresses.evmAddress}
                          {" "}
                            <img
                              src={CopyIcon}
                              alt="copyIcon"
                              name={EVM}
                              onClick={handleCopy}
                            />
                          </span>
                        </>
                        :
                        <p>
                          <img src={GrayCircle} alt="connectionLogo" />
                          {currentAccount?.accountName}

                        </p>

                    }
                  </div>
                )}
                <div className={style.balanceDetails__selectStyle}>
                  <Select
                    onChange={handleNetworkChange}
                    suffixIcon={<img src={DownArrowSuffix} />}
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
                        label: <span className="flexedItemSelect">QA</span>,
                      },
                    ]}
                  />
                </div>
              </>
            </div>
            {path === "swapapprove" && (
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
            )}
            {path === "wallet" && (
              <div className={style.balanceDetails__innerBalance}>
                <div className={style.balanceDetails__innerBalance__totalBalnce}>
                  <p>
                    Total Balance : <span>{total_balance}</span>
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
                        <img src={WalletCardLogo} />
                        {native_balance}
                      </h3>
                    </div>
                    <div className={style.balanceDetails__innerBalance__walletQa}>
                      <img onClick={showModal} src={WalletQr} />
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
                        <img src={WalletCardLogo} />
                        {evm_balance}
                      </h3>
                    </div>
                    <div className={style.balanceDetails__innerBalance__walletQa}>
                      <img onClick={evmModal} src={WalletQr} />
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
                  <img src={ModelLogo} alt="logo" />
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
                  <img src={ModelLogo} />
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
