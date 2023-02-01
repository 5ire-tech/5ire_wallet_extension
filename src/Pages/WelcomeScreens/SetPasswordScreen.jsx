import React, { useState, useEffect } from "react";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import style from "./style.module.scss";
import { setPassword, setPassError } from "../../Store/reducer/auth";
import { useDispatch } from "react-redux";

function SetPasswordScreen() {
  const [pass, setPass] = useState({ pass: "", confirmPass: "" });
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (pass?.pass.length < 8) {
      setIsError(true);
      dispatch(setPassError(true));
      setError("Your password must be at least 8 characters!");
    } else if (pass?.pass.search(/[a-z]/i) < 0) {
      setIsError(true);
      dispatch(setPassError(true));
      setError("Your password must contain at least one letter!");
    } else if (pass?.pass.search(/[0-9]/) < 0) {
      setIsError(true);
      dispatch(setPassError(true));
      setError("Your password must contain at least one digit!");
    } else if (pass?.pass !== pass?.confirmPass) {
      setIsError(true);
      dispatch(setPassError(true));
      setError("Password and confirm password doesn't match!");
    } else {
      setIsError(false);
      setError("");
      if (pass?.pass && pass.confirmPass) {
        dispatch(setPassword(pass?.pass));
        dispatch(setPassError(false));
      }
    }
  }, [pass, dispatch]);

  const handleChange = (e) => {
    setPass((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  return (
    <div className={`${style.cardWhite}`}>
      <div className={style.cardWhite__beginText}>
        <h1>Create Password</h1>
        <p>
          Your password is used to unlock your wallet and is stored securely on
          your device. We recommend 12 characters, with uppercase and lowercase
          letters, symbols and numbers.
        </p>
        <p style={{ color: "red" }}>{isError ? error : ""}</p>
        <div className={style.cardWhite__beginText__passInputSec}>
          <InputFieldOnly
            type="password"
            name="pass"
            onChange={handleChange}
            placeholder={"Enter Password"}
            placeholderBaseColor={true}
            coloredBg={true}
          />
        </div>
        <div className={style.cardWhite__beginText__passInputSec}>
          <InputFieldOnly
            type="password"
            name="confirmPass"
            onChange={handleChange}
            placeholder={"Confirm  Password"}
            placeholderBaseColor={true}
            coloredBg={true}
          />
        </div>
      </div>
    </div>
  );
}

export default SetPasswordScreen;
