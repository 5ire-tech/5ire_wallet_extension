import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import style from "./style.module.scss";
import { useSelector } from "react-redux";
import useWallet from "../../Hooks/useWallet";
import { decryptor } from "../../Helper/CryptoHelper";
// import { toast } from "react-toastify";

function ImportWallet() {
  const navigate = useNavigate();
  const { accounts, pass } = useSelector((state) => state.auth);
  const { importAccount } = useWallet();
  const [data, setData] = useState({ accName: "", key: "" });
  const [warrning, setWarrning] = useState({ acc: "", key: "" });
  const { isLogin } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validateAccName = () => {
    if (data.accName.trim().length < 2 || data.accName.trim().length >= 16) {
      setWarrning((p) => ({
        ...p,
        acc:
          "Please input account name between " +
          2 +
          " and " +
          15 +
          " characters.",
      }));
    } else {
      setWarrning((p) => ({ ...p, acc: "" }));
    }
  };

  const validateKey = () => {
    if (data.key.length === 0) {
      setWarrning((p) => ({ ...p, key: "This field is required." }));
    } else {
      setWarrning((p) => ({ ...p, key: "" }));
    }
  };

  const handleClick = async () => {
    if (data.key.length === 0) {
      setWarrning((p) => ({ ...p, key: "This field is required." }));
    } else if (data.accName.trim().length === 0) {
      setWarrning((p) => ({ ...p, acc: "This field is required." }));
    } else {
      if (!warrning.key && !warrning.acc) {
        const match = accounts.find((e) => {
          if (e.accountName === data.accName) {
            setWarrning((p) => ({
              ...p,
              acc: "Account with this name allready exists.",
            }));
            return true;
          } else if (decryptor(e.temp1m, pass) === data.key) {
            setWarrning((p) => ({
              ...p,
              key: "Account with this mnemonic allready exists.",
            }));
            return true;
          } else return false;
        });

        if (!match) {
          let res = await importAccount(data);
          if (res.error) setWarrning((p) => ({ ...p, key: res.data }));
          else {
            setWarrning({ acc: "", key: "" });
            if (isLogin) navigate("/wallet");
            else navigate("/setPassword");
          }
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
          <h1>Import Account </h1>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <div>
          <InputFieldOnly
            placeholder={"Enter Account name"}
            placeholderBaseColor={true}
            coloredBg={true}
            name="accName"
            onChange={handleChange}
            keyUp={validateAccName}
          />
          <p className="errorText">{warrning.acc}</p>
          </div>
          <div>
          <InputFieldOnly
            type="password"
            placeholder={"Enter mnemonic here"}
            placeholderBaseColor={true}
            coloredBg={true}
            name="key"
            onChange={handleChange}
            keyUp={validateKey}
          />
          <p className="errorText">{warrning.key}</p>
          </div>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancle} />
          <ButtonComp onClick={handleClick} text={"Import"} />
        </div>
      </div>
    </div>
  );
}

export default ImportWallet;
