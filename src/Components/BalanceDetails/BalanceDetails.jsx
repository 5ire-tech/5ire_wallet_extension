import { Select } from "antd";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import useWallet from "../../Hooks/useWallet";
import { useLocation } from "react-router-dom";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";
import WalletQr from "../../Assets/QRicon.svg";
import DarkLogo from "../../Assets/DarkLogo.svg";
import GrayCircle from "../../Assets/graycircle.svg";
import ModalCustom from "../ModalCustom/ModalCustom";
import GreenCircle from "../../Assets/greencircle.svg";
import { getCurrentTabUrl } from "../../Scripts/utils";
import React, { useEffect, useState, useContext } from "react";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import DownArrowSuffix from "../../Assets/DownArrowSuffix.svg";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import { NATIVE, EVM, NETWORK, COPIED, HTTP_END_POINTS, EMTY_STR} from "../../Constants/index";


function BalanceDetails({ mt0 }) {

  const getLocation = useLocation();
  const { getBalance } = useWallet();
  const { state, updateState } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvmModal, setIsEvmModal] = useState(false);
  const [accountData, setAccountData] = useState({ accountName: EMTY_STR });
  const [addresses, setAddresses] = useState({
    evmAddress: EMTY_STR,
    nativeAddress: EMTY_STR,
  });

  const {
    currentAccount,
    currentNetwork,
    balance,
    allAccounts,
    connectedSites,
  } = state;

  useEffect(() => {
    setAccountData(allAccounts ? allAccounts[currentAccount.index] : {});

  }, [currentAccount.index])


  useEffect(() => {

    getCurrentTabUrl((cv) => {
      const isExist = connectedSites.find((ct) => ct?.origin === cv);
      if (isExist) {
        setIsConnected(isExist.isConnected);
      }
    });

    if (accountData.evmAddress && accountData?.nativeAddress) {
      setAddresses({ evmAddress: shortner(accountData?.evmAddress), nativeAddress: shortner(accountData?.nativeAddress) });
    }

    //inverval id for unbind the interval
    let intId = null;

    connectionObj.initializeApi(HTTP_END_POINTS.TESTNET, HTTP_END_POINTS.QA, currentNetwork, false)
      .then((res) => {
        if (!res?.value) {
          Connection.isExecuting.value = false;
          getBalance(res.evmApi, res.nativeApi, true);

          intId = setInterval(() => {
            getBalance(res.evmApi, res.nativeApi, true);
          }, 5000)

        }
      })
      .catch((err) => {
        console.log("Error while getting the balance : ", err.message)
      });

    return () => { intId && clearInterval(intId) }

  }, [currentNetwork, accountData.accountName]);



  // useEffect(() => {
  //   if (balance?.evmBalance === "" || balance.nativeAddress === "") {
  //     // dispatch(toggleLoader(true));
  //   } else {
  //     // dispatch(toggleLoader(false));
  //   }
  // }, [balance?.evmBalance, balance?.nativeBalance, balance?.totalBalance]);


  const handleNetworkChange = (network) => {
    // dispatch(setCurrentNetwork(network));
    updateState(currentNetwork, network);
    updateState(balance, { evmBalance: EMTY_STR, nativeBalance: EMTY_STR, totalBalance: EMTY_STR });
  };

  const handleCopy = (e) => {
    if (e.target.name === NATIVE)
      navigator.clipboard.writeText(accountData.nativeAddress);
    else if (e.target.name === EVM)
      navigator.clipboard.writeText(accountData.evmAddress);
    toast.success(COPIED);
  };


  const path = getLocation.pathname.replace("/", EMTY_STR);
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
          <div className={`${style.balanceDetails} ${mt0 ? mt0 : EMTY_STR}`}>
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
                            {accountData?.accountName}
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
                          {accountData?.accountName}

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
                      value={accountData.nativeAddress}
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
                      value={accountData.evmAddress}
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
