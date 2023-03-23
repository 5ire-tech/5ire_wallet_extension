import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import React, { useState, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { LABELS, REGEX, ERROR_MESSAGES } from "../../Constants/index";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

function CreateNewWallet() {
  const navigate = useNavigate();
  const [data, setData, isLogin] = useState("");
  const [warrning, setWarrning] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { state, updateState } = useContext(AuthContext);
  const { allAccounts } = state;


  const handleChange = (e) => {
    setData(e.target.value);
    setWarrning("");
  };

  const validateAccName = () => {

    if (data.trim().length < 2 || data.trim().length >= 19) {
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

    if (data.trim().length === 0)
      setWarrning(ERROR_MESSAGES.INPUT_REQUIRED);

    else {
      if (!warrning) {
        const match = allAccounts.find((e) => e.accountName === data.trim());
        if (match) {
          setWarrning(ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS);
        } else {
          updateState(LABELS.ACCOUNT_NAME, data.trim(), false);
          navigate("/beforebegin");
        }
      }
    }
  };

  const handleCancle = () => {
    updateState(LABELS.ACCOUNT_NAME, null, false);
    if (isLogin) navigate("/wallet");
    else navigate("/");
  };

  return (
    <div className={style.cardWhite}>
      <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Create a New Wallet</h1>
        </div>
        <div className={style.cardWhite__linkOuter}>
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
          <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancle} />
          <ButtonComp onClick={handleClick} text={"Create"} isDisable={isDisable} />
        </div>
      </div>
    </div>
  );
}

export default CreateNewWallet;
