import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import style from "./style.module.scss";
import { setAccountName } from "../../Store/reducer/auth";
import { useDispatch, useSelector } from "react-redux";

function CreateNewWallet() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLogin, accounts } = useSelector((state) => state.auth);
  const [data, setData] = useState("");
  const [warrning, setWarrning] = useState("");

  const handleChange = (e) => {
    setData(e.target.value);
    setWarrning("");
  };

  const validateAccName = () => {
    if (data.trim().length < 2 || data.trim().length >= 19) {
      setWarrning("Please input account name between " + 2 + " and " + 18 + " characters.");
    }
    else {
      setWarrning("");
    }
  }
  const handleClick = () => {

    if (data.trim().length === 0) {
      setWarrning("This field is required.")
    }
    else {
      if (!warrning) {
        const match = accounts.find(e => {
          if (e.accountName === data) {
            setWarrning("Account with this name is allready exists!");
            return true;
          }
          else
            return false;
        });
        if (!match) {
          dispatch(setAccountName(data.trim()));
          navigate("/beforebegin");
        }
      }
    };
  }

  const handleCancle = () => {
    if (isLogin) navigate("/wallet");
    else navigate("/");
  };

  return (
    <div className={style.cardWhite}>
      <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Create New Wallet</h1>
          {/* <p>The Decentralized Wallet</p> */}
        </div>
        <div className={style.cardWhite__linkOuter}>
          <InputFieldOnly
            value={data}
            placeholder={"Enter Wallet Name"}
            placeholderBaseColor={true}
            coloredBg={true}
            name="accountName"
            onChange={handleChange}
            keyUp={validateAccName}
          />
          <p style={{ color: "red" }}>{warrning}</p>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancle} />
          <ButtonComp onClick={handleClick} text={"Create"} />
        </div>
      </div>
    </div>
  );
}

export default CreateNewWallet;
