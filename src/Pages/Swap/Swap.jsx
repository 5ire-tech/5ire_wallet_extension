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
import ComplSwap from "../../Assets/DarkLogo.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { InputField } from "../../Components/InputField/InputFieldSimple";
import { NATIVE, EVM, ERR_MSG, INPUT,COPIED } from "../../Constants/index";
import { connectionObj, Connection } from "../../Helper/connection.helper";


function Swap() {

  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [amount, setAmount] = useState("");
  const [gassFee, setGassFee] = useState("");
  const [swapErr, setSwapError] = useState("");
  const [disableBtn, setDisable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [toFrom, setToFrom] = useState({ from: NATIVE, to: EVM });
  const [address, setAddress] = useState({ fromAddress: "", toAddress: "" });

  const {
    currentAccount,
    balance,
    httpEndPoints,
    currentNetwork
  } = useSelector((state) => state.auth);
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

    else if (toFrom.from.toLowerCase() === EVM.toLowerCase())
      setAddress({
        toAddress: currentAccount?.nativeAddress,
        fromAddress: currentAccount?.evmAddress,
      });
    setAmount("");
    setError("");

  }, [currentAccount?.evmAddress, currentAccount?.nativeAddress, toFrom]);


  useEffect(() => {

    const getData = setTimeout(() => {
      if (amount.length > 0 && !error) {
        getFee();
      } else {
        setGassFee("");
        setDisable(true);
      }
    }, 1000);

    return () => clearTimeout(getData);

  }, [amount, error]);


  useEffect(() => {
    if (gassFee === "" || !gassFee) setDisable(true);

    else {
      if (
        toFrom.from.toLowerCase() === EVM.toLowerCase() &&
        toFrom.to.toLowerCase() === NATIVE.toLowerCase()
      ) {
        if ((Number(amount) + Number(gassFee)) >= Number(balance.evmBalance)) {
          setGassFee("");
          setDisable(true);
          setError(ERR_MSG.INSUFFICENT_BALANCE);

        } else {
          setDisable(false);
          setError("");
        }

      } else if (
        toFrom.from.toLowerCase() === NATIVE.toLowerCase() &&
        toFrom.to.toLowerCase() === EVM.toLowerCase()
      ) {

        if ((Number(amount) + Number(gassFee)) >= Number(balance.nativeBalance)) {
          setGassFee("");
          setDisable(true);
          setError(ERR_MSG.INSUFFICENT_BALANCE);

        } else {
          setDisable(false);
          setError("");
        }

      }
    }
  }, [gassFee]);


  const blockInvalidChar = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();


  const validateAmount = () => {

    if (amount.length === 0)
      setError(INPUT.REQUIRED);

    else if (isNaN(amount))
      setError("Please enter amount correctly.");

    else if (Number(amount) <= 0)
      setError("Amount can't be 0 or less then 0");

    else if (
      toFrom.from.toLowerCase() === EVM.toLowerCase() &&
      toFrom.to.toLowerCase() === NATIVE.toLowerCase()
    ) {

      if (Number(amount) >= Number(balance.evmBalance))
        setError(ERR_MSG.INSUFFICENT_BALANCE);

      else
        setError("");
    }

    else if (
      toFrom.from.toLowerCase() === NATIVE.toLowerCase() &&
      toFrom.to.toLowerCase() === EVM.toLowerCase()
    ) {

      if (Number(amount) >= Number(balance.nativeBalance))
        setError(ERR_MSG.INSUFFICENT_BALANCE);

      else
        setError("");
    }
  };


  const handleApprove = async (e) => {
    try {

      connectionObj.initializeApi(httpEndPoints.testnet, httpEndPoints.qa, currentNetwork, false).then(async (apiRes) => {

        if (!apiRes?.value) {

          Connection.isExecuting.value = false;

          if (
            toFrom.from.toLowerCase() === EVM.toLowerCase() &&
            toFrom.to.toLowerCase() === NATIVE.toLowerCase()
          ) {

            let res = await evmToNativeSwap(apiRes.evmApi, apiRes.nativeApi, amount);
            if (res.error) {
              setIsFaildOpen(true);
              setSwapError(res.data);
            } else {
              setIsModalOpen(true);
              setTxHash(res.data);
              // setTimeout(() => {
              //   getBalance(apiRes.evmApi, apiRes.nativeApi, true);
              // }, 3000);
            }

          } else if (
            toFrom.from.toLowerCase() === NATIVE.toLowerCase() &&
            toFrom.to.toLowerCase() === EVM.toLowerCase()
          ) {

            let res = await nativeToEvmSwap(apiRes.nativeApi, amount);
            if (res.error) {
              setIsFaildOpen(true);
              setSwapError(res.data);
            } else {
              setIsModalOpen(true);
              setTxHash(res.data);
              // setTimeout(() => {
              //   getBalance(apiRes.evmApi, apiRes.nativeApi, true);
              // }, 3000);
            }
          }
        }
        setGassFee("");
      });
    } catch (error) {
      toast.error("Error occured.");
    }
  };


  const getFee = async () => {

    connectionObj.initializeApi(httpEndPoints.testnet, httpEndPoints.qa, currentNetwork, false).then(async (apiRes) => {

      if (!apiRes?.value) {

        Connection.isExecuting.value = false;

        if (toFrom.from.toLocaleLowerCase() === NATIVE.toLowerCase()) {

          let feeRes = await retriveNativeFee(apiRes.nativeApi, "", amount);
          if (feeRes.error) {
            if (feeRes.data) {
              toast.error(feeRes.error);
              setDisable(false);
            }
          } else {
            setGassFee(feeRes.data);
            setDisable(false);
          }

        } else if (toFrom.from.toLocaleLowerCase() === EVM.toLowerCase()) {

          let feeRes = await retriveEvmFee(apiRes.evmApi, "", amount);
          if (feeRes.error) {
            if (feeRes.data) {
              setError(feeRes.error);
            } else {
              toast.error("Error while getting fee.");
            }
          } else {
            setGassFee(feeRes.data);
            setDisable(false);
          }

        }
      }
    });

  };


  const handleChange = (e) => {
    let val = e.target.value;
    let arr = val.split(".");

    if (arr.length > 1) {

      if (arr[1].length > 18) {
        let slice = arr[1].slice(0, 18);
        setAmount(arr[0] + "." + slice);
      } else {
        if (amount !== val) {
          setAmount(val);
          setGassFee("");
        }
      }
    }
    else {
      if (amount !== val) {
        setAmount(val);
        setGassFee("");
      }
    }
  };


  const handleEnter = (e) => {
    if ((e.key === "Enter")) {
      if (!disableBtn) {
        handleApprove();
      }
    }
  };


  const handle_OK_Cancle = () => {
    setAmount("");
    setGassFee("");
    setDisable(true);
    setIsFaildOpen(false);
    setIsModalOpen(false);
  };


  const handleClick = () => {

    if (toFrom.from.toLowerCase() === EVM.toLowerCase()) { }
    setToFrom({ from: NATIVE, to: EVM });

    if (toFrom.from.toLowerCase() === NATIVE.toLowerCase())
      setToFrom({ from: EVM, to: NATIVE });

    setAmount("");
    setGassFee("");

  };


  const handleCopy = (e) => {
    if (e.target.name.toLowerCase() === NATIVE.toLowerCase())
      navigator.clipboard.writeText(currentAccount.nativeAddress);

    if (e.target.name.toLowerCase() === EVM.toLowerCase())
      navigator.clipboard.writeText(currentAccount.evmAddress);

    if (e.target.name.toLowerCase() === "hash")
      navigator.clipboard.writeText(txHash);

    toast.success(COPIED);
  };


  return (
    <>
      <div className={style.swap} onKeyDown={handleEnter} >
        <div className={style.swap__swapCopy}>
          <div className={style.swap__swapSec}>
            <h3>From {toFrom.from}</h3>
            <span>
              {shortner(address.fromAddress)}
              <img
                width={15}
                height={15}
                alt="copyIcon"
                src={CopyIcon}
                draggable={false}
                name={toFrom.from}
                onClick={handleCopy}
              />
            </span>
          </div>
          <div className={style.swap__icon} onClick={handleClick}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div className={style.swap__swapSec}>
            <h3>To {toFrom.to}</h3>
            <span>
              {shortner(address.toAddress)}{" "}
              <img
                width={15}
                height={15}
                src={CopyIcon}
                alt="copyIcon"
                name={toFrom.to}
                draggable={false}
                onClick={handleCopy}
              />
            </span>
          </div>
        </div>
        <div className={style.swap__swapAccount}>
          <div>
            <InputField
              min={"0"}
              type="number"
              value={amount}
              coloredBg={true}
              keyUp={validateAmount}
              onChange={handleChange}
              keyDown={blockInvalidChar}
              placeholderBaseColor={true}
              placeholder={"Enter Amount"}
              addonAfter={
                <span className={style.swap__pasteText}>
                  <img src={WalletCardLogo} alt="walletLogo" draggable={false} />
                  5ire
                </span>
              }

            />
            <p className="errorText">{error}</p>

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
          <p>{gassFee ? `Estimated fee : ${gassFee} 5ire` : ""}</p>
        </div>
      </div>
      <Approve onClick={handleApprove} text="Swap" isDisable={disableBtn} />
      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancle}
        handleCancel={handle_OK_Cancle}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapIcon" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Processed</h2>
            <p className="transId">Your Swapped Transaction ID</p>
            <span className="address">
              {txHash ? shortner(txHash) : ""}
              <img
                width={15}
                height={15}
                name={"hash"}
                src={CopyIcon}
                alt="copyIcon"
                draggable={false}
                onClick={handleCopy}
                />
            </span>

            <div className="footerbuttons">
              <ButtonComp text={"Swap Again"} onClick={handle_OK_Cancle} />
            </div>
          </div>
        </div>
      </ModalCustom>
      <ModalCustom
        isModalOpen={isFaildOpen}
        handleOk={handle_OK_Cancle}
        handleCancel={handle_OK_Cancle}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={FaildSwap} alt="swapFaild" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Failed!</h2>
            <p className="transId">{swapErr}</p>

            <div className="footerbuttons">
              <ButtonComp text={"Try Again"} onClick={handle_OK_Cancle} />
            </div>
          </div>
        </div>
      </ModalCustom>
    </>
  );
}

export default Swap;
