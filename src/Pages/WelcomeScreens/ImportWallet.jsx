import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";
import CongratulationsScreen from "./CongratulationsScreen";
import React, { useState, useEffect, useContext, useCallback } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { isEmpty, validateMnemonic } from "../../Utility/utility";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import WelcomeLogo from "../../Assets/welcomeLogo.svg";
import {
  REGEX,
  LABELS,
  EMTY_STR,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";

function ImportWallet() {
  const navigate = useNavigate();
  const [isDisable, setDisable] = useState(true);
  const [data, setData] = useState({ accName: "", key: "" });
  const [warrning, setWarrning] = useState({ acc: "", key: "" });
  const { state, userPass, allAccounts, inputError, setInputError, setSelectedToken } =
    useContext(AuthContext);
  const { isLogin } = state;
  const [show, setShow] = useState(false);
  const [isOpenEye, setEye] = useState(false);
  const [isMannual, setMannual] = useState(false);

  useEffect(() => {
    if (isLogin) {
      sendRuntimeMessage(
        MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
        MESSAGE_EVENT_LABELS.GET_ACCOUNTS,
        {}
      );
    }
  }, [isLogin]);

  useEffect(() => {
    if (inputError) setWarrning((p) => ({ ...p, key: inputError }));
  }, [inputError]);

  useEffect(() => {
    if (!data.accName.length || !data.key || data.accName.length < 2) {
      setDisable(true);
    } else {
      if (!warrning.acc && !warrning.key) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [data.accName, data.key, warrning]);

  const handleChange = useCallback(
    (e) => {
      setData((p) => ({ ...p, [e.target.name]: e.target.value }));
      if (e.target.name === LABELS.KEY) {
        if (e.target.value?.trim() && !isMannual) setEye(true);

        setInputError("");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMannual]
  );

  const validateAccName = useCallback(() => {
    if (data.accName.trim().length < 2 || data.accName.trim().length >= 16) {
      setWarrning((p) => ({
        ...p,
        acc: ERROR_MESSAGES.INPUT_BETWEEN_2_TO_18
      }));
      setDisable(true);
    } else if (!REGEX.WALLET_NAME.test(data.accName)) {
      setWarrning((p) => ({
        ...p,
        acc: ERROR_MESSAGES.ALPHANUMERIC_CHARACTERS
      }));
      setDisable(true);
    } else setWarrning((p) => ({ ...p, acc: "" }));
  }, [data.accName]);

  const validateKey = () => {
    if (isEmpty(data.key)) {
      setWarrning((p) => ({ ...p, key: ERROR_MESSAGES.INPUT_REQUIRED }));
      setDisable(true);
    } else if (!validateMnemonic(data?.key?.trim())) {
      setWarrning((p) => ({ ...p, key: ERROR_MESSAGES.INVALID_MNEMONIC }));
      setDisable(true);
    } else setWarrning((p) => ({ ...p, key: EMTY_STR }));
  };

  const handleClick = async (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (!warrning.key && !warrning.acc && data?.accName && data?.key) {
        if (userPass && !isLogin) {
          setShow(true);
          setTimeout(() => {
            setShow(false);
            sendRuntimeMessage(
              MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
              MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE,
              {
                password: userPass,
                opts: {
                  mnemonic: data?.key?.trim(),
                  name: data?.accName?.trim()
                },
                type: LABELS.IMPORT
              }
            );
          }, 2000);
        } else {
          const match = allAccounts?.find((a) => a.accountName === data.accName.trim());

          if (match) {
            setWarrning((p) => ({
              ...p,
              acc: ERROR_MESSAGES.WALLET_NAME_ALREADY_EXISTS
            }));
          } else {
            sendRuntimeMessage(
              MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
              MESSAGE_EVENT_LABELS.IMPORT_BY_MNEMONIC,
              { mnemonic: data?.key?.trim(), name: data.accName.trim() }
            );
            setSelectedToken({
              address: "",
              balance: "",
              decimals: "",
              name: "",
              symbol: ""
            });
          }
        }
      }
    }
  };

  const handleCancel = useCallback(() => {
    setInputError("");
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      {!isLogin && <StepHeaders active={2} isCreate={false} />}
      {/* <MenuRestofHeaders logosilver={true} title="5ire Wallet" /> */}
      {isLogin && <img src={WelcomeLogo} alt="logo" style={{ marginTop: "20px" }} />}

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
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className="errorText">{warrning.acc}</p>
          </div>
          <div className="inputFieldOnly">
            <TextArea
              rows={4}
              name={LABELS.KEY}
              onKeyUp={validateKey}
              onChange={handleChange}
              onDrop={(e) => {
                e.preventDefault();
              }}
              placeholder={"Enter mnemonic here"}
              className={isOpenEye && "blurContact"}
            />

            <img
              className="eyeIcon"
              width={19}
              height={16}
              alt="eyeClose"
              src={isOpenEye ? EyeCloseIcon : EyeOpenIcon}
              draggable={false}
              onClick={() => {
                setEye((old) => !old);
                setMannual(true);
              }}
            />

            <p className="errorText">{warrning.key}</p>
          </div>
        </div>
        <div className={style.setPassword__footerbuttons} style={{ marginTop: "90px" }}>
          <ButtonComp onClick={handleClick} text={"Import"} isDisable={isDisable} />
          <ButtonComp bordered={true} text={"Cancel"} onClick={handleCancel} />
        </div>
        {show && !warrning.key && (
          <div className="loader">
            <CongratulationsScreen text={"Your wallet has been imported"} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportWallet;
