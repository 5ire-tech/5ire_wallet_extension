import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { isEmpty } from "../../Utility/utility";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  REGEX,
  LABELS,
  EMTY_STR,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

export default function SetPasswordScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDisable, setDisable] = useState(true);
  const { setUserPass, accountName, setDetailsPage } = useContext(AuthContext);
  const { updateState } = useContext(AuthContext);
  const [error, setError] = useState({ pass: EMTY_STR, confirmPass: EMTY_STR });
  const [pass, setPass] = useState({ pass: EMTY_STR, confirmPass: EMTY_STR });

  useEffect(() => {
    if (pass.confirmPass === pass.pass || pass.pass === EMTY_STR)
      setError((p) => ({ ...p, confirmPass: EMTY_STR }));
    else if (pass.confirmPass !== EMTY_STR)
      setError((p) => ({ ...p, confirmPass: ERROR_MESSAGES.PASS_DONT_MATCH }));
  }, [pass.pass, pass.confirmPass]);

  useEffect(() => {
    if (
      pass.confirmPass === pass.pass &&
      !error.pass &&
      !error.confirmPass &&
      pass.pass &&
      pass.confirmPass
    )
      setDisable(false);
    else setDisable(true);
  }, [pass.confirmPass, pass.pass, error.pass, error.confirmPass]);

  const validatePass = useCallback(() => {
    let errMsg = EMTY_STR;

    if (isEmpty(pass.pass)) errMsg = ERROR_MESSAGES.INPUT_REQUIRED;
    else if (
      !REGEX.UPPERCASE.test(pass.pass) ||
      !REGEX.LOWERCASE.test(pass.pass) ||
      !REGEX.DIGITS.test(pass.pass) ||
      !REGEX.SPECIAL_CHAR.test(pass.pass) ||
      !REGEX.MIN_LENGTH.test(pass.pass)
    )
      errMsg = ERROR_MESSAGES.CREATE_PASS_MSG;
    else errMsg = EMTY_STR;

    setError((p) => ({ ...p, pass: errMsg }));
  }, [pass.pass]);

  const validateConfirmPass = useCallback(() => {
    if (isEmpty(pass.confirmPass))
      setError((p) => ({ ...p, confirmPass: ERROR_MESSAGES.INPUT_REQUIRED }));
    else if (pass.confirmPass !== pass.pass)
      setError((p) => ({ ...p, confirmPass: ERROR_MESSAGES.PASS_DONT_MATCH }));
    else setError((p) => ({ ...p, confirmPass: EMTY_STR }));
  }, [pass.confirmPass, pass.pass]);

  const handleCancel = useCallback(() => {
    updateState(LABELS.NEW_ACCOUNT, null, false);
    // updateState(LABELS.ACCOUNT_NAME, null, false);
    navigate(ROUTES.DEFAULT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (!error.pass && !error.confirmPass && pass.pass && pass.confirmPass) {
        if (params.id === LABELS.CREATE) {
          sendRuntimeMessage(
            MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
            MESSAGE_EVENT_LABELS.CREATE_OR_RESTORE,
            { password: pass.pass, opts: { name: accountName }, type: "create" }
          );
          setDetailsPage(true);
        } else {
          setUserPass(pass.pass);
          navigate(ROUTES.IMPORT_WALLET);
        }
      }
    }
  };

  const handleChange = useCallback((e) => {
    setPass((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value.trim()
      };
    });
  }, []);

  return (
    <>
      <div onKeyDown={handleSubmit} className={`${style.cardWhite}`}>
        {params.id === LABELS.CREATE ? (
          <StepHeaders active={3} />
        ) : (
          <StepHeaders active={1} isCreate={false} />
        )}
        <MenuRestofHeaders
          backTo={
            params.id === LABELS.CREATE ? ROUTES.CREATE_WALLET : ROUTES.DEFAULT
          }
          title={"Create Password"}
        />
        <div
          className={`${style.cardWhite__beginText} ${style.cardWhite__createPassText}`}>
          <p>
            Your password is used to unlock your wallet and is stored securely
            on your device. We recommend 12 characters, with uppercase and
            lowercase letters, symbols and numbers.
          </p>
          <div
            className={style.cardWhite__beginText__passInputSec}
            style={{ marginTop: "20px" }}>
            <InputFieldSimple
              coloredBg={true}
              value={pass?.pass}
              name={LABELS.PASS}
              keyUp={validatePass}
              onChange={handleChange}
              placeholderBaseColor={true}
              placeholder={"Enter Password"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
          </div>
          <p className={style.errorText}>{error.pass ? error.pass : ""}</p>
          <div
            className={style.cardWhite__beginText__passInputSec}
            style={{ marginTop: "34px" }}>
            <InputFieldSimple
              coloredBg={true}
              name="confirmPass"
              onChange={handleChange}
              value={pass?.confirmPass}
              placeholderBaseColor={true}
              keyUp={validateConfirmPass}
              placeholder={"Confirm Password"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className={style.errorText}>
              {error.confirmPass ? error.confirmPass : ""}
            </p>
          </div>

          <div style={{ marginTop: "50px" }} className={style.contBtn}>
            <ButtonComp
              isDisable={isDisable}
              onClick={handleSubmit}
              text={"Continue"}
              maxWidth={"100%"}
            />
            <ButtonComp
              bordered={true}
              onClick={handleCancel}
              text={"Cancel"}
              maxWidth={"100%"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
