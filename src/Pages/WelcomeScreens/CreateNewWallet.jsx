import React, { useState } from "react";
import style from "./style.module.scss";
import { INPUT,REGEX_WALLET_NAME} from "../../Constants/index";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAccountName } from "../../Utility/redux_helper";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

function CreateNewWallet() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState("");
  const [warrning, setWarrning] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { isLogin, accounts } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setData(e.target.value);
    setWarrning("");
  };

  const validateAccName = () => {

    if (data.trim().length < 2 || data.trim().length >= 19) {
      setWarrning("Please input account name between " + 2 + " and " + 18 + " characters.");
      setDisable(true);
    }

    else if (!REGEX_WALLET_NAME.test(data)) {
      setWarrning("Please enter only alphanumeric characters.");
      setDisable(true);
    }

    else {
      setWarrning("");
      setDisable(false);
    }
  };

  const handleClick = () => {

    if (data.trim().length === 0)
      setWarrning(INPUT.REQUIRED);

    else {
      if (!warrning) {
        const match = accounts.find((e) => {
          if (e.accountName === data.trim()) {
            setWarrning("Wallet name already exists. ");
            return true;
          } 
          else return false;

        });
        
        if (!match) {
          dispatch(setAccountName(data.trim()));
          navigate("/beforebegin");
        }
      }
    }
  };

  const handleCancle = () => {
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
              name="accountName"
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
