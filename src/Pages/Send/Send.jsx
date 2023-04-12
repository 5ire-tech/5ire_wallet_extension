import { toast } from "react-toastify";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import useWallet from "../../Hooks/useWallet";
// import { isEmpty } from "../../Utility/utility";
import ComplSwap from "../../Assets/DarkLogo.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import React, { useState, useEffect, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import {
  EVM,
  LABELS,
  NATIVE,
  CURRENCY,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
} from "../../Constants/index";
import {
  InputField,
  InputFieldOnly,
} from "../../Components/InputField/InputFieldSimple";


function Send() {

  const { validateAddress } = useWallet();
  // const [txHash, setTxHash] = useState("");
  // const [sendError, setSendError] = useState("");
  const [disableBtn, setDisable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [err, setErr] = useState({ to: "", amount: "" });
  const [data, setData] = useState({ to: "", amount: "" });
  const [activeTab, setActiveTab] = useState(NATIVE.toLowerCase());
  const { state, estimatedGas, updateEstimatedGas, updateLoading } = useContext(AuthContext);
  const { balance, currentAccount } = state;




  useEffect(() => {
    setData({ to: "", amount: "" });
    setErr({ to: "", amount: "" });
  }, [currentAccount?.evmAddress, currentAccount?.nativeAddress]);


  useEffect(() => {

    const getData = setTimeout(() => {
      if ((!err.to) && (!err.amount) && data.amount.length > 0 && data.to.length > 0) {
        getFee();
      } else {
        updateEstimatedGas(null);
        setDisable(true);
      }
    }, 1000);

    return () => clearTimeout(getData);

  }, [err.to, err.amount, data.to, data.amount]);


  useEffect(() => {
    if (!estimatedGas) {
      setDisable(true);
    } else {
      if (activeTab.toLowerCase() === EVM.toLowerCase()) {
        if ((Number(data.amount) + Number(estimatedGas)) >= Number(balance.evmBalance)) {
          updateEstimatedGas(null);
          setDisable(true);
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));

        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }))
        }
      } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

        if ((Number(data.amount) + Number(estimatedGas)) >= Number(balance.nativeBalance)) {
          updateEstimatedGas(null);
          setDisable(true);
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));

        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }))
        }
      }
    }
  }, [estimatedGas]);


  const blockInvalidChar = e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();


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
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.NOT_YOUR_OWN_ADDRESS }));

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
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.NOT_YOUR_OWN_ADDRESS }));

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

      updateLoading(true);
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.NATIVE_FEE, { amount: data.amount, account: state.currentAccount, toAddress: data.to });
    }
    else if (activeTab.toLowerCase() === EVM.toLowerCase()) {

      updateLoading(true);
      //calculate the evm fee
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.EVM_FEE, { amount: data.amount, account: state.currentAccount, toAddress: data.to });
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
          updateEstimatedGas(null);
        }
      }
      else {
        setData(p => ({ ...p, amount: e.target.value }))
        updateEstimatedGas(null);
      }
    } else {

      if (data.to !== e.target.value.trim()) {
        setData((p) => ({
          ...p,
          [e.target.name]: (e.target.value).trim(),
        }));
        updateEstimatedGas(null);
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
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.EVM_TX, { to: data.to, amount: data.amount, account: state.currentAccount });
        setIsModalOpen(true);

      } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

        //pass the message request for native transfer
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI, MESSAGE_EVENT_LABELS.NATIVE_TX, { to: data.to, amount: data.amount, account: state.currentAccount });
        setIsModalOpen(true);
      }

      updateEstimatedGas(null);

    } catch (error) {
      toast.error(ERROR_MESSAGES.ERR_OCCURED);
    }
  };


  const activeSend = (e) => {
    setActiveTab(e.target.name);
    updateEstimatedGas(null);
    setDisable(true);
    setErr({ to: "", amount: "" });
    setData({ to: "", amount: "" });
  };


  // const handleCopy = () => {
  //   navigator.clipboard.writeText(txHash);
  //   toast.success(COPIED);
  // };


  const handle_OK_Cancel = () => {
    updateEstimatedGas(null);
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
          <p>{estimatedGas ? `Estimated fee : ${estimatedGas} ${CURRENCY}` : ""}</p>
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
            {/* <p className="transId">{sendError}</p> */}

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
