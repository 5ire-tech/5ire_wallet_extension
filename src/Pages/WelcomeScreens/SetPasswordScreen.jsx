import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { toggleLoader, setLogin } from "../../Store/reducer/auth";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
// import { setPassword, setPassError } from "../../Store/reducer/auth";


export default function SetPasswordScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setUserPass } = useAuth();
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [confirmError, setconfirmError] = useState("");
  const { isLogin } = useSelector((state) => state.auth);
  const [pass, setPass] = useState({ pass: "", confirmPass: "" });

  useEffect(()=>{
    console.log(pass.confirmPass === pass.pass);
    if (pass.confirmPass === pass.pass) {
      setconfirmError("");
    }else{
      if(pass.confirmPass !== "")
      setconfirmError("Passwords do not match.")
    }
  },[pass.pass,pass.confirmPass])

  const validatePass = () => {
    const uppercaseRegExp = /(?=.*?[A-Z])/;
    const lowercaseRegExp = /(?=.*?[a-z])/;
    const digitsRegExp = /(?=.*?[0-9])/;
    const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    const minLengthRegExp = /.{8,}/;

    let errMsg = "";
    if (pass.pass.length === 0) {
      errMsg = "This field is required.";
    } else if (!uppercaseRegExp.test(pass.pass) || !lowercaseRegExp.test(pass.pass) || !digitsRegExp.test(pass.pass) || !specialCharRegExp.test(pass.pass) || !minLengthRegExp.test(pass.pass)) {
      errMsg = "Password must have at least 8 characters, combination of Mixed case, 1 Special Character and 1 Number.";
    } else {
      errMsg = "";
    }

    // let errMsg = "";
    // if (pass.pass.length === 0) {
    //   errMsg = "Password is empty";
    // } else if (!uppercaseRegExp.test(pass.pass)) {
    //   errMsg = "At least one Uppercase";
    // } else if (!lowercaseRegExp.test(pass.pass)) {
    //   errMsg = "At least one Lowercase";
    // } else if (!digitsRegExp.test(pass.pass)) {
    //   errMsg = "At least one digit";
    // } else if (!specialCharRegExp.test(pass.pass)) {
    //   errMsg = "At least one Special Characters";
    // } else if (!minLengthRegExp.test(pass.pass)) {
    //   errMsg = "At least minumum 8 characters";
    // } else {
    //   errMsg = "";
    // }
    setError(errMsg);
  };

  const validateConfirmPass = () => {
    if (pass.confirmPass.length === 0) {
      setconfirmError("This field is required.");
    }
    else if (pass.confirmPass !== pass.pass) {
      // setconfirmError("Password and confirm password don't match!");
      setconfirmError("Passwords do not match.");
      // return { error: true };
    } else {
      setconfirmError("");
      // return { error: false };
    }
  };

  const handleSubmit = async () => {
    if (pass.pass.length === 0 && pass.confirmPass.length === 0) {
      setError("This field is required.");
      setconfirmError("This field is required.");
    }
    else if (pass.pass.length === 0) {
      setError("This field is required.");
    }
    else if (pass.confirmPass.length === 0) {
      setconfirmError("This field is required.");
    }
    else {
      // let confirmRes = validateConfirmPass();
      // console.log("Confirm Res : ",confirmRes);
      // console.log("error : ",error);
      if (!error && !confirmError) {
        dispatch(toggleLoader(true));
        let res = await setUserPass(pass.pass);
        if (res.error) {
          dispatch(toggleLoader(false));
          toast.error(res.data);
        } else {
          dispatch(toggleLoader(false));
          setShow(true);
          setTimeout(() => {
            //look
            if (isLogin !== true) dispatch(setLogin(true));
            setShow(false);
            setTimeout(() => {
              navigate("/wallet");
            }, 500);
          }, 2000);
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
      <div className={`${style.cardWhite}`}>
        <div className={style.cardWhite__beginText}>
          <h1>Create Password</h1>
          <p>
            Your password is used to unlock your wallet and is stored securely
            on your device. We recommend 12 characters, with uppercase and
            lowercase letters, symbols and numbers.
          </p>
          <div className={style.cardWhite__beginText__passInputSec}>
            <InputFieldSimple
              // type="password"
              value={pass.pass}
              name="pass"
              onChange={handleChange}
              placeholder={"Enter Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validatePass}
            />
          </div>
          <p className={style.errorText}>{error ? error : ""}</p>
          <div className={style.cardWhite__beginText__passInputSec}>
            <InputFieldSimple
              // type="password"
              value={pass.confirmPass}
              name="confirmPass"
              onChange={handleChange}
              placeholder={"Confirm Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validateConfirmPass}
            />
            <p className={style.errorText}>{confirmError ? confirmError : ""}</p>
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
            <CongratulationsScreen />
          </div>
        )}
      </div>
    </>
  );
}
