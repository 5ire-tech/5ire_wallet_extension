import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import useWallet from "../../Hooks/useWallet";
import { useNavigate } from "react-router-dom";
import { decryptor } from "../../Helper/CryptoHelper";
import React, { useState, useEffect, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { INPUT, REGEX_WALLET_NAME, ERROR_MESSAGES, LABELS } from "../../Constants/index";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";



function ImportWallet() {
  const navigate = useNavigate();
  const { importAccount } = useWallet();
  const [isDisable, setDisable] = useState(true);
  const { state } = useContext(AuthContext);
  const [data, setData] = useState({ accName: "", key: "" });
  const [warrning, setWarrning] = useState({ acc: "", key: "" });

  const { isLogin, allAccounts, pass } = state;

  useEffect(() => {

    if ((!data.accName.length || !data.key || data.accName.length < 2)) {
      setDisable(true);
    } else {
      if (!warrning.acc && !warrning.key) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [data.accName, data.key, warrning])

  const handleChange = (e) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validateAccName = () => {

    if (data.accName.trim().length < 2 || data.accName.trim().length >= 16) {
      setWarrning((p) => ({
        ...p,
        acc: ERROR_MESSAGES.INPUT_BETWEEN_2_TO_18
      }));
      setDisable(true);
    }

    else if (!REGEX_WALLET_NAME.test(data.accName)) {

      setWarrning(p => ({ ...p, acc: ERROR_MESSAGES.ALPHANUMERIC_CHARACTERS }))
      setDisable(true);
    }

    else {
      setWarrning((p) => ({ ...p, acc: "" }));
      // setDisable(false);
    }
  };

  const validateKey = () => {
    if (data.key.length === 0) {
      setWarrning((p) => ({ ...p, key: INPUT.REQUIRED }));
      setDisable(true)
    } else {
      setWarrning((p) => ({ ...p, key: "" }));
    }
  };

  const handleClick = async (e) => {
    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {
      if (data.key.length === 0) {
        setWarrning((p) => ({ ...p, key: INPUT.REQUIRED }));
        setDisable(true);
      } else if (data.accName.trim().length === 0) {
        setWarrning((p) => ({ ...p, acc: INPUT.REQUIRED }));
        setDisable(true);
      } else {
        if (!warrning.key && !warrning.acc) {
          const match = allAccounts.find((e) => {
            if (e.accountName === data.accName.trim()) {
              setWarrning((p) => ({
                ...p,
                acc: ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS,
              }));
              return true;
            } else if (decryptor(e.temp1m, pass) === data.key) {
              setWarrning((p) => ({
                ...p,
                key: ERROR_MESSAGES.MNEMONICS_ALREADY_EXISTS,
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
              else navigate("/setPassword/import");
            }
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
    <div className={style.cardWhite} onKeyDown={handleClick}>
      <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Import Wallet </h1>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <div>
            <InputFieldOnly
              placeholder={"Enter wallet name"}
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
          <ButtonComp onClick={handleClick} text={"Import"} isDisable={isDisable} />
        </div>
      </div>
    </div>
  );
}

export default ImportWallet;
