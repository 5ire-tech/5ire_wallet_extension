import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { AuthContext } from "../../Store";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { useLocation, useNavigate } from "react-router-dom";
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
  // const [errMsg, setErrorMsg] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { state, passError, setPassError } = useContext(AuthContext);
  const { vault } = state;

  console.log("PASS ERROROROR ::: ",passError);

  useEffect(() => {
    if (passError || !pass) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [passError, pass]);


  const handleChange = (e) => {
    setPass(e.target.value);
    setPassError("");
  };


  const validateInput = () => {
    if (isEmpty(pass)) {
      setPassError(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }

  }

  const handleClick = async (e) => {
    console.log("CLICK..............");
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
        <div className={style.cardWhite__linkOuter}>
          <InputFieldSimple
            // type="password"
            name={"key"}
            onChange={handleChange}
            placeholder={"Enter Password"}
            placeholderBaseColor={true}
            keyUp={validateInput}
            coloredBg={true}
          />
          <p className={style.errorText}>{passError ? passError : ""}</p>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp onClick={handleClick} text={"Unlock"} isDisable={isDisable} />
        </div>
        {/* <div className={style.forgotLink}>
          <Link to="">Forgot password?</Link>
        </div> */}
      </div>
    </div>
  );
}

export default UnlockWelcome;
