import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import useWallet from "../../Hooks/useWallet";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "../../Utility/utility";
import { decryptor } from "../../Helper/CryptoHelper";
import React, { useState, useEffect, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import PrivacyPolicy from "../../Components/MenuFooter/PrivacyPolicy";
import { REGEX, ERROR_MESSAGES, LABELS } from "../../Constants/index";
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
  }, [data.accName, data.key, warrning]);

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
    else if (!REGEX.WALLET_NAME.test(data.accName)) {

      setWarrning(p => ({ ...p, acc: ERROR_MESSAGES.ALPHANUMERIC_CHARACTERS }))
      setDisable(true);
    }
    else {
      setWarrning((p) => ({ ...p, acc: "" }));
      // setDisable(false);
    }
  };

  const validateKey = () => {
    if (isEmpty(data.key)) {
      setWarrning((p) => ({ ...p, key: ERROR_MESSAGES.INPUT_REQUIRED }));
      setDisable(true);
    } else {
      setWarrning((p) => ({ ...p, key: "" }));
    }
  };

  const handleClick = async (e) => {
    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {

      if (!warrning.key && !warrning.acc && data.key && data.accName) {
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
            if (isLogin) navigate(ROUTES.WALLET);
            else navigate(ROUTES.SET_PASS + "/import");
          }
        }
      }
    }
  };

  const handleCancel = () => {
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Import Wallet </h1>
        </div>
        <div className={style.cardWhite__importWalletlinkOuter}>
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
          <div className="inputFieldOnly">
            {/* <InputFieldOnly
              type="password"
              placeholder={"Enter mnemonic here"}
              placeholderBaseColor={true}
              coloredBg={true}
              name="key"
              onChange={handleChange}
              keyUp={validateKey}
            /> */}
            <TextArea
              placeholder={"Enter mnemonic here"}
              rows={4}
              onChange={handleChange}
              onKeyUp={validateKey}
              name="key"
            />
            <p className="errorText">{warrning.key}</p>
          </div>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp onClick={handleClick} text={"Import"} isDisable={isDisable} />
          <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
}

export default ImportWallet;
