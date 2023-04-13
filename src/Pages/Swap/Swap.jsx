import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import useWallet from "../../Hooks/useWallet";
import { shortner } from "../../Helper/helper";
import SwapIcon from "../../Assets/SwapIcon.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import ComplSwap from "../../Assets/DarkLogo.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import React, { useState, useContext } from "react";
import Info from "../../Assets/infoIcon.svg";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import logoNew from "../../Assets/logoNew.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { InputField } from "../../Components/InputField/InputFieldSimple";
import { connectionObj, Connection } from "../../Helper/connection.helper";
import {
  EVM,
  NATIVE,
  ERROR_MESSAGES,
  COPIED, HTTP_END_POINTS, LABELS,
  MESSAGE_EVENT_LABELS,
  MESSAGE_TYPE_LABELS
} from "../../Constants/index";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { Switch } from "antd";


function Swap() {
  const accountData = useRef(null);
  const { state, estimatedGas, updateEstimatedGas, updateLoading } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [amount, setAmount] = useState("");
  // const [gassFee, setGassFee] = useState("");
  const [swapErr, setSwapError] = useState("");
  const [disableBtn, setDisable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [toFrom, setToFrom] = useState({ from: NATIVE, to: EVM });
  const [address, setAddress] = useState({ fromAddress: "", toAddress: "" });
  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };
  const {
    balance,
    allAccounts,
    currentAccount,
    currentNetwork
  } = state;

  useEffect(() => {
    accountData.current = allAccounts[currentAccount.index];
  }, [currentAccount.accountName]);

  useEffect(() => {

    if (toFrom.from.toLowerCase() === NATIVE.toLowerCase())
      setAddress({
        toAddress: accountData?.current?.evmAddress,
        fromAddress: accountData?.current?.nativeAddress,
      });

    else if (toFrom.from.toLowerCase() === EVM.toLowerCase())
      setAddress({
        toAddress: accountData?.current?.nativeAddress,
        fromAddress: accountData?.current?.evmAddress,
      });
    setAmount("");
    setError("");

  }, [toFrom]);


  useEffect(() => {

    const getData = setTimeout(() => {
      if (amount.length > 0 && !error) {
        getFee();
      } else {
        updateEstimatedGas("");
        setDisable(true);
      }
    }, 1000);

    return () => clearTimeout(getData);

  }, [amount, error]);


  useEffect(() => {
    if (estimatedGas === "" || !estimatedGas) setDisable(true);

    else {
      if (
        toFrom.from.toLowerCase() === EVM.toLowerCase() &&
        toFrom.to.toLowerCase() === NATIVE.toLowerCase()
      ) {
        if ((Number(amount) + Number(estimatedGas)) >= Number(balance.evmBalance)) {
          updateEstimatedGas("");
          setDisable(true);
          setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

        } else {
          setDisable(false);
          setError("");
        }

      } else if (
        toFrom.from.toLowerCase() === NATIVE.toLowerCase() &&
        toFrom.to.toLowerCase() === EVM.toLowerCase()
      ) {

        if ((Number(amount) + Number(estimatedGas)) >= Number(balance.nativeBalance)) {
          updateEstimatedGas("");
          setDisable(true);
          setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

        } else {
          setDisable(false);
          setError("");
        }

      }
    }
  }, [estimatedGas]);


  const blockInvalidChar = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();


  const validateAmount = () => {

    if (amount.length === 0)
      setError(ERROR_MESSAGES.INPUT_REQUIRED);

    else if (isNaN(amount))
      setError(ERROR_MESSAGES.ENTER_AMOUNT_CORRECTLY);

    else if (Number(amount) <= 0)
      setError(ERROR_MESSAGES.AMOUNT_CANT_BE_0);

    else if (
      toFrom.from.toLowerCase() === EVM.toLowerCase() &&
      toFrom.to.toLowerCase() === NATIVE.toLowerCase()
    ) {

      if (Number(amount) >= Number(balance.evmBalance))
        setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

      else
        setError("");
    }

    else if (
      toFrom.from.toLowerCase() === NATIVE.toLowerCase() &&
      toFrom.to.toLowerCase() === EVM.toLowerCase()
    ) {

      if (Number(amount) >= Number(balance.nativeBalance))
        setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

      else
        setError("");
    }
  };


  const handleApprove = async (e) => {
    try {

          if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {

            // let res = await evmToNativeSwap(apiRes.evmApi, apiRes.nativeApi, amount);
            // if (res.error) {
            //   setIsFaildOpen(true);
            //   setSwapError(res.data);
            // } else {
            //   setIsModalOpen(true);
            //   setTxHash(res.data);
            // }

            // updateLoading(true);
            sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.EVM_TO_NATIVE_SWAP, {value: amount, options: {account: state.currentAccount}});
            setIsModalOpen(true);

          } else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {

            // let res = await nativeToEvmSwap(apiRes.nativeApi, amount);
            // // console.log("res.err : ",res.error);
            // if (res.error) {
            //   // console.log("error true");

            //   setIsFaildOpen(true);
            //   setSwapError(res.data);
            // } else {
            //   // console.log("error false");
            //   setIsModalOpen(true);
            //   setTxHash(res.data);
            // }

            // updateLoading(true);
            sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.NATIVE_TO_EVM_SWAP, {value: amount, options: {account: state.currentAccount}});
            setIsModalOpen(true);
          }

      updateEstimatedGas("");
    } catch (error) {
      toast.error("Error occured.");
    }
  };


  const getFee = async () => {

        if (toFrom.from.toLocaleLowerCase() === NATIVE.toLowerCase()) {

          // let feeRes = await retriveNativeFee(apiRes.nativeApi, "", amount);
          // if (feeRes.error) {
          //   if (feeRes.data) {
          //     toast.error(feeRes.error);
          //     setDisable(false);
          //   }
          // } else {
          //   updateEstimatedGas(feeRes.data);
          //   setDisable(false);
          // }

          updateLoading(true);
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.NATIVE_FEE, {value: amount, options: {account: state.currentAccount}});
        } else if (toFrom.from.toLocaleLowerCase() === EVM.toLowerCase()) {

          // let feeRes = await retriveEvmFee(apiRes.evmApi, "", amount);
          // if (feeRes.error) {
          //   if (feeRes.data) {
          //     setError(feeRes.error);
          //   } else {
          //     toast.error("Error while getting fee.");
          //   }
          // } else {
          //   updateEstimatedGas(feeRes.data);
          //   setDisable(false);
          // }
          updateLoading(true);
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, {value: amount, options: {account: state.currentAccount}});
        }

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
          updateEstimatedGas("");
        }
      }
    }
    else {
      if (amount !== val) {
        setAmount(val);
        updateEstimatedGas("");
      }
    }
  };


  const handleEnter = (e) => {
    if ((e.key === LABELS.ENTER)) {
      if (!disableBtn) {
        handleApprove();
      }
    }
  };


  const handle_OK_Cancel = () => {
    setAmount("");
    updateEstimatedGas("");
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
    updateEstimatedGas("");

  };


  const handleCopy = (e) => {
    if (e.target.name.toLowerCase() === NATIVE.toLowerCase())
      navigator.clipboard.writeText(accountData.current.nativeAddress);

    if (e.target.name.toLowerCase() === EVM.toLowerCase())
      navigator.clipboard.writeText(accountData.current.evmAddress);

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
            {/* <span>
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
            </span> */}
            <span>100 5ire </span>
          </div>
          <div className={style.swap__icon} onClick={handleClick}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div className={style.swap__swapSec}>
            <h3>To {toFrom.to}</h3>
            {/* <span>
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
            </span> */}
            <span>100 5ire </span>
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
                  <img src={logoNew} alt="walletLogo" draggable={false} />
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
        <div className={style.swap__txFeeBalance}>
          <h2>TX Fee : 0.0002 5IRE</h2>
          <h3>Balance 00.0000 5IRE</h3>
        </div>
        <div className={style.swap__inFoAccount}>
         <img src={Info}/>
          <h3>Transfer with account keep alive checks </h3>
          <Switch defaultChecked onChange={onChange} />
        </div>
        {/* <div className={style.swap__transactionFee}>
          <p>{estimatedGas ? `Estimated fee : ${estimatedGas} 5ire` : ""}</p>
        </div> */}
      </div>
      <Approve onClick={handleApprove} text="Swap" isDisable={disableBtn} />
      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapIcon" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Processed</h2>
            {/* <p className="transId">Your Swapped Transaction ID</p>
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
            </span> */}

            <div className="footerbuttons">
              <ButtonComp text={"Swap Again"} onClick={handle_OK_Cancel} />
            </div>
          </div>
        </div>
      </ModalCustom>
      <ModalCustom
        isModalOpen={isFaildOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={FaildSwap} alt="swapFaild" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Failed!</h2>
            <p className="transId">{swapErr}</p>

            <div className="footerbuttons">
              <ButtonComp text={"Try Again"} onClick={handle_OK_Cancel} />
            </div>
          </div>
        </div>
      </ModalCustom>
    </>
  );
}

export default Swap;
