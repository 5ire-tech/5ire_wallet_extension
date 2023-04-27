import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import { LABELS, REGEX, ERROR_MESSAGES, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS } from "../../Constants/index";

function CreateNewWallet() {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [warrning, setWarrning] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { state, updateState, setAccName, allAccounts } = useContext(AuthContext);
  const { isLogin } = state;

  useEffect(() => {
    if (isLogin) {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.GET_ACCOUNTS, {});
    }
  }, []);

  const handleChange = (e) => {
    setData(e.target.value);
    setWarrning("");
  };

  const validateAccName = () => {

    if (data.trim().length === 0) {
      setWarrning(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
    else if (data.trim().length < 2 || data.trim().length >= 19) {
      setWarrning(ERROR_MESSAGES.INPUT_BETWEEN_2_TO_18);
      setDisable(true);
    }

    else if (!REGEX.WALLET_NAME.test(data)) {
      setWarrning(ERROR_MESSAGES.ALPHANUMERIC_CHARACTERS);
      setDisable(true);
    }

    else {
      setWarrning("");
      setDisable(false);
    }
  };

  const handleClick = () => {

    if (!warrning && data.trim()) {

      if (isLogin) {
        const match = allAccounts?.find((a) => a.accountName === data.trim());
        if (match) {
          setWarrning(ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS);
        } else {
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.ADD_ACCOUNT, { name: data.trim() });
          navigate(ROUTES.NEW_WALLET_DETAILS);
        }
      }
      else {
        setAccName(data.trim());
        navigate(ROUTES.SET_PASS + "/" + LABELS.CREATE);
      }

    }
  }


  const handleCancle = () => {
    updateState(LABELS.ACCOUNT_NAME, null, false);
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  };


  return (
    <>
      <div className={style.cardWhite}>
        {
          !isLogin &&
          <StepHeaders active={2} />

        }
        <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
        <div className={style.cardWhite__cardInner}>
          <div className={style.cardWhite__cardInner__innercontact}>
            <h1>Create a New Wallet</h1>
          </div>
          <div className={style.cardWhite__importWalletlinkOuter}>
            <div>
              <InputFieldOnly
                value={data}
                coloredBg={true}
                name={LABELS.ACCOUNT_NAME}
                placeholderBaseColor={true}
                onChange={handleChange}
                keyUp={validateAccName}
                placeholder={"Enter wallet name"}
              />
              <p className="errorText">{warrning}</p>
            </div>
          </div>
          <div className={style.setPassword__footerbuttons}>
            <ButtonComp onClick={handleClick} text={"Create Wallet"} isDisable={isDisable} />
            <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancle} />
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateNewWallet;
