import { Switch, Tooltip } from "antd";
import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import Info from "../../Assets/infoIcon.svg";
import SwapIcon from "../../Assets/SwapIcon.svg";
import FaildSwap from "../../Assets/DarkLogo.svg";
import SmallLogo from "../../Assets/smallLogo.svg";
import ComplSwap from "../../Assets/succeslogo.svg";
import React, { useState, useContext, useCallback, useEffect } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { InputField } from "../../Components/InputField/InputFieldSimple";
import {
  EVM,
  REGEX,
  NATIVE,
  LABELS,
  TX_TYPE,
  MESSAGES,
  EXTRA_FEE,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

function Swap() {
  const [isEd, setEd] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [disableBtn, setDisable] = useState(true);
  const [maxClicked, setMaxClicked] = useState(false);
  const [isMaxDisabled, setMaxDisabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [toFrom, setToFrom] = useState({ from: NATIVE, to: EVM });

  const { state, estimatedGas, updateEstimatedGas, updateLoading, edValue } =
    useContext(AuthContext);
  const { allAccountsBalance, pendingTransactionBalance, currentNetwork, currentAccount } = state;
  const balance = allAccountsBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()];

  //Reset the amount and error when to and from changes
  useEffect(() => {
    setError("");
    setAmount("");
    updateEstimatedGas(null);
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.GET_ED, {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toFrom?.to, currentNetwork]);

  // useEffect(() => {
  //   if (!amount && !estimatedGas) {
  //     setError("");
  //   }
  // }, [amount, estimatedGas]);

  useEffect(() => {
    if (
      (toFrom.from === EVM && Number(balance?.evmBalance) <= edValue && isEd) ||
      (toFrom.from === NATIVE && Number(balance?.nativeBalance) <= edValue && isEd) ||
      (toFrom.from === EVM && Number(balance?.evmBalance) <= edValue && !isEd) ||
      (toFrom.from === NATIVE && Number(balance?.nativeBalance) <= edValue && !isEd)
    ) {
      setMaxDisabled(true);
    } else {
      setMaxDisabled(false);
    }
  }, [balance?.evmBalance, balance?.nativeBalance, toFrom?.from, isEd, edValue]);

  //Get fee if to and amount is present
  useEffect(() => {
    if (amount && !error && !estimatedGas) {
      const getData = setTimeout(() => {
        getFee();
      }, 1000);
      return () => clearTimeout(getData);
    } else if (!amount || error || !estimatedGas) {
      setDisable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, error, isEd, toFrom?.from, estimatedGas]);

  //Check for Insufficent balance
  useEffect(() => {
    if (!estimatedGas) setDisable(true);
    else {
      if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {
        if (estimatedGas && !amount && maxClicked) {
          const value =
            Number(balance?.evmBalance) -
            (Number(estimatedGas) +
              EXTRA_FEE +
              (isEd ? edValue : 0) +
              pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()]
                .evm);

          setAmount(Number(value) >= 1 ? value : "");
          updateEstimatedGas(Number(value) >= 1 ? estimatedGas : null);
          // Number(value) <= 1 && toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
          Number(value) <= edValue && setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);
          setMaxClicked(false);

          return;
        } else if (
          Number(amount) + Number(estimatedGas) + (isEd ? edValue : 0) >
          Number(balance?.evmBalance) -
            pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm
        ) {
          setDisable(true);
          updateEstimatedGas(null);
          setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);
        } else {
          setDisable(false);
          setError("");
        }
      } else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {
        if (estimatedGas && !amount && maxClicked) {
          const value =
            Number(balance?.nativeBalance) -
            (Number(estimatedGas) +
              EXTRA_FEE +
              (isEd ? edValue : 0) +
              pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()]
                .native);

          updateEstimatedGas(Number(value) >= 1 ? estimatedGas : null);
          setAmount(Number(value) >= 1 ? value : "");
          // Number(value) <= 1 && toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
          setMaxClicked(false);
          Number(value) <= edValue && setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);

          return;
        }
        if (
          Number(amount) + Number(estimatedGas) + (isEd ? edValue : 0) >
          Number(balance?.nativeBalance) -
            pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()]
              .native
        ) {
          setDisable(true);
          updateEstimatedGas(null);
          setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);
        } else {
          setDisable(false);
          setError("");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGas, amount, balance?.nativeBalance, isEd, toFrom.from, balance?.evmBalance]);

  const blockInvalidChar = useCallback(
    (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
    []
  );

  //validate amount
  const validateAmount = useCallback(() => {
    if (amount.length === 0) setError(ERROR_MESSAGES.INPUT_REQUIRED);
    else if (isNaN(amount)) setError(ERROR_MESSAGES.ENTER_AMOUNT_CORRECTLY);
    else if (Number(amount) < 1) setError(ERROR_MESSAGES.AMOUNT_CANT_LESS_THEN_ONE);
    else if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {
      if (
        Number(amount) >=
        Number(balance?.evmBalance) -
          pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm
      )
        setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      else setError("");
    } else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {
      if (
        Number(amount) >=
        Number(balance?.nativeBalance) -
          pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].native
      )
        setError(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      else setError("");
    }
  }, [
    amount,
    balance?.evmBalance,
    balance?.nativeBalance,
    currentAccount.evmAddress,
    currentNetwork,
    pendingTransactionBalance,
    toFrom.from
  ]);

  //Perform swap
  const handleApprove = useCallback(async () => {
    try {
      if (toFrom.from.toLowerCase() === EVM.toLowerCase()) {
        updateLoading(true);
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.INTERNAL_TX,
          MESSAGE_EVENT_LABELS.EVM_TO_NATIVE_SWAP,
          {
            value: amount,
            options: {
              account: state.currentAccount,
              network: state.currentNetwork,
              type: TX_TYPE.SWAP,
              isEvm: true,
              to: LABELS.EVM_TO_NATIVE,
              fee: estimatedGas
            }
          }
        );
        setTimeout(() => {
          setIsModalOpen(true);
          updateLoading(false);
        }, 3000);
      } else if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) {
        updateLoading(true);
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.INTERNAL_TX,
          MESSAGE_EVENT_LABELS.NATIVE_TO_EVM_SWAP,
          {
            value: amount,
            options: {
              account: state.currentAccount,
              network: state.currentNetwork,
              type: TX_TYPE.SWAP,
              isEvm: false,
              to: LABELS.NATIVE_TO_EVM,
              fee: estimatedGas
            }
          }
        );
        setTimeout(() => {
          setIsModalOpen(true);
          updateLoading(false);
        }, 3000);
      }
      setAmount("");
      updateEstimatedGas(null);
    } catch (error) {
      toast.error("Error occured.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    amount,
    estimatedGas,
    state.currentAccount,
    state.currentNetwork,
    toFrom.from,
    updateLoading
  ]);

  //for getting the fee details
  const getFee = useCallback(
    async (loader = true) => {
      if (
        toFrom.from.toLocaleLowerCase() === NATIVE.toLowerCase() &&
        Number(balance?.nativeBalance) > 0
      ) {
        loader && updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.NATIVE_FEE, {
          value: amount ? amount : balance?.nativeBalance,
          options: {
            account: state.currentAccount
          },
          isEd
        });
      } else if (toFrom.from.toLocaleLowerCase() === EVM.toLowerCase() && balance?.evmBalance) {
        loader && updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, {
          value: amount ? amount : balance?.evmBalance,
          options: {
            account: state.currentAccount
          },
          isEd
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amount, balance?.evmBalance, balance?.nativeBalance, isEd, state.currentAccount, toFrom.from]
  );

  //handle the changed value of inputs
  // const handleChange = useCallback(
  //   (e) => {
  //     const val = e.target.value;
  //     const arr = val.split(".");

  //     if (val === "") {
  //       updateEstimatedGas(null);
  //       setAmount("");
  //       return;
  //     }

  //     if (arr.length > 1) {
  //       if (arr[1].length > 18) {
  //         let slice = arr[1].slice(0, 18);
  //         setAmount(arr[0] + "." + slice);
  //       } else {
  //         if (amount !== val) {
  //           setAmount(val);
  //           updateEstimatedGas(null);
  //         }
  //       }
  //     } else {
  //       if (amount !== val) {
  //         setAmount(val);
  //         updateEstimatedGas(null);
  //       }
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [amount, updateEstimatedGas]
  // );

  //Perform action on click of Enter
  const handleChange = useCallback(
    (e) => {
      const val = e.target.value.replace(REGEX.DECIMAL_NUMBERS, "");
      const arr = val.split(".");

      if (arr.length === 2) {
        if (arr[1].length > 18) {
          let slice = arr[1].slice(0, 18);
          setAmount(arr[0] + "." + slice);
        } else {
          setAmount(val);
          if (Number(val) !== Number(amount)) {
            updateEstimatedGas(null);
          }
        }
      } else if (arr.length === 1) {
        setAmount(val);
        if (Number(val) !== Number(amount)) {
          updateEstimatedGas(null);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amount, updateEstimatedGas]
  );

  const handleEnter = (e) => {
    if (e.key === LABELS.ENTER) {
      if (!disableBtn) {
        handleApprove();
      }
    }
  };

  //handle Ok and cancel button of popup
  const handle_OK_Cancel = () => {
    setDisable(true);
    setIsFaildOpen(false);
    setIsModalOpen(false);
  };

  //Set To and from
  const handleClick = () => {
    setToFrom({ from: NATIVE, to: EVM });

    if (toFrom.from.toLowerCase() === NATIVE.toLowerCase()) setToFrom({ from: EVM, to: NATIVE });

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
    setMaxClicked(true);
    setAmount("");
    setError("");
    getFee();
  };

  const suffix = (
    <button disabled={isMaxDisabled} className="maxBtn" onClick={handleMaxClick}>
      Max
    </button>
  );

  return (
    <>
      <div className={style.swap} onKeyDown={handleEnter}>
        <div className={style.swap__swapCopy}>
          <div className={style.swap__swapSec}>
            <h3>From {toFrom.from}</h3>
          </div>
          <div className={style.swap__icon} onClick={handleClick}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div className={style.swap__swapSec}>
            <h3>To {toFrom.to}</h3>
          </div>
        </div>
        <div className={style.swap__swapAccount}>
          <div>
            <InputField
              min={"0"}
              // type="number"
              value={amount}
              key="swapInput"
              suffix={suffix}
              coloredBg={true}
              name={"swapAmount"}
              keyUp={validateAmount}
              onChange={handleChange}
              keyDown={blockInvalidChar}
              placeholderBaseColor={true}
              placeholder={"Enter Amount"}
              onDrop={(e) => {
                e.preventDefault();
              }}
              addonAfter={
                <span className={style.swap__pasteText}>
                  <img src={SmallLogo} alt="walletLogo" draggable={false} />
                  5ire
                </span>
              }
            />
            <p className="errorText">{error}</p>

            {/* <span className={style.swap__spanbalanceText}>
              Balance 00.0000 5IRE
            </span> */}
          </div>
        </div>
        <div className={style.swap__txFeeBalance}>
          <h2>{estimatedGas ? `TX Fee : ${estimatedGas} 5IRE` : ""}</h2>
        </div>
        <div className={style.swap__inFoAccount}>
          <Tooltip title={MESSAGES.ED}>
            <img src={Info} alt="infoImage" />
          </Tooltip>
          <h3>Transfer with account keep alive checks </h3>
          <Switch defaultChecked onChange={onChangeToggler} />
        </div>
      </div>
      <Approve onClick={handleApprove} text="Swap" isDisable={disableBtn} />

      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
        centered>
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapIcon" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Processed</h2>
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
        centered>
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={FaildSwap} alt="swapFaild" width={127} height={127} draggable={false} />
            <h2 className="title">Swap Failed!</h2>
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
