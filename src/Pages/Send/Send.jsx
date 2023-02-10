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
    // getEvmBalance,
    // getNativeBalance,
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
  const [data, setData] = useState({ to: "", amount: ""});
  const [err, setErr] = useState({ to: "", amount: "" });
  const [gassFee, setGassFee] = useState(0);

  useEffect(() => {
    if (data.to && Number(data.amount) > 0) {
      getFee();
    }
    // else {
    //   setGassFee("0");
    // }
  }, [data, activeTab]);

  const getFee = async () => {
    let fee = 0;

    if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {
      fee = await retriveNativeFee(data.to, data.amount);
    }
    if (activeTab.toLowerCase() === EVM.toLowerCase()) {
      fee = await retriveEvmFee(data.to, data.amount);
    }
    setGassFee(fee);
  };

  const activeSend = (e) => {
    setActiveTab(e.target.name);
    setData({ to: "", amount: ""});
    setGassFee(0);
    setErr({ to: "", amount: "" });
  };

  const handleChange = (e) => {
    setData((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
    setErr((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleApprove = async () => {
    try {
      if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0)
        setErr((p) => ({ ...p, amount: "Please enter amount correctly!" }));

      if (activeTab.toLowerCase() === EVM.toLowerCase()) {

        if (!data.to || !data.to.startsWith("0x"))
          setErr((p) => ({ ...p, to: "Please enter to address correctly!" }));
        else if (data.to === currentAccount.evmAddress)
          setErr((p) => ({ ...p, to: "To can't be same as your current address!" }));
        // else if (Number(data.amount) >= Number(balance.evmBalance))
        //   toast.error("Insufficient Balance!");

        else {
          const res = await evmTransfer(data);
          if (res.error)
            setIsFaildOpen(true);
          else {
            setTxHash(res.data);
            setIsModalOpen(true);
            setTimeout(() => {
              getBalance();
              // getNativeBalance();
              // getEvmBalance();
            }, 60000);
          }
        }
      }

      if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {
        // console.log("balance.nativeBalance : ",balance.nativeBalance);
        if (!data.to || !data.to.startsWith("5"))
          setErr((p) => ({ ...p, to: "Please enter to address correctly!" }));
        else if (data.to === currentAccount.nativeAddress)
          setErr((p) => ({ ...p, to: "To can't be same as your current address!" }));
        // else if (Number(data.amount) >= Number(balance.nativeBalance))
        //   toast.error("Insufficient Balance!");

        else {
          const res = await nativeTransfer(data);
          // console.log("res : ", res);
          if (res.error) setIsFaildOpen(true);
          else {
            setTxHash(res.data);
            setIsModalOpen(true);

            setTimeout(() => {
              getBalance()
              // getNativeBalance();
              // getEvmBalance();
            }, 60000);
          }
        }
      }
    } catch (error) {
      console.error("Error : ", error);
      toast.error("Error occured!");
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setData({ to: "", amount: ""});
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setData({ to: "", amount: ""});
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    toast.success("Copied!");
  };

  const handleSwapAgain = () => {
    setIsFaildOpen(false);
    setIsModalOpen(false);
    setData({ to: "", amount: ""});
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
          />
          <div>
            <span style={{ color: "red" }}>{err.amount}</span>
            <InputField
              coloredBg={true}
              name="amount"
              value={data.amount}
              placeholder={"Enter Amount"}
              onChange={handleChange}
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
          <p>Transaction Fee : {gassFee} 5IRE</p>
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
            <p className="transId">Your Send Request Failed!</p>

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
