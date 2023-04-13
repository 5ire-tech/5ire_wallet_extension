import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import React, { useState, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { LABELS, REGEX, ERROR_MESSAGES } from "../../Constants/index";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import PrivacyPolicy from "../../Components/MenuFooter/PrivacyPolicy";

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
        const match = allAccounts?.find((e) => e.accountName === data.trim());
        if (match) {
          setWarrning(ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS);
        } else {
          updateState(LABELS.ACCOUNT_NAME, data.trim(), false);
          navigate(ROUTES.BEFORE_BEGIN);
        }
      }
    }
  };

  const handleCancle = () => {
    updateState(LABELS.ACCOUNT_NAME, null, false);
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  };

  return (
    <>
    <div className={style.cardWhite}>
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
