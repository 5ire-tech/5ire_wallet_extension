import style from "./style.module.scss";
import { useSelector } from "react-redux";
import useWallet from "../../Hooks/useWallet";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { decryptor } from "../../Helper/CryptoHelper";
import { INPUT, REGEX_WALLET_NAME } from "../../Constants/index";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import CongratulationsScreen from "./CongratulationsScreen";



function ImportWallet() {
  const navigate = useNavigate();
  const { importAccount } = useWallet();
  const [isDisable, setDisable] = useState(true);
  const { isLogin } = useSelector((state) => state.auth);
  const [data, setData] = useState({ accName: "", key: "" });
  const { accounts, pass } = useSelector((state) => state.auth);
  const [warrning, setWarrning] = useState({ acc: "", key: "" });
  const [show, setShow] = useState(false)

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
        acc:
          "Please input account name between " +
          2 +
          " and " +
          15 +
          " characters.",
      }));
      setDisable(true);
    }

    else if (!REGEX_WALLET_NAME.test(data.accName)) {

      setWarrning(p => ({ ...p, acc: "Please enter alphanumeric characters only." }))
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
    if ((e.key === "Enter") || (e.key === undefined)) {
      if (data.key.length === 0) {
        setWarrning((p) => ({ ...p, key: INPUT.REQUIRED }));
        setDisable(true);
      } else if (data.accName.trim().length === 0) {
        setWarrning((p) => ({ ...p, acc: INPUT.REQUIRED }));
        setDisable(true);
      } else {
        if (!warrning.key && !warrning.acc) {
          const match = accounts.find((e) => {
            if (e.accountName === data.accName.trim()) {
              setWarrning((p) => ({
                ...p,
                acc: "Wallet name already exists.",
              }));
              return true;
            } else if (decryptor(e.temp1m, pass) === data.key) {
              setWarrning((p) => ({
                ...p,
                key: "Wallet with this mnemonic already exists.",
              }));
              return true;
            } else return false;
          });

          if (!match) {
            let res = await importAccount(data);
            if (res.error) setWarrning((p) => ({ ...p, key: res.data }));
            else {
              setWarrning({ acc: "", key: "" });
              if (isLogin) {
                setShow(true)
                setTimeout(() => {
                  setShow(false)
                  navigate("/wallet");

                }, 2000)
              }
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

        {isLogin && show && (
          <div className="loader">
            <CongratulationsScreen text={`Your Wallet is Imported`} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportWallet;
