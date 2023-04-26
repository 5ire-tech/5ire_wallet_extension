import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { AuthContext } from "../../Store";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import { LABELS, ERROR_MESSAGES, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS } from "../../Constants/index";
import { isEmpty } from "../../Utility/utility";

function UnlockWelcome() {
  // const navigate = useNavigate();
  // const location = useLocation();

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

  const handleChange = (e) => {
    setPass(e.target.value);
    setInputError("");
  };

  const validateInput = () => {
    if (isEmpty(pass)) {
      setInputError(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
  };

  const handleClick = async (e) => {
    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.UNLOCK, { password: pass, vault: vault });
    }
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      <MenuRestofHeaders logosilver={false} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} alt="placeLogo" draggable={false} />
            <div className={style.cardWhite__cardInner__innercontact}>
              <h1>Welcome Back!</h1>
              {/* <span>The Decentralized Web Awaits</span> */}
            </div>
          </div>
        </div>
        <div className={style.cardWhite__importWalletlinkOuter}>
          <div>
            <InputFieldSimple
              // type="password"
              name={"key"}
              onChange={handleChange}
              placeholder={"Enter Password"}
              placeholderBaseColor={true}
              keyUp={validateInput}
              coloredBg={true}
            />
            <p className={style.errorText}>{inputError ? inputError : ""}</p>
          </div>
          <div className={style.forgotLink}>
            <Link to={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
          </div>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp
            onClick={handleClick}
            text={"Unlock"}
            isDisable={isDisable}
          />
        </div>
      </div>
    </div>
  );
}

export default UnlockWelcome;
