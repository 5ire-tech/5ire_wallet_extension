import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect, useCallback } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  REGEX,
  LABELS,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

function CreateNewWallet() {
  const navigate = useNavigate();
  const [warrning, setWarrning] = useState("");
  const [isDisable, setDisable] = useState(true);
  const {
    state,
    setAccName,
    allAccounts,
    updateState,
    newWalletName,
    setDetailsPage,
    setNewWalletName
  } = useContext(AuthContext);

  const { isLogin } = state;

  useEffect(() => {
    if (isLogin)
      sendRuntimeMessage(
        MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
        MESSAGE_EVENT_LABELS.GET_ACCOUNTS,
        {}
      );

    if (newWalletName.trim().length >= 2) setDisable(false);
  }, [isLogin, newWalletName]);

  const handleChange = useCallback((e) => {
    setNewWalletName(e.target.value);
    setWarrning("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateAccName = useCallback(() => {
    if (newWalletName.trim().length === 0) {
      setWarrning(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    } else if (
      newWalletName.trim().length < 2 ||
      newWalletName.trim().length >= 19
    ) {
      setWarrning(ERROR_MESSAGES.INPUT_BETWEEN_2_TO_18);
      setDisable(true);
    } else if (!REGEX.WALLET_NAME.test(newWalletName)) {
      setWarrning(ERROR_MESSAGES.ALPHANUMERIC_CHARACTERS);
      setDisable(true);
    } else {
      setWarrning("");
      setDisable(false);
    }
  }, [newWalletName]);

  const handleClick = (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (!warrning && newWalletName.trim()) {
        if (isLogin) {
          const match = allAccounts?.find(
            (a) => a.accountName === newWalletName.trim()
          );
          if (match) {
            setWarrning(ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS);
          } else {
            sendRuntimeMessage(
              MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
              MESSAGE_EVENT_LABELS.ADD_ACCOUNT,
              { name: newWalletName.trim() }
            );
            setDetailsPage(true);
          }
        } else {
          setAccName(newWalletName.trim());
          navigate(ROUTES.SET_PASS + "/" + LABELS.CREATE);
        }
      }
    }
  };

  const handleCancle = useCallback(() => {
    updateState(LABELS.ACCOUNT_NAME, null, false);
    if (isLogin) {
      setDetailsPage(false);
      navigate(ROUTES.WALLET);
    } else navigate(ROUTES.DEFAULT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  return (
    <>
      <div className={style.cardWhite} onKeyDown={handleClick}>
        {!isLogin && <StepHeaders active={2} />}
        <MenuRestofHeaders logosilver={true} title="5ire Wallet" />
        <div className={style.cardWhite__cardInner}>
          <div className={style.cardWhite__cardInner__innercontact}>
            <h1>Create a New Wallet</h1>
          </div>
          <div className={style.cardWhite__importWalletlinkOuter}>
            <div>
              <InputFieldOnly
                coloredBg={true}
                value={newWalletName}
                name={LABELS.ACCOUNT_NAME}
                placeholderBaseColor={true}
                onChange={handleChange}
                keyUp={validateAccName}
                placeholder={"Enter wallet name"}
                onDrop={(e) => {
                  e.preventDefault();
                }}
              />
              <p className="errorText">{warrning}</p>
            </div>
          </div>
          <div className={style.setPassword__footerbuttons}>
            <ButtonComp
              onClick={handleClick}
              text={"Create Wallet"}
              isDisable={isDisable}
            />
            <ButtonComp
              bordered={true}
              text={"Cancel"}
              onClick={handleCancle}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateNewWallet;
