import { ROUTES } from "../../Routes";
// import { toast } from "react-toastify";
import style from "./style.module.scss";
// import useAuth from "../../Hooks/useAuth";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "../../Utility/utility";
import React, { useContext, useEffect, useState } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import {
  REGEX,
  LABELS,
  EMTY_STR,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import { AuthContext } from "../../Store";


export default function SetPasswordScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const { setUserPass, accountName } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [error, setError] = useState({ pass: EMTY_STR, confirmPass: EMTY_STR });
  const [pass, setPass] = useState({ pass: EMTY_STR, confirmPass: EMTY_STR });


  useEffect(() => {

    if (pass.confirmPass === pass.pass || pass.pass === EMTY_STR)

      setError(p => ({ ...p, confirmPass: EMTY_STR }))
    else
      if (pass.confirmPass !== EMTY_STR)
        setError(p => ({ ...p, confirmPass: ERROR_MESSAGES.PASS_DONT_MATCH }))

  }, [pass.pass, pass.confirmPass]);


  const validatePass = () => {
    let errMsg = EMTY_STR;

    if (isEmpty(pass.pass))
      errMsg = ERROR_MESSAGES.INPUT_REQUIRED;

    else if (
      !REGEX.UPPERCASE.test(pass.pass) ||
      !REGEX.LOWERCASE.test(pass.pass) ||
      !REGEX.DIGITS.test(pass.pass) ||
      !REGEX.SPECIAL_CHAR.test(pass.pass) ||
      !REGEX.MIN_LENGTH.test(pass.pass)
    )
      errMsg = ERROR_MESSAGES.CREATE_PASS_MSG;

    else
      errMsg = EMTY_STR;

    setError(p => ({ ...p, pass: errMsg }));
  };


  const validateConfirmPass = () => {

    if (isEmpty(pass.confirmPass))
      setError(p => ({ ...p, confirmPass: ERROR_MESSAGES.INPUT_REQUIRED }))

    else if (pass.confirmPass !== pass.pass)
      setError(p => ({ ...p, confirmPass: ERROR_MESSAGES.PASS_DONT_MATCH }))

    else
      setError(p => ({ ...p, confirmPass: EMTY_STR }))

  };


  const handleSubmit = async (e) => {

    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {

      if (!error.pass && !error.confirmPass && pass.pass && pass.confirmPass) {
        if (params.id === LABELS.CREATE) {

          sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE, { password: pass.pass, opts: { name: accountName } });
          setTimeout(() => {
            navigate(ROUTES.NEW_WALLET_DETAILS);
          }, 1000);
        } else {

          setTimeout(() => {
            setUserPass(pass.pass);
            navigate(ROUTES.IMPORT_WALLET);
          }, 1000);
        }

      }
    }
  };

  const handleChange = (e) => {
    setPass((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value.trim(),
      };
    });
  };

  return (
    <>
      <div onKeyDown={handleSubmit} className={`${style.cardWhite}`}>
        <div className={style.cardWhite__beginText}>
          <h1>Create Password</h1>
          <p>
            Your password is used to unlock your wallet and is stored securely
            on your device. We recommend 12 characters, with uppercase and
            lowercase letters, symbols and numbers.
          </p>
          <div className={style.cardWhite__beginText__passInputSec}>
            <InputFieldSimple
              value={pass.pass}
              name={LABELS.PASS}
              onChange={handleChange}
              placeholder={"Enter Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validatePass}
            />
          </div>
          <p className={style.errorText}>{error.pass}</p>
          <div className={style.cardWhite__beginText__passInputSec}>
            <InputFieldSimple
              value={pass.confirmPass}
              name="confirmPass"
              onChange={handleChange}
              placeholder={"Confirm Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validateConfirmPass}
            />
            <p className={style.errorText}>{error.confirmPass}</p>
          </div>
          <div style={{ marginTop: "30px" }}>
            <ButtonComp
              onClick={handleSubmit}
              text={"Continue"}
              maxWidth={"100%"}
            />
          </div>
        </div>
      </div>
      <div className={style.menuItems__cancleContinue}>
        {show && (
          <div className="loader">
            <CongratulationsScreen text={`Your Wallet is ${params.id === "create" ? "Created" : "Imported"}.`} />
          </div>
        )}
      </div>
    </>
  );
}
