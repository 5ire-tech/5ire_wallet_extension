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
  const { isLogin,accounts } = useSelector((state) => state.auth);
  const [data, setData] = useState("");
  const [warrning, setWarrning] = useState("");

  const handleChange = (e) => {
    setData(e.target.value);
    setWarrning("");
  };

  const handleClick = () => {
    if (data.length === 0) setWarrning("Please enter account name!");
    else {
      const match = accounts.find(e => {
        if (e.accountName === data) {
          setWarrning("Account with this name is allready exists!");
          return true;
        }
        else
          return false;
      });
      if (!match) {
        dispatch(setAccountName(data));
        navigate("/beforebegin");
      }
    }
  };

  const handleCancle = () => {
    if (isLogin) navigate("/wallet");
    else navigate("/");
  };

  return (
    <div className={style.cardWhite}>
      <MenuRestofHeaders logosilver={true} title="5ire Non-Custodial Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Create New Wallet</h1>
          <p>The decentralized wallet</p>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <p style={{ color: "red" }}>{warrning}</p>
          <InputFieldOnly
            placeholder={"Type Wallet Name"}
            placeholderBaseColor={true}
            coloredBg={true}
            name="accountName"
            onChange={handleChange}
          />
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
