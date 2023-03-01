import React, { useState, useEffect } from "react";
import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import ComplSwap from "../../Assets/DarkLogo.svg";
import useWallet from "../../Hooks/useWallet";
import FaildSwap from "../../Assets/DarkLogo.svg";
import { shortner } from "../../Helper/helper";
import CopyIcon from "../../Assets/CopyIcon.svg";
import { toast } from "react-toastify";
import { NATIVE, EVM } from "../../Constants/index";
import { useSelector } from "react-redux";
import { connectionObj, Connection } from "../../Helper/connection.helper"
import {
  InputField,
  InputFieldOnly,
} from "../../Components/InputField/InputFieldSimple";
// const dispatch = useDispatch();

function Send() {
  const [disableBtn, setDisable] = useState(true);
  const {
    evmTransfer,
    nativeTransfer,
    getBalance,
    retriveEvmFee,
    retriveNativeFee,
    validateAddress
  } = useWallet();
  const { balance, currentAccount, httpEndPoints, currentNetwork } = useSelector(state => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("native");
  const [txHash, setTxHash] = useState("");
  const [data, setData] = useState({ to: "", amount: "" });
  const [err, setErr] = useState({ to: "", amount: "" });
  const [sendError, setSendError] = useState("");
  const [gassFee, setGassFee] = useState("");

  useEffect(() => {

    console.log("data. amount :::: ", data.amount);

    if (data.to === "" || !data.amount) {
      setErr(p => ({ ...p, to: "" }));
      setGassFee("");
    }
    if (data.amount === "" || !data.amount) {
      setErr(p => ({ ...p, amount: "" }));
      setGassFee("");
    }

    if ((data.to) && (data.amount)) {
      getFee();
    } else {
      setGassFee("");
      setDisable(true);
    }
  }, [data.to, data.amount]);

  useEffect(() => {
    if (gassFee === "" || !gassFee) {
      setDisable(true);
    } else {
      if (activeTab.toLowerCase() === EVM.toLowerCase()) {
        if ((Number(data.amount) + Number(gassFee)) >= Number(balance.evmBalance)) {
          setGassFee("");
          setDisable(true);
          setErr((p) => ({ ...p, amount: "Insufficent balance." }));

        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }))

        }
      } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

        if ((Number(data.amount) + Number(gassFee)) >= Number(balance.nativeBalance)) {
          setGassFee("");
          setDisable(true);
          setErr((p) => ({ ...p, amount: "Insufficent balance." }));

        } else {
          setDisable(false);
          setErr((p) => ({ ...p, amount: "" }))
        }
      }
    }
  }, [gassFee]);

  const validateAmount = () => {

    if (!data.amount) {
      setErr((p) => ({ ...p, amount: "Please enter amount." }));
      return { error: true };

    } else if (isNaN(data.amount)) {
      setErr((p) => ({ ...p, amount: "Please enter amount correctly." }));
      return { error: true };

    } else if (Number(data.amount) <= 0) {
      setErr((p) => ({ ...p, amount: "Amount can't be 0 or less then 0" }));
      return { error: true };

    } else if (activeTab.toLowerCase() === EVM.toLowerCase()) {

      if (Number(data.amount) >= Number(balance.evmBalance)) {
        setErr((p) => ({ ...p, amount: "Insufficent balance." }));
        return { error: true };
      } else {
        setErr((p) => ({ ...p, amount: "" }));
        return { error: false };
      }
    } else if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {

      if (Number(data.amount) >= Number(balance.nativeBalance)) {
        setErr((p) => ({ ...p, amount: "Insufficent balance." }));
        return { error: true };
      } else {
        setErr((p) => ({ ...p, amount: "" }));
        return { error: false };
      }
    }
  }

  const validateToAddress = () => {
    if (activeTab.toLowerCase() === EVM.toLowerCase()) {

      if (!data.to) {
        setErr((p) => ({ ...p, to: "Please enter 'Recipient' address." }));
        return { error: true }

      } else if (!data.to.startsWith("0x")) {
        setErr((p) => ({ ...p, to: "Incorrect 'Recipient' address." }));
        return { error: true }

      } else if (data.to === currentAccount.evmAddress) {
        setErr((p) => ({ ...p, to: "'Recipient' can not be same as your current address!" }));
        return { error: true }

      } else {
        let res = validateAddress(data.to);

        if (res.error) {
          setErr((p) => ({ ...p, to: res.data }));
          return { error: true }
        } else {
          setErr((p) => ({ ...p, to: "" }));
          return { error: false };
        }
      }
    }

    else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

      if (!data.to) {
        setErr((p) => ({ ...p, to: "Please enter 'Recipient' address." }));
        return { error: true }

      } else if (!data.to.startsWith("5")) {
        setErr((p) => ({ ...p, to: "Incorrect 'Recipient' address." }));
        return { error: true }

      } else if (data.to === currentAccount.nativeAddress) {
        setErr((p) => ({ ...p, to: "'Recipient' can't be same as your current address." }));
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

      // setDisable(false);
      connectionObj.initializeApi(httpEndPoints.testnet, httpEndPoints.qa, currentNetwork, false).then(async (apiRes) => {

        if (!apiRes?.value) {

          Connection.isExecuting.value = false;

          if (activeTab.toLowerCase() === NATIVE.toLowerCase()) {

            let feeRes = await retriveNativeFee(apiRes.nativeApi, data.to, data.amount);

            if (feeRes.error) {
              if (feeRes.data) {
                setErr(p => ({ ...p, to: feeRes.data }));
                setDisable(true);
              } else {
                toast.error("Error while getting fee!");
                setDisable(true);
              }
            } else {
              setGassFee(feeRes.data);
              setDisable(false);
            }
          }
          else if (activeTab.toLowerCase() === EVM.toLowerCase()) {

            let feeRes = await retriveEvmFee(apiRes.evmApi, data.to, data.amount);
            // console.log("Fee Res : ", feeRes);
            if (feeRes.error) {
              if (feeRes.data) {
                setErr(p => ({ ...p, to: feeRes.data }));
              } else {
                toast.error("Error while getting fee!");
              }
            } else {
              setGassFee(feeRes.data);
              setDisable(false);
            }
          }
        }
      });
    } else {
      setDisable(true);
    }
  };

  const handleChange = (e) => {
    setData((p) => ({
      ...p,
      [e.target.name]: (e.target.value).trim(),
    }));
    setGassFee("");
  };

  const handleApprove = async (e) => {
    try {

      // if ((e.key === "Enter") || (e.key === undefined)) {

      let amtRes = validateAmount();
      let addressRes = validateToAddress();

      if (!(amtRes.error) && !(addressRes.error) && !err.amount && !err.to) {

        connectionObj.initializeApi(httpEndPoints.testnet, httpEndPoints.qa, currentNetwork, false).then(async (apiRes) => {

          if (!apiRes?.value) {
            Connection.isExecuting.value = false;

            if (activeTab.toLowerCase() === EVM.toLowerCase()) {

              if ((Number(data.amount) + Number(gassFee)) >= Number(balance.evmBalance)) {
                setErr((p) => ({ ...p, amount: "Insufficent balance." }))
              } else {
                const res = await evmTransfer(apiRes.evmApi, data);
                if (res.error) {
                  setSendError(res.data);
                  setIsFaildOpen(true);
                }
                else {
                  setTxHash(res.data);
                  setIsModalOpen(true);
                  setTimeout(() => {
                    getBalance(apiRes.evmApi, apiRes.nativeApi, true);
                  }, 3000);
                }
              }


            } else if (activeTab?.toLowerCase() === NATIVE.toLowerCase()) {

              // console.log("(Number(data.amount) + Number(gassFee)) > Number(balance.nativeBalance) : ", (Number(data.amount) + Number(gassFee)) > Number(balance.nativeBalance));

              if ((Number(data.amount) + Number(gassFee)) >= Number(balance.nativeBalance)) {

                setErr((p) => ({ ...p, amount: "Insufficent balance." }));

              } else {
                const res = await nativeTransfer(apiRes.nativeApi, data);
                if (res.error) {
                  setSendError(res.data);
                  setIsFaildOpen(true);
                }
                else {
                  setTxHash(res.data);
                  setIsModalOpen(true);
                  setTimeout(() => {
                    getBalance(apiRes.evmApi, apiRes.nativeApi, true)
                  }, 3000);
                }
              }
            }
          }
          setGassFee("");
        });
        // }
      } else {
        setDisable(true);
      }


    } catch (error) {
      console.error("Error : ", error);
      toast.error("Error occured!");
    }
  };

  const activeSend = (e) => {
    setActiveTab(e.target.name);
    setGassFee("");
    setDisable(true);
    setErr({ to: "", amount: "" });
    setData({ to: "", amount: "" });
  };

  const handleOk = () => {
    setDisable(true);
    setGassFee("");
    setIsModalOpen(false);
    setData({ to: "", amount: "" });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setDisable(true);
    setGassFee("");
    setData({ to: "", amount: "" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    toast.success("Copied!");
  };

  const handleSwapAgain = () => {
    setIsFaildOpen(false);
    setDisable(true);
    setGassFee("");
    setIsModalOpen(false);
    setData({ to: "", amount: "" });
  };

  const faildOk = () => {
    setDisable(true);
    setIsFaildOpen(false);
    setGassFee("");
    setData({ to: "", amount: "" });
  };

  const faildCancel = () => {
    setIsFaildOpen(false);
    setDisable(true);
    setGassFee("");
    setData({ to: "", amount: "" });
  };

  return (
    <>
      <div className={style.sendSec} /*onKeyDown={handleApprove} */>
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
          <InputFieldOnly
            name="to"
            value={data.to}
            placeholder={"Please enter recipient address"}
            placeholderBaseColor={true}
            coloredBg={true}
            onChange={handleChange}
          // keyUp={validateToAddress}
          />
          <span className={style.errorText}>{err.to}</span>

          <div>
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
                  <img src={WalletCardLogo} alt="logo" draggable={false} />
                  5ire
                </span>
              }
            />
            <span className={style.errorText}>{err.amount}</span>

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
          <p>{gassFee ? `Estimated fee : ${gassFee} 5IRE` : ""}</p>
        </div>
      </div>
      <Approve onClick={handleApprove} text="Transfer" isDisable={disableBtn} />

      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapImage" width={127} height={127} draggable={false} />
            <h2 className="title">Transfer Processed</h2>
            <p className="transId">Your Transaction ID</p>
            <span className="address">{shortner(txHash)}</span>
            <img
              draggable={false}
              src={CopyIcon}
              alt="copyIcon"
              name="naiveAddress"
              onClick={handleCopy}
            />

            <div className="footerbuttons">
              <ButtonComp text={"Transfer Again"} onClick={handleSwapAgain} />
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
            <img src={FaildSwap} alt="swapFaild" width={127} height={127} draggable={false} />
            <h2 className="title">Transfer Failed!</h2>
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
