import { useEffect } from "react";
import { Switch, Tooltip } from "antd";
import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import Info from "../../Assets/infoIcon.svg";
import { isEmpty } from "../../Utility/utility";
import SwapIcon from "../../Assets/SwapIcon.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import SmallLogo from "../../Assets/smallLogo.svg";
import ComplSwap from "../../Assets/succeslogo.svg";
import React, { useState, useContext } from "react";
// import WalletCardLogo from "../../Assets/walletcardLogo.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { InputField } from "../../Components/InputField/InputFieldSimple";
import {
  EVM,
  NATIVE,
  LABELS,
  TX_TYPE,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  EXISTENTIAL_DEPOSITE,
  MESSAGE_EVENT_LABELS,
} from "../../Constants/index";


function Swap() {
  const [isEd, setEd] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [disableBtn, setDisable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [toFrom, setToFrom] = useState({ from: NATIVE, to: EVM });
  const { state, estimatedGas, updateEstimatedGas, updateLoading } = useContext(AuthContext);
  const { balance } = state;

  //Reset the amount and error when to and from changes
  useEffect(() => {
    setAmount("");
    setError("");
  }, [toFrom.to]);

  //Reset the amount and error when to and from changes
  useEffect(() => {
    setAmount("");
    setError("");
  }, []);

  //Get fee if to and amount is present
  useEffect(() => {
    const getData = setTimeout(() => {
      if ((!isEmpty(amount) && !error && !estimatedGas)) {
        getFee();
      } else if (!amount || error || !estimatedGas) {
        setDisable(true);
      }
    }, 1000);

    return () => clearTimeout(getData);

  }, [amount, error, isEd, toFrom.from, estimatedGas]);


  //Check for Insufficent balance
  useEffect(() => {
    if (!estimatedGas) setDisable(true);
    else {
      if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {
        if (estimatedGas && !amount) {
          const amount = Number(balance.evmBalance) - (Number(estimatedGas) + 0.1 + (isEd ? EXISTENTIAL_DEPOSITE : 0));
          setAmount(amount > 0 ? amount : "");
          updateEstimatedGas(amount > 0 ? estimatedGas : null);
          return;
        }
        else if ((Number(amount) + (Number(estimatedGas)) + (isEd ? EXISTENTIAL_DEPOSITE : 0)) > Number(balance.evmBalance)) {
          setDisable(true);
          updateEstimatedGas(null);
          setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

        } else {
          setDisable(false);
          setError("");
        }

      } else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {
        if (estimatedGas && !amount) {
          const amount = Number(balance.nativeBalance) - (Number(estimatedGas) + 0.1 + (isEd ? EXISTENTIAL_DEPOSITE : 0));
          setAmount(amount > 0 ? amount : "");
          updateEstimatedGas(amount > 0 ? estimatedGas : null);
          return;
        }
        if ((Number(amount) + Number(estimatedGas) + (isEd ? EXISTENTIAL_DEPOSITE : 0)) > Number(balance.nativeBalance)) {
          setDisable(true);
          updateEstimatedGas(null);
          setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

        } else {
          setDisable(false);
          setError("");
        }

      }
    }
  }, [estimatedGas, amount, balance.nativeBalance, isEd, toFrom.from, balance.evmBalance]);

  const blockInvalidChar = e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();


  //validate amount
  const validateAmount = () => {

    if (amount.length === 0)
      setError(ERROR_MESSAGES.INPUT_REQUIRED);

    else if (isNaN(amount))
      setError(ERROR_MESSAGES.ENTER_AMOUNT_CORRECTLY);

    else if (Number(amount) < 1)
      setError(ERROR_MESSAGES.AMOUNT_CANT_LESS_THEN_ONE);

    // else if (Number(amount) <= 0)
    //   setError(ERROR_MESSAGES.AMOUNT_CANT_BE_0);

    else if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {

      if (Number(amount) >= Number(balance.evmBalance))
        setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

      else
        setError("");
    }

    else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {

      if (Number(amount) >= Number(balance.nativeBalance))
        setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

      else
        setError("");
    }
  };

  //Perform swap
  const handleApprove = async (e) => {
    try {
      if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.EVM_TO_NATIVE_SWAP, { value: amount, options: { account: state.currentAccount, network: state.currentNetwork, type: TX_TYPE.SWAP, isEvm: true, to: LABELS.EVM_TO_NATIVE } });
        setIsModalOpen(true);
      } else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.NATIVE_TO_EVM_SWAP, { value: amount, options: { account: state.currentAccount, network: state.currentNetwork, type: TX_TYPE.SWAP, isEvm: false, to: LABELS.NATIVE_TO_EVM } });
        setIsModalOpen(true);
      }

      updateEstimatedGas("");
    } catch (error) {
      toast.error("Error occured.");
    }
  };

  //for getting the fee details
  const getFee = async (loader = true) => {
    if (toFrom.from.toLocaleLowerCase() === NATIVE.toLowerCase() && balance.nativeBalance) {
      loader && updateLoading(true);
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.NATIVE_FEE,
        {
          value: amount ? amount : balance?.nativeBalance,
          options: {
            account: state.currentAccount
          }
        });
    } else if (toFrom.from.toLocaleLowerCase() === EVM.toLowerCase() && balance.evmBalance) {
      loader && updateLoading(true);
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE,
        {
          value: amount ? amount : balance?.evmBalance,
          options: {
            account: state.currentAccount
          }
        }
      );
    }

    updateEstimatedGas(null);
  };

  //handle the changed value of inputs
  const handleChange = (e) => {
    const val = e.target.value;
    const arr = val.split(".");

    if (arr.length > 1) {

      if (arr[1].length > 18) {
        let slice = arr[1].slice(0, 18);
        setAmount(arr[0] + "." + slice);
      } else {
        if (amount !== val) {
          setAmount(val);
          updateEstimatedGas(null);
        }
      }
    }
    else {
      if (amount !== val) {
        setAmount(val);
        updateEstimatedGas(null);
      }
    }
  };

  //Perform action on click of Enter
  const handleEnter = (e) => {
    if ((e.key === LABELS.ENTER)) {
      if (!disableBtn) {
        handleApprove();
      }
    }
  };

  //handle Ok and cancel button of popup
  const handle_OK_Cancel = () => {
    setAmount("");
    setDisable(true);
    setIsFaildOpen(false);
    setIsModalOpen(false);
    updateEstimatedGas(null);
  };


  //Set To and from
  const handleClick = () => {

    if (toFrom.from.toLowerCase() === EVM.toLowerCase()) { }
    setToFrom({ from: NATIVE, to: EVM });

    if (toFrom.from.toLowerCase() === NATIVE.toLowerCase())
      setToFrom({ from: EVM, to: NATIVE });

    setAmount("");
    updateEstimatedGas(null);

  };

  //set the ED toggler state
  const onChangeToggler = (checked) => {
    setEd(checked);
    setError("");
    setAmount("");
    updateEstimatedGas(null);
  };

  //performs action when user click on max button
  const handleMaxClick = () => {
    setAmount("");
    setError("");
    getFee();
  }

  const suffix = (
    <button className="maxBtn" onClick={handleMaxClick}>Max</button>
  );

  // useEffect(() => {
  //   const getData = setTimeout(() => {
  //     if (
  //       (!isEmpty(amount) && !error)
  //       ||
  //       !amount
  //     ) {
  //       getFee(!amount ? false : true);
  //     } else {
  //       updateEstimatedGas(null);
  //       setDisable(true);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(getData);

  // }, [amount, error, isEd, maxAmount, toFrom.from]);


  // const handleCopy = (e) => {
  //   if (e.target.name.toLowerCase() === NATIVE.toLowerCase())
  //     navigator.clipboard.writeText(currentAccount?.nativeAddress);

  //   if (e.target.name.toLowerCase() === EVM.toLowerCase())
  //     navigator.clipboard.writeText(currentAccount?.evmAddress);

  //   // if (e.target.name.toLowerCase() === "hash")
  //   //   navigator.clipboard.writeText(txHash);

  //   toast.success(COPIED);
  // };


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
            {/* <span>{isEqual(toFrom.to, EVM) ? shortner(currentAccount.evmAddress) : shortner(currentAccount.nativeAddress)}</span> */}
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
            {/* <span>{!isEqual(toFrom.to, EVM) ? shortner(currentAccount.evmAddress) : shortner(currentAccount.nativeAddress)}</span> */}
          </div>
        </div>
        <div className={style.swap__swapAccount}>
          <div>
            <InputField
              min={"0"}
              key="swapInput"
              name={"swapAmount"}
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
                  <img src={SmallLogo} alt="walletLogo" draggable={false} />
                  5ire
                </span>
              }
              suffix={suffix}

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
          <h2>{estimatedGas ? `TX Fee : ${estimatedGas} 5IRE` : ""}</h2>
          {/* <h3>Balance 00.0000 5IRE</h3> */}
        </div>
        <div className={style.swap__inFoAccount}>
          <Tooltip title="5irechain requires a minimum of 1 5ire token to keep your wallet active">
            <img src={Info} />
          </Tooltip>
          <h3>Transfer with account keep alive checks </h3>
          <Switch defaultChecked onChange={onChangeToggler} />
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
        centered
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapIcon" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Processed</h2>
            {/* <p className="transId">Your Swapped Transaction ID</p>
             <h3 className="hashTag">{txHash ? shortner(txHash): ""}</h3>
              {txHash && <img
              draggable={false}
              src={CopyIcon}
              alt="copyIcon"
              name="naiveAddress"
              style={{cursor: "pointer"}}
              onClick={handleCopy}
            />} */}

            {/* <span className="address">
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
        centered
      >
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={FaildSwap} alt="swapFaild" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Failed!</h2>
            {/* <p className="transId">{swapErr}</p> */}

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
