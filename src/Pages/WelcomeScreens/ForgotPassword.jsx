import TextArea from "antd/es/input/TextArea";
import React, { useState } from "react";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import PrivacyPolicy from "../../Components/MenuFooter/PrivacyPolicy";
import { ERROR_MESSAGES } from "../../Constants/index";
import style from "./style.module.scss";
function ForgotPassword() {
  const [errMsg, setErrorMsg] = useState("");
  const [data, setData] = useState("");
  const [isDisable, setDisable] = useState(true);

  const handleChange = (e) => {
    setData(e.target.value);
    setErrorMsg("");
  };
  const validateInput = () => {
    if (data.length === 0) {
      setErrorMsg(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
  };
  return (
    //onKeyDown={handleClick}//
    <div className={style.cardWhite}>
      <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Forgot password</h1>
        </div>
        <div className={style.cardWhite__importWalletlinkOuter}>
          <div className="inputFieldOnly">
            <TextArea placeholder={"Enter mnemonic here"} rows={4} />
            <p className={style.errorText}>{errMsg ? errMsg : ""}</p>
          </div>
          <div>
            <InputFieldSimple
              // type="password"
              name={"key"}
              onChange={handleChange}
              placeholder={"Enter New Password"}
              placeholderBaseColor={true}
              keyUp={validateInput}
              coloredBg={true}
            />
            <p className={style.errorText}>{errMsg ? errMsg : ""}</p>
          </div>
          <div>
            <InputFieldSimple
              // type="password"
              name={"key"}
              onChange={handleChange}
              placeholder={"Confirm Password"}
              placeholderBaseColor={true}
              keyUp={validateInput}
              coloredBg={true}
            />
            <p className={style.errorText}>{errMsg ? errMsg : ""}</p>
          </div>
          <div className={style.setPassword__footerbuttons}>
          <ButtonComp  text={"Change"}  />
        </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
