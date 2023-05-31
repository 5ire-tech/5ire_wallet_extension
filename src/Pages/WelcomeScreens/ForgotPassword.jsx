import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import TextArea from "antd/es/input/TextArea";
import React, { useState, useEffect } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { isEmpty, validateMnemonic } from "../../Utility/utility";
import InputFieldSimple, { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  REGEX,
  LABELS,
  EMTY_STR,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

function ForgotPassword() {
  const [isDisable, setDisable] = useState(true);
  const [data, setData] = useState({
    pass: EMTY_STR,
    confirmPass: EMTY_STR,
    key: EMTY_STR,
    accName: EMTY_STR
  });
  const [error, setError] = useState({
    pass: EMTY_STR,
    confirmPass: EMTY_STR,
    key: EMTY_STR,
    accName: EMTY_STR
  });

  useEffect(() => {
    if (
      !error.key &&
      !error.pass &&
      !error.confirmPass &&
      !error.accName &&
      data.key.trim() &&
      data.pass.trim() &&
      data.confirmPass.trim() &&
      data.accName.trim()
    )
      setDisable(false);
    else setDisable(true);
  }, [
    error.key,
    error.pass,
    error.confirmPass,
    error.accName,
    data.key,
    data.pass,
    data.confirmPass,
    data.accName
  ]);

  useEffect(() => {
    if (data.confirmPass === data.pass || data.pass === EMTY_STR)
      setError((p) => ({ ...p, confirmPass: EMTY_STR }));
    else if (data.confirmPass !== EMTY_STR)
      setError((p) => ({ ...p, confirmPass: ERROR_MESSAGES.PASS_DONT_MATCH }));
  }, [data?.pass, data?.confirmPass]);

  const handleChange = (e) => {
    setData((p) => {
      return {
        ...p,
        [e.target.name]: e.target.value
      };
    });
  };

  //validate Password
  const validatePass = () => {
    let errMsg = EMTY_STR;

    if (isEmpty(data.pass)) errMsg = ERROR_MESSAGES.INPUT_REQUIRED;
    else if (
      !REGEX.UPPERCASE.test(data.pass) ||
      !REGEX.LOWERCASE.test(data.pass) ||
      !REGEX.DIGITS.test(data.pass) ||
      !REGEX.SPECIAL_CHAR.test(data.pass) ||
      !REGEX.MIN_LENGTH.test(data.pass)
    )
      errMsg = ERROR_MESSAGES.CREATE_PASS_MSG;
    else errMsg = EMTY_STR;

    setError((p) => ({ ...p, pass: errMsg }));
  };

  //validate Confirm Password
  const validateConfirmPass = () => {
    if (isEmpty(data.confirmPass))
      setError((p) => ({ ...p, confirmPass: ERROR_MESSAGES.INPUT_REQUIRED }));
    else if (data?.confirmPass !== data?.pass)
      setError((p) => ({ ...p, confirmPass: ERROR_MESSAGES.PASS_DONT_MATCH }));
    else setError((p) => ({ ...p, confirmPass: EMTY_STR }));
  };

  //check Mnemonic
  const validateKey = () => {
    if (isEmpty(data.key)) setError((p) => ({ ...p, key: ERROR_MESSAGES.INPUT_REQUIRED }));
    else if (!validateMnemonic(data.key.trim()))
      setError((p) => ({ ...p, key: ERROR_MESSAGES.INVALID_MNEMONIC }));
    else setError((p) => ({ ...p, key: EMTY_STR }));
  };

  const validateAccName = () => {
    if (data.accName.trim().length < 2 || data.accName.trim().length >= 16)
      setError((p) => ({
        ...p,
        accName: ERROR_MESSAGES.INPUT_BETWEEN_2_TO_18
      }));
    else if (!REGEX.WALLET_NAME.test(data.accName))
      setError((p) => ({
        ...p,
        accName: ERROR_MESSAGES.ALPHANUMERIC_CHARACTERS
      }));
    else setError((p) => ({ ...p, accName: "" }));
  };

  const handleSubmit = (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (
        !error.key &&
        !error.pass &&
        !error.confirmPass &&
        !error.accName &&
        data.key &&
        data.pass &&
        data.confirmPass &&
        data.accName
      ) {
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
          MESSAGE_EVENT_LABELS.FORGOT_PASS,
          {
            password: data.pass,
            opts: { mnemonic: data.key.trim(), name: data.accName.trim() },
            type: "forgot"
          }
        );

        // navigate(ROUTES.WALLET);
      }
    }
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleSubmit}>
      <MenuRestofHeaders logosilver={true} title="5ire Wallet" backTo={ROUTES.UNLOACK_WALLET} />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Forgot password</h1>
        </div>
        <div
          className={`${style.cardWhite__importWalletlinkOuter} ${style.cardWhite__forgotPassword}`}>
          <div>
            <InputFieldOnly
              name="accName"
              coloredBg={true}
              onChange={handleChange}
              keyUp={validateAccName}
              placeholderBaseColor={true}
              placeholder={"Enter wallet name"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className={style.errorText}>{error?.accName ? error.accName : ""}</p>
          </div>
          <div className="inputFieldOnly">
            <TextArea
              rows={4}
              name="key"
              onKeyUp={validateKey}
              onChange={handleChange}
              placeholder={"Enter mnemonic here"}
            />
            {/* <p className="pasteTextArea">Paste</p> */}
            <p className={style.errorText}>{error?.key ? error.key : ""}</p>
          </div>
          <div>
            <InputFieldSimple
              name={"pass"}
              coloredBg={true}
              keyUp={validatePass}
              onChange={handleChange}
              placeholderBaseColor={true}
              placeholder={"Enter New Password"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className={style.errorText}>{error?.pass ? error.pass : ""}</p>
          </div>
          <div>
            <InputFieldSimple
              coloredBg={true}
              name={"confirmPass"}
              onChange={handleChange}
              placeholderBaseColor={true}
              keyUp={validateConfirmPass}
              placeholder={"Confirm Password"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className={style.errorText}>{error?.confirmPass ? error.confirmPass : ""}</p>
          </div>
          <div className={`${style.setPassword__footerbuttons}${style.setPassword__forGotBtn}`}>
            <ButtonComp text={"Change"} onClick={handleSubmit} isDisable={isDisable} />
            {/* <ButtonComp text={"Cancel"} onClick={handleCancel} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
