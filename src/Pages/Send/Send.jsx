import { toast } from "react-toastify";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import useWallet from "../../Hooks/useWallet";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";
import ComplSwap from "../../Assets/DarkLogo.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import React, { useState, useEffect, useContext} from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { connectionObj, Connection } from "../../Helper/connection.helper"
import {
  InputField,
  InputFieldOnly,
} from "../../Components/InputField/InputFieldSimple";
import {
  EVM,
  INPUT,
  NATIVE,
  COPIED,
  ERROR_MESSAGES,
  HTTP_END_POINTS,
  LABELS,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";
import { sendRuntimeMessage } from "../../Utility/message_helper";


function Send() {

  const {state, estimatedGas, updateEstimatedGas, updateLoading} = useContext(AuthContext);
  const [txHash, setTxHash] = useState("");
  const [sendError, setSendError] = useState("");
  const [disableBtn, setDisable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [err, setErr] = useState({ to: "", amount: "" });
  const [data, setData] = useState({ to: "", amount: "" });
  const [activeTab, setActiveTab] = useState(NATIVE.toLowerCase());

  const {
    evmTransfer,
    nativeTransfer,
    retriveEvmFee,
    retriveNativeFee,
    validateAddress
  } = useWallet();

  const {
    balance,
    currentAccount,
    currentNetwork
  } = state;



  useEffect(() => {
    setData({ to: "", amount: "" });
    setErr({ to: "", amount: "" });
  }, [currentAccount?.evmAddress, currentAccount?.nativeAddress]);


  useEffect(() => {

    const getData = setTimeout(() => {
      if ((!err.to) && (!err.amount) && data.amount.length > 0 && data.to.length > 0) {
        getFee();
      } else {
        updateEstimatedGas("");
        setDisable(true);
      }
    }, 1000);

    return () => clearTimeout(getData);

  }, [err.to, err.amount, data.to, data.amount]);


  useEffect(() => {
    if (estimatedGas === "" || !estimatedGas) {
      setDisable(true);
    } else {
      if (activeTab.toLowerCase() === EVM.toLowerCase()) {
        if ((Number(data.amount) + Number(estimatedGas)) >= Number(balance.evmBalance)) {
          updateEstimatedGas("");
          setDisable(true);
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));

        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }))
        }
      } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

        if ((Number(data.amount) + Number(estimatedGas)) >= Number(balance.nativeBalance)) {
          updateEstimatedGas("");
          setDisable(true);
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));

        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }))
        }
      }
    }
  }, [estimatedGas]);


  const blockInvalidChar = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();


  const validateAmount = () => {

    if (!data.amount)
      setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INPUT_REQUIRED }));

    else if (isNaN(data.amount))
      setErr((p) => ({ ...p, amount: ERROR_MESSAGES.ENTER_AMOUNT_CORRECTLY }));

    else if (Number(data.amount) <= 0)
      setErr((p) => ({ ...p, amount: ERROR_MESSAGES.AMOUNT_CANT_BE_0 }));

    else if (activeTab.toLowerCase() === EVM.toLowerCase()) {

      if (Number(data.amount) >= Number(balance.evmBalance))
        setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));

      else
        setErr((p) => ({ ...p, amount: "" }));

    }

    else if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {

      if (Number(data.amount) >= Number(balance.nativeBalance))
        setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));

      else
        setErr((p) => ({ ...p, amount: "" }));

    }
  };


  const validateToAddress = async () => {
    if (activeTab.toLowerCase() === EVM.toLowerCase()) {

      if (!data.to)
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.INPUT_REQUIRED }));

      else if (!data.to?.startsWith("0x"))
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.INCORRECT_ADDRESS }));

      else if (data.to === currentAccount.evmAddress)
        setErr((p) => ({ ...p, to: "Recipient address should not your own address." }));

      else {
        let res = await validateAddress(data.to);

        if (res.error)
          setErr((p) => ({ ...p, to: res.data }));

        else
          setErr((p) => ({ ...p, to: "" }));
      }
    }

    else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

      if (!data.to)
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.INPUT_REQUIRED }));

      else if (!data.to?.startsWith("5"))
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.INCORRECT_ADDRESS }));

      else if (data.to === currentAccount.nativeAddress)
        setErr((p) => ({ ...p, to: "Recipient address should not your own address." }));

      else {
        let res = await validateAddress(data.to);

        if (res.error)
          setErr((p) => ({ ...p, to: res.data }));

        else
          setErr((p) => ({ ...p, to: "" }));
      }
    }
  };


  const getFee = async () => {

        if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {

          // let feeRes = await retriveNativeFee(apiRes.nativeApi, data.to, data.amount);

          // if (feeRes.error) {
          //   if (feeRes.data) {
          //     setDisable(true);
          //     toast.error("Error while getting fee.");
          //   }
          // } else {
          //   setGassFee(feeRes.data);
          //   setDisable(false);
          // }

          updateLoading(true);
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.NATIVE_FEE, {amount: data.amount, account: state.currentAccount, toAddress: data.to});
        }
        else if (activeTab.toLowerCase() === EVM.toLowerCase()) {

          // let feeRes = await retriveEvmFee(apiRes.evmApi, data.to, data.amount);

          // if (feeRes.error) {
          //   if (feeRes.data) {
          //     setDisable(true);
          //     toast.error("Error while getting fee.");
          //   }

          // } else {
          //   setGassFee(feeRes.data);
          //   setDisable(false);
          // }

          //calculate the evm fee
          updateLoading(true);
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.EVM_FEE, {amount: data.amount, account: state.currentAccount, toAddress: data.to});
      }
  };


  const handleChange = (e) => {

    if (e.target.name === "amount") {
      let arr = e.target.value.split(".");
      if (arr.length > 1) {

        if (arr[1].length > 18) {
          let slice = arr[1].slice(0, 18);
          setData(p => ({ ...p, amount: arr[0] + "." + slice }))
        } else {
          setData(p => ({ ...p, amount: e.target.value }))
          updateEstimatedGas("");
        }
      }
      else {
        setData(p => ({ ...p, amount: e.target.value }))
        updateEstimatedGas("");
      }
    } else {

      if (data.to !== e.target.value.trim()) {
        setData((p) => ({
          ...p,
          [e.target.name]: (e.target.value).trim(),
        }));
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


  const handleApprove = async () => {
    try {

          if (activeTab.toLowerCase() === EVM.toLowerCase()) {

            //pass the message request for evm transfer
            // updateLoading(true);
            sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.EVM_TX, {to: data.to, amount: data.amount, account: state.currentAccount});
            setIsModalOpen(true);

            // const res = await evmTransfer(apiRes.evmApi, data);
            // if (res.error) {
            //   setSendError(res.data);
            //   setIsFaildOpen(true);
            // }
            // else {
            //   setTxHash(res.data);
            //   setIsModalOpen(true);
            //   // setTimeout(() => {
            //   //   getBalance(apiRes.evmApi, apiRes.nativeApi, true);
            //   // }, 3000);
            // }

          } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

            //pass the message request for native transfer
            // updateLoading(true);
            sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.NATIVE_TX, {to: data.to, amount: data.amount, account: state.currentAccount});
            setIsModalOpen(true);

            // const res = await nativeTransfer(apiRes.nativeApi, data);
            // if (res.error) {
            //   setSendError(res.data);
            //   setIsFaildOpen(true);
            // }
            // else {
            //   setTxHash(res.data);
            //   setIsModalOpen(true);
            //   // setTimeout(() => {
            //   //   getBalance(apiRes.evmApi, apiRes.nativeApi, true)
            //   // }, 3000);
            // }
          }

        updateEstimatedGas("");

    } catch (error) {
      toast.error("Error occured.");
    }
  };


  const activeSend = (e) => {
    setActiveTab(e.target.name);
    updateEstimatedGas("");
    setDisable(true);
    setErr({ to: "", amount: "" });
    setData({ to: "", amount: "" });
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    toast.success(COPIED);
  };


  const handle_OK_Cancel = () => {
    updateEstimatedGas("");
    setDisable(true);
    setIsModalOpen(false);
    setIsFaildOpen(false);
    setData({ to: "", amount: "" });
  };


  return (
    <>
      <div className={style.sendSec} onKeyDown={handleEnter}>
        <div className={`scrollableCont ${style.sendSec__sourceLabel}`}>
          <label>Source Chain :</label>
          <div className={style.sendSec__sendSwapbtn}>
            <button
              onClick={activeSend}
              name={NATIVE.toLowerCase()}
              className={`${style.sendSec__sendSwapbtn__buttons} 
              ${activeTab === NATIVE.toLowerCase() &&
                style.sendSec__sendSwapbtn__buttons__active
                }
            `}
            >
              Native
            </button>
            <button
              onClick={activeSend}
              name={EVM.toLowerCase()}
              className={`${style.sendSec__sendSwapbtn__buttons}  ${activeTab === EVM.toLowerCase() &&
                style.sendSec__sendSwapbtn__buttons__active
                }`}
            >
              EVM
            </button>
          </div>
        </div>
        <div className={style.sendSec__inputInnerSec}>
          <InputFieldOnly
            name="to"
            value={data.to}
            coloredBg={true}
            onChange={handleChange}
            keyUp={validateToAddress}
            placeholderBaseColor={true}
            placeholder={"Please enter recipient address"}
          />
          <span className={style.errorText}>{err.to}</span>

          <div>
            <InputField
              min={"0"}
              name="amount"
              type={"number"}
              coloredBg={true}
              value={data.amount}
              keyUp={validateAmount}
              onChange={handleChange}
              keyDown={blockInvalidChar}
              placeholderBaseColor={true}
              placeholder={"Enter Amount"}
              addonAfter={
                <span className={style.sendSec__pasteText}>
                  <img src={WalletCardLogo} alt="logo" draggable={false} />
                  5ire
                </span>
              }
            />
            <span className={style.errorText}>{err.amount}</span>
          </div>

        </div>
        <div className={style.sendSec__transactionFee}>
          <p>{estimatedGas ? `Estimated fee : ${estimatedGas} 5ire` : ""}</p>
        </div>
      </div>
      <Approve onClick={handleApprove} text="Transfer" isDisable={disableBtn} />

      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapImage" width={127} height={127} draggable={false} />
            <h2 className="title">Transfer Processed</h2>
            {/* <p className="transId">Your Transaction ID</p>
            <span className="address">{shortner(txHash)}</span>
            <img
              draggable={false}
              src={CopyIcon}
              alt="copyIcon"
              name="naiveAddress"
              onClick={handleCopy}
            /> */}

            <div className="footerbuttons">
              <ButtonComp text={"Transfer Again"} onClick={handle_OK_Cancel} />
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
            <h2 className="title">Transfer Failed!</h2>
            <p className="transId">{sendError}</p>

            <div className="footerbuttons">
              <ButtonComp text={"Try Again"} onClick={handle_OK_Cancel} />
            </div>
          </div>
        </div>
      </ModalCustom>
    </>
  );
}

export default Send;
