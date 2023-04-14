import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import useWallet from "../../Hooks/useWallet";
import { isEmpty } from "../../Utility/utility";
import React, { useState, useEffect, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  REGEX,
  LABELS,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  EMTY_STR
} from "../../Constants/index";



function ImportWallet() {
  const navigate = useNavigate();
  const { validMnemonic } = useWallet();
  const [isDisable, setDisable] = useState(true);
  const [data, setData] = useState({ accName: "", key: "" });
  const [warrning, setWarrning] = useState({ acc: "", key: "" });
  const { state, userPass, allAccounts } = useContext(AuthContext);
  const { isLogin } = state;

  useEffect(() => {
    if (isLogin) {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.GET_ACCOUNTS, {});
    }
  }, []);


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
    }
    else if (!validMnemonic(data.key)) {
      setWarrning((p) => ({ ...p, key: ERROR_MESSAGES.INVALID_MNEMONIC }));
      setDisable(true);
    }
    else {
      setWarrning((p) => ({ ...p, key: EMTY_STR }));
    }
  };

  const handleClick = async (e) => {
    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {

      if (!warrning.key && !warrning.acc && data.accName && data.key) {
        if (userPass && !isLogin) {

          sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE, { password: userPass, opts: { mnemonic: data.key, name: data.accName.trim() } });
          navigate(ROUTES.WALLET);

        } else {
          const match = allAccounts?.find((a) => a.accountName === data.accName.trim());

          if (match) {
            setWarrning(p => ({
              ...p,
              acc: ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS,
            }));
          }else{
            //todo
            sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC, { mnemonic: data.key, name: data.accName.trim() });
            navigate(ROUTES.WALLET);
          }

        }
      }
    }
  };

  const handleCancle = () => {
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
