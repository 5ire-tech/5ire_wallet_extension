import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import Approve from "../Approve/Approve";
import { AuthContext } from "../../Store";
import FaildSwap from "../../Assets/DarkLogo.svg";
import SmallLogo from "../../Assets/smallLogo.svg";
import ComplSwap from "../../Assets/succeslogo.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { debounce, formatBalance, validateAddress } from "../../Utility/utility";
import { InputField, InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import {
  REGEX,
  LABELS,
  TX_TYPE,
  EXTRA_FEE,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";
import { DownArrow } from "../../Assets/StoreAsset/StoreAsset";
import Info from "../../Assets/infoIcon.svg";
import { Tooltip } from "antd";

function Send() {
  const [disableBtn, setDisable] = useState(true);
  // const [activeTab, setActiveTab] = useState(NATIVE);
  const [allTokens, setAllTokens] = useState([]);
  const [tokensList, setTokensList] = useState([]);
  const [searchedInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFaildOpen, setIsFaildOpen] = useState(false);
  const [err, setErr] = useState({ to: "", amount: "" });
  const [isMaxDisabled, setMaxDisabled] = useState(true);
  const [data, setData] = useState({ to: "", amount: "" });
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const {
    state,
    edValue,
    estimatedGas,
    updateLoading,
    selectedToken,
    setSelectedToken,
    updateEstimatedGas
  } = useContext(AuthContext);
  const { currentAccount, pendingTransactionBalance, currentNetwork, allAccountsBalance, tokens } =
    state;
  const balance = allAccountsBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()];
  const MINIMUM_BALANCE = edValue;

  /**
   * Perform Search
   */
  // eslint-disable-next-line
  const handleSearch = useCallback(
    debounce((searchQuery, tokens_) => {
      const results = tokens_.filter(
        (result) =>
          result?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result?.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setTokensList(results);
    }, 1000),
    []
  );

  useEffect(() => {
    const tokensByAddress = tokens[currentAccount?.evmAddress];
    const tokensToShow = tokensByAddress ? tokensByAddress[currentNetwork?.toLowerCase()] : null;

    setAllTokens(tokensToShow);
  }, [currentNetwork, currentAccount?.evmAddress, tokens]);

  useEffect(() => {
    if (searchedInput) {
      handleSearch(searchedInput, allTokens);
    } else {
      if (allTokens.length >= 2) {
        setTokensList([
          {
            address: "",
            balance: "",
            decimals: "",
            name: "5ire",
            symbol: "5ire"
          },
          allTokens[0],
          allTokens[1]
        ]);
      } else if (allTokens.length >= 1) {
        setTokensList([
          {
            address: "",
            balance: "",
            decimals: "",
            name: "5ire",
            symbol: "5ire"
          },
          allTokens[0]
        ]);
      } else {
        setTokensList([
          {
            address: "",
            balance: "",
            decimals: "",
            name: "5ire",
            symbol: "5ire"
          }
        ]);
      }
    }
  }, [searchedInput, allTokens, handleSearch]);

  const showModal = () => {
    setIsModalOpen1(true);
  };
  const handleOk = () => {
    setIsModalOpen1(false);
  };
  const handleCancel = () => {
    setIsModalOpen1(false);
  };

  /**
   * Reset the amount, to and error evm and native address changed
   */
  useEffect(() => {
    updateEstimatedGas(null);
    setErr({ to: "", amount: "" });
    setData({ to: "", amount: "" });
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.GET_ED, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?.evmAddress, currentNetwork]);

  useEffect(() => {
    if (!data.to && !data.amount && !estimatedGas) {
      setErr({ to: "", amount: "" });
    }
  }, [data.to, data.amount, estimatedGas]);

  useEffect(() => {
    if (Number(balance?.transferableBalance) < MINIMUM_BALANCE || !data.to || err.to) {
      setMaxDisabled(true);
    } else {
      setMaxDisabled(false);
    }
  }, [balance?.transferableBalance, balance?.stakedBalance, data?.to, err.to, MINIMUM_BALANCE]);

  /**
   * Get fee if to and amount is present
   */
  useEffect(() => {
    if (!err.to && !err.amount && data.amount && data.to && !estimatedGas) {
      const getData = setTimeout(() => {
        getFee();
      }, 1000);
      return () => clearTimeout(getData);
    } else if (!data.amount || !data.to || !estimatedGas) {
      setDisable(true);
    } else {
      setDisable(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [err.to, err.amount, data?.to, data?.amount, estimatedGas]);

  /**
   * Check for Insufficent balance after fee getting
   */
  useEffect(() => {
    if (!estimatedGas) {
      setDisable(true);
    } else {
      // if (activeTab === EVM) {
      if (selectedToken?.address === "") {
        if (estimatedGas && !data.amount && data.to) {
          const amount =
            Number(balance?.transferableBalance) -
            (Number(estimatedGas) +
              EXTRA_FEE +
              pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()]
                .evm);

          Number(amount) <= 0 &&
            setErr((p) => ({
              ...p,
              amount: ERROR_MESSAGES.INSUFFICENT_BALANCE
            }));

          updateEstimatedGas(amount > 0 ? estimatedGas : null);
          setData((p) => ({ ...p, amount: amount > 0 ? amount : "" }));
          return;
        } else if (data?.amount && estimatedGas && data?.to) {
          if (
            Number(data.amount) + Number(estimatedGas) >
            Number(balance?.transferableBalance) -
              pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm
          ) {
            updateEstimatedGas(null);
            setErr((p) => ({
              ...p,
              amount: ERROR_MESSAGES.INSUFFICENT_BALANCE
            }));
          } else {
            setErr((p) => ({ ...p, amount: "" }));
          }
        }
      } else {
        if (estimatedGas && !data.amount && data.to) {
          const amount = selectedToken.balance;
          Number(estimatedGas) > balance?.transferableBalance &&
            setErr((p) => ({
              ...p,
              amount: ERROR_MESSAGES.INSUFFICENT_BALANCE
            }));

          updateEstimatedGas(amount > 0 ? estimatedGas : null);
          setData((p) => ({ ...p, amount: amount > 0 ? amount : "" }));
          return;
        } else if (data?.amount && estimatedGas && data?.to) {
          if (
            Number(estimatedGas) >
            Number(balance?.transferableBalance) -
              pendingTransactionBalance[currentAccount.evmAddress][currentNetwork.toLowerCase()].evm
          ) {
            updateEstimatedGas(null);
            setErr((p) => ({
              ...p,
              amount: ERROR_MESSAGES.INSUFFICENT_BALANCE
            }));
          } else {
            setErr((p) => ({ ...p, amount: "" }));
          }
        }
      }
      // }
      // else if (activeTab === NATIVE) {
      //   if (estimatedGas && !data.amount && data.to) {
      //     const amount =
      //       Number(balance?.nativeBalance) -
      //       (Number(estimatedGas) +
      //         EXTRA_FEE +
      //         (isEd ? edValue : 0) +
      //         pendingTransactionBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()]
      //           .native);

      //     // Number(amount) <= 0 && toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      //     Number(amount) <= 0 &&
      //       setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
      //     updateEstimatedGas(amount > 0 ? estimatedGas : null);
      //     setData((p) => ({ ...p, amount: amount > 0 ? amount : "" }));
      //     return;
      //   } else if (
      //     Number(data.amount) + Number(estimatedGas) + (isEd ? edValue : 0) >
      //     Number(balance?.nativeBalance) -
      //       pendingTransactionBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()]
      //         .native
      //   ) {
      //     updateEstimatedGas(null);
      //     setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
      //   } else {
      //     setErr((p) => ({ ...p, amount: "" }));
      //   }
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.to, data.amount, estimatedGas, balance?.transferableBalance, selectedToken.address]);

  const blockInvalidChar = useCallback(
    (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
    []
  );

  //set the ED toggler state
  // const onChangeToggler = (checked) => {
  //   setEd(checked);
  //   updateEstimatedGas(null);
  //   setErr((p) => ({ ...p, amount: "" }));
  //   setData((p) => ({ ...p, amount: "" }));
  // };

  /**
   * Validate Amount
   */
  const validateAmount = useCallback(() => {
    if (!data.amount) setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INPUT_REQUIRED }));
    else if (isNaN(data.amount))
      setErr((p) => ({ ...p, amount: ERROR_MESSAGES.ENTER_AMOUNT_CORRECTLY }));
    else if (Number(data.amount) <= 0)
      setErr((p) => ({ ...p, amount: ERROR_MESSAGES.AMOUNT_SHOULD_BE_GREATER_THAN_0 }));
    else {
      if (selectedToken.address !== "") {
        if (
          data?.amount > selectedToken?.balance ||
          Number(balance?.transferableBalance) -
            pendingTransactionBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()]
              .evm <=
            0
        ) {
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
        } else {
          setErr((p) => ({ ...p, amount: "" }));
        }
      } else {
        if (balance?.transferableBalance < MINIMUM_BALANCE)
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
        else if (
          Number(data.amount) >=
          Number(balance?.transferableBalance) -
            pendingTransactionBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()].evm
        )
          setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
        else setErr((p) => ({ ...p, amount: "" }));
      }
    }
    // } else if (activeTab === NATIVE) {
    //   if (balance?.nativeBalance < MINIMUM_BALANCE)
    //     setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
    //   else if (
    //     Number(data.amount) >=
    //     Number(balance?.nativeBalance) -
    //       pendingTransactionBalance[currentAccount?.evmAddress][currentNetwork.toLowerCase()].native
    //   )
    //     setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
    //   else setErr((p) => ({ ...p, amount: "" }));
    // }
  }, [
    balance?.transferableBalance,
    // balance?.nativeBalance,
    currentAccount?.evmAddress,
    currentNetwork,
    data?.amount,
    pendingTransactionBalance,
    MINIMUM_BALANCE,
    selectedToken.address,
    selectedToken.balance
  ]);

  /**
   * Validate Address
   */
  const validateToAddress = useCallback(async () => {
    // if (activeTab === EVM) {
    if (!data.to) setErr((p) => ({ ...p, to: ERROR_MESSAGES.INPUT_REQUIRED }));
    else if (!data.to?.startsWith("0x"))
      setErr((p) => ({ ...p, to: ERROR_MESSAGES.INCORRECT_ADDRESS }));
    else if (data.to === currentAccount?.evmAddress)
      setErr((p) => ({ ...p, to: ERROR_MESSAGES.NOT_YOUR_OWN_ADDRESS }));
    else {
      let res = await validateAddress(data.to);

      if (res.error) setErr((p) => ({ ...p, to: res.data }));
      else {
        setErr((p) => ({ ...p, to: "" }));
      }
    }
    //}
    // else if (activeTab === NATIVE) {
    //   if (!data.to) setErr((p) => ({ ...p, to: ERROR_MESSAGES.INPUT_REQUIRED }));
    //   else if (!data.to?.startsWith("5"))
    //     setErr((p) => ({ ...p, to: ERROR_MESSAGES.INCORRECT_ADDRESS }));
    //   else if (data.to === currentAccount?.nativeAddress)
    //     setErr((p) => ({ ...p, to: ERROR_MESSAGES.NOT_YOUR_OWN_ADDRESS }));
    //   else {
    //     let res = await validateAddress(data.to);

    //     if (res.error) setErr((p) => ({ ...p, to: res.data }));
    //     else {
    //       setErr((p) => ({ ...p, to: "" }));
    //     }
    //   }
    // }
  }, [currentAccount?.evmAddress, data.to]);

  /**
   * Fetch fee details
   * @param {*} loader
   */
  const getFee = async (loader = true) => {
    // if (activeTab === NATIVE && Number(balance?.nativeBalance) > 0) {
    //   loader && updateLoading(true);

    //   //calculate the native fee
    //   sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.NATIVE_FEE, {
    //     value: data?.amount ? data.amount : balance?.nativeBalance,
    //     toAddress: data.to,
    //     options: { account: currentAccount },
    //     isEd
    //   });
    // } else

    if (Number(balance?.transferableBalance) > 0) {
      loader && updateLoading(true);

      //calculate the evm fee
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.FEE_AND_BALANCE, MESSAGE_EVENT_LABELS.EVM_FEE, {
        value: data?.amount ? data.amount : balance?.transferableBalance,
        toAddress: data.to,
        options: { account: currentAccount },
        isEd: false
      });
    }
  };

  /**
   * Handle Amount and Address Input Change
   */
  const handleChange = useCallback(
    (e) => {
      let val = e.target.value;

      if (e.target.name === LABELS.AMOUNT) {
        val = e.target.value.replace(REGEX.DECIMAL_NUMBERS, "");
        const arr = val.split(".");

        if (arr.length === 2) {
          if (arr[1].length > 18) {
            let slice = arr[1].slice(0, 18);
            setData((p) => ({ ...p, amount: arr[0] + "." + slice }));
          } else {
            setData((p) => ({ ...p, amount: val }));
            if (Number(val) !== Number(data.amount)) {
              updateEstimatedGas(null);
            }
          }
        } else if (arr.length === 1) {
          setData((p) => ({ ...p, amount: val }));
          if (Number(val) !== Number(data.amount)) {
            updateEstimatedGas(null);
          }
        }
      } else {
        if (data.to !== e.target.value.trim()) {
          setData((p) => ({
            ...p,
            [e.target.name]: e.target.value.trim()
          }));
          updateEstimatedGas(null);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.to, data.amount, updateEstimatedGas]
  );

  /**
   * Perform action on click of Enter
   * @param {*} e
   */
  const handleEnter = (e) => {
    if (e.key === LABELS.ENTER) {
      if (!disableBtn) {
        handleApprove();
      }
    }
  };

  /**
   * Perform Transfer
   */
  const handleApprove = useCallback(async () => {
    try {
      // if (activeTab === EVM) {
      if (selectedToken?.address !== "") {
        updateLoading(true);
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.TOKEN_TRANSFER, {
          to: data.to,
          value: data.amount,
          options: {
            isEvm: true,
            fee: estimatedGas,
            account: currentAccount,
            network: currentNetwork,
            type: TX_TYPE.TOKEN_TRANSFER,
            contractDetails: selectedToken
          },
          isEd: false
        });

        setTimeout(() => {
          setIsModalOpen(true);
          updateLoading(false);
        }, 3000);
      } else {
        updateLoading(true);
        //pass the message request for evm transfer
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.EVM_TX, {
          to: data.to,
          value: data.amount,
          options: {
            account: currentAccount,
            network: currentNetwork,
            type: TX_TYPE.SEND,
            isEvm: true,
            fee: estimatedGas
          },
          isEd: false
        });
        setTimeout(() => {
          setIsModalOpen(true);
          updateLoading(false);
        }, 3000);
      }
      // } else if (activeTab === NATIVE) {
      //   if (balance?.nativeBalance < MINIMUM_BALANCE) {
      //     setErr((p) => ({ ...p, amount: ERROR_MESSAGES.INSUFFICENT_BALANCE }));
      //     // toast.error(ERROR_MESSAGES.INSUFFICENT_BALANCE);
      //   } else {
      //     updateLoading(true);
      //     //pass the message request for native transfer
      //     sendRuntimeMessage(MESSAGE_TYPE_LABELS.INTERNAL_TX, MESSAGE_EVENT_LABELS.NATIVE_TX, {
      //       to: data.to,
      //       value: data.amount,
      //       options: {
      //         account: currentAccount,
      //         network: currentNetwork,
      //         type: TX_TYPE.SEND,
      //         isEvm: false,
      //         fee: estimatedGas
      //       },
      //       isEd
      //     });
      //     setTimeout(() => {
      //       setIsModalOpen(true);
      //       updateLoading(false);
      //     }, 3000);
      //   }
      // }
      setData({ amount: "", to: "" });
      updateEstimatedGas(null);
    } catch (error) {
      toast.error(ERROR_MESSAGES.ERR_OCCURED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.to,
    data.amount,
    estimatedGas,
    currentNetwork,
    balance?.transferableBalance,
    // balance?.nativeBalance,
    currentAccount?.evmAddress,
    updateLoading
  ]);

  // const activeSend = (e) => {
  //   updateEstimatedGas(null);
  //   setActiveTab(e.target.name);
  //   setErr({ to: "", amount: "" });
  //   setData({ to: "", amount: "" });
  // };

  /**
   * handle Ok and cancel button of popup
   */
  const handle_OK_Cancel = () => {
    setIsFaildOpen(false);
    setIsModalOpen(false);
  };

  //performs action when user click on max button
  const handleMaxClick = () => {
    if (!err.to && data?.to) {
      getFee();
      setData((p) => ({ ...p, amount: "" }));
      setErr((p) => ({ ...p, amount: "" }));
    }
  };

  const handleChangeSearch = (event) => {
    const value = event.target.value;
    setSearchInput(value);
  };

  const handleTokenSelect = (value) => {
    if (value?.address === selectedToken?.address) {
      setSelectedToken({
        address: "",
        balance: "",
        decimals: "",
        name: "",
        symbol: ""
      });
    } else {
      setSelectedToken({
        ...value,
        balance: value?.balance ? Number(value?.balance) / 10 ** Number(value?.decimals ?? 0) : 0
      });
    }
    setData({ ...data, amount: "" });
    updateEstimatedGas(null);
    handleCancel();
  };

  const suffix = (
    <button disabled={isMaxDisabled} className="maxBtn" onClick={handleMaxClick}>
      Max
    </button>
  );

  return (
    <>
      <div className={style.sendSec} onKeyDown={handleEnter}>
        {/* <div className={`scrollableCont ${style.sendSec__sourceLabel}`}>
          <label>Source Chain</label>
          <div className={style.sendSec__sendSwapbtn}>
            <button
              onClick={activeSend}
              name={NATIVE}
              className={`${style.sendSec__sendSwapbtn__buttons} 
              ${activeTab === NATIVE && style.sendSec__sendSwapbtn__buttons__active}
            `}>
              Native
            </button>
            <button
              onClick={activeSend}
              name={EVM}
              className={`${style.sendSec__sendSwapbtn__buttons}  ${
                activeTab === EVM && style.sendSec__sendSwapbtn__buttons__active
              }`}>
              EVM
            </button>
            <div
              className={`${activeTab === NATIVE && style.activeFirst} ${
                activeTab === EVM && style.activeSecond
              } ${style.animations}`}></div>
          </div>
        </div> */}
        <div className={style.sendSec__assetSec}>
          <h2>Asset</h2>
          <div className="assetSelectStyle">
            <button onClick={showModal}>
              {selectedToken?.address
                ? `${selectedToken.name} (${formatBalance(selectedToken?.balance)})`
                : "5ire"}{" "}
              <DownArrow />
            </button>
            <ModalCustom
              isModalOpen={isModalOpen1}
              handleOk={handleOk}
              handleCancel={handleCancel}
              centered
              closeIcon={false}>
              <div className="fireCustmModel customModel">
                <div className="innerContct">
                  {/* <Tooltip
                    placement="top"
                    title="Only the top 3 tokens are shown here, you can view all tokens by searching.">
                    <img src={Info} alt="infoIcon" width={20} height={20} />
                  </Tooltip> */}
                  <p>
                    <Tooltip
                      placement="top"
                      title="Only the top 3 tokens are shown here, you can view all tokens by searching.">
                      <img
                        src={Info}
                        alt="infoIcon"
                        width={15}
                        height={15}
                        style={{ marginRight: 5 }}
                      />
                    </Tooltip>
                    <span>Select Assets</span>
                  </p>
                  <InputFieldOnly
                    onChange={handleChangeSearch}
                    coloredBg={true}
                    placeholderBaseColor={true}
                    placeholder="Search by token name or address"
                  />
                </div>
                <div className="topDetail">
                  <h3>Name</h3>
                  <h3>Amount</h3>
                </div>
                {tokensList.length
                  ? tokensList.slice(0, 3).map((e, i) => (
                      <div
                        className={`innerDetail ${
                          selectedToken?.address === e?.address ? "active" : ""
                        }`}
                        key={i + e?.name}
                        onClick={() => handleTokenSelect(e)}>
                        <h2>{e?.name}</h2>
                        <p>
                          {formatBalance(
                            e?.balance ? Number(e?.balance) / 10 ** Number(e?.decimals ?? 0) : 0
                          )}
                        </p>
                      </div>
                    ))
                  : ""}
              </div>
            </ModalCustom>
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
              onDrop={(e) => {
                e.preventDefault();
              }}
              placeholder={"Please enter recipient address"}
            />
            <span className={style.errorText}>{err.to}</span>
          </div>
          <div style={{ marginTop: "17px" }} className="maxInput">
            <InputField
              min="0"
              name="amount"
              // type="number"
              coloredBg={true}
              key="sendInput"
              onDrop={(e) => {
                e.preventDefault();
              }}
              value={data.amount}
              keyUp={validateAmount}
              onChange={handleChange}
              keyDown={blockInvalidChar}
              placeholderBaseColor={true}
              placeholder={"Enter Amount"}
              addonAfter={suffix}
              suffix={
                selectedToken?.address ? (
                  ""
                ) : (
                  <span className={style.sendSec__pasteText}>
                    <img src={SmallLogo} alt="logo" draggable={false} />
                    5ire
                  </span>
                )
              }
            />
            <span className={style.errorText}>{err.amount}</span>
          </div>
        </div>
        <div className={style.sendSec__txFeeBalance}>
          <h2>{estimatedGas ? `TX Fee : ${estimatedGas} 5IRE` : ""}</h2>
        </div>
        {/* <div className={style.sendSec__inFoAccount}>
          <Tooltip title={MESSAGES.ED}>
            <img src={Info} style={{ cursor: "pointer" }} alt="infoIcon" />
          </Tooltip>
          <h3>Transfer with account keep alive checks </h3>
          <Switch defaultChecked name="EdToggler" onChange={onChangeToggler} />
        </div> */}
      </div>
      <Approve onClick={handleApprove} text="Transfer" isDisable={disableBtn} />

      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
        centered>
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={ComplSwap} alt="swapImage" width={127} height={127} draggable={false} />
            <h2 className="title">Transfer Processed</h2>
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
        centered>
        <div className="swapsendModel">
          <div className="innerContact">
            <img src={FaildSwap} alt="swapFaild" width={127} height={127} draggable={false} />
            <h2 className="title">Transfer Failed!</h2>

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
