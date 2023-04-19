import { ROUTES } from "../../Routes";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { AuthContext } from "../../Store";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "../../Utility/utility";
import React, { useEffect, useState, useContext } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import { REGEX, LABELS, ERROR_MESSAGES, EMTY_STR } from "../../Constants/index";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

export default function SetPasswordScreen() {
  const params = useParams();

  const navigate = useNavigate();
  const { setUserPass } = useAuth();
  const [show, setShow] = useState(false);
  const [error, setError] = useState(EMTY_STR);
  const [confirmError, setconfirmError] = useState(EMTY_STR);
  const { state, updateState } = useContext(AuthContext);
  // const { state, updateState } = useContext(AuthContext);
  const [pass, setPass] = useState({ pass: EMTY_STR, confirmPass: EMTY_STR });

  useEffect(() => {
    if (pass.confirmPass === pass.pass || pass.pass === EMTY_STR) {
      setconfirmError(EMTY_STR);
    } else {
      if (pass.confirmPass !== EMTY_STR)
        setconfirmError(ERROR_MESSAGES.PASS_DONT_MATCH);
    }
  }, [pass.pass, pass.confirmPass]);

  const validatePass = () => {
    let errMsg = EMTY_STR;

    if (pass.pass.length === 0) errMsg = ERROR_MESSAGES.INPUT_REQUIRED;
    else if (
      !REGEX.UPPERCASE.test(pass.pass) ||
      !REGEX.LOWERCASE.test(pass.pass) ||
      !REGEX.DIGITS.test(pass.pass) ||
      !REGEX.SPECIAL_CHAR.test(pass.pass) ||
      !REGEX.MIN_LENGTH.test(pass.pass)
    )
      errMsg = ERROR_MESSAGES.CREATE_PASS_MSG;
    else errMsg = EMTY_STR;

    setError(errMsg);
  };

  const validateConfirmPass = () => {
    if (pass.confirmPass.length === 0)
      setconfirmError(ERROR_MESSAGES.INPUT_REQUIRED);
    else if (pass.confirmPass !== pass.pass)
      setconfirmError(ERROR_MESSAGES.PASS_DONT_MATCH);
    else setconfirmError(EMTY_STR);
  };
  const handleCancle = () => {
    updateState(LABELS.NEW_ACCOUNT, null, false);
    // updateState(LABELS.ACCOUNT_NAME, null, false);
    navigate(ROUTES.DEFAULT);
  };

  const handleSubmit = async (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (isEmpty(pass.pass) && isEmpty(pass.confirmPass)) {
        setError(ERROR_MESSAGES.INPUT_REQUIRED);
        setconfirmError(ERROR_MESSAGES.INPUT_REQUIRED);
      } else if (isEmpty(pass.pass)) {
        setError(ERROR_MESSAGES.INPUT_REQUIRED);
      } else if (isEmpty(pass.confirmPass)) {
        setconfirmError(ERROR_MESSAGES.INPUT_REQUIRED);
      } else {
        if (!error && !confirmError) {
          let res = await setUserPass(pass.pass);
          if (res.error) toast.error(res.data);
          else {
            setShow(true);
            setTimeout(() => {
              // if (state.isLogin !== true) updateState(LABELS.ISLOGIN, true);
              setShow(false);
              setTimeout(() => {
                navigate(ROUTES.WALLET);
              }, 200);
            }, 2000);
          }
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
        <MenuRestofHeaders
          backTo={ROUTES.NEW_WALLET_DETAILS}
          title={"Create Password"}
        />
        <div className={style.cardWhite__beginText}>
          <p>
            Your password is used to unlock your wallet and is stored securely
            on your device. We recommend 12 characters, with uppercase and
            lowercase letters, symbols and numbers.
          </p>
          <div
            className={style.cardWhite__beginText__passInputSec}
            style={{ marginTop: "48px" }}
          >
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
          <p className={style.errorText}>{error ? error : ""}</p>
          <div
            className={style.cardWhite__beginText__passInputSec}
            style={{ marginTop: "20px" }}
          >
            <InputFieldSimple
              value={pass.confirmPass}
              name="confirmPass"
              onChange={handleChange}
              placeholder={"Confirm Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validateConfirmPass}
            />
            <p className={style.errorText}>
              {confirmError ? confirmError : ""}
            </p>
          </div>
          <div style={{ marginTop: "50px" }} className={style.contBtn}>
            <ButtonComp
              onClick={handleSubmit}
              text={"Continue"}
              maxWidth={"100%"}
            />
            <ButtonComp
              bordered={true}
              onClick={handleCancle}
              text={"Cancel"}
              maxWidth={"100%"}
            />
          </div>
        </div>
      </div>
      <div className={style.menuItems__cancleContinue}>
        {show && (
          <div className="loader">
            <CongratulationsScreen
              text={`Your Wallet is ${
                params.id === "create" ? "Created" : "Imported"
              }.`}
            />
          </div>
        )}
      </div>
    </>
  );
}
