import { useEffect } from "react";
import { toast } from "react-toastify";
import React, { useState } from "react";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { useSelector } from "react-redux";
import useWallet from "../../Hooks/useWallet";
import { shortner } from "../../Helper/helper";
import SwapIcon from "../../Assets/SwapIcon.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import ComplSwap from "../../Assets/tranCompl.svg";
import FaildSwap from "../../Assets/tranReject.svg";
import { NATIVE, EVM } from "../../Constants/index";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { InputField } from "../../Components/InputField/InputFieldSimple";

function Swap() {

  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [amount, setAmount] = useState("");
  const [gassFee, setGassFee] = useState("");
  const [swapErr, setSwapError] = useState("");
  const [activeTab, setActiveTab] = useState("one");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [toFrom, setToFrom] = useState({ from: "Native", to: "Evm" });
  const [address, setAddress] = useState({ fromAddress: "", toAddress: "" });
  const { currentAccount, balance, wsEndPoints, currentNetwork } = useSelector((state) => state.auth);
  const {
    evmToNativeSwap,
    nativeToEvmSwap,
    getBalance,
    retriveNativeFee,
    retriveEvmFee,
  } = useWallet();


  useEffect(() => {
    if (toFrom.from.toLowerCase() === NATIVE.toLowerCase())
      setAddress({
        toAddress: currentAccount?.evmAddress,
        fromAddress: currentAccount?.nativeAddress,
      });
    if (toFrom.from.toLowerCase() === EVM.toLowerCase())
      setAddress({
        toAddress: currentAccount?.nativeAddress,
        fromAddress: currentAccount?.evmAddress,
      });
  }, [currentAccount?.evmAddress, currentAccount?.nativeAddress, toFrom]);

  useEffect(() => {
    if (amount) {
      getFee();
    }
  }, [amount, toFrom]);

  const validateAmount = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter amount correctly!");
      return { error: true };
    } else {
      setError("");
      return { error: false };
    }
  };

  const handleApprove = async () => {
    try {
      let amtRes = validateAmount();
      if (!amtRes.error) {

        connectionObj.initializeApi(wsEndPoints.testnet, wsEndPoints.qa, currentNetwork, false).then(async (apiRes) => {

          if (!apiRes?.value) {

            // console.log("API RES ::: ", apiRes);
            Connection.isExecuting.value = false;

            if (
              toFrom.from.toLowerCase() === EVM.toLowerCase() &&
              toFrom.to.toLowerCase() === NATIVE.toLowerCase()
            ) {
              if (Number(amount) >= Number(balance.evmBalance)) {
                toast.error("Insufficent Balance.")
                // setIsFaildOpen(true);
                // setSwapError("Insufficent Balance!");
              } else {
                let res = await evmToNativeSwap(apiRes.evmApi, apiRes.nativeApi, amount);
                if (res.error) {
                  setIsFaildOpen(true);
                  setSwapError(res.data);
                } else {
                  setIsModalOpen(true);
                  setTxHash(res.data);
                  setTimeout(() => {
                    getBalance(apiRes.evmApi, apiRes.nativeApi);
                  }, 60000);
                }
              }
            } else if (
              toFrom.from.toLowerCase() === NATIVE.toLowerCase() &&
              toFrom.to.toLowerCase() === EVM.toLowerCase()
            ) {
              if (Number(amount) >= Number(balance.nativeBalance)) {
                toast.error("Insufficent Balance.")
                // setIsFaildOpen(true);
                // setSwapError("Insufficent Balance.");
              } else {
                let res = await nativeToEvmSwap(apiRes.evmApi, apiRes.nativeApi, amount);
                if (res.error) {
                  setIsFaildOpen(true);
                  setSwapError(res.data);
                } else {
                  setIsModalOpen(true);
                  setTxHash(res.data);
                  setTimeout(() => {
                    getBalance(apiRes.evmApi, apiRes.nativeApi);
                  }, 60000);
                }
              }
            }
          }
        });

      }
    } catch (error) {
      // console.log("Error while swapping : ", error);
      toast.error("Error occured!");
    }
  };

  const getFee = async () => {
    let amtRes = validateAmount();
    // console.log("AMOUNT VALIDATION RESPONSE : ",amtRes);
    if (!amtRes.error) {

      // console.log("GETTING FEE FOR SWAP");

      connectionObj.initializeApi(wsEndPoints.testnet, wsEndPoints.qa, currentNetwork, false).then(async (apiRes) => {

        if (!apiRes?.value) {

          // console.log("API RES ::: ", apiRes);

          Connection.isExecuting.value = false;

          if (toFrom.from.toLocaleLowerCase() === NATIVE.toLowerCase() && amount) {
            let feeRes = await retriveNativeFee(apiRes.nativeApi, "", amount);
            // console.log("Fee Res : ", feeRes);
            if (feeRes.error) {
              if (feeRes.data) {
                setError(feeRes.error);
              } else {
                toast.error("Error while getting fee!");
              }
            } else {
              setGassFee(feeRes.data);
            }
          } else if (
            toFrom.from.toLocaleLowerCase() === EVM.toLowerCase()
          ) {
            let feeRes = await retriveEvmFee(apiRes.evmApi, "", amount);
            // console.log("Fee Res : ", feeRes);
            if (feeRes.error) {
              if (feeRes.data) {
                setError(feeRes.error);
              } else {
                toast.error("Error while getting fee!");
              }
            } else {
              setGassFee(feeRes.data);
            }
          }
        }
      });
    }
  };

  const handleChange = (e) => {
    setAmount(e.target.value.trim());
    setGassFee("");
    // setError("");
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setAmount("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAmount("");
  };

  const faildOk = () => {
    setIsFaildOpen(false);
  };

  const faildCancel = () => {
    setIsFaildOpen(false);
    setAmount("");
  };

  const handleSwapAgain = () => {
    setIsFaildOpen(false);
    setIsModalOpen(false);
    setAmount("");
  };

  const handleClick = () => {
    if (toFrom.from.toLowerCase() === EVM.toLowerCase())
      setToFrom({ from: "Native", to: "Evm" });
    if (toFrom.from.toLowerCase() === NATIVE.toLowerCase())
      setToFrom({ from: "Evm", to: "Native" });

    setAmount("");
    setGassFee("0");
  };

  const handleCopy = (e) => {
    if (e.target.name.toLowerCase() === NATIVE.toLowerCase())
      navigator.clipboard.writeText(currentAccount.nativeAddress);

    if (e.target.name.toLowerCase() === EVM.toLowerCase())
      navigator.clipboard.writeText(currentAccount.evmAddress);

    if (e.target.name.toLowerCase() === "hash")
      navigator.clipboard.writeText(txHash);

    toast.success("Copied!");
  };

  return (
    <>
      <div className={style.swap}>
        <div className={style.swap__swapCopy}>
          <div className={style.swap__swapSec}>
            <h3>From {toFrom.from}</h3>
            <span>
              {shortner(address.fromAddress)}
              <img
                name={toFrom.from}
                alt="copyIcon"
                onClick={handleCopy}
                src={CopyIcon}
                width={15}
                height={15}
              />
            </span>
          </div>
          <div className={style.swap__icon} onClick={handleClick}>
            <img src={SwapIcon} alt="swapIcon" />
          </div>
          <div className={style.swap__swapSec}>
            <h3>To {toFrom.to}</h3>
            <span>
              {shortner(address.toAddress)}{" "}
              <img
                name={toFrom.to}
                src={CopyIcon}
                onClick={handleCopy}
                alt="copyIcon"
                width={15}
                height={15}
              />
            </span>
          </div>
        </div>
        <div className={style.swap__swapAccount}>
          <div>
            <p style={{ color: "red" }}>{error}</p>
            <InputField
              coloredBg={true}
              placeholderBaseColor={true}
              placeholder={"Enter Swap Amount "}
              onChange={handleChange}
              value={amount}
              addonAfter={
                <span className={style.swap__pasteText}>
                  <img src={WalletCardLogo} alt="walletLogo" />
                  5ire
                </span>
              }
            />
            {/* <span className={style.swap__spanbalanceText}>
              Balance 00.0000 5IRE
            </span> */}
          </div>
          {/* <div className={style.swap__activeBalnce}>
            <button
              onClick={activeIst}
              className={`${style.swap__activeBalanceSelect__buttons} 
              ${
                activeTab === "one" &&
                style.swap__activeBalanceSelect__buttons__active
              }
            `}
            >
              25 %
            </button>
            <button
              onClick={activeSecond}
              className={`${style.swap__activeBalanceSelect__buttons}  ${
                activeTab === "two" &&
                style.swap__activeBalanceSelect__buttons__active
              }`}
            >
              50 %
            </button>
            <button
              onClick={activeThree}
              className={`${style.swap__activeBalanceSelect__buttons}  ${
                activeTab === "three" &&
                style.swap__activeBalanceSelect__buttons__active
              }`}
            >
              70 %
            </button>
            <button
              onClick={activeFour}
              className={`${style.swap__activeBalanceSelect__buttons}  ${
                activeTab === "four" &&
                style.swap__activeBalanceSelect__buttons__active
              }`}
            >
              100 %
            </button>
          </div> */}
        </div>
        <div className={style.swap__transactionFee}>
          <p>Transaction Fee : {gassFee ? gassFee + "5IRE" : ""}</p>
        </div>
      </div>
      <Approve onClick={handleApprove} text="Swap" />
      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapIcon" />
            <h2 className="title">Swap Completed</h2>
            <p className="transId">Your Swapped Transaction ID</p>
            <span className="address">
              {txHash ? shortner(txHash) : ""}
              <img
                name={"hash"}
                src={CopyIcon}
                onClick={handleCopy}
                alt="copyIcon"
                width={15}
                height={15}
              />
            </span>

            <div className="footerbuttons">
              <ButtonComp text={"Swap Again"} onClick={handleSwapAgain} />
            </div>
          </div>
        </div>
      </ModalCustom>
      <ModalCustom
        isModalOpen={isFaildOpen}
        handleOk={faildOk}
        handleCancel={faildCancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={FaildSwap} alt="swapFaild" />
            <h2 className="title">Swap Failed!</h2>
            <p className="transId">{swapErr}</p>

            <div className="footerbuttons">
              <ButtonComp text={"Swap Again"} onClick={handleSwapAgain} />
            </div>
          </div>
        </div>
      </ModalCustom>
    </>
  );
}

export default Swap;
