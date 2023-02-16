import React, { useState, useEffect } from "react";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import ComplSwap from "../../Assets/tranCompl.svg";
import useWallet from "../../Hooks/useWallet";
import FaildSwap from "../../Assets/tranReject.svg";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";
import { toast } from "react-toastify";
import { NATIVE, EVM } from "../../Constants/index";
import {
  InputField,
  InputFieldOnly,
} from "../../Components/InputField/InputFieldSimple";
import { useDispatch, useSelector } from "react-redux"

function Send() {
  const {
    evmTransfer,
    nativeTransfer,
    getBalance,
    retriveEvmFee,
    retriveNativeFee,
  } = useWallet();
  // const dispatch = useDispatch();
  const { balance, currentAccount } = useSelector(state => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("native");
  const [txHash, setTxHash] = useState("");
  const [data, setData] = useState({ to: "", amount: "" });
  const [err, setErr] = useState({ to: "", amount: "" });
  const [sendError, setSendError] = useState("");
  const [gassFee, setGassFee] = useState("");

  useEffect(() => {
    if ((data.to) && (data.amount)) {
      getFee();
    } else {
      setGassFee("");
    }
  }, [data.to, data.amount]);

  const validateAmount = () => {
    // console.log("");
    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
      setErr((p) => ({ ...p, amount: "Please enter amount correctly!" }));
      return { error: true }
    } else {
      setErr((p) => ({ ...p, amount: "" }));
      return { error: false }
    }
  }

  const validateToAddress = () => {
    if (activeTab.toLowerCase() === EVM.toLowerCase()) {

      if (!data.to || !data.to.startsWith("0x")) {
        setErr((p) => ({ ...p, to: "Please enter to address correctly!" }));
        return { error: true }
      } else if (data.to === currentAccount.evmAddress) {
        setErr((p) => ({ ...p, to: "To can't be same as your current address!" }));
        return { error: true }
      } else {
        setErr((p) => ({ ...p, to: "" }));
        return { error: false }
      }
    }
    else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

      if (!data.to || !data.to.startsWith("5")) {
        setErr((p) => ({ ...p, to: "Please enter to address correctly!" }));
        return { error: true }
      } else if (data.to === currentAccount.nativeAddress) {
        setErr((p) => ({ ...p, to: "To can't be same as your current address!" }));
        return { error: true }
      } else {
        setErr((p) => ({ ...p, to: "" }));
        return { error: false }

      }
    }
  }

  const getFee = async () => {
    let amtRes = validateAmount();
    let addressRes = validateToAddress();
    if (!(amtRes.error) && !(addressRes.error)) {
      if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {
        let feeRes = await retriveNativeFee(data.to, data.amount);
        console.log("Fee Res : ", feeRes);
        if (feeRes.error) {
          if (feeRes.data) {
            setErr(p => ({ ...p, to: feeRes.data }));
          } else {
            toast.error("Error while getting fee!");
          }
        } else {
          setGassFee(feeRes.data);
        }
      }
      if (activeTab.toLowerCase() === EVM.toLowerCase()) {
        let feeRes = await retriveEvmFee(data.to, data.amount);
        console.log("Fee Res : ", feeRes);
        if (feeRes.error) {
          if (feeRes.data) {
            setErr(p => ({ ...p, to: feeRes.data }));
          } else {
            toast.error("Error while getting fee!");
          }
        } else {
          setGassFee(feeRes.data);
        }
      }
    }
  };

  const handleChange = (e) => {
    setData((p) => ({
      ...p,
      [e.target.name]: (e.target.value).trim(),
    }));
    setGassFee("");
  };

  const handleApprove = async () => {
    try {
      let amtRes = validateAmount();
      let addressRes = validateToAddress();
      if (!(amtRes.error) && !(addressRes.error)) {

        if (activeTab.toLowerCase() === EVM.toLowerCase()) {
          const res = await evmTransfer(data);
          if (res.error) {
            setSendError(res.data);
            setIsFaildOpen(true);
          }
          else {
            setTxHash(res.data);
            setIsModalOpen(true);
            setTimeout(() => {
              console.log("Getting Balance after Send");
              getBalance();
            }, 60000);
          }
        } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {
          const res = await nativeTransfer(data);
          if (res.error) {
            setSendError(res.data);
            setIsFaildOpen(true);
          }
          else {
            setTxHash(res.data);
            setIsModalOpen(true);
            setTimeout(() => {
              console.log("Getting Balance after Send");
              getBalance()
            }, 60000);
          }
        }
        setGassFee("");
      }

    } catch (error) {
      console.error("Error : ", error);
      toast.error("Error occured!");
    }
  };

  const activeSend = (e) => {
    setActiveTab(e.target.name);
    setData({ to: "", amount: "" });
    setGassFee(0);
    setErr({ to: "", amount: "" });
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setData({ to: "", amount: "" });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setData({ to: "", amount: "" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    toast.success("Copied!");
  };

  const handleSwapAgain = () => {
    setIsFaildOpen(false);
    setIsModalOpen(false);
    setData({ to: "", amount: "" });
  };

  const faildOk = () => {
    setIsFaildOpen(false);
  };

  const faildCancel = () => {
    setIsFaildOpen(false);
  };

  return (
    <>
      <div className={style.sendSec}>
        <div className={`scrollableCont ${style.sendSec__sourceLabel}`}>
          <label>Source Chain :</label>
          <div className={style.sendSec__sendSwapbtn}>
            <button
              name="native"
              onClick={activeSend}
              className={`${style.sendSec__sendSwapbtn__buttons} 
              ${activeTab === "native" &&
                style.sendSec__sendSwapbtn__buttons__active
                }
            `}
            >
              Native
            </button>
            <button
              onClick={activeSend}
              name="evm"
              className={`${style.sendSec__sendSwapbtn__buttons}  ${activeTab === "evm" &&
                style.sendSec__sendSwapbtn__buttons__active
                }`}
            >
              EVM
            </button>
          </div>
        </div>
        <div className={style.sendSec__inputInnerSec}>
          <span style={{ color: "red" }}>{err.to}</span>
          <InputFieldOnly
            name="to"
            value={data.to}
            placeholder={"Please enter recipient address"}
            placeholderBaseColor={true}
            coloredBg={true}
            onChange={handleChange}
          // keyUp={validateToAddress}
          />
          <div>
            <span style={{ color: "red" }}>{err.amount}</span>
            <InputField
              coloredBg={true}
              placeholderBaseColor={true}
              name="amount"
              value={data.amount}
              placeholder={"Enter Amount"}
              onChange={handleChange}
              // keyUp={validateAmount}
              addonAfter={
                <span className={style.sendSec__pasteText}>
                  <img src={WalletCardLogo} alt="logo" />
                  5ire
                </span>
              }
            />

            {/* <span className={style.sendSec__spanbalanceText}>
              Balance 00.0000 5IRE
            </span> */}
          </div>
          {/* <InputFieldOnly
            name="memo"
            placeholder={"Memo (Optional)"}
            onChange={handleChange}
            placeholderBaseColor={true}
            coloredBg={true}
          /> */}
        </div>
        <div className={style.sendSec__transactionFee}>
          <p>Transaction Fee : {gassFee ? gassFee + " 5IRE" : gassFee}</p>
        </div>
      </div>
      <Approve onClick={handleApprove} text="Send" />

      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapImage" />
            <h2 className="title">Transfer Completed</h2>
            <p className="transId">Your Transaction ID</p>
            <span className="address">{shortner(txHash)}</span>
            <img
              src={CopyIcon}
              alt="copyIcon"
              name="naiveAddress"
              onClick={handleCopy}
            />

            <div className="footerbuttons">
              <ButtonComp text={"Send Again"} onClick={handleSwapAgain} />
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
            <h2 className="title">Send Failed!</h2>
            <p className="transId">{sendError}</p>

            <div className="footerbuttons">
              <ButtonComp text={"Swap Again"} onClick={handleSwapAgain} />
            </div>
          </div>
        </div>
      </ModalCustom>
    </>
  );
}

export default Send;
