import { Switch, Tooltip } from "antd";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import Info from "../../Assets/infoIcon.svg";
import logoNew from "../../Assets/logoNew.svg";
import ComplSwap from "../../Assets/succeslogo.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import { validateAddress } from "../../Utility/utility";
import React, { useState, useEffect, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import {
  InputField,
  InputFieldOnly,
} from "../../Components/InputField/InputFieldSimple";
import {
  EVM,
  LABELS,
  NATIVE,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  EXISTENTIAL_DEPOSITE,
  COPIED,
  TX_TYPE
} from "../../Constants/index";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";



function Send() {
  const [isEd, setEd] = useState(true);
  const [disableBtn, setDisable] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [err, setErr] = useState({ to: "", amount: "" });
  const [data, setData] = useState({ to: "", amount: "" });
  const [activeTab, setActiveTab] = useState(NATIVE.toLowerCase());
  const { state, estimatedGas, updateEstimatedGas, updateLoading, txHash, setTxHash } = useContext(AuthContext);

  const { balance, currentAccount } = state;

  useEffect(() => {
    setData({ to: "", amount: "" });
    setErr({ to: "", amount: "" });
  }, [currentAccount?.evmAddress, currentAccount?.nativeAddress]);

  useEffect(() => {
    const getData = setTimeout(() => {
      if (
        !err.to &&
        !err.amount &&
        data.amount.length > 0 &&
        data.to.length > 0
      ) {
        getFee();
      } else {
        updateEstimatedGas(null);
        setDisable(true);
      }
    }, 1000);

    return () => clearTimeout(getData);
  }, [err.to, err.amount, data.to, data.amount, isEd]);


  useEffect(() => {
    if (!estimatedGas) {
      setDisable(true);
    } else {
      if (activeTab.toLowerCase() === EVM.toLowerCase()) {
        if ((Number(data.amount) + Number(estimatedGas) + (isEd ? EXISTENTIAL_DEPOSITE : 0)) >= Number(balance.evmBalance)) {
          updateEstimatedGas(null);
          setDisable(true);
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }));
        }
      } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

        if ((Number(data.amount) + Number(estimatedGas) + (isEd ? EXISTENTIAL_DEPOSITE : 0)) >= Number(balance.nativeBalance)) {
          updateEstimatedGas(null);
          setDisable(true);
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }));
        }
      }
    }
  }, [estimatedGas]);

  const blockInvalidChar = e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();


  //set the ED toggler state
  const onChangeToggler = (checked) => {
    console.log(`switch to ${checked}`);
    setEd(checked);
    updateEstimatedGas(null);
    setErr((p) => ({ ...p, amount: "" }));
  };

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
      else setErr((p) => ({ ...p, amount: "" }));
    } else if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {
      if (Number(data.amount) >= Number(balance.nativeBalance))
        setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
      else setErr((p) => ({ ...p, amount: "" }));
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

        if (res.error) setErr((p) => ({ ...p, to: res.data }));
        else setErr((p) => ({ ...p, to: "" }));
      }
    } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {
      if (!data.to)
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.INPUT_REQUIRED }));
      else if (!data.to?.startsWith("5"))
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.INCORRECT_ADDRESS }));
      else if (data.to === currentAccount.nativeAddress)
        setErr((p) => ({ ...p, to: ERROR_MESSAGES.NOT_YOUR_OWN_ADDRESS }));

      else {
        let res = await validateAddress(data.to);

        if (res.error) setErr((p) => ({ ...p, to: res.data }));
        else setErr((p) => ({ ...p, to: "" }));
      }
    }
  };

  const getFee = async () => {

    if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {
      updateLoading(true);
      //calculate the native fee
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.NATIVE_FEE, { value: data.amount, toAddress: data.to, options: { account: state.currentAccount, network: state.currentNetwork} });
    }
    else if (activeTab.toLowerCase() === EVM.toLowerCase()) {
      updateLoading(true);
      //calculate the evm fee
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, { value: data.amount, toAddress: data.to, options: { account: state.currentAccount, network: state.currentNetwork} });
    }
  };

  const handleChange = (e) => {
    if (e.target.name === LABELS.AMOUNT) {
      const arr = e.target.value.split(".");
      if (arr.length > 1) {
        if (arr[1].length > 18) {
          const slice = arr[1].slice(0, 18);
          setData((p) => ({ ...p, amount: arr[0] + "." + slice }));
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
          [e.target.name]: e.target.value.trim(),
        }));
        updateEstimatedGas(null);
      }
    }
  };

  const handleEnter = (e) => {
    if (e.key === LABELS.ENTER) {
      if (!disableBtn) {
        handleApprove();
      }
    }
  };

  const handleCopy = (e) => {
    if (e.target.name.toLowerCase() === NATIVE.toLowerCase())
      navigator.clipboard.writeText(currentAccount?.nativeAddress);

    if (e.target.name.toLowerCase() === EVM.toLowerCase())
      navigator.clipboard.writeText(currentAccount?.evmAddress);

    // if (e.target.name.toLowerCase() === "hash")
    //   navigator.clipboard.writeText(txHash);

    toast.success(COPIED);
  };

  const handleApprove = async () => {
    try {

      if (activeTab.toLowerCase() === EVM.toLowerCase()) {

        //pass the message request for evm transfer
        updateLoading(true);
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.INTERNAL_TX,
          MESSAGE_EVENT_LABELS.EVM_TX,
          { to: data.to, value: data.amount, options: { account: state.currentAccount, network: state.currentNetwork, type: TX_TYPE.SEND }}
        );

      } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

        //pass the message request for native transfer
        updateLoading(true);
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.INTERNAL_TX,
          MESSAGE_EVENT_LABELS.NATIVE_TX,
          { to: data.to, value: data.amount, options: { account: state.currentAccount, network: state.currentNetwork, type: TX_TYPE.SEND } }
        );
      }

      updateEstimatedGas("");

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

  const handle_OK_Cancel = () => {
    updateEstimatedGas(null);
    setDisable(true);
    setIsFaildOpen(false);
    setData({ to: "", amount: "" });
    setTxHash(null);
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
          <div>
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
          </div>
          <div style={{ marginTop: "14px" }}>
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
                  <img src={logoNew} alt="logo" draggable={false} />
                  5ire
                </span>
              }
            />
            <span className={style.errorText}>{err.amount}</span>
          </div>
        </div>
        <div className={style.sendSec__txFeeBalance}>
          <h2>{estimatedGas ? `TX Fee : ${estimatedGas} 5IRE` : ""}</h2>
          {/* <h3>Balance 00.0000 5IRE</h3> */}
        </div>
        <div className={style.sendSec__inFoAccount}>
          <Tooltip title="5irechain requires a minimum of 1 5ire token to keep your wallet active">
          <img src={Info} />
          </Tooltip>
          <h3>Transfer with account keep alive checks </h3>
          <Switch defaultChecked name="EdToggler" onChange={onChangeToggler} />
        </div>
      </div>
      <Approve onClick={handleApprove} text="Transfer" isDisable={disableBtn} />

      <ModalCustom
        isModalOpen={!!txHash}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
        centered
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img
              src={ComplSwap}
              alt="swapImage"
              width={127}
              height={127}
              draggable={false}
            />
            <h2 className="title">Transfer Processed</h2>
            <p className="transId">Your Transaction ID</p>
            <h3 className="hashTag">{txHash ? shortner(txHash): ""}</h3>
              {txHash && <img
              draggable={false}
              src={CopyIcon}
              alt="copyIcon"
              style={{cursor: "pointer"}}
              name="naiveAddress"
              onClick={handleCopy}
            />}

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
        centered
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img
              src={FaildSwap}
              alt="swapFaild"
              width={127}
              height={127}
              draggable={false}
            />
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
