import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";
import CongratulationsScreen from "./CongratulationsScreen";
import React, { useState, useEffect, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { isEmpty, validateMnemonic } from "../../Utility/utility";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  REGEX,
  LABELS,
  EMTY_STR,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";




function ImportWallet() {
  const navigate = useNavigate();
  const [isDisable, setDisable] = useState(true);
  const [data, setData] = useState({ accName: "", key: "" });
  const [warrning, setWarrning] = useState({ acc: "", key: "" });
  const { state, userPass, allAccounts, inputError, setInputError } = useContext(AuthContext);
  const { isLogin } = state;
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isLogin) {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.GET_ACCOUNTS, {});
    }
  }, []);


  useEffect(() => {
    if (inputError) {
      setWarrning(p => ({ ...p, key: inputError }));
    }

  }, [inputError]);


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
    if (e.target.name === LABELS.KEY) {
      setInputError("");
    }
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
    else if (!validateMnemonic(data?.key?.trim())) {
      setWarrning((p) => ({ ...p, key: ERROR_MESSAGES.INVALID_MNEMONIC }));
      setDisable(true);
    }
    else {
      setWarrning((p) => ({ ...p, key: EMTY_STR }));
    }
  };

  const handleClick = async (e) => {
    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {
      if (!warrning.key && !warrning.acc && data?.accName && data?.key) {

        if (userPass && !isLogin) {

          setShow(true)
          setTimeout(() => {
            setShow(false)
            sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE, { password: userPass, opts: { mnemonic: data?.key?.trim(), name: data?.accName?.trim() }, type: LABELS.IMPORT });
          }, 2000)


        } else {
          const match = allAccounts?.find((a) => a.accountName === data.accName.trim());

          if (match) {
            setWarrning(p => ({
              ...p,
              acc: ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS,
            }));
          } else {

            sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC, { mnemonic: data?.key?.trim(), name: data.accName.trim() });

          }

        }
      }
    }
  };

  const handleCancel = () => {
    setInputError("");
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      {
        !isLogin && <StepHeaders active={2} isCreate={false} />
      }
      <MenuRestofHeaders logosilver={true} title="5ireChain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Import Wallet </h1>
        </div>
        <div className={style.cardWhite__importWalletlinkOuter}>
          <div>
            <InputFieldOnly
              name="accName"
              coloredBg={true}
              onChange={handleChange}
              keyUp={validateAccName}
              placeholderBaseColor={true}
              placeholder={"Enter wallet name"}
              onDrop={e => { e.preventDefault() }}
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
              rows={4}
              name={LABELS.KEY}
              onKeyUp={validateKey}
              onChange={handleChange}
              onDrop={e => { e.preventDefault() }}
              placeholder={"Enter mnemonic here"}
            />
            <p className="errorText">{warrning.key}</p>
          </div>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp onClick={handleClick} text={"Import"} isDisable={isDisable} />
          <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancel} />
        </div>
        {show && !warrning.key && <div className="loader">
          <CongratulationsScreen text={"Your wallet has been imported"} /></div>}
      </div>
    </div>
  );
}

export default ImportWallet;
