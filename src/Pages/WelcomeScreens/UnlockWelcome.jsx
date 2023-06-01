import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { AuthContext } from "../../Store";
import { isEmpty } from "../../Utility/utility";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { decryptor } from "../../Helper/CryptoHelper";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  LABELS,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

function UnlockWelcome() {
  const { verifyPass } = useAuth();
  const [pass, setPass] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { state, inputError, setInputError } = useContext(AuthContext);
  const { vault } = state;

  useEffect(() => {
    if (inputError || !pass) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [inputError, pass]);

  const handleChange = useCallback((e) => {
    setPass(e.target.value);
    setInputError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateInput = useCallback(() => {
    if (isEmpty(pass)) {
      setInputError(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pass]);

  const handleClick = async (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (state?.pass && state?.oldAccounts && pass && !inputError) {
        const passRes = await verifyPass(pass, state.pass);

        if (!passRes.error) {
          if (state?.oldAccounts.length > 0) {
            const oldAccDetails = [];

            for (let i = 0; i < state.oldAccounts.length; i++) {
              oldAccDetails.push({
                mnemonic: decryptor(state?.oldAccounts[i].temp1m, state?.pass),
                accountName: state?.oldAccounts[i]?.accountName
              });
            }
            sendRuntimeMessage(
              MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
              MESSAGE_EVENT_LABELS.RECOVER_OLD_ACCOUNTS,
              { password: pass, oldAccDetails, opts: {} }
            );
          }
        } else {
          setInputError(passRes.data);
        }
      } else if (pass && !inputError) {
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.UNLOCK, {
          password: pass,
          vault: vault
        });
      }
    }
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      <MenuRestofHeaders logosilver={false} title="5ire Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} alt="placeLogo" draggable={false} />
            <div className={style.cardWhite__cardInner__innercontact}>
              <h1>Welcome Back!</h1>
            </div>
          </div>
        </div>
        <div className={style.cardWhite__importWalletlinkOuter}>
          <div>
            <InputFieldSimple
              name={"key"}
              coloredBg={true}
              keyUp={validateInput}
              onChange={handleChange}
              placeholderBaseColor={true}
              placeholder={"Enter Password"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className={style.errorText}>{inputError ? inputError : ""}</p>
          </div>
          <div className={style.forgotLink}>
            <Link to={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
          </div>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp onClick={handleClick} text={"Unlock"} isDisable={isDisable} />
        </div>
      </div>
    </div>
  );
}

export default UnlockWelcome;
